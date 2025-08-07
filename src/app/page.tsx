"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import ChatInterface from "@/components/ChatInterface";
import { RefreshCw } from "lucide-react";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  const handleNewChat = () => {
    setSelectedStock("");
    setResetKey((prev) => prev + 1); // Force ChatInterface to completely reset
  };

  return (
    <div
      className="h-screen bg-black flex flex-col overflow-hidden"
      suppressHydrationWarning
    >
      {/* Main Content - Full Screen Chat */}
      <main className="flex flex-col h-full" suppressHydrationWarning>
        {/* Header with branding */}
        <div className="flex items-center justify-between p-2 sm:p-4 flex-shrink-0">
          {/* Left side - Branding */}
          <div className="flex items-center space-x-2">
            <h1
              className="text-xl sm:text-2xl font-light tracking-tight text-white cursor-pointer"
              onClick={() => window.location.reload()}
            >
              AlphaSignalAI
            </h1>
          </div>

          {/* Right side - New Chat button (only show when stock is selected) */}
          {selectedStock && (
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-xs sm:text-sm"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="cursor-pointer">New Chat</span>
            </button>
          )}
        </div>

        {/* Chat Interface - Full Screen */}
        <div className="flex-1 relative min-h-0">
          <ChatInterface
            key={resetKey}
            selectedStock={selectedStock}
            onStockSelect={setSelectedStock}
          />
        </div>
      </main>
    </div>
  );
}
