import axios from "axios";
import { socialSentimentAPI, SocialSentiment } from "./social-sentiment";

const TWELVE_DATA_BASE_URL = "https://api.twelvedata.com";

export interface StockQuote {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  previous_close: string;
  change: string;
  percent_change: string;
  average_volume: string;
  is_market_open: boolean;
  fifty_two_week: {
    low: string;
    high: string;
    low_change: string;
    high_change: string;
    low_change_percent: string;
    high_change_percent: string;
    range: string;
  };
}

export interface TimeSeriesData {
  datetime: string;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
}

export interface TechnicalIndicator {
  datetime: string;
  [key: string]: string | number;
}

export interface StockData {
  quote: StockQuote;
  timeSeries: TimeSeriesData[];
  technicalIndicators: {
    rsi: TechnicalIndicator[] | null;
    macd: TechnicalIndicator[] | null;
    bollingerBands: TechnicalIndicator[] | null;
  };
  socialSentiment?: SocialSentiment;
}

class TwelveDataAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TWELVE_DATA_API_KEY || "";
    if (!this.apiKey) {
      throw new Error("TWELVE_DATA_API_KEY is required");
    }
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    try {
      const response = await axios.get(`${TWELVE_DATA_BASE_URL}/quote`, {
        params: {
          symbol: symbol.toUpperCase(),
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Failed to fetch quote");
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching quote:", error);
      throw error;
    }
  }

  async getTimeSeries(
    symbol: string,
    interval: string = "1day",
    outputsize: number = 30
  ): Promise<TimeSeriesData[]> {
    try {
      const response = await axios.get(`${TWELVE_DATA_BASE_URL}/time_series`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval,
          outputsize,
          apikey: this.apiKey,
        },
      });

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Failed to fetch time series");
      }

      return response.data.values || [];
    } catch (error) {
      console.error("Error fetching time series:", error);
      throw error;
    }
  }

  async getTechnicalIndicators(symbol: string): Promise<{
    rsi: TechnicalIndicator[] | null;
    macd: TechnicalIndicator[] | null;
    bollingerBands: TechnicalIndicator[] | null;
  }> {
    try {
      // Get RSI
      const rsiResponse = await axios.get(`${TWELVE_DATA_BASE_URL}/rsi`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: "1day",
          series_type: "close",
          time_period: 14,
          apikey: this.apiKey,
        },
      });

      // Get MACD
      const macdResponse = await axios.get(`${TWELVE_DATA_BASE_URL}/macd`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: "1day",
          series_type: "close",
          fastperiod: 12,
          slowperiod: 26,
          signalperiod: 9,
          apikey: this.apiKey,
        },
      });

      // Get Bollinger Bands
      const bbResponse = await axios.get(`${TWELVE_DATA_BASE_URL}/bbands`, {
        params: {
          symbol: symbol.toUpperCase(),
          interval: "1day",
          series_type: "close",
          time_period: 20,
          nbdevup: 2,
          nbdevdn: 2,
          apikey: this.apiKey,
        },
      });

      return {
        rsi: rsiResponse.data.status === "ok" ? rsiResponse.data.values : null,
        macd:
          macdResponse.data.status === "ok" ? macdResponse.data.values : null,
        bollingerBands:
          bbResponse.data.status === "ok" ? bbResponse.data.values : null,
      };
    } catch (error) {
      console.error("Error fetching technical indicators:", error);
      return {
        rsi: null,
        macd: null,
        bollingerBands: null,
      };
    }
  }

  async getStockData(symbol: string): Promise<StockData> {
    try {
      const [quote, timeSeries, technicalIndicators] = await Promise.all([
        this.getQuote(symbol),
        this.getTimeSeries(symbol),
        this.getTechnicalIndicators(symbol),
      ]);

      // Get social sentiment in parallel (non-blocking)
      let socialSentiment: SocialSentiment | undefined;
      console.log(
        `🔄 [Twelve Data] Fetching social sentiment for ${symbol} (${quote.name})`
      );
      try {
        socialSentiment = await socialSentimentAPI.getStockSentiment(
          symbol,
          quote.name
        );
        console.log(
          `✅ [Twelve Data] Social sentiment fetched successfully for ${symbol}`
        );
      } catch (error) {
        console.error(
          `❌ [Twelve Data] Error fetching social sentiment for ${symbol}:`,
          error
        );
        // Don't fail the entire request if sentiment fails
      }

      return {
        quote,
        timeSeries,
        technicalIndicators,
        socialSentiment,
      };
    } catch (error) {
      console.error("Error fetching stock data:", error);
      throw error;
    }
  }

  async searchSymbols(query: string): Promise<
    {
      symbol: string;
      name: string;
      exchange: string;
      type: string;
    }[]
  > {
    try {
      const response = await axios.get(
        `${TWELVE_DATA_BASE_URL}/symbol_search`,
        {
          params: {
            symbol: query,
            apikey: this.apiKey,
          },
        }
      );

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Failed to search symbols");
      }

      return response.data.data || [];
    } catch (error) {
      console.error("Error searching symbols:", error);
      return [];
    }
  }
}

export const twelveDataAPI = new TwelveDataAPI();
