import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite-plus";
import { plansApiPlugin } from "./src/server/plans-plugin.ts";

const isDev = process.argv.includes("dev") || process.argv.includes("serve");

export default defineConfig({
  plugins: [react(), tailwindcss(), ...(isDev ? [plansApiPlugin()] : [])],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  staged: {
    "*": "vp check --fix",
  },
  lint: { options: { typeAware: true, typeCheck: true } },
});
