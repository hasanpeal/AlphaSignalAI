import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlphaSignalAI - AI-Powered Stock Analysis Tool",
    short_name: "AlphaSignalAI",
    description:
      "Get real-time stock analysis with AI-powered insights. Analyze stocks using Twitter data and comprehensive market analysis.",
    start_url: "https://alpha-signal.xyz/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/alpha_signal_favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icons8-stock-market-cloud-16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/icons8-stock-market-cloud-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons8-stock-market-cloud-96.png",
        sizes: "96x96",
        type: "image/png",
      },
    ],
  };
}
