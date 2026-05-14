import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon-16x16.png",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "icons/*.png",
      ],
      // ─── Web App Manifest ────────────────────────────────────────
      manifest: {
        name: "Water Tracker",
        short_name: "WaterTrack",
        description: "Stay hydrated — track your daily water intake offline.",
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
      // ─── Workbox Service Worker Configuration ────────────────────
      workbox: {
        // Cache static build assets with CacheFirst (long-lived)
        runtimeCaching: [
          {
            // API calls — NetworkFirst: tries server, falls back to cache
            urlPattern: /\/api\//,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Google Fonts stylesheets — StaleWhileRevalidate
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "google-fonts-stylesheets",
            },
          },
          {
            // Google Fonts webfonts — CacheFirst (long TTL)
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-webfonts",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Images — CacheFirst
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
        // Pre-cache the app shell (all build output)
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Ensure the app loads offline even on navigation
        navigateFallback: "/index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
      // Dev options: enable SW during development for testing
      devOptions: {
        enabled: false, // set to true to test SW in dev mode (may cause hot-reload issues)
        type: "module",
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
