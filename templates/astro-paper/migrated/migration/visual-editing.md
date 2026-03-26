# Visual Editing — astro-paper

## Setup

- Installed `@cloudcannon/editable-regions` via pnpm
- Added `editableRegions()` integration to `astro.config.ts`
- Created `src/cloudcannon/registerComponents.ts` (comments only — no components registered)
- Imported registerComponents from `src/layouts/Layout.astro` (base layout)

## Editable regions

### PostDetails.astro

- `title` (h1): `data-editable="text" data-prop="title"` — inline text editing
- Article body: `data-editable="text" data-type="block" data-prop="@content"` — rich text editing of the markdown body

### AboutLayout.astro

- `title` (h1): `data-editable="text" data-prop="title"` — inline text editing
- Body content: wrapped `<slot />` in `<div data-editable="text" data-type="block" data-prop="@content">` — rich text editing

### index.astro (homepage hero)

- `h1` "Mingalaba": `data-editable="source" data-path="src/pages/index.astro" data-key="hero-title"` — inline source editing
- Description paragraph: `data-editable="source" data-path="src/pages/index.astro" data-key="hero-description" data-type="block"` — block rich text source editing
- Second paragraph (with `<LinkButton>`): not editable — contains Astro component syntax that the rich text editor can't handle

## Not editable (intentional)

- **Header/Footer**: Site chrome driven by `SITE` const and `SOCIALS` array in TypeScript. Better managed by developers.
- **Tags, dates, social links**: Sidebar/data editor territory — not suited for inline visual editing.
- **Navigation**: Hardcoded in Header component, driven by route structure.

## Component registration

No components registered — this migration uses only primitive editables (text, block text). No component re-rendering needed since:

- No page builder / content_blocks pattern
- No conditional rendering driven by frontmatter toggles in editable areas
- No style/class bindings that need live updates

## Notes

- `astro.config.ts` (not `.mjs`) — the setup script warned about missing `astro.config.mjs` but we handled the integration manually
- The `<slot />` in AboutLayout needed a wrapper `<div>` for the `@content` editable since slot elements can't carry HTML attributes directly
