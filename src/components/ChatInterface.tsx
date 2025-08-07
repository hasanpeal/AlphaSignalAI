"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import StockSearch from "@/components/StockSearch";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  selectedStock?: string;
  onStockSelect?: (symbol: string) => void;
}

export default function ChatInterface({
  selectedStock,
  onStockSelect,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [analysisStep, setAnalysisStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const analysisSteps = [
    { text: "Searching Twitter", icon: "🔍" },
    { text: "Extracting top tweets", icon: "📊" },
    { text: "Analyzing tweets", icon: "💡" },
    { text: "Extracting keywords", icon: "🔍" },
    { text: "Analyzing keywords", icon: "💭" },
    { text: "Identifying catalysts", icon: "⚡" },
    { text: "Generating insights", icon: "💡" },
  ];

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setAnalysisStep((prev) => (prev + 1) % analysisSteps.length);
      }, 800);
      return () => clearInterval(interval);
    } else {
      setAnalysisStep(0);
    }
  }, [isLoading, analysisSteps.length]);

  const sendMessage = async (messageToSend?: string) => {
    const message = messageToSend || inputMessage;
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
          symbol: selectedStock,
          isNewConversation: messages.length === 0,
          sessionId: sessionId,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update session ID if provided
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const suggestedPrompts = selectedStock
    ? [
        `What's the Twitter sentiment for ${selectedStock}?`,
        `Are there any catalysts that could move ${selectedStock}?`,
        `What do the top liked tweets suggest for ${selectedStock}?`,
        `Is this a good entry point for ${selectedStock}?`,
      ]
    : [];

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-4 sm:py-8 px-2 sm:px-4">
            <p className="text-2xl sm:text-4xl font-light tracking-tight mb-2">
              I am AlphaSignalAI
            </p>
            <p className="text-gray-400 mb-6 sm:mb-8 font-light text-sm sm:text-base">
              {selectedStock
                ? `How can I help you analyze ${selectedStock} today?`
                : "Simply enter a ticker first and ask questions"}
            </p>

            {/* Stock Search - Only show when no stock is selected */}
            {!selectedStock && onStockSelect && (
              <div className="max-w-md mx-auto mb-6 sm:mb-8">
                <StockSearch
                  onStockSelect={onStockSelect}
                  selectedStock={selectedStock}
                />
              </div>
            )}

            {/* Suggested Prompts */}
            {suggestedPrompts.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:gap-4 max-w-2xl mx-auto">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => sendMessage(prompt)}
                    className="p-3 sm:p-4 bg-gray-800 rounded-lg text-left hover:bg-gray-700 transition-colors text-xs sm:text-sm font-light"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex items-start max-w-[85%] sm:max-w-[80%] ${
                  message.role === "user"
                    ? "flex-row-reverse space-x-reverse space-x-3"
                    : "space-x-3"
                }`}
              >
                <div
                  className={`flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-700 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  ) : (
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-3 py-2 sm:px-4 sm:py-2 ${
                    message.role === "user"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-800 text-white"
                  }`}
                >
                  {message.role === "user" ? (
                    <div className="whitespace-pre-wrap font-light text-sm sm:text-base">
                      {message.content}
                    </div>
                  ) : (
                    <div className="prose prose-sm prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-sm sm:text-base font-semibold mb-2 text-white tracking-tight">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-sm sm:text-base font-medium mb-2 mt-3 text-white tracking-tight">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm sm:text-base font-medium mb-1 mt-2 text-white tracking-tight">
                              {children}
                            </h3>
                          ),
                          h4: ({ children }) => (
                            <h4 className="text-sm sm:text-base font-normal mb-1 mt-2 text-white tracking-tight">
                              {children}
                            </h4>
                          ),
                          h5: ({ children }) => (
                            <h5 className="text-sm sm:text-base font-normal mb-1 text-white tracking-tight">
                              {children}
                            </h5>
                          ),
                          h6: ({ children }) => (
                            <h6 className="text-sm sm:text-base font-normal mb-1 text-white tracking-tight">
                              {children}
                            </h6>
                          ),
                          p: ({ children }) => (
                            <p className="mb-2 text-sm sm:text-base text-white font-light leading-relaxed">
                              {children}
                            </p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-2 space-y-1 text-sm sm:text-base text-white font-light">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-2 space-y-1 text-sm sm:text-base text-white font-light">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-sm sm:text-base text-white font-light">
                              {children}
                            </li>
                          ),
                          strong: ({ children }) => (
                            <strong className="text-sm sm:text-base font-medium text-white">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="text-sm sm:text-base italic text-white font-light">
                              {children}
                            </em>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-700 px-1 py-0.5 rounded text-sm sm:text-base font-mono text-white">
                              {children}
                            </code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-gray-600 pl-4 italic text-sm sm:text-base text-gray-300 font-light">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                  <div
                    className={`text-xs mt-1 ${
                      message.role === "user"
                        ? "text-blue-200"
                        : "text-gray-400"
                    } font-light`}
                  >
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gray-700 text-white flex items-center justify-center">
                <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
              <div className="bg-gray-800 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse text-blue-400 text-base sm:text-lg">
                    {analysisSteps[analysisStep].icon}
                  </div>
                  <span className="text-gray-300 font-light text-sm sm:text-base">
                    {analysisSteps[analysisStep].text}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-800 p-2 sm:p-4 bg-black">
        <div className="flex items-center space-x-2 bg-gray-800 rounded-lg px-2 sm:px-3 py-2">
          <input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Send a message..."
            disabled={!selectedStock || isLoading}
            className="flex-1 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:cursor-not-allowed font-light text-sm sm:text-base"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputMessage.trim() || !selectedStock || isLoading}
            className="p-1.5 sm:p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Send className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
