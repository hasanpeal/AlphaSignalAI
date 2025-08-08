import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

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
  title: "AlphaSignalAI",
  description: "AlphaSignalAI",
  keywords: [
    "AlphaSignalAI",
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
    "Twitter sentiment",
    "real-time stock data",
    "AI investment",
    "stock recommendations",
  ],
  authors: [{ name: "AlphaSignalAI" }],
  creator: "AlphaSignalAI",
  publisher: "AlphaSignalAI",
  openGraph: {
    title: "AlphaSignalAI - AI-Powered Stock Analysis",
    description:
      "Get real-time stock analysis with AI-powered insights. Analyze stocks using Twitter data and comprehensive market analysis.",
    url: "https://alpha-signal.xyz",
    siteName: "AlphaSignalAI",
    type: "website",
    images: [
      {
        url: "/icons8-stock-market-cloud-96.png",
        width: 96,
        height: 96,
        alt: "AlphaSignalAI Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AlphaSignalAI - AI-Powered Stock Analysis",
    description:
      "Get real-time stock analysis with AI-powered insights. Analyze stocks using Twitter data and comprehensive market analysis.",
    images: ["/icons8-stock-market-cloud-96.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/alpha_signal_favicon.ico",
    shortcut: "/alpha_signal_favicon.ico",
    apple: "/alpha_signal_favicon.ico",
  },
};

// Mobile-friendly viewport configuration
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // Disable auto-zoom on mobile Safari
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "AlphaSignalAI",
              description:
                "AI-powered stock analysis tool that provides real-time market insights using Twitter sentiment and comprehensive financial data.",
              url: "https://alpha-signal.xyz",
              applicationCategory: "FinanceApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              creator: {
                "@type": "Organization",
                name: "AlphaSignalAI",
              },
              keywords:
                "stock analysis, AI trading, investment insights, Twitter sentiment, financial analysis",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
