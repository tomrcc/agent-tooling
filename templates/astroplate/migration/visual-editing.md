# Astroplate visual editing implementation

## What was made editable

| Page | Editable regions | Path type |
|---|---|---|
| Homepage banner | title (text), content (text), button label (text), image (image) | Relative (`banner.title`, etc.) |
| Homepage features | array wrapper + per-item: title (text), content (text), image (image) | Relative via array context |
| About | title (text), image (image), content body (text/block) | Relative |
| Blog post | title (text), image (image), content body (text/block) | Relative |
| Contact | title (text, via PageHeader) | Relative |
| CTA section | title (text), description (text), image (image) | Absolute file path |
| Testimonial section | title (text), description (text) | Absolute file path |

## What was left for sidebar editing

- Testimonial individual items (Swiper carousel conflicts with DOM manipulation)
- Navigation menus, social links, site settings (all JSON config files)
- Blog post metadata (author, categories, tags, date, draft)
- Button enable/disable toggles and link URLs
- Feature bulletpoints (nested string arrays -- complex to make inline-editable)

## Files modified

- `astro.config.mjs` -- added `editableRegions()` integration
- `src/layouts/Base.astro` -- added hydration script
- `src/pages/index.astro` -- banner + features editable regions
- `src/pages/about.astro` -- title, image, content editable regions
- `src/layouts/PostSingle.astro` -- title, image, content editable regions
- `src/layouts/partials/PageHeader.astro` -- title editable region
- `src/layouts/partials/CallToAction.astro` -- title, description, image with absolute file paths
- `src/layouts/partials/Testimonial.astro` -- title, description with absolute file paths
