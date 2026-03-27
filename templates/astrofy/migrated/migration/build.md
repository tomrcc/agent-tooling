# Build — Astrofy

## Build command

`pnpm build` (runs `astro build`)

No prebuild scripts needed.

## Pre-existing issues fixed

- `@astrojs/sitemap` version incompatibility: `^3.0.1` resolved to 3.7.2 which crashes during build. Pinned to `3.2.1`.
- `rss.xml.js` used old `get()` export instead of Astro 4's `GET()`.

## Editable-regions integration

The `@cloudcannon/editable-regions` Astro integration (`editableRegions()`) is not compatible with Astro 4's `astro sync` step — it references `window` at module evaluation time, before the integration's Vite plugin can shim it. This is specific to Astro 4; astroplate (Astro 6) works fine.

The integration was removed. `data-editable` attributes still work for CloudCannon's visual editor (text editing, image picking, array CRUD). Component re-rendering (live preview updates) requires Astro 5+.

## Verification

Build output contains `data-editable` attributes on all key pages:

- Homepage: 10 editable regions
- CV: 29 editable regions
- Projects: 12 editable regions
- Blog post: 3 editable regions
- Store item: present

All 16 pages generated successfully, sitemap created.
