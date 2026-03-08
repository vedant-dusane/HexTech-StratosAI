import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        // Required for SSE streaming — disable response buffering
        headers: { "Connection": "keep-alive" },
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            proxyReq.setHeader("Accept", "text/event-stream");
          });
        },
      },
      "/health": { target: "http://localhost:8000", changeOrigin: true },
    },
  },
});