import { defineConfig } from "vite";

export default defineConfig(({ command }) => ({
  // En build: GitHub Pages en /Bug-Hunter/. En dev: raíz local.
  base: command === "build" ? "/Bug-Hunter/" : "/",
  build: {
    target: "esnext",
    chunkSizeWarningLimit: 1600,
  },
  server: {
    port: 5173,
    open: true,
  },
}));