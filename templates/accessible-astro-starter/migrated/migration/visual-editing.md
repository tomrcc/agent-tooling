# Visual Editing — Accessible Astro Starter

## Setup

- Installed `@cloudcannon/editable-regions` with `--legacy-peer-deps`
- Added `editableRegions()` integration to `astro.config.mjs`
- Created `src/cloudcannon/registerComponents.ts` with Feature, Counter, ContentMedia registrations
- Imported registerComponents from `DefaultLayout.astro`

## Homepage editables

Since homepage reads from `src/content/pages/index.md`:
- Hero: text editables on `hero.gradient_text` and `hero.title`
- Features: array editable with nested text editables on title and description
- Content sections: array editable with image and text editables
- FAQ: text editables on title/description, array editable on items with text editables on content
- Community: text editables on title/description, array editable on members
- Counters: array editable with text editables on count, title, subtitle

## Blog and project editables

- Blog detail: `@content` body editable (block-level rich text)
- Project detail: `@content` body editable (block-level rich text)
- Catch-all page: `@content` body editable

## Source editables

- Contact page: source editables on intro paragraph and description paragraph

## Skipped

- Thank-you page: all text is inside Astro component props, not suitable for source editables
- 404, sitemap, accessible-components, accessible-launcher, color-contrast-checker: tool/showcase/utility pages, not content

## Component registration

Registered components for live re-rendering:
- `feature` → Feature.astro (handles icon + title + description)
- `counter` → Counter.astro (handles count + title + subtitle)
- `content-media` → ContentMedia.astro (handles image + slot content)

Not registered (npm package components that would need display fallbacks):
- Accordion/AccordionItem from accessible-astro-components
- Avatar/AvatarGroup from accessible-astro-components
- Card, Heading, Link, etc. from accessible-astro-components

These would need Astro display fallback components to re-render in the visual editor.
For the initial migration, sidebar editing works for these elements.
