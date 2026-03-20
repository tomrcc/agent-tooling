# Astroplate Visual Editing Notes

## Setup

1. Installed `@cloudcannon/editable-regions` and `js-beautify` with `--legacy-peer-deps`
2. Added the Astro integration (`editableRegions()`) to `astro.config.mjs` after `mdx()`
3. Created `src/cloudcannon/registerComponents.ts` with the core hydration import, and imported it from `Base.astro`

## Editable Regions Added

### Homepage (`src/pages/index.astro`)

Data source: `src/content/pages/index.md` (pages collection, `_schema: homepage`).

**Banner** (frontmatter `banner` object) -- registered component (`banner`):
- Extracted to `src/layouts/partials/Banner.astro`, wrapped with `<editable-component data-component="banner" data-prop="banner">`
- `title` -- text editable on `<h1>`
- `content` -- text editable on `<p>`
- `image` -- image editable wrapping `<ImageMod>`
- `button.label` -- text editable on `<span>` inside the CTA link
- Made a component because `button.enable` and `image` are conditional -- toggling them wouldn't live-update without a full re-render

**Features** (frontmatter `features` array) -- registered component (`features`):
- Extracted to `src/layouts/partials/Features.astro`, wrapped with `<editable-component data-component="features" data-prop="features">`
- Array editable on container `<div>` with array-items for each feature
- Each feature has:
  - `title` -- text editable on `<h2>`
  - `content` -- text editable on `<p>`
  - `image` -- image editable wrapping `<ImageMod>`
  - `button.label` -- text editable on `<span>` inside the link
  - `bulletpoints` -- nested array editable with text editables per bullet
- Made a component because `button.enable` is conditional and alternating styles (`bg-gradient`, `md:order-2`) are index-driven

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
| Feature bulletpoints | ~~Array of strings with icon elements -- better edited in data panel~~ Now editable inline (array + text editables) |
| Blog metadata (author, date, categories, tags) | Sidebar/data editor fields, not visual content |
| Navigation (Header/Footer) | Complex structure, config-driven (`menu.json`) -- data editor |
| SEO fields (meta_title, description) | Not visible on page; sidebar fields |
| Draft toggle, enable toggles | Boolean switches -- sidebar only |
| URL/link fields | Not visible on page; sidebar fields |
| MDX shortcodes (elements.mdx) | Won't render in visual editor |

## Component Re-rendering

Registered components in `src/cloudcannon/registerComponents.ts`:

| Component | Key | Type | Why |
|-----------|-----|------|-----|
| `Banner` | `banner` | Astro | Conditional button (`button.enable`) and image (`image &&`) |
| `Features` | `features` | Astro | Conditional buttons, index-driven alternating styles |
| `AnnouncementDisplay` | `announcement` | React | Conditional display (`enable` toggle), styled banner |

Sections without conditional elements or style bindings (Testimonial, CallToAction, PageHeader) use primitive editables only -- text and image regions provide real-time inline editing without component registration.
