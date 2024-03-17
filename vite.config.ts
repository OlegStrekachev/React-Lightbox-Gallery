import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  server: {
    // Replace with ENV variable
    host: "0.0.0.0",
  },
  base: "/react-lightbox/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // ... other configurations
});
