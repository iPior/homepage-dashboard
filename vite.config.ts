import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { readFile } from "node:fs/promises";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  publicDir: false,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "runtime-config-dev-server",
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url?.split("?")[0] !== "/config.json") {
            next();
            return;
          }

          try {
            const config = await readFile(fileURLToPath(new URL("./config.json", import.meta.url)));
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(config);
          } catch (error) {
            if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
              res.statusCode = 404;
              res.end("config.json not found");
              return;
            }

            next(error);
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
