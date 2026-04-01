import { defineConfig } from "astro/config";
import AutoImport from "astro-auto-import";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import editableRegions from "@cloudcannon/editable-regions/astro-integration";

export default defineConfig({
  site: "https://astro-nano-demo.vercel.app",
  integrations: [
    AutoImport({
      imports: [
        "./src/components/FormattedDate.astro",
        "./src/components/MdxButton.astro",
      ],
    }),
    mdx(),
    sitemap(),
    tailwind(),
    editableRegions(),
  ],
});
