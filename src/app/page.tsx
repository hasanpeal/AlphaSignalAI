"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import ChatInterface from "@/components/ChatInterface";
import { RefreshCw, Mail } from "lucide-react";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [resetKey, setResetKey] = useState(0);

  const handleNewChat = () => {
    setSelectedStock("");
    setResetKey((prev) => prev + 1); // Force ChatInterface to completely reset
  };

  const handleContactUs = () => {
    window.open("mailto:Jeremy@shoykhet.co", "_blank");
  };

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-black">
      {/* Header with branding */}
      <div className="flex items-center justify-between p-4 flex-shrink-0 border-b border-gray-800">
        {/* Left side - Branding */}
        <div className="flex items-center space-x-2">
          <h1
            className="text-xl sm:text-2xl font-light tracking-tight text-white cursor-pointer"
            onClick={() => window.location.reload()}
          >
            AlphaSignalAI
          </h1>
        </div>

        {/* Right side - Contact Us and New Chat buttons */}
        <div className="flex items-center space-x-2">
          {!selectedStock && (
            <button
              onClick={handleContactUs}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              <Mail className="w-4 h-4" />
              <span className="cursor-pointer">Contact Us</span>
            </button>
          )}

          {selectedStock && (
            <button
              onClick={handleNewChat}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="cursor-pointer">New Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Interface - Full Screen */}
      <div className="flex-1 min-h-0">
        <ChatInterface
          key={resetKey}
          selectedStock={selectedStock}
          onStockSelect={setSelectedStock}
        />
      </div>
    </div>
  );
}
