import axios from "axios";

const SCRAPER_API_BASE_URL = "https://api.scraper.tech";

export interface SocialSentiment {
  positive: number;
  negative: number;
  neutral: number;
  totalMentions: number;
  recentTweets: Array<{
    text: string;
    sentiment: "positive" | "negative" | "neutral";
    timestamp?: string;
    likes?: number;
    retweets?: number;
  }>;
  trendingTopics: string[];
  overallSentiment: "positive" | "negative" | "neutral";
  hasTwitterData: boolean;
}

export interface Tweet {
  type: string;
  tweet_id: string;
  screen_name: string;
  text: string;
  created_at: string;
  lang: string;
  favorites: number;
  retweets: number;
  replies: number;
  quotes: number;
  bookmarks: number;
  media?: {
    photo?: Array<{ media_url_https: string }>;
    video?: Array<{
      media_url_https: string;
      variants?: Array<{ url: string; content_type: string }>;
    }>;
  };
}

export interface ScraperResponse {
  timeline?: Tweet[];
  next_cursor?: string;
  error?: string;
}

class SocialSentimentAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.SCRAPER_API_KEY || "";
  }

  async getStockSentiment(
    symbol: string,
    companyName?: string
  ): Promise<SocialSentiment> {
    console.log(
      `🔍 [AlphasignalAI] Starting Twitter sentiment analysis for: ${symbol}${
        companyName ? ` (${companyName})` : ""
      }`
    );

    try {
      // Focus on cashtag and stock ticker searches for top 20 liked posts
      const searchTerms = [`$${symbol.toUpperCase()}`];

      console.log(
        `📝 [AlphasignalAI] Search terms for top 60 liked posts: ${searchTerms.join(
          ", "
        )}`
      );

      const allTweets: Tweet[] = [];

      // Fetch tweets for each search term, focusing on top liked posts
      for (const term of searchTerms) {
        console.log(
          `🐦 [AlphasignalAI] Fetching top 60 liked tweets for: "${term}"`
        );

        let cursor = "";
        let totalTweetsCollected = 0;
        const maxTweets = 60;
        const maxRequests = 3; // Limit to 3 API calls to avoid rate limiting
        let requestCount = 0;

        while (totalTweetsCollected < maxTweets && requestCount < maxRequests) {
          try {
            console.log(
              `📡 [AlphasignalAI] API Request ${
                requestCount + 1
              } for ${term} (cursor: ${cursor ? "present" : "empty"})`
            );

            const response = await axios.get(
              `${SCRAPER_API_BASE_URL}/search.php`,
              {
                params: {
                  query: term,
                  cursor: cursor,
                  search_type: "Top", // Focus on top posts
                  count: 20, // Each request returns 20 tweets
                },
                headers: {
                  "scraper-key": this.apiKey,
                },
                timeout: 30000,
              }
            );

            console.log(`📊 [AlphasignalAI] API Response for ${term}:`, {
              status: response.status,
              dataLength: response.data?.timeline?.length || 0,
              hasData: !!response.data?.timeline,
              hasNextCursor: !!response.data?.next_cursor,
            });

            if (response.data && response.data.timeline) {
              // Filter tweets to only include those from last 24 hours and with cashtag
              const now = new Date();
              const twentyFourHoursAgo = new Date(
                now.getTime() - 24 * 60 * 60 * 1000
              );

              const filteredTweets = response.data.timeline
                .filter((tweet: Tweet, tweetIndex: number) => {
                  const text = tweet.text.toLowerCase();
                  const tweetDate = new Date(tweet.created_at);

                  // Must contain cashtag and be from last 24 hours
                  const hasCashtag = text.includes(`$${symbol.toLowerCase()}`);
                  const isRecent = tweetDate >= twentyFourHoursAgo;

                  // Log tweet filtering for debugging
                  if (tweetIndex % 10 === 0) {
                    console.log(
                      `🔍 [AlphasignalAI] Tweet filtering: "${text.substring(
                        0,
                        50
                      )}..." | Has cashtag: ${hasCashtag} | Is recent: ${isRecent} | Date: ${tweetDate.toISOString()}`
                    );
                  }

                  return hasCashtag && isRecent;
                })
                .sort(
                  (a: Tweet, b: Tweet) =>
                    (b.favorites || 0) - (a.favorites || 0)
                ); // Sort by likes

              if (filteredTweets.length > 0) {
                allTweets.push(...filteredTweets);
                totalTweetsCollected += filteredTweets.length;
                console.log(
                  `✅ [AlphasignalAI] Collected ${filteredTweets.length} tweets (total: ${totalTweetsCollected}) for ${term}`
                );
              }

              // Update cursor for next request
              if (
                response.data.next_cursor &&
                totalTweetsCollected < maxTweets
              ) {
                cursor = response.data.next_cursor;
                console.log(
                  `🔄 [AlphasignalAI] Next cursor available, continuing pagination for ${term}`
                );
              } else {
                console.log(
                  `🏁 [AlphasignalAI] No more cursor or reached limit for ${term}`
                );
                break;
              }
            } else {
              console.log(`⚠️ [AlphasignalAI] No data received for ${term}`);
              break;
            }
          } catch (error) {
            console.error(
              `❌ [AlphasignalAI] Error fetching tweets for ${term}:`,
              error
            );
            break;
          }

          requestCount++;
        }

        console.log(
          `📈 [AlphasignalAI] Completed fetching for ${term}: ${totalTweetsCollected} tweets collected in ${requestCount} requests`
        );
      }

      // Analyze sentiment from the tweets
      console.log(
        `📈 [AlphasignalAI] Total top liked tweets collected: ${allTweets.length}`
      );
      const sentiment = this.analyzeSentiment(allTweets);

      console.log(`🎯 [AlphasignalAI] Final sentiment analysis:`, {
        overallSentiment: sentiment.overallSentiment,
        totalMentions: sentiment.totalMentions,
        positive: sentiment.positive,
        negative: sentiment.negative,
        neutral: sentiment.neutral,
        trendingTopics: sentiment.trendingTopics,
        hasTwitterData: sentiment.hasTwitterData,
      });

      return sentiment;
    } catch (error) {
      console.error("Error fetching social sentiment:", error);
      return this.getDefaultSentiment();
    }
  }

  private analyzeSentiment(tweets: Tweet[]): SocialSentiment {
    console.log(
      `🔍 [AlphasignalAI] Starting analysis of ${tweets.length} top liked tweets`
    );

    if (!tweets || tweets.length === 0) {
      console.log(
        `⚠️ [AlphasignalAI] No tweets to analyze, returning default sentiment`
      );
      return this.getDefaultSentiment();
    }

    let positive = 0;
    let negative = 0;
    let neutral = 0;
    const recentTweets: Array<{
      text: string;
      sentiment: "positive" | "negative" | "neutral";
      timestamp?: string;
      likes?: number;
      retweets?: number;
    }> = [];

    const positiveKeywords = [
      "bullish",
      "buy",
      "buying",
      "moon",
      "rocket",
      "🚀",
      "💎",
      "diamond hands",
      "hodl",
      "hold",
      "strong",
      "good",
      "great",
      "amazing",
      "profit",
      "gains",
      "positive",
      "up",
      "rise",
      "growth",
      "success",
      "win",
      "winner",
      "breakout",
      "breakthrough",
      "catalyst",
      "earnings beat",
      "revenue growth",
      "partnership",
      "acquisition",
      "innovation",
    ];

    const negativeKeywords = [
      "bearish",
      "sell",
      "selling",
      "dump",
      "crash",
      "fall",
      "down",
      "loss",
      "bear",
      "short",
      "bad",
      "terrible",
      "awful",
      "negative",
      "drop",
      "decline",
      "fail",
      "failure",
      "lose",
      "loser",
      "panic",
      "fear",
      "miss",
      "disappointment",
      "downgrade",
      "lawsuit",
      "scandal",
      "bankruptcy",
    ];

    // Analyze top 100 liked tweets
    console.log(
      `📝 [AlphasignalAI] Analyzing top ${tweets.length} liked tweets`
    );

    tweets.forEach((tweet: Tweet, index) => {
      const text = tweet.text?.toLowerCase() || "";
      let sentiment: "positive" | "negative" | "neutral" = "neutral";
      let score = 0;

      // Check for positive keywords
      positiveKeywords.forEach((keyword) => {
        if (text.includes(keyword)) score += 1;
      });

      // Check for negative keywords
      negativeKeywords.forEach((keyword) => {
        if (text.includes(keyword)) score -= 1;
      });

      // Determine sentiment based on score
      if (score > 0) {
        sentiment = "positive";
        positive++;
      } else if (score < 0) {
        sentiment = "negative";
        negative++;
      } else {
        neutral++;
      }

      // Log every 5th tweet for debugging
      if (index % 5 === 0) {
        console.log(
          `📄 [AlphasignalAI] Tweet ${index + 1}: "${text.substring(
            0,
            50
          )}..." → ${sentiment} (score: ${score}, likes: ${tweet.favorites})`
        );
      }

      recentTweets.push({
        text: tweet.text || "No text available",
        sentiment,
        timestamp: tweet.created_at,
        likes: tweet.favorites,
        retweets: tweet.retweets,
      });
    });

    const totalMentions = positive + negative + neutral;
    const trendingTopics = this.extractTrendingTopics(tweets);

    console.log(`📊 [AlphasignalAI] Results:`, {
      positive,
      negative,
      neutral,
      totalMentions,
      trendingTopics,
    });

    // Determine overall sentiment
    let overallSentiment: "positive" | "negative" | "neutral" = "neutral";
    if (positive > negative && positive > neutral) {
      overallSentiment = "positive";
    } else if (negative > positive && negative > neutral) {
      overallSentiment = "negative";
    }

    console.log(`🎯 [AlphasignalAI] Overall sentiment: ${overallSentiment}`);

    return {
      positive,
      negative,
      neutral,
      totalMentions,
      recentTweets: recentTweets.slice(0, 10), // Limit to 10 recent tweets
      trendingTopics,
      overallSentiment,
      hasTwitterData: totalMentions > 0,
    };
  }

  private extractTrendingTopics(tweets: Tweet[]): string[] {
    console.log(
      `🔍 [AlphasignalAI] Extracting topics from ${tweets.length} tweets`
    );

    const topics = new Set<string>();
    const commonTopics = [
      "earnings",
      "revenue",
      "profit",
      "growth",
      "innovation",
      "technology",
      "market",
      "trading",
      "investment",
      "finance",
      "economy",
      "AI",
      "artificial intelligence",
      "electric vehicles",
      "EV",
      "sustainability",
      "delivery",
      "production",
      "sales",
      "quarterly",
      "annual",
      "ceo",
      "leadership",
      "competition",
      "partnership",
      "acquisition",
      "catalyst",
      "breakout",
      "breakthrough",
      "bullish",
      "bearish",
      "short squeeze",
      "meme stock",
      "retail investors",
      "institutional",
      "analyst",
      "upgrade",
      "downgrade",
      "price target",
    ];

    tweets.forEach((tweet: Tweet) => {
      const text = tweet.text?.toLowerCase() || "";
      commonTopics.forEach((topic) => {
        if (text.includes(topic)) {
          topics.add(topic);
        }
      });
    });

    const result = Array.from(topics).slice(0, 5);
    console.log(`📈 [AlphasignalAI] Found topics: ${result.join(", ")}`);

    return result;
  }

  private getDefaultSentiment(): SocialSentiment {
    return {
      positive: 0,
      negative: 0,
      neutral: 0,
      totalMentions: 0,
      recentTweets: [],
      trendingTopics: [],
      overallSentiment: "neutral",
      hasTwitterData: false,
    };
  }
}

export const socialSentimentAPI = new SocialSentimentAPI();
