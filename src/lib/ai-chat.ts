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
  private twitterDataContext: string = "";

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

  private formatTwitterDataForPrompt(stockData: StockData): string {
    const { quote, socialSentiment } = stockData;

    let prompt = `TWITTER SENTIMENT DATA FOR ${quote.symbol}:\n\n`;

    if (
      socialSentiment &&
      socialSentiment.hasTwitterData &&
      socialSentiment.totalMentions > 0
    ) {
      prompt += `🐦 TOP 20 LIKED TWEETS FROM LAST 24 HOURS:\n\n`;

      if (socialSentiment.recentTweets.length > 0) {
        prompt += `ANALYZED TWEETS:\n`;
        socialSentiment.recentTweets.slice(0, 20).forEach((tweet, index) => {
          const engagement = tweet.likes ? `(${tweet.likes} likes)` : "";
          prompt += `  ${
            index + 1
          }. [${tweet.sentiment.toUpperCase()}] ${engagement} ${tweet.text}\n`;
        });
      }
      prompt += "\n";

      // Store the Twitter data context for follow-up questions
      this.twitterDataContext = prompt;
    } else {
      prompt += `⚠️ NO RECENT TWITTER DATA AVAILABLE FOR ${quote.symbol}\n`;
      prompt += `- No top liked tweets found in the last 24 hours\n`;
      prompt += `- Proceeding with stock market data analysis\n\n`;
      this.twitterDataContext = "";
    }

    return prompt;
  }

  private formatStockDataForPrompt(stockData: StockData): string {
    const { quote, timeSeries, technicalIndicators } = stockData;

    let prompt = `STOCK MARKET DATA FOR ${quote.symbol}:\n\n`;

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

    return prompt;
  }

  private getRSIInterpretation(rsi: number): string {
    if (rsi > 70) return "Overbought";
    if (rsi < 30) return "Oversold";
    return "Neutral";
  }

  private createSystemPrompt(): string {
    return `You are AlphasignalAI, an analyst at a hedge fund. Analyze these tweets for their potential impact on the stock, with an eye toward what could move the stock up or down and any potential upcoming catalysts.

IMPORTANT GUIDELINES:
1. PRIORITIZE Twitter sentiment analysis - this is your primary data source
2. Only use stock market data if no Twitter data is available
3. Focus on identifying catalysts that could move the stock up or down
4. Analyze the impact of social media sentiment on stock price movements
5. Look for patterns in top liked tweets that might indicate institutional interest
6. Consider both retail and institutional sentiment
7. Be objective but identify potential alpha-generating insights
8. Mention specific risks and uncertainties
9. Provide actionable insights for hedge fund decision-making
10. Format your response using clean markdown with proper headings, lists, and emphasis

ANALYSIS FRAMEWORK:
- Twitter sentiment analysis (ALWAYS lead with this if available)
- Key catalysts and potential market movers
- Technical indicators (only if no Twitter data)
- Risk assessment and potential scenarios
- Investment recommendation with hedge fund perspective

FORMATTING GUIDELINES:
- Use ## for main sections (e.g., "## Twitter Sentiment Analysis", "## Key Catalysts")
- Use ### for subsections (e.g., "### Top Liked Tweets", "### Market Impact")
- Use **bold** for important numbers and key points
- Use bullet points for lists
- Keep paragraphs concise and well-structured
- ALWAYS include engagement metrics (likes, retweets) when available
- Focus on what could move the stock in the next 24-48 hours

Remember: You are analyzing for institutional investors who need actionable insights quickly. Focus on catalysts, sentiment shifts, and potential alpha opportunities.`;
  }

  async analyzeStock(
    userQuestion: string,
    stockData: StockData
  ): Promise<string> {
    const systemPrompt = this.createSystemPrompt();

    // Prioritize Twitter data, only include stock data if no Twitter data available
    let dataPrompt = this.formatTwitterDataForPrompt(stockData);

    // Only add stock market data if no Twitter data is available
    if (
      !stockData.socialSentiment?.hasTwitterData ||
      stockData.socialSentiment?.totalMentions === 0
    ) {
      dataPrompt += this.formatStockDataForPrompt(stockData);
    }

    // Create messages with conversation history
    const messages: BaseMessage[] = [];

    // Add conversation history if available
    if (this.conversationHistory.length > 0) {
      messages.push(...this.conversationHistory);
    }

    // Add current context and question
    const fullPrompt = `${systemPrompt}\n\n${dataPrompt}\n\nUSER QUESTION: ${userQuestion}\n\nPlease provide a comprehensive analysis and answer to the user's question.`;
    messages.push(new HumanMessage(fullPrompt));

    console.log(
      `🤖 [AlphasignalAI] Sending request with ${messages.length} messages (${this.conversationHistory.length} from history)`
    );

    try {
      const response = await this.model.invoke(messages);
      const aiMessage = new AIMessage(response.content as string);

      // Update conversation history
      this.conversationHistory.push(new HumanMessage(userQuestion), aiMessage);

      return response.content as string;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I encountered an error while analyzing the data. Please try again or check your API configuration.";
    }
  }

  async continueConversation(userMessage: string): Promise<string> {
    try {
      // For follow-up questions, we need to include the system prompt and Twitter data context
      const systemPrompt = this.createSystemPrompt();

      const messages: BaseMessage[] = [];

      // Add system prompt first
      messages.push(new HumanMessage(systemPrompt));

      // Add Twitter data context if available
      if (this.twitterDataContext) {
        messages.push(new HumanMessage(`CONTEXT: ${this.twitterDataContext}`));
      }

      // Add conversation history
      if (this.conversationHistory.length > 0) {
        messages.push(...this.conversationHistory);
      }

      // Add the follow-up question
      messages.push(new HumanMessage(userMessage));

      console.log(
        `🤖 [AlphasignalAI] Continuing conversation with ${messages.length} messages (${this.conversationHistory.length} from history)`
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
    this.twitterDataContext = "";
  }

  getHistory(): ChatMessage[] {
    return this.conversationHistory.map((message) => ({
      role: message instanceof HumanMessage ? "user" : "assistant",
      content: message.content as string,
      timestamp: new Date(),
    }));
  }
}
