import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AlphaSignalAI - AI-Powered Stock Analysis Tool",
    short_name: "AlphaSignalAI",
    description:
      "Get real-time stock analysis with AI-powered insights. Analyze stocks using Twitter data and comprehensive market analysis.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#3b82f6",
    icons: [
      {
        src: "/alpha_signal_favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
