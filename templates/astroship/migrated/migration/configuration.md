# Configuration: Astroship

## Gadget baseline

Ran `gadget generate --auto --init-settings --ssg astro`. Generated config had issues:
- `source` pointed to a node_modules path (wrong) — removed
- Minimal collections config — replaced entirely

## Collections

| Collection | Path | URL | Schemas |
|---|---|---|---|
| pages | `src/content/pages` | `/[slug]/` | homepage, about, pricing, contact |
| blog | `src/content/blog` | `/blog/[slug]/` | default (post) |
| team | `src/content/team` | — | default (team-member) |

### Collection groups

- Pages: pages
- Blogging: blog, team

### add_options

- `pages`: empty array (all four pages have dedicated routes, can't create new ones)
- `blog`: Blog Post only
- `team`: Team Member only

## Schemas

Created in `.cloudcannon/schemas/`:
- `homepage.md`, `about.md`, `pricing.md`, `contact.md` (pages collection)
- `post.md` (blog collection)
- `team-member.md` (team collection)

## Key config decisions

### Markdown tables

`kitchensink.mdx` contains Markdown-syntax tables. Configured:
- `markdown.options.table: true` for serialization
- `_editables.content.table: true` for the toolbar button (with all other defaults re-declared)

### Snippets

Single snippet for `Button` component used in `kitchensink.mdx`:
- Template: `mdx_paired_component` (wraps content)
- `inline: true` since Button can appear mid-sentence
- No `_snippets_imports` needed

### Structures

- `buttons`: for homepage banner buttons array
- `features_items`: for homepage features items array
- `plans`: for pricing plans array

All arrays explicitly linked via `type: array` + `options.structures` in `file_config`.

### Paths

- `static: public`
- `uploads: public/images`

## initial-site-settings.json

- `ssg: astro`
- `build_command: pnpm build`
- `output_path: dist`
- `install_command: pnpm i`
