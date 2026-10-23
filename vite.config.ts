import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { VitePWA } from "vite-plugin-pwa";
import { nitro } from "nitro/vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: { 
        entry: "src/server.ts" 
      },
    }),
    nitro({
      preset: "vercel"
    }),
    react(),
    tailwindcss(),
    tsConfigPaths(),
    VitePWA({
      strategies: "generateSW",
      registerType: "autoUpdate",
      injectRegister: null,
      filename: "sw.js",
      devOptions: { enabled: false },
      includeAssets: ["favicon.png", "robots.txt"],
      manifest: {
        name: "RaileX — Smart Train Booking",
        short_name: "RaileX",
        description: "Search trains, understand availability and manage journeys — works offline.",
        display: "standalone",
        background_color: "#0b0e14",
        theme_color: "#0b0e14",
        start_url: "/",
        icons: [
          { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/favicon.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,json,svg,png,webp,jpg,ico,woff2,mp3}"],
        navigateFallback: "/",
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // HTML navigations: always try the network first, fall back to the cached shell.
            urlPattern: ({ request }) => request.mode === "navigate",
            handler: "NetworkFirst",
            options: { cacheName: "railex-pages", networkTimeoutSeconds: 4 },
          },
          {
            // Hashed same-origin build assets, audio, logos and icons.
            urlPattern: ({ request, sameOrigin }) =>
              sameOrigin && ["script", "style", "image", "font", "audio"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "railex-assets",
              expiration: { maxEntries: 300, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin && url.pathname.endsWith(".json"),
            handler: "StaleWhileRevalidate",
            options: { cacheName: "railex-data" },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
