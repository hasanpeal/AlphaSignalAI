# Stock Pilot - AI-Powered Stock Analysis Tool

A Next.js application that combines real-time stock data from Twelve Data API with DeepSeek AI to provide intelligent stock analysis and investment insights.

## Features

- 🔍 **Stock Search**: Search and select any stock symbol with autocomplete
- 📊 **Real-Time Data**: Live stock data including price, volume, and technical indicators
- 🤖 **AI Analysis**: DeepSeek AI-powered analysis with context memory
- 📈 **Technical Indicators**: RSI, MACD, and Bollinger Bands analysis
- 💬 **Interactive Chat**: Natural language interface for stock queries
- 🎯 **Investment Insights**: Comprehensive buy/sell analysis and recommendations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: LangChain with DeepSeek AI
- **Data**: Twelve Data API
- **UI**: Lucide React Icons

## Prerequisites

- Node.js 18+
- npm or yarn
- Twelve Data API key
- DeepSeek API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd stock-pilot
npm install
```

### 2. Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Twelve Data API Key
TWELVE_DATA_API_KEY=your_twelve_data_api_key_here

# DeepSeek API Key
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Scraper.tech API Key (for social sentiment analysis)
SCRAPER_API_KEY=your_scraper_api_key_here
```

### 3. Get API Keys

#### Twelve Data API

1. Visit [https://twelvedata.com](https://twelvedata.com)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your `.env.local` file

#### DeepSeek API

1. Visit [https://platform.deepseek.com](https://platform.deepseek.com)
2. Create an account and get your API key
3. Add it to your `.env.local` file

#### Scraper.tech API (Optional - for social sentiment analysis)

1. Visit [https://scraper.tech](https://scraper.tech)
2. Sign up for an account and get your API key
3. Add it to your `.env.local` file
4. This enables Twitter/X sentiment analysis for stocks

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage

### 1. Select a Stock

- Use the search bar to find any stock symbol (e.g., AAPL, TSLA, MSFT)
- The search provides autocomplete with company names and exchanges
- Click on a stock to select it for analysis

### 2. Ask Questions

Once a stock is selected, you can ask questions like:

- "Is this a good time to buy?"
- "What do the technical indicators suggest?"
- "How has the stock performed recently?"
- "What are the risks and opportunities?"
- "Should I sell my position?"

### 3. Get AI Analysis

The AI will:

- Fetch real-time stock data
- Analyze technical indicators (RSI, MACD, Bollinger Bands)
- Provide comprehensive investment insights
- Remember conversation context for follow-up questions

## Example Use Case

1. **Select Tesla (TSLA)** from the stock search
2. **Ask**: "Is this a good time to buy Tesla?"
3. **AI Response**: The AI will analyze:
   - Current price and recent performance
   - Technical indicators (RSI, MACD, Bollinger Bands)
   - Volume analysis
   - Risk assessment
   - Investment recommendation with reasoning

## API Endpoints

### `/api/stock-data`

- **GET** `/api/stock-data?symbol=AAPL`
- Returns comprehensive stock data including quote, time series, and technical indicators

### `/api/search-symbols`

- **GET** `/api/search-symbols?q=tesla`
- Returns matching stock symbols for search functionality

### `/api/chat`

- **POST** `/api/chat`
- Body: `{ message: "string", symbol: "string", isNewConversation: boolean }`
- Returns AI analysis response

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # AI chat endpoint
│   │   ├── search-symbols/route.ts # Stock search endpoint
│   │   └── stock-data/route.ts    # Stock data endpoint
│   ├── globals.css                # Global styles
│   ├── layout.tsx                 # Root layout
│   └── page.tsx                   # Main page component
├── components/
│   ├── ChatInterface.tsx          # Chat UI component
│   └── StockSearch.tsx            # Stock search component
└── lib/
    ├── ai-chat.ts                 # LangChain + DeepSeek integration
    └── twelve-data.ts             # Twelve Data API utilities
```

## Key Features Explained

### Stock Data Integration

- Real-time quotes and price data
- Historical time series data
- Technical indicators (RSI, MACD, Bollinger Bands)
- Volume and market analysis

### AI Analysis

- Context-aware conversations using LangChain
- Comprehensive financial analysis
- Risk assessment and recommendations
- Professional investment insights

### User Experience

- Modern, responsive design
- Real-time search with autocomplete
- Interactive chat interface
- Loading states and error handling

## Customization

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

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform

## Troubleshooting

### API Key Issues

- Ensure both API keys are correctly set in `.env.local`
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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is for educational purposes only. Not financial advice.

## Disclaimer

This tool is for educational and informational purposes only. It does not constitute financial advice. Always consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results.
