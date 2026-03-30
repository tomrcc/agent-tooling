# Configuration — astro-cactus

## Gadget baseline

Generated via `gadget generate --auto --init-settings --ssg astro`. Gadget produced a minimal config (paths, timezone, markdown). Note: Gadget wrote files to a nested `source` path — moved to project root and removed the source key.

## Collections

### post

- `path: src/content/post` with `glob: "**/*.md"`
- URL: `/posts/[full_slug]/` — posts live in subdirectories (`testing/`, `markdown-elements/`) so `[slug]` alone wouldn't work. `[full_slug]` = `[relative_base_path]/[slug]` which handles nested paths. Needs verification against `dist/` output for `index.md` files.
- Editors: visual, content, data
- Schema: single `default` schema for blog posts
- `add_options` with `editor: content` since posts are markdown-heavy

### note

- `path: src/content/note` with `glob: "**/*.md"`
- URL: `/notes/[slug]/`
- Single schema, `editor: content` on add

### tag

- `path: src/content/tag` with `glob: "**/*.md"`
- URL: `/tags/[slug]/` — tag pages are generated from `post.data.tags`, tag collection provides optional metadata. URL only resolves when posts actually use that tag.
- `_enabled_editors: [content, data]` — no visual editing for tag pages (generated from post data, not directly from tag collection file)

### pages

- `path: src/pages` with `glob: [index.astro, about.astro]`
- URL: `/[slug]/`
- `_enabled_editors: [visual]` — `.astro` files only support visual editing
- `disable_add: true` — these are fixed pages with hardcoded routes

## Inputs

- `title`: text (schema has max 60)
- `description`: textarea
- `publishDate` / `updatedDate`: datetime
- `draft` / `pinned`: switch
- `tags`: multiselect with `allow_create: true`
- `coverImage`: object (src + alt)
- `ogImage`: image with comment about auto-generation

## Markdown

- `table: true` in both `markdown.options` and `_editables.content` — content files contain Markdown tables
- `gfm: true` for GitHub Flavored Markdown compatibility

## What was NOT configured

- `_structures`: No arrays in frontmatter that need structure definitions
- `_snippets`: No MDX files and no inline HTML that needs snippet support. Admonition (`:::`) and github-card (`::github{}`) syntax from remark plugins are build-time only — CC content editor won't preserve them, documented as limitation
- `data_config`: No JSON/YAML data files. Site config is in TypeScript (`src/site.config.ts`) — left as developer-only
- `file_config`: No files needing scoped input overrides
- `_select_data`: Tags use `allow_create: true` on the multiselect, no fixed value set needed

## Build

- Install: `pnpm i`
- Build: `npx astro build && npx pagefind --site dist` (includes Pagefind search indexing)
- Output: `dist`
