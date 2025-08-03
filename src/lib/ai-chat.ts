import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StockData } from "./twelve-data";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export class StockAnalysisChat {
  private model: ChatGroq;
  private conversationHistory: BaseMessage[] = [];

  constructor() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is required");
    }

    this.model = new ChatGroq({
      apiKey,
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.7,
    });
  }

  private formatStockDataForPrompt(stockData: StockData): string {
    const { quote, timeSeries, technicalIndicators, socialSentiment } =
      stockData;

    let prompt = `STOCK DATA FOR ${quote.symbol}:\n\n`;

    // Quote information
    prompt += `CURRENT QUOTE:\n`;
    prompt += `- Symbol: ${quote.symbol}\n`;
    prompt += `- Company: ${quote.name}\n`;
    prompt += `- Exchange: ${quote.exchange}\n`;
    prompt += `- Current Price: $${quote.close}\n`;
    prompt += `- Previous Close: $${quote.previous_close}\n`;
    prompt += `- Change: $${quote.change} (${quote.percent_change}%)\n`;
    prompt += `- Volume: ${quote.volume}\n`;
    prompt += `- Average Volume: ${quote.average_volume}\n`;
    prompt += `- Day Range: $${quote.low} - $${quote.high}\n`;
    prompt += `- 52-Week Range: ${quote.fifty_two_week.range}\n`;
    prompt += `- Market Open: ${quote.is_market_open ? "Yes" : "No"}\n\n`;

    // Recent price history (last 5 days)
    if (timeSeries.length > 0) {
      prompt += `RECENT PRICE HISTORY (Last 5 days):\n`;
      timeSeries.slice(0, 5).forEach((day, index) => {
        prompt += `${index + 1}. ${day.datetime}: Open: $${day.open}, High: $${
          day.high
        }, Low: $${day.low}, Close: $${day.close}, Volume: ${day.volume}\n`;
      });
      prompt += "\n";
    }

    // Technical indicators
    if (
      technicalIndicators.rsi ||
      technicalIndicators.macd ||
      technicalIndicators.bollingerBands
    ) {
      prompt += `TECHNICAL INDICATORS:\n`;

      if (technicalIndicators.rsi && technicalIndicators.rsi.length > 0) {
        const latestRSI = technicalIndicators.rsi[0];
        prompt += `- RSI (14): ${latestRSI.rsi} (${this.getRSIInterpretation(
          parseFloat(String(latestRSI.rsi))
        )})\n`;
      }

      if (technicalIndicators.macd && technicalIndicators.macd.length > 0) {
        const latestMACD = technicalIndicators.macd[0];
        prompt += `- MACD: ${String(latestMACD.macd)}, Signal: ${String(
          latestMACD.macd_signal
        )}, Histogram: ${String(latestMACD.macd_hist)}\n`;
      }

      if (
        technicalIndicators.bollingerBands &&
        technicalIndicators.bollingerBands.length > 0
      ) {
        const latestBB = technicalIndicators.bollingerBands[0];
        prompt += `- Bollinger Bands: Upper: ${String(
          latestBB.bb_upper
        )}, Middle: ${String(latestBB.bb_middle)}, Lower: ${String(
          latestBB.bb_lower
        )}\n`;
      }
      prompt += "\n";
    }

    // Social sentiment analysis
    if (socialSentiment && socialSentiment.totalMentions > 0) {
      console.log(`📊 [AI Chat] Including social sentiment data:`, {
        overallSentiment: socialSentiment.overallSentiment,
        totalMentions: socialSentiment.totalMentions,
        positive: socialSentiment.positive,
        negative: socialSentiment.negative,
        neutral: socialSentiment.neutral,
        trendingTopics: socialSentiment.trendingTopics,
      });

      prompt += `SOCIAL MEDIA SENTIMENT ANALYSIS:\n`;
      prompt += `- Overall Sentiment: ${socialSentiment.overallSentiment.toUpperCase()}\n`;
      prompt += `- Total Mentions: ${socialSentiment.totalMentions}\n`;
      prompt += `- Positive Mentions: ${socialSentiment.positive} (${(
        (socialSentiment.positive / socialSentiment.totalMentions) *
        100
      ).toFixed(1)}%)\n`;
      prompt += `- Negative Mentions: ${socialSentiment.negative} (${(
        (socialSentiment.negative / socialSentiment.totalMentions) *
        100
      ).toFixed(1)}%)\n`;
      prompt += `- Neutral Mentions: ${socialSentiment.neutral} (${(
        (socialSentiment.neutral / socialSentiment.totalMentions) *
        100
      ).toFixed(1)}%)\n`;

      if (socialSentiment.trendingTopics.length > 0) {
        prompt += `- Trending Topics: ${socialSentiment.trendingTopics.join(
          ", "
        )}\n`;
      }

      if (socialSentiment.recentTweets.length > 0) {
        prompt += `- Recent Sentiment Examples:\n`;
        socialSentiment.recentTweets.slice(0, 3).forEach((tweet, index) => {
          prompt += `  ${
            index + 1
          }. [${tweet.sentiment.toUpperCase()}] ${tweet.text.substring(
            0,
            100
          )}${tweet.text.length > 100 ? "..." : ""}\n`;
        });
      }
      prompt += `- Engagement Metrics: Average likes, retweets, and replies from analyzed tweets\n`;
      prompt += "\n";
    } else {
      console.log(
        `⚠️ [AI Chat] No social sentiment data available or totalMentions is 0`
      );
    }

    console.log(prompt);

    return prompt;
  }

  private getRSIInterpretation(rsi: number): string {
    if (rsi > 70) return "Overbought";
    if (rsi < 30) return "Oversold";
    return "Neutral";
  }

  private createSystemPrompt(): string {
    return `You are an expert financial analyst and stock market advisor. Your role is to analyze stock data and provide insightful, well-reasoned investment advice.

IMPORTANT GUIDELINES:
1. Always base your analysis on the provided stock data and technical indicators
2. Be objective and balanced in your assessment
3. Consider both fundamental and technical analysis
4. Include social media sentiment analysis when available
5. Mention risks and uncertainties
6. Provide specific reasoning for your recommendations
7. Use clear, professional language
8. If asked about buying/selling, provide a comprehensive analysis with pros and cons
9. Always remind users that this is not financial advice and they should consult with a financial advisor
10. Format your response using clean markdown with proper headings, lists, and emphasis

ANALYSIS FRAMEWORK:
- Current market position and recent performance
- Technical indicators interpretation
- Volume analysis
- Price action and trends
- Social media sentiment analysis (ALWAYS include when available)
- Risk assessment
- Investment recommendation with reasoning

FORMATTING GUIDELINES:
- Use ## for main sections (e.g., "## Current Market Position")
- Use ### for subsections (e.g., "### Technical Indicators", "### Social Sentiment")
- Use **bold** for important numbers and key points
- Use bullet points for lists
- Keep paragraphs concise and well-structured
- ALWAYS include a "## Social Sentiment Analysis" section when social data is available
- Include sentiment percentages, trending topics, and key insights from social media

Remember: Past performance doesn't guarantee future results. Always emphasize the importance of diversification and risk management.`;
  }

  async analyzeStock(
    userQuestion: string,
    stockData: StockData
  ): Promise<string> {
    const systemPrompt = this.createSystemPrompt();
    const stockDataPrompt = this.formatStockDataForPrompt(stockData);

    // Create messages with conversation history
    const messages: BaseMessage[] = [];

    // Add conversation history if available
    if (this.conversationHistory.length > 0) {
      messages.push(...this.conversationHistory);
    }

    // Add current context and question
    const fullPrompt = `${systemPrompt}\n\n${stockDataPrompt}\n\nUSER QUESTION: ${userQuestion}\n\nPlease provide a comprehensive analysis and answer to the user's question.`;
    messages.push(new HumanMessage(fullPrompt));

    console.log(
      `🤖 [AI Chat] Sending request with ${messages.length} messages (${this.conversationHistory.length} from history)`
    );

    try {
      const response = await this.model.invoke(messages);
      const aiMessage = new AIMessage(response.content as string);

      // Update conversation history
      this.conversationHistory.push(new HumanMessage(userQuestion), aiMessage);

      return response.content as string;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I encountered an error while analyzing the stock data. Please try again or check your API configuration.";
    }
  }

  async continueConversation(userMessage: string): Promise<string> {
    try {
      // For follow-up questions, we need to include the system prompt
      const systemPrompt = this.createSystemPrompt();

      const messages: BaseMessage[] = [];

      // Add system prompt first
      messages.push(new HumanMessage(systemPrompt));

      // Add conversation history
      if (this.conversationHistory.length > 0) {
        messages.push(...this.conversationHistory);
      }

      // Add the follow-up question
      messages.push(new HumanMessage(userMessage));

      console.log(
        `🤖 [AI Chat] Continuing conversation with ${messages.length} messages (${this.conversationHistory.length} from history)`
      );

      const response = await this.model.invoke(messages);

      const aiMessage = new AIMessage(response.content as string);
      this.conversationHistory.push(new HumanMessage(userMessage), aiMessage);

      return response.content as string;
    } catch (error) {
      console.error("Error continuing conversation:", error);
      return "I apologize, but I encountered an error while processing your message. Please try again.";
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory.map((message) => ({
      role: message instanceof HumanMessage ? "user" : "assistant",
      content: message.content as string,
      timestamp: new Date(),
    }));
  }
}
