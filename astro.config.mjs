import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: process.env.SITE_URL ?? "https://your-username.github.io",
  base: process.env.BASE_PATH ?? "/",
  trailingSlash: "always",
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-light",
    },
  },
});
