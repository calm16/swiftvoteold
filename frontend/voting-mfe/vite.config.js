import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "votingMfe",
      filename: "remoteEntry.js",
      exposes: {
        "./VotingApp": "./src/VotingApp.jsx",
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
  server: { port: 5004, cors: true },
  preview: { port: 5004, cors: true },
});
