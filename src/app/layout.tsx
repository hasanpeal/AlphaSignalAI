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
  title: "AlphaSignalAI",
  description:
    "AlphaSignalAI is an AI-powered stock analysis tool that uses Twitter data to analyze stocks",
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
  authors: [{ name: "AlphaSignalAI" }],
  creator: "AlphaSignalAI",
  publisher: "AlphaSignalAI",
  icons: {
    icon: [
      {
        url: "/icons8-stock-market-cloud-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/icons8-stock-market-cloud-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/icons8-stock-market-cloud-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
    shortcut: "/icons8-stock-market-cloud-32.png",
    apple: "/icons8-stock-market-cloud-96.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
