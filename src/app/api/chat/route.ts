import { NextRequest, NextResponse } from "next/server";
import { StockAnalysisChat } from "@/lib/ai-chat";
import { twelveDataAPI } from "@/lib/twelve-data";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, symbol, isNewConversation } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const chat = new StockAnalysisChat();

    let response: string;

    if (symbol && isNewConversation) {
      // Get stock data and analyze
      const stockData = await twelveDataAPI.getStockData(symbol);
      response = await chat.analyzeStock(message, stockData);
    } else {
      // Continue existing conversation
      response = await chat.continueConversation(message);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
