# Content — astro-paper

## Summary

No content file changes needed. Blog posts have consistent frontmatter and clean markdown bodies.

## Frontmatter consistency

All posts have the required fields (`title`, `pubDatetime`, `description`). Optional fields are used consistently:

- `draft` — present and explicit in most posts (good for CC toggle visibility)
- `featured` — present in most posts, some omit it (schema default handles it)
- `modDatetime` — present when applicable, correctly nullable
- `tags` — always present as a key, sometimes with no values (defaults to `["others"]` at runtime)
- `author` — present in all posts, defaults to `SITE.author` via schema

## `slug` in frontmatter

Most posts include `slug` but it's not in the Zod schema. URLs are derived from file paths via `getPath()`. The `slug` field is effectively ignored at build time. Hidden in CC config to avoid confusion.

## No `-index.md` files

The blog collection has no index files. No renaming needed.

## Markdown bodies

- No MDX components or shortcodes
- 5 posts contain markdown tables — handled by `markdown.options.table: true` in CC config
- Empty bodies on some posts (frontmatter-only) — normal

### Inline HTML snippets

Several posts contain inline HTML that has no markdown equivalent. These were normalized to consistent patterns and configured as raw snippets in `cloudcannon.config.yml`:

- **`<figure>`** (3 instances) — image with figcaption. Removed `class="text-center"` from `<figcaption>` on 2 instances to standardize. Snippet exposes `src`, `alt`, and `caption` fields to editors.
- **`<video>` with controls** (2 instances) — interactive demo video. Snippet exposes `src` field; presentation attributes (`autoplay`, `muted`, `controls`) are hardcoded.
- **`<video>` with loop** (4 instances) — short animated clip. Removed `class="border border-skin-line"` from 1 instance to match the other 3. Snippet exposes `src` field; presentation attributes hardcoded.

## About page

`src/pages/about.md` has clean frontmatter (`layout`, `title`) and a prose body. No changes needed.
