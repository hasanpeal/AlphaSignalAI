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
    setQuery(`${stock.symbol} - ${stock.name}`);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <div className="relative w-full max-w-md" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search for a stock symbol (e.g., AAPL, TSLA)"
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((stock, index) => (
            <div
              key={`${stock.symbol}-${stock.exchange}-${index}`}
              onClick={() => handleSelectStock(stock)}
              className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold text-gray-900">
                    {stock.symbol}
                  </div>
                  <div className="text-sm text-gray-600">{stock.name}</div>
                </div>
                <div className="text-xs text-gray-400">{stock.exchange}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedStock && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            Selected: <span className="font-semibold">{selectedStock}</span>
          </div>
        </div>
      )}
    </div>
  );
}
