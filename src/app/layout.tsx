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
        url: "/alpha_signal_favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
    shortcut: "/alpha_signal_favicon.ico",
    apple: "/alpha_signal_favicon.ico",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
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
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
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
