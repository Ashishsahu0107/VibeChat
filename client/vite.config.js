import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:4500",
        changeOrigin: true,
      },
      "/socket.io": {
        target: "http://localhost:4500",
        ws: true,
      },
    },
  },
  build: {
    target: "es2022",
    cssMinify: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("node_modules")) {
            if (id.includes("emoji-picker-react")) {
              return "emoji-picker";
            }
            if (id.includes("socket.io-client")) {
              return "socket-client";
            }
            if (id.includes("react-easy-crop")) {
              return "cropper";
            }
            if (id.includes("react-icons")) {
              return "icons";
            }
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom") ||
              id.includes("zustand")
            ) {
              return "vendor";
            }
          }
        },
      },
    },
  },
});
