import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  envDir: "../..",
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  ssr: {
    noExternal: ["@url-shortener/engine"],
    // Prisma Client must stay external: bundling it leaves a bare
    // ".prisma/client/default" specifier that Node cannot resolve
    // at runtime (server crashes on start).
    external: ["@prisma/client", ".prisma/client/default"],
  },
  optimizeDeps: {
    include: ["@url-shortener/engine"],
  },
});
