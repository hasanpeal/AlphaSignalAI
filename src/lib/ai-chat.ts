import { ChatDeepSeek } from "@langchain/deepseek";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { StockData } from "./twelve-data";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export class StockAnalysisChat {
  private model: ChatDeepSeek;
  private conversationHistory: BaseMessage[] = [];

  constructor() {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error("DEEPSEEK_API_KEY is required");
    }

    this.model = new ChatDeepSeek({
      apiKey,
      model: "deepseek-chat",
      temperature: 0.7,
    });
  }

  private formatStockDataForPrompt(stockData: StockData): string {
    const { quote, timeSeries, technicalIndicators } = stockData;

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
4. Mention risks and uncertainties
5. Provide specific reasoning for your recommendations
6. Use clear, professional language
7. If asked about buying/selling, provide a comprehensive analysis with pros and cons
8. Always remind users that this is not financial advice and they should consult with a financial advisor
9. Format your response using clean markdown with proper headings, lists, and emphasis

ANALYSIS FRAMEWORK:
- Current market position and recent performance
- Technical indicators interpretation
- Volume analysis
- Price action and trends
- Risk assessment
- Investment recommendation with reasoning

FORMATTING GUIDELINES:
- Use ## for main sections (e.g., "## Current Market Position")
- Use ### for subsections (e.g., "### Technical Indicators")
- Use **bold** for important numbers and key points
- Use bullet points for lists
- Keep paragraphs concise and well-structured

Remember: Past performance doesn't guarantee future results. Always emphasize the importance of diversification and risk management.`;
  }

  async analyzeStock(
    userQuestion: string,
    stockData: StockData
  ): Promise<string> {
    const systemPrompt = this.createSystemPrompt();
    const stockDataPrompt = this.formatStockDataForPrompt(stockData);

    const fullPrompt = `${systemPrompt}\n\n${stockDataPrompt}\n\nUSER QUESTION: ${userQuestion}\n\nPlease provide a comprehensive analysis and answer to the user's question.`;

    try {
      const response = await this.model.invoke([new HumanMessage(fullPrompt)]);

      const aiMessage = new AIMessage(response.content as string);
      this.conversationHistory.push(new HumanMessage(userQuestion), aiMessage);

      return response.content as string;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I encountered an error while analyzing the stock data. Please try again or check your API configuration.";
    }
  }

  async continueConversation(userMessage: string): Promise<string> {
    try {
      const messages = [
        ...this.conversationHistory,
        new HumanMessage(userMessage),
      ];

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
