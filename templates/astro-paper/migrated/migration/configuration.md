# Configuration — astro-paper

## Gadget baseline

Generated with `gadget generate --auto --init-settings --ssg astro`. Issues fixed:

- Removed `source` collection (root directory, not content)
- Removed `migration` collection (migration notes, not content)
- Renamed `data_blog` → `blog`
- Added `url` patterns to collections
- Removed incorrect `timezone: Pacific/Auckland` (site uses `SITE.timezone` from config.ts)

## Collections

### `blog`

- Path: `src/data/blog` (non-standard — uses `src/data/` instead of `src/content/`)
- URL: `/posts/[slug]/` (matches `getPath()` routing in `src/utils/getPath.ts`)
- Glob: `**/*.md`
- Editors: content + data
- Schema: single `default` (blog post)

### `pages`

- Path: `src/pages`
- URL: `/[slug]/`
- Glob: `*.md` (only catches `about.md`, excludes `.astro` files)
- Editors: content + data
- `disable_add: true` — about is a one-off page with a dedicated route, don't allow creating new pages

## Site config

`src/config.ts` (`SITE`) and `src/constants.ts` (`SOCIALS`, `SHARE_LINKS`) are TypeScript `as const` objects. Not editable in CloudCannon. Converting to JSON data files would require updating all imports across the project — not worth the effort for this blog template. Documented as developer-only.

## Markdown tables

5 blog posts use markdown table syntax. Set `markdown.options.table: true` and `_editables.content.table: true` so tables round-trip correctly through the rich text editor.

## Build command

CC build: `npx astro build && npx pagefind --site dist`

Skipped from the original `pnpm build` script:
- `astro check` — TypeScript type checking, could fail and block builds unnecessarily
- `cp -r dist/pagefind public/` — only needed for local dev (copies search index for next build)

## Hidden fields

Developer-only fields hidden from editors:
- `canonicalURL` — SEO override, rarely used
- `hideEditPost` — controls GitHub edit link visibility
- `timezone` — per-post timezone override
- `slug` — not in Zod schema, URLs derive from file path
- `layout` — Astro markdown page convention (about.md)

## Not configured

- No `_snippets` (no MDX components)
- No `_structures` / page builder (simple blog)
- No `data_config` (no shared data files — config is in TypeScript)
- No `file_config` (no JSON/YAML data files to configure)
- No `_select_data` (tags use `allow_create` multiselect)
