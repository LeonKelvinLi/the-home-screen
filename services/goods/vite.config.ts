import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: process.env.GOODS_BASE_PATH || "/",
  plugins: [react()],
  server: { port: 5191, proxy: { "/api": "http://127.0.0.1:8791" } },
  build: { sourcemap: false, target: "es2022" },
});
