import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "water-bottle.png", // ضفنا أيقونة الماية بتاعتك هنا
      ],
      manifest: {
        name: "Water Tracker",
        short_name: "WaterTrack",
        description: "Stay hydrated — track your daily water intake.",
        start_url: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#0f172a",
        theme_color: "#60a5fa",
        categories: ["health", "fitness", "lifestyle"],
        icons: [
          {
            src: "/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      workbox: {
        // هنخلي الكاش للملفات الثابتة بس عشان السرعة والأيقونة
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallback: "/index.html",
      },
    }),
  ],
  optimizeDeps: {
    exclude: ["api/utils/db.js", "mongoose"],
  },
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
    fs: {
      allow: ["src", "public", "backend"],
    },
  },
});
