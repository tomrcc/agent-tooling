# Configuration — Astrofy

## Gadget baseline

Gadget generated a minimal config. The `source` path was incorrectly nested — set to `templates/astrofy/migrated` for the monorepo layout.

## Collections

- **pages**: New collection at `src/content/pages/`. URL `[slug]` (filename-based). Schemas: homepage, card_listing, cv, default.
- **blog**: URL `{slug}` (frontmatter-based) because `GENERATE_SLUG_FROM_TITLE = true` means blog URLs come from title-derived slugs. Added `slug` frontmatter to each post.
- **store**: URL `[slug]` (filename-based, `entry.slug`).

## Slug strategy

Blog uses `{slug}` (frontmatter) rather than `{title|slugify|lowercase}` because the template's `createSlug()` strips `[^\w-]` (removes special chars) while CC's slugify replaces them with hyphens. For simple titles they match; for edge cases they diverge. The `slug` field makes it deterministic.

## Structures

- `card_items`: HorizontalCard shape (title, img, desc, url, badge, tags, target)
- `card_sections`: Section with heading + items array
- `timeline_entries`: TimeLine shape (title, subtitle, description)
- `certification_entries`: Link shape (text, url)
- `hero_buttons`: Button shape (text, url, variant, target)

## Schemas

- `homepage`: Hero section + project cards + blog settings. One-off, excluded from add_options.
- `card_listing`: Reusable for projects/services type pages. In add_options.
- `cv`: Resume page. One-off, excluded from add_options.
- `default`: Generic title + body page. In add_options with `editor: content`.
- `post`: Blog post with slug field.
- `store-item`: Store item.

## Notes

- `services.astro` had `title="Projects"` — corrected to "Services" in the content file.
- No markdown tables in content, so `markdown.options.table` left at default.
- No MDX content, so no `_snippets` needed.
- No prebuild scripts needed.
