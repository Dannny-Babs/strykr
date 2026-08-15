import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cordena",
    short_name: "Cordena",
    description:
      "Vehicle transaction reconciliation, evidence, exceptions, and review decisions in one explainable compliance ledger.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#176b51",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.svg", sizes: "180x180", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
