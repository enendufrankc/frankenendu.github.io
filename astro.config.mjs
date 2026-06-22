import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  // TODO: change to "https://inflecthub.com" once DNS + Vercel custom domain are configured
  site: "https://frankenendugithubio.vercel.app",
  output: "server",
  adapter: vercel(),
  integrations: [react(), sitemap()],
  markdown: {
    shikiConfig: {
      theme: "github-dark",
      wrap: true,
    },
  },
});