"use client";

import { useState } from "react";
import StockSearch from "@/components/StockSearch";
import ChatInterface from "@/components/ChatInterface";
import { TrendingUp, Bot, BarChart3 } from "lucide-react";

export default function Home() {
  const [selectedStock, setSelectedStock] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-gray-900">
                  AlphasignalAI
                </h1>
              </div>
              <div className="hidden sm:block text-sm text-gray-500">
                Twitter-First Stock Analysis
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Bot className="w-4 h-4" />
                <span>Powered by Groq AI (Llama3-8B)</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Stock Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Select Stock
                </h2>
              </div>

              <div className="space-y-4">
                <StockSearch
                  onStockSelect={setSelectedStock}
                  selectedStock={selectedStock}
                />

                {selectedStock && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">
                      Ready to Analyze
                    </h3>
                    <p className="text-sm text-blue-700">
                      I&apos;ll analyze Twitter sentiment for{" "}
                      <strong>{selectedStock}</strong>, focusing on top 20 liked
                      posts from the last 24 hours to identify potential
                      catalysts.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] lg:h-[700px]">
              <ChatInterface selectedStock={selectedStock} />
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Twitter Sentiment
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Analyzes top 20 liked tweets from the last 24 hours to identify
              sentiment trends and potential catalysts.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Hedge Fund Analysis
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              AlphasignalAI provides institutional-grade analysis focusing on
              catalysts that could move stock prices.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Market Data
              </h3>
            </div>
            <p className="text-gray-600 text-sm">
              Real-time stock data and technical indicators when Twitter
              sentiment is not available.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            <p>AlphasignalAI - Twitter-First Stock Analysis</p>
            <p className="mt-2">Powered by Twitter API and Groq AI</p>
            <p className="mt-2 text-xs">
              This tool is for educational purposes only. Not financial advice.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
