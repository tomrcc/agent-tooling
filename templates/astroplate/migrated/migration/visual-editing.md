# Astroplate Visual Editing Notes

## Setup

1. Installed `@cloudcannon/editable-regions` and `js-beautify` with `--legacy-peer-deps`
2. Added the Astro integration (`editableRegions()`) to `astro.config.mjs` after `mdx()`
3. Created `src/cloudcannon/registerComponents.ts` with the core hydration import, and imported it from `Base.astro`

## Editable Regions Added

### Homepage (`src/pages/index.astro`)

**Banner** (data from `homepage/index.md`):
- `banner.title` -- text editable on `<h1>`
- `banner.content` -- text editable on `<p>`
- `banner.image` -- image editable wrapping `<ImageMod>`
- `banner.button.label` -- text editable on `<span>` inside the CTA link

**Features** (array from `homepage/index.md`):
- `features` -- array editable on container `<div>`
- Each feature is an `array-item` with:
  - `title` -- text editable on `<h2>`
  - `content` -- text editable on `<p>`
  - `image` -- image editable wrapping `<ImageMod>`
  - `button.label` -- text editable on `<span>` inside the link
- Bulletpoints are not individually editable (array of strings with check icons -- better edited via the data panel)

### Call to Action (`src/layouts/partials/CallToAction.astro`)

Uses cross-file editing since data comes from `src/content/sections/call-to-action.md`:
- `@file[src/content/sections/call-to-action.md].title` -- text editable on `<h2>`
- `@file[src/content/sections/call-to-action.md].description` -- text editable on `<p>`
- `@file[src/content/sections/call-to-action.md].image` -- image editable wrapping `<ImageMod>`
- `@file[src/content/sections/call-to-action.md].button.label` -- text editable on `<span>`

### Testimonial (`src/layouts/partials/Testimonial.astro`)

Uses cross-file editing for the header. Individual testimonial items inside the Swiper carousel are not editable inline -- Swiper's DOM management conflicts with editable region DOM manipulation.

- `@file[src/content/sections/testimonial.md].title` -- text editable on `<h2>`
- `@file[src/content/sections/testimonial.md].description` -- text editable on `<p>`
- Individual testimonials: edit via the data panel (sidebar)

### Blog Post (`src/layouts/PostSingle.astro`)

- `title` -- text editable on `<h1>`
- `image` -- image editable wrapping `<ImageMod>`
- `@content` -- block-level rich text editable on the content body `<div>`

### Page Header (`src/layouts/partials/PageHeader.astro`)

- `title` -- text editable on `<h1>`

## Not Made Editable (Deliberate)

| Element | Reason |
|---------|--------|
| Testimonial items (inside Swiper) | Swiper carousel DOM management conflicts with editable regions |
| Feature bulletpoints | Array of strings with icon elements -- better edited in data panel |
| Blog metadata (author, date, categories, tags) | Sidebar/data editor fields, not visual content |
| Navigation (Header/Footer) | Complex structure, config-driven (`menu.json`) -- data editor |
| SEO fields (meta_title, description) | Not visible on page; sidebar fields |
| Draft toggle, enable toggles | Boolean switches -- sidebar only |
| MDX shortcodes (elements.mdx) | Won't render in visual editor |

## Component Re-rendering

Not implemented in this migration. Text and image editable regions provide real-time inline editing. Full component re-rendering (via `registerAstroComponent()`) is a future enhancement for templates where full live preview is a priority.
