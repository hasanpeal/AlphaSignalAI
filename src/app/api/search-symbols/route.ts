import { NextRequest, NextResponse } from "next/server";
import { twelveDataAPI } from "@/lib/twelve-data";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    const symbols = await twelveDataAPI.searchSymbols(query);

    return NextResponse.json(symbols);
  } catch (error) {
    console.error("Error searching symbols:", error);
    return NextResponse.json(
      { error: "Failed to search symbols" },
      { status: 500 }
    );
  }
}
