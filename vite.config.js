import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    include: ["tests/**/*.test.js"],
    coverage: {
      enabled: true,
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage"
    }
  }
});
