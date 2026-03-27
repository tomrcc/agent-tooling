# Content — Astrofy

## Pages collection

Created `src/content/pages/` with four content files extracted from hardcoded `.astro` pages:

- `index.md` (`_schema: homepage`) — hero section fields, project card items array, blog settings
- `projects.md` (`_schema: card_listing`) — 2 sections with card items
- `services.md` (`_schema: card_listing`) — 1 section with card items
- `cv.md` (`_schema: cv`) — profile text, education/experience timeline arrays, certifications, skills

Each `.astro` page in `src/pages/` was updated to fetch from the collection via `getEntry("pages", "<id>")`.

## Zod schemas

Added to `src/content/config.ts`:

- `homepageSchema`: hero object + items array + blog settings
- `cardListingSchema`: sections array (heading + items)
- `cvSchema`: profile + education/experience/certifications/skills arrays
- `pageSchema`: generic title + body (fallback)
- Union: `[homepageSchema, cvSchema, cardListingSchema, pageSchema]`
- Used `.nullish()` on optional fields to handle YAML `null` values from empty keys

## Blog slug frontmatter

Added `slug` field to all three blog posts with pre-computed values matching `createSlug(title)` output. Updated `blog/[slug].astro`, `blog/[...page].astro`, `blog/tag/[tag]/[...page].astro`, and `index.astro` to prefer `post.data.slug` over `createSlug()`.

## Catch-all route

Added `src/pages/[...slug].astro` to serve pages created from the CMS. Handles `card_listing` schema (sections + cards) and `default` schema (prose markdown body). Astro's routing priority means dedicated routes (`index.astro`, `projects.astro`, etc.) always win.

## Fixes

- Fixed `services.astro` title from "Projects" to using `data.title` (resolves to "Services" from the content file)
