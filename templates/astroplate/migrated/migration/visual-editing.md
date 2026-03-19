# Astroplate Visual Editing Notes

## Setup

1. Installed `@cloudcannon/editable-regions` and `js-beautify` with `--legacy-peer-deps`
2. Added the Astro integration (`editableRegions()`) to `astro.config.mjs` after `mdx()`
3. Created `src/cloudcannon/registerComponents.ts` with the core hydration import, and imported it from `Base.astro`

## Editable Regions Added

### Homepage (`src/pages/index.astro`)

Data source: `src/content/pages/index.md` (pages collection, `_schema: homepage`).

**Banner** (frontmatter `banner` object):
- `banner.title` -- text editable on `<h1>`
- `banner.content` -- text editable on `<p>`
- `banner.image` -- image editable wrapping `<ImageMod>`
- `banner.button.label` -- text editable on `<span>` inside the CTA link

**Features** (frontmatter `features` array):
- `features` -- array editable on container `<div>`
- Each feature is an `array-item` with:
  - `title` -- text editable on `<h2>`
  - `content` -- text editable on `<p>`
  - `image` -- image editable wrapping `<ImageMod>`
  - `button.label` -- text editable on `<span>` inside the link
- Bulletpoints are not individually editable (array of strings with check icons -- better edited via the data panel)

### Call to Action (`src/layouts/partials/CallToAction.astro`)

Data source: `src/data/call-to-action.json` (data file, imported as JSON).

Uses `@data[call-to-action]` paths for visual editing:
- `@data[call-to-action].title` -- text editable on `<h2>`
- `@data[call-to-action].description` -- text editable on `<p>`
- `@data[call-to-action].image` -- image editable wrapping `<ImageMod>`
- `@data[call-to-action].button.label` -- text editable on `<span>`

### Testimonial (`src/layouts/partials/Testimonial.astro`)

Data source: `src/data/testimonial.json` (data file, imported as JSON).

Uses `@data[testimonial]` paths for the header. Individual testimonial items inside the Swiper carousel are not editable inline -- Swiper's DOM management conflicts with editable region DOM manipulation.

- `@data[testimonial].title` -- text editable on `<h2>`
- `@data[testimonial].description` -- text editable on `<p>`
- Individual testimonials: edit via the data panel (sidebar)

### About page (`src/pages/[regular].astro`)

Data source: `src/content/pages/about.md` (pages collection).

- `title` -- text editable on `<h1>` (via `PageHeader` partial)
- `@content` -- block-level rich text editable on the content body `<div>`

### Contact page (`src/pages/contact.astro`)

Data source: `src/content/pages/contact.md` (pages collection).

- `title` -- text editable on `<h1>` (via `PageHeader` partial)
- `name_label`, `email_label`, `message_label`, `submit_label` -- text editable on `<span>` elements inside form labels/button

### Blog Post (`src/layouts/PostSingle.astro`)

- `title` -- text editable on `<h1>`
- `image` -- image editable wrapping `<ImageMod>`
- `@content` -- block-level rich text editable on the content body `<div>`

### Page Header (`src/layouts/partials/PageHeader.astro`)

- `title` -- text editable on `<h1>`

## Configuration Patterns Applied

- **`_schema: homepage`** on `src/content/pages/index.md` -- tells CloudCannon to use the homepage schema (with banner/features fields) rather than the default page schema
- **`_enabled_editors: [visual, data]`** on the pages collection -- allows both visual and data editing
- **`data_config`** for CTA and testimonial -- shared section data lives in `src/data/*.json`, edited via the data editor, referenced in templates via JSON import and in visual editor via `@data` paths

## Not Made Editable (Deliberate)

| Element | Reason |
|---------|--------|
| Testimonial items (inside Swiper) | Swiper carousel DOM management conflicts with editable regions |
| Feature bulletpoints | Array of strings with icon elements -- better edited in data panel |
| Blog metadata (author, date, categories, tags) | Sidebar/data editor fields, not visual content |
| Navigation (Header/Footer) | Complex structure, config-driven (`menu.json`) -- data editor |
| SEO fields (meta_title, description) | Not visible on page; sidebar fields |
| Draft toggle, enable toggles | Boolean switches -- sidebar only |
| URL/link fields | Not visible on page; sidebar fields |
| MDX shortcodes (elements.mdx) | Won't render in visual editor |

## Component Re-rendering

Not implemented in this migration. Text and image editable regions provide real-time inline editing. Full component re-rendering (via `registerAstroComponent()`) is a future enhancement for templates where full live preview is a priority.
