"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import ChatInterface from "@/components/ChatInterface";
import { X } from "lucide-react";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  const handleExit = () => {
    setSelectedStock("");
    setResetKey((prev) => prev + 1); // Force ChatInterface to completely reset
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Main Content - Full Screen Chat */}
      <main className="h-screen flex flex-col">
        {/* Header with branding and search */}
        <div className="flex items-center justify-between p-4">
          {/* Left side - Branding */}
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-light tracking-tight text-white">
              AlphaSignalAI
            </h1>
          </div>

          {/* Right side - Stock Search (only show when no stock selected) */}
          {!selectedStock && (
            <div className="flex-1 max-w-[120px] sm:max-w-[200px] md:max-w-md ml-2 sm:ml-4">
              <StockSearch
                onStockSelect={setSelectedStock}
                selectedStock={selectedStock}
              />
            </div>
          )}
        </div>

        {/* Chat Interface - Full Screen */}
        <div className="flex-1 relative">
          {selectedStock && (
            <button
              onClick={handleExit}
              className="absolute top-4 left-4 z-10 p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <ChatInterface key={resetKey} selectedStock={selectedStock} />
        </div>
      </main>
    </div>
  );
}
