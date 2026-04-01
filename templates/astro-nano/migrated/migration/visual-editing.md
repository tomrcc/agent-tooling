# Visual Editing — astro-nano

## Setup

- Installed `@cloudcannon/editable-regions` via pnpm
- Added `editableRegions()` integration to `astro.config.mjs`
- Created `src/cloudcannon/registerComponents.ts` (currently no component registrations — this simple site doesn't need component re-rendering)
- Added `registerComponents` import to `src/components/Head.astro`

## Editable regions added

### Homepage (`src/pages/index.astro`) — source editables

| Key | Element | Type |
|---|---|---|
| `hero-heading` | "Hi, I'm Nano 👋🏻" | source |
| `posts-heading` | "Latest posts" | source |
| `work-heading` | "Work Experience" | source |
| `projects-heading` | "Recent projects" | source |
| `connect-heading` | "Let's Connect" | source |
| `connect-description` | Contact paragraph | source |

**Not made editable**: The three hero description paragraphs contain `<Link>` Astro components which would not survive source editing. These remain developer-only.

### Blog detail page (`src/pages/blog/[...slug].astro`)

- **Title**: `data-editable="text"` with `data-prop="title"`
- **Content body**: `data-editable="text"` with `data-type="block"` and `data-prop="@content"`

### Project detail page (`src/pages/projects/[...slug].astro`)

- **Title**: `data-editable="text"` with `data-prop="title"`
- **Content body**: `data-editable="text"` with `data-type="block"` and `data-prop="@content"`

### Not covered

- **Work listing page**: Work entries render inline from the collection. Individual fields could use `@file` editables but the work collection has no `url` pattern, and the rendering includes computed content (`dateRange()`) that wouldn't update live.
- **Listing pages** (blog/projects/work): Minimal hardcoded text ("Blog", "Projects", "Work" headings). Not worth the overhead.
- **Header/Footer**: Navigation and theme controls are better managed in code. The site name comes from `consts.ts`.

## No component registrations needed

This site doesn't have:
- Page builder blocks
- Conditional elements that need re-rendering
- Complex component re-rendering needs

The primitive editables (text, source) cover the important editing surfaces.
