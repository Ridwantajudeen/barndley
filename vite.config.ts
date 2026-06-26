import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import { nitro } from "nitro/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@tanstack/react-router": resolve(rootDir, "src/router-shim.tsx"),
    },
  },
  plugins: [
    nitro(),
    react(),
    tsconfigPaths(),
    tailwindcss(),
  ],
  server: {
    fs: {
      strict: false,
    },
  },
});
