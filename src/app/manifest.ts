import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Loopit",
    short_name: "Loopit",
    description: "Learning trivia",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#9b73f6",
    icons: [
      {
        src: "/icon-192-nobg.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-192-nobg.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-192-nobg.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}