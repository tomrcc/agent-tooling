# Content — Accessible Astro Starter

## Blog conversion

Converted the API-driven blog (JSONPlaceholder) to file-based content collection:
- Created 6 sample blog posts in `src/content/blog/` with accessibility-themed content
- Added `blog` collection to `src/content.config.ts` with full schema
- Rewrote `blog/[...page].astro` to use `getCollection('blog')` with sort by date and pagination
- Rewrote `blog/[post].astro` to use collection entry with `render()` for markdown body
- Rewrote `FeaturedPosts.astro` to use `getCollection('blog')` instead of API fetch
- `BLOG_API_URL` env var is no longer used; could be removed from `astro.config.mjs` env schema

## Homepage extraction

Extracted all homepage hardcoded content into `src/content/pages/index.md`:
- Hero: title, gradient_text, image, buttons array
- Features: 9 items with icon, title, description
- Content sections: 2 items with image, heading, content, reverse_image
- FAQ: title, description, link, 5 items
- Community: title, description, 9 members
- Counters: 4 items with count, title, subtitle
- Toggle booleans for featured projects/posts sections

Updated `src/pages/index.astro` to fetch from content collection and render data-driven.

Added catch-all route `src/pages/[...slug].astro` for CMS-created pages.

## Auto-import setup

Installed `astro-auto-import` and configured for `BreakoutImage` and `BlockQuote` components.
Removed explicit import statements from all 7 project MDX files (kept `Image` from `astro:assets`).

## Content review findings

- All 7 project MDX files have consistent frontmatter matching the Zod schema
- No markdown tables found in content files
- No dash-index convention used
- Counter `count` values quoted as strings (e.g. `"1.100+"`) to avoid YAML numeric parsing
- No Astro template artifacts found in extracted content
- `Image` from `astro:assets` is still explicitly imported in project MDX files (can't be auto-imported from virtual module)
