import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Pilot - AI-Powered Stock Analysis Tool",
  description:
    "Get real-time stock analysis with AI-powered insights. Analyze stocks using technical indicators, social sentiment, and comprehensive market data. Powered by Twelve Data API and DeepSeek AI.",
  keywords: [
    "stock analysis",
    "AI trading",
    "investment insights",
    "technical indicators",
    "social sentiment",
    "stock market",
    "financial analysis",
    "trading tool",
    "market data",
    "investment advice",
  ],
  authors: [{ name: "Stock Pilot" }],
  creator: "Stock Pilot",
  publisher: "Stock Pilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
