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
  }>;
  trendingTopics: string[];
  overallSentiment: "positive" | "negative" | "neutral";
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
      `🔍 [Social Sentiment] Starting sentiment analysis for: ${symbol}${
        companyName ? ` (${companyName})` : ""
      }`
    );

    try {
      // Focus on stock ticker symbol only for more relevant results
      const searchTerms = [symbol];

      console.log(
        `📝 [Social Sentiment] Search terms: ${searchTerms.join(", ")}`
      );

      const allTweets: Tweet[] = [];

      // Fetch tweets for each search term
      for (const term of searchTerms) {
        // Try different search variations - focus on stock ticker and stock-related terms
        const searchVariations = [
          `$${term}`,
          `${term} stock`,
          `${term} $${term}`,
          `$${term} stock`,
        ];

        for (const searchQuery of searchVariations) {
          console.log(
            `🐦 [Social Sentiment] Fetching tweets for: "${searchQuery}"`
          );
          try {
            const response = await axios.get(
              `${SCRAPER_API_BASE_URL}/search.php`,
              {
                params: {
                  query: searchQuery,
                  cursor: "",
                  search_type: "Top",
                },
                headers: {
                  "scraper-key": this.apiKey,
                },
                timeout: 30000,
              }
            );

            console.log(
              `📊 [Social Sentiment] API Response for ${searchQuery}:`,
              {
                status: response.status,
                dataLength: response.data?.timeline?.length || 0,
                hasData: !!response.data?.timeline,
              }
            );

            if (response.data && response.data.timeline) {
              // Filter tweets to only include those with the stock ticker and stock-related keywords
              const filteredTweets = response.data.timeline.filter(
                (tweet: Tweet) => {
                  const text = tweet.text.toLowerCase();
                  const tickerVariations = [
                    `$${term.toLowerCase()}`,
                    `${term.toLowerCase()} stock`,
                    `${term.toLowerCase()} shares`,
                    `${term.toLowerCase()} trading`,
                    `${term.toLowerCase()} price`,
                  ];

                  // Must contain stock ticker AND stock-related keywords
                  const stockKeywords = [
                    "stock",
                    "shares",
                    "trading",
                    "price",
                    "market",
                    "invest",
                    "buy",
                    "sell",
                    "earnings",
                    "revenue",
                  ];
                  const hasTicker = tickerVariations.some((ticker) =>
                    text.includes(ticker)
                  );
                  const hasStockKeyword = stockKeywords.some((keyword) =>
                    text.includes(keyword)
                  );

                  return hasTicker && hasStockKeyword;
                }
              );

              if (filteredTweets.length > 0) {
                allTweets.push(...filteredTweets);
                console.log(
                  `✅ [Social Sentiment] Added ${filteredTweets.length} stock-related tweets for ${searchQuery} (filtered from ${response.data.timeline.length} total)`
                );
                // If we got relevant data, break out of the search variations loop
                break;
              } else {
                console.log(
                  `⚠️ [Social Sentiment] No stock-related tweets found for ${searchQuery} (${response.data.timeline.length} total tweets, none contained ticker + stock keywords)`
                );
              }
            } else {
              console.log(
                `⚠️ [Social Sentiment] No data received for ${searchQuery}`
              );
            }
          } catch (error) {
            console.error(
              `❌ [Social Sentiment] Error fetching tweets for ${searchQuery}:`,
              error
            );
          }
        }
      }

      // Analyze sentiment from the tweets
      console.log(
        `📈 [Social Sentiment] Total tweets collected: ${allTweets.length}`
      );
      const sentiment = this.analyzeSentiment(allTweets);

      console.log(`🎯 [Social Sentiment] Final sentiment analysis:`, {
        overallSentiment: sentiment.overallSentiment,
        totalMentions: sentiment.totalMentions,
        positive: sentiment.positive,
        negative: sentiment.negative,
        neutral: sentiment.neutral,
        trendingTopics: sentiment.trendingTopics,
      });

      return sentiment;
    } catch (error) {
      console.error("Error fetching social sentiment:", error);
      return this.getDefaultSentiment();
    }
  }

  private analyzeSentiment(tweets: Tweet[]): SocialSentiment {
    console.log(
      `🔍 [Sentiment Analysis] Starting analysis of ${tweets.length} tweets`
    );

    if (!tweets || tweets.length === 0) {
      console.log(
        `⚠️ [Sentiment Analysis] No tweets to analyze, returning default sentiment`
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
    ];

    // Analyze all tweets (up to 20 from each search)
    console.log(
      `📝 [Sentiment Analysis] Analyzing all ${tweets.length} tweets`
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

      // Log every 10th tweet for debugging
      if (index % 10 === 0) {
        console.log(
          `📄 [Sentiment Analysis] Tweet ${index + 1}: "${text.substring(
            0,
            50
          )}..." → ${sentiment} (score: ${score})`
        );
      }

      recentTweets.push({
        text: tweet.text || "No text available",
        sentiment,
        timestamp: tweet.created_at,
      });
    });

    const totalMentions = positive + negative + neutral;
    const trendingTopics = this.extractTrendingTopics(tweets);

    console.log(`📊 [Sentiment Analysis] Results:`, {
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

    console.log(
      `🎯 [Sentiment Analysis] Overall sentiment: ${overallSentiment}`
    );

    return {
      positive,
      negative,
      neutral,
      totalMentions,
      recentTweets: recentTweets.slice(0, 10), // Limit to 10 recent tweets
      trendingTopics,
      overallSentiment,
    };
  }

  private extractTrendingTopics(tweets: Tweet[]): string[] {
    console.log(
      `🔍 [Trending Topics] Extracting topics from ${tweets.length} tweets`
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
    console.log(`📈 [Trending Topics] Found topics: ${result.join(", ")}`);

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
    };
  }
}

export const socialSentimentAPI = new SocialSentimentAPI();
