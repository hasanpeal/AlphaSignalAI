# AlphaSignalAI - AI-Powered Stock Analysis with Twitter Sentiment

A modern Next.js application that combines real-time stock market data with Twitter/X sentiment analysis to provide comprehensive AI-powered stock insights and investment recommendations.

## 🚀 Features

- **🔍 Smart Stock Search**: Real-time autocomplete search for any stock symbol with company names and exchange information
- **📊 Live Market Data**: Real-time quotes, price history, volume analysis, and 52-week ranges
- **📈 Technical Analysis**: RSI, MACD, and Bollinger Bands indicators with AI interpretation
- **🐦 Twitter Sentiment Analysis**: Analyzes top 60 liked tweets from the last 24 hours for social sentiment
- **🤖 AI-Powered Insights**: Groq-powered AI analysis with conversation memory and context awareness
- **💬 Interactive Chat Interface**: Natural language interface for stock queries with suggested prompts
- **📱 Modern UI**: Responsive design with dark theme and smooth animations
- **🔄 Session Management**: Persistent conversation sessions with automatic cleanup

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **AI**: LangChain with Groq (Llama 4 Scout 17B)
- **Data**: Twelve Data API for stock data
- **Social**: Scraper.tech API for Twitter sentiment
- **UI Components**: Radix UI, Lucide React Icons
- **Styling**: Tailwind CSS with custom animations

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Twelve Data API key
- Groq API key
- Scraper.tech API key (for Twitter sentiment)

## ⚙️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd stock-pilot
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Twelve Data API Key (Required)
TWELVE_DATA_API_KEY=your_twelve_data_api_key_here

# Groq API Key (Required for AI analysis)
GROQ_API_KEY=your_groq_api_key_here

# Scraper.tech API Key (Required for Twitter sentiment)
SCRAPER_API_KEY=your_scraper_api_key_here
```

### 3. Get API Keys

#### Twelve Data API

1. Visit [https://twelvedata.com](https://twelvedata.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

#### Groq API

1. Visit [https://console.groq.com](https://console.groq.com)
2. Create an account and get your API key
3. Add it to your `.env.local` file
4. Used for fast AI responses using Llama 4 Scout 17B model

#### Scraper.tech API

1. Visit [https://scraper.tech](https://scraper.tech)
2. Sign up for an account and get your API key
3. Add it to your `.env.local` file
4. Enables Twitter/X sentiment analysis for stocks

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎯 Usage

### 1. Select a Stock

- Use the search bar to find any stock symbol (e.g., AAPL, TSLA, MSFT)
- The search provides autocomplete with company names and exchanges
- Click on a stock to select it for analysis

### 2. Ask Questions

Once a stock is selected, you can ask questions like:

- "What's the Twitter sentiment for this stock?"
- "Are there any catalysts that could move this stock?"
- "What do the top liked tweets suggest?"
- "Is this a good entry point?"
- "What do the technical indicators show?"
- "How has the stock performed recently?"

### 3. Get AI Analysis

The AI will:

- Fetch real-time stock data and technical indicators
- Analyze Twitter sentiment from top 60 liked tweets (last 24 hours)
- Provide comprehensive investment insights
- Remember conversation context for follow-up questions

## 🔧 API Endpoints

### `/api/chat`

- **POST** `/api/chat`
- Body: `{ message: string, symbol: string, isNewConversation: boolean, sessionId: string }`
- Returns AI analysis response with session management

### `/api/search-symbols`

- **GET** `/api/search-symbols?q=tesla`
- Returns matching stock symbols for search functionality

### `/api/stock-data`

- **GET** `/api/stock-data?symbol=AAPL`
- Returns comprehensive stock data including quote, time series, and technical indicators

### `/api/social-sentiment`

- **GET** `/api/social-sentiment?symbol=AAPL&company=Apple Inc`
- Returns Twitter sentiment analysis for the specified stock

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # AI chat endpoint
│   │   ├── search-symbols/route.ts    # Stock search endpoint
│   │   ├── stock-data/route.ts        # Stock data endpoint
│   │   └── social-sentiment/route.ts  # Twitter sentiment endpoint
│   ├── globals.css                    # Global styles
│   ├── layout.tsx                     # Root layout with favicon
│   ├── manifest.ts                    # PWA manifest
│   └── page.tsx                       # Main page component
├── components/
│   ├── ChatInterface.tsx              # Chat UI with Twitter integration
│   └── StockSearch.tsx                # Stock search component
└── lib/
    ├── ai-chat.ts                     # LangChain + Groq integration
    ├── conversation-store.ts           # Session management
    ├── social-sentiment.ts            # Twitter sentiment analysis
    └── twelve-data.ts                 # Twelve Data API utilities
```

## 🎨 Key Features Explained

### Stock Data Integration

- Real-time quotes and price data from Twelve Data API
- Historical time series data (30 days)
- Technical indicators (RSI, MACD, Bollinger Bands)
- Volume analysis and 52-week ranges

### Twitter Sentiment Analysis

- Analyzes top 60 liked tweets from last 24 hours
- Focuses on cashtag mentions (e.g., $AAPL)
- Sentiment classification (positive/negative/neutral)
- Trending topics extraction
- Engagement metrics (likes, retweets)

### AI Analysis

- Context-aware conversations using LangChain
- Groq-powered responses with Llama 4 Scout 17B
- Comprehensive financial analysis
- Risk assessment and recommendations
- Professional investment insights

### User Experience

- Modern, responsive dark theme design
- Real-time search with autocomplete
- Interactive chat interface with suggested prompts
- Loading states and error handling
- Session persistence with automatic cleanup

## 🔄 Session Management

The application maintains conversation sessions with:

- 30-minute session timeout
- Automatic cleanup of expired sessions
- Context preservation for follow-up questions
- Session reset when switching stocks

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

Ensure all required environment variables are set:

- `TWELVE_DATA_API_KEY`
- `GROQ_API_KEY`
- `SCRAPER_API_KEY`

## 🐛 Troubleshooting

### API Key Issues

- Ensure all API keys are correctly set in `.env.local`
- Check API key permissions and quotas
- Verify API endpoints are accessible

### Build Errors

- Ensure all dependencies are installed: `npm install`
- Check TypeScript compilation: `npm run build`
- Verify environment variables are set

### Runtime Errors

- Check browser console for frontend errors
- Check server logs for API errors
- Verify API endpoints are working

## 📝 Customization

### Adding New Technical Indicators

Edit `src/lib/twelve-data.ts` to add more technical indicators:

```typescript
async getTechnicalIndicators(symbol: string) {
  // Add new indicators here
  const newIndicator = await axios.get(`${TWELVE_DATA_BASE_URL}/new_indicator`, {
    params: { symbol, apikey: this.apiKey }
  });
}
```

### Modifying AI Prompts

Edit `src/lib/ai-chat.ts` to customize the AI analysis:

```typescript
private createSystemPrompt(): string {
  return `Your custom prompt here...`;
}
```

### Twitter Sentiment Keywords

Edit `src/lib/social-sentiment.ts` to customize sentiment analysis keywords.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is for educational purposes only. Not financial advice.

## ⚠️ Disclaimer

This tool is for educational and informational purposes only. It does not constitute financial advice. Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.

## 🔗 Links

- [Twelve Data API](https://twelvedata.com)
- [Groq API](https://console.groq.com)
- [Scraper.tech API](https://scraper.tech)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
