import { NextRequest, NextResponse } from "next/server";
import { socialSentimentAPI } from "@/lib/social-sentiment";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");
    const companyName = searchParams.get("company");

    if (!symbol) {
      return NextResponse.json(
        { error: "Symbol parameter is required" },
        { status: 400 }
      );
    }

    const sentiment = await socialSentimentAPI.getStockSentiment(
      symbol,
      companyName || undefined
    );

    return NextResponse.json(sentiment);
  } catch (error) {
    console.error("Error fetching social sentiment:", error);
    return NextResponse.json(
      { error: "Failed to fetch social sentiment" },
      { status: 500 }
    );
  }
}
