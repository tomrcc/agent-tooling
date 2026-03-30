import { defineConfig } from 'astro/config'
import { fileURLToPath } from 'url'
import AutoImport from 'astro-auto-import'
import compress from 'astro-compress'
import icon from 'astro-icon'
import mdx from '@astrojs/mdx'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { enhanceConfigForWorkspace } from './scripts/workspace-config.js'
import editableRegions from "@cloudcannon/editable-regions/astro-integration";

// Vite configuration with path aliases and SCSS settings
const viteConfig = {
  css: {
    preprocessorOptions: {
      scss: {
        logger: {
          warn: () => {},
        },
      },
    },
  },
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@public': fileURLToPath(new URL('./public', import.meta.url)),
      '@post-images': fileURLToPath(new URL('./public/posts', import.meta.url)),
      '@project-images': fileURLToPath(new URL('./public/projects', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@theme-config': fileURLToPath(new URL('./theme.config.ts', import.meta.url)),
    },
  },
}

// https://astro.build/config
export default defineConfig({
  compressHTML: true,
  site: 'https://accessible-astro-starter.incluud.dev',
  integrations: [
    editableRegions(),
    AutoImport({
      imports: [
        '@components/BreakoutImage.astro',
        '@components/BlockQuote.astro',
        '@components/ImageGallery.astro',
      ],
    }),
    compress(),
    icon(),
    mdx(),
    sitemap(),
  ],
  vite: enhanceConfigForWorkspace(viteConfig),
})
