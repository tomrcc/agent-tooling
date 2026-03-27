# Visual Editing — Astrofy

## Setup

- Installed `@cloudcannon/editable-regions` via setup script
- **Removed** `editableRegions()` integration from `astro.config.mjs` — the integration references `window` at module scope, which crashes during Astro 4's `astro sync` step. This is a compatibility issue with Astro 4; the integration works in Astro 5+.
- Created `src/cloudcannon/registerComponents.ts` as a placeholder (no-op in Astro 4)
- Component re-rendering is **not available** in this migration. Upgrading to Astro 5+ would enable it.
- Text, image, array editing, and source editables work via `data-editable` HTML attributes without the integration.

## Editable regions

### PostLayout

- `data-editable="image"` with `data-prop-src="heroImage"` on hero image
- `data-editable="text"` on title
- `data-editable="text" data-type="block" data-prop="@content"` on body

### StoreItemLayout

- Same pattern as PostLayout for hero image, title, and body content

### Homepage (index.astro)

- `data-editable="text"` on hero.greeting, hero.name, hero.tagline
- `data-editable="text" data-type="block"` on hero.description
- `data-editable="text"` on projects_heading, blog_heading
- `data-editable="array"` with `data-prop="items"` on project cards
- `data-editable="array-item"` on each card

### Projects / Services

- `data-editable="array"` with `data-prop="sections"` on sections
- `data-editable="array-item"` on each section
- Nested `data-editable="array"` with `data-prop="items"` on cards within sections
- `data-editable="text"` on section headings

### CV

- `data-editable="text" data-type="block"` on profile
- `data-editable="array"` on education, experience, certifications, skills
- `data-editable="array-item"` on each entry
- `data-editable="text"` on certification text within array items

## Registered components

- `horizontal-card` → HorizontalCard.astro
- `timeline` → TimeLine.astro

## Conditional guards

All optional fields (hero.greeting, hero.name, hero.tagline, hero.description, profile, section headings) are conditionally rendered with `{field && ...}`.
