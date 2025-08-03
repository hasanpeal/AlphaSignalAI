import { NextRequest, NextResponse } from "next/server";
import { twelveDataAPI } from "@/lib/twelve-data";
import { conversationStore } from "@/lib/conversation-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, symbol, isNewConversation, sessionId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Generate session ID if not provided
    const currentSessionId = sessionId || `session_${Date.now()}`;

    // Get or create conversation session
    const chat = conversationStore.getOrCreateSession(currentSessionId);

    let response: string;

    if (symbol && isNewConversation) {
      // Clear previous conversation for new stock analysis
      conversationStore.clearSession(currentSessionId);
      const newChat = conversationStore.getOrCreateSession(currentSessionId);

      // Get stock data and analyze
      const stockData = await twelveDataAPI.getStockData(symbol);
      response = await newChat.analyzeStock(message, stockData);
    } else {
      // Continue existing conversation
      response = await chat.continueConversation(message);
    }

    return NextResponse.json({ response, sessionId: currentSessionId });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}
