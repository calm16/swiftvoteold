import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "shell",
      remotes: {
        authMfe: "http://localhost:5001/assets/remoteEntry.js",
        eventsMfe: "http://localhost:5002/assets/remoteEntry.js",
        contestantsMfe: "http://localhost:5003/assets/remoteEntry.js",
        votingMfe: "http://localhost:5004/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
  build: {
    target: "esnext",
    minify: false,
    modulePreload: false,
  },
  server: { port: 5000, cors: true },
  preview: { port: 5000, cors: true },
});
