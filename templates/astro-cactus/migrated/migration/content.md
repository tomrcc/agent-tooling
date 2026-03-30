# Content — astro-cactus

## Changes made

### coverImage schema migration

Changed `coverImage.src` from `image()` to `z.string()` in `src/content.config.ts`. The `image()` Zod helper validates co-located images (relative paths like `./cover.png`), which is incompatible with CloudCannon image uploads to `public/images/`.

- Moved `src/content/post/testing/cover-image/cover.png` to `public/images/cover-image.png`
- Updated frontmatter path from `./cover.png` to `/images/cover-image.png`
- Updated `Masthead.astro` to use `<img>` instead of Astro's `<Image>` component (which requires `ImageMetadata` from `image()`)
- Trade-off: Loses Astro's automatic image optimization for cover images. New uploads via CC will use standard paths.

The co-located `logo.png` in `markdown-elements/` is referenced from the markdown body (`![...](./logo.png)`), not frontmatter — left in place since markdown image references are handled differently by Astro's build pipeline.

### Date normalization

Converted all informal date strings to ISO 8601 format:
- `"11 Oct 2023"` → `"2023-10-11T00:00:00Z"`
- `6 December 2024` → `"2024-12-06T00:00:00Z"`
- `"01 Feb 2023"` → `"2023-02-01T00:00:00Z"`
- etc.

Astro's `z.string().or(z.date()).transform(val => new Date(val))` coerces any format, but CC's datetime inputs work best with ISO 8601.

### Explicit draft field

Added `draft: false` to all posts that didn't have an explicit `draft` field. The schema defaults to `false`, so this is functionally identical, but gives editors a visible toggle in the CC sidebar.

## Limitations documented

### Remark plugin content

The following remark directive syntax will not survive round-tripping through CC's content editor:
- **Admonitions** (`:::note`, `:::tip`, `:::caution`, `:::danger`) — `remark-directive` + custom `remark-admonitions` plugin
- **GitHub cards** (`::github{repo="owner/repo"}`) — custom `remark-github-card` plugin

These render correctly at build time but CC's content editor treats them as plain text. Editing posts with these directives will likely strip or mangle them. Editors should use the data editor for frontmatter changes on affected posts and avoid editing the body content of `admonitions.md` through CC.
