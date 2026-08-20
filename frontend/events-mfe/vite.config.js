import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "eventsMfe",
      filename: "remoteEntry.js",
      exposes: {
        "./EventsApp": "./src/EventsApp.jsx",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: true,
    modulePreload: false,
  },
  server: { port: 5002, cors: true },
  preview: { port: 5002, cors: true },
});
