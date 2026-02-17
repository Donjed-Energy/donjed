import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Listen on all interfaces (required for ngrok to connect)
    host: "0.0.0.0",

    // Use port 5175 to match ngrok
    port: 5175,

    // Allow all hostnames (prevents the "Blocked request" error)
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".ngrok.io",
      ".ngrok-free.app",
      ".ngrok-free.dev",
      "tenuously-mackinawed-eliz.ngrok-free.dev",
    ],

    // Enable broad CORS rules for development
    cors: true,

    // Configure HMR to work over the HTTPS tunnel
    hmr: {
      clientPort: 443,
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: [
            "@radix-ui/react-dialog",
            "@radix-ui/react-slot",
            "lucide-react",
          ],
          charts: ["recharts"],
          pdf: ["pdfjs-dist"],
        },
      },
    },
  },
});
