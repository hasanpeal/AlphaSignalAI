"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface StockSymbol {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

interface StockSearchProps {
  onStockSelect: (symbol: string) => void;
  selectedStock?: string;
}

export default function StockSearch({
  onStockSelect,
  selectedStock,
}: StockSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StockSymbol[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchSymbols = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search-symbols?q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        setResults(data.slice(0, 10)); // Limit to 10 results
        setIsOpen(true);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Error searching symbols:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(searchSymbols, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelectStock(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelectStock = (stock: StockSymbol) => {
    onStockSelect(stock.symbol);
    setQuery(stock.symbol);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter Ticker"
          className="w-full pl-6 sm:pl-10 pr-2 sm:pr-4 py-1.5 sm:py-2 md:py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400 text-xs sm:text-sm md:text-base"
        />
        {isLoading && (
          <div className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-48 sm:max-h-60 overflow-y-auto">
          {results.map((stock, index) => (
            <div
              key={`${stock.symbol}-${stock.exchange}-${index}`}
              onClick={() => handleSelectStock(stock)}
              className={`px-2 sm:px-3 md:px-4 py-2 sm:py-2 md:py-3 cursor-pointer hover:bg-gray-700 active:bg-gray-600 transition-colors text-left ${
                index === selectedIndex ? "bg-gray-700" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-white text-xs sm:text-sm md:text-base truncate text-left">
                    {stock.symbol}
                  </div>
                  <div className="text-xs text-gray-300 truncate hidden sm:block text-left">
                    {stock.name}
                  </div>
                </div>
                <div className="text-xs text-gray-400 ml-1 sm:ml-2 flex-shrink-0 hidden sm:block">
                  {stock.exchange}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStock && (
        <div className="mt-2 p-1.5 sm:p-2 md:p-3 bg-green-900 border border-green-700 rounded-lg">
          <div className="text-xs sm:text-sm text-green-200">
            Selected: <span className="font-semibold">{selectedStock}</span>
          </div>
        </div>
      )}
    </div>
  );
}
