# Audit — astro-cactus

## 1. Astro version and dependencies

- **Astro 6.0.4** — full `editableRegions()` support, `src/content.config.ts` with glob loader
- **No UI frameworks** — pure `.astro` components, no React/Vue/Svelte
- **MDX**: `@astrojs/mdx` 5.0.0 installed but **no `.mdx` files exist** in content
- **Tailwind CSS 4.2.1** via `@tailwindcss/vite` (not PostCSS)
- **Package manager**: pnpm (lockfile present)
- **Node**: 22 (`.nvmrc`)
- **Remark plugins**: `remark-reading-time`, `remark-directive` + custom `remark-admonitions`, custom `remark-github-card`
- **Rehype plugins**: `rehype-autolink-headings`, `rehype-external-links`, `rehype-unwrap-images`
- **Other integrations**: `astro-expressive-code`, `astro-icon` (Iconify `@iconify-json/mdi`), `astro-sitemap`, `astro-robots-txt`, `astro-webmanifest`
- **Image**: Satori + sharp for OG image generation, Astro `Image` component for cover images
- **Search**: Pagefind (runs as `postbuild` script)

## 2. Content collections

Defined in `src/content.config.ts` using `defineCollection` + `glob` loaders.

### `post`

- **Loader**: `glob({ base: "./src/content/post", pattern: "**/*.{md,mdx}" })`
- **Schema fields**:
  - `title`: string, max 60
  - `description`: string (required)
  - `coverImage`: optional object (`{ alt: string, src: image() }`) — uses Astro's `image()` for co-located image validation
  - `draft`: boolean, default false
  - `ogImage`: optional string
  - `tags`: string array, default [], deduped + lowercased via transform
  - `publishDate`: string or date → Date transform
  - `updatedDate`: optional string → Date transform
  - `pinned`: boolean, default false
- **Files** (7 total, in subdirectories):
  - `webmentions.md`
  - `testing/long-title.md`, `testing/social-image.md`, `testing/draft-post.md`, `testing/cover-image/index.md`
  - `markdown-elements/index.md`, `markdown-elements/admonitions.md`
- **Co-located assets**: `cover.png` in `testing/cover-image/`, `logo.png` in `markdown-elements/`
- **Consumed by**: `getAllPosts()` in `src/data/post.ts` (filters drafts in production), various page templates
- **Body usage**: Rendered on post detail pages

### `note`

- **Loader**: `glob({ base: "./src/content/note", pattern: "**/*.{md,mdx}" })`
- **Schema fields**:
  - `title`: string, max 60
  - `description`: optional string
  - `publishDate`: ISO datetime with offset → Date transform
- **Files**: 1 (`welcome.md`)
- **Body usage**: Rendered on note detail pages and preview on homepage

### `tag`

- **Loader**: `glob({ base: "./src/content/tag", pattern: "**/*.{md,mdx}" })`
- **Schema fields**:
  - `title`: optional string, max 60
  - `description`: optional string
- **Files**: 1 (`test.md`)
- **Body usage**: Rendered on tag pages (optional enrichment for tag listing). Tag pages are generated from `post.data.tags`, not from the tag collection. Tag collection entries provide optional metadata via `getTagMeta(tag)` which matches `entry.id === tag`.

### Data files outside collections

- `src/data/post.ts` — TypeScript helper functions (`getAllPosts`, `getUniqueTags`, etc.), not static data
- `src/site.config.ts` — site title, author, description, lang, date locale, menu links, expressive-code options (all TypeScript, not CC-editable)
- No JSON/YAML data files

## 3. Pages and routing

| Route file | URL pattern | Data source |
|---|---|---|
| `index.astro` | `/` | `getAllPosts()` (latest 10 + pinned 3), `getCollection("note")` (latest 5) |
| `about.astro` | `/about/` | Hardcoded prose |
| `404.astro` | `/404/` | None |
| `posts/[...page].astro` | `/posts/`, `/posts/2/` | `getAllPosts()` paginated (10/page) + `getUniqueTags` |
| `posts/[...slug].astro` | `/posts/{post.id}/` | `getAllPosts()` → `params: { slug: post.id }` |
| `notes/[...page].astro` | `/notes/`, `/notes/2/` | `getCollection("note")` paginated (10/page) |
| `notes/[...slug].astro` | `/notes/{note.id}/` | `getCollection("note")` → `params: { slug: note.id }` |
| `tags/index.astro` | `/tags/` | `getAllPosts()` → unique tags with counts |
| `tags/[tag]/[...page].astro` | `/tags/{tag}/`, `/tags/{tag}/2/` | Posts filtered by tag, paginated |
| `rss.xml.ts` | `/rss.xml` | Posts RSS |
| `notes/rss.xml.ts` | `/notes/rss.xml` | Notes RSS |
| `og-image/[...slug].png.ts` | `/og-image/{post.id}.png` | Satori-generated OG images |

**Routing uses `post.id`** (filename-based from glob loader), not frontmatter `slug`. No posts have a `slug` frontmatter field.

**Subdirectory impact**: Posts in subdirectories get ids like `testing/cover-image` (for `index.md`) or `testing/long-title`. The `[...slug]` rest param handles the nested segments. CC URL pattern needs `[full_slug]` — verify against `dist/` output.

## 4. Layouts and components

### Base layout (`src/layouts/Base.astro`)
- Wraps: `<BaseHead>`, `<ThemeProvider>`, `<SkipLink>`, `<Header>`, `<main><slot /></main>`, `<Footer>`
- Props: `meta: SiteMeta` (title, description, ogImage, articleDate)

### Blog post layout (`src/layouts/BlogPost.astro`)
- Wraps `Base` with post-specific meta
- Contains: `<Masthead>`, optional `<TOC>`, `<slot>` (post body), `<WebMentions>`, scroll-to-top button

### Key components
- `Masthead.astro` — post hero with cover image (Astro `Image`), title, date, reading time, tags
- `PostPreview.astro` — post list item
- `Note.astro` — note display/preview
- `TOC.astro` / `TOCHeading.astro` — table of contents from headings
- `Search.astro` — Pagefind search UI
- `SocialList.astro` — hardcoded social links
- `ThemeToggle.astro` / `ThemeProvider.astro` — dark/light mode

### Source editable candidates
- **`index.astro`**: Hero title ("Hello World!") and description paragraph — simple hardcoded text, good for source editables
- **`about.astro`**: Entire prose `<div>` content — good for block source editable

### Classification of static pages
- **`index.astro`**: Source editables — fixed layout with a few hardcoded text elements, programmatic post/note lists
- **`about.astro`**: Source editables — simple prose content in a fixed layout
- Neither page has structured/repeated data needing content collection extraction

## 5. Build pipeline

- `build`: `astro build`
- `postbuild`: `pagefind --site dist` — must include in CC build command
- No pre-build scripts
- `astro.config.ts`: `output` default (static), no `trailingSlash`, no `build.format` override (defaults to `directory`)
- **Environment variables**: `WEBMENTION_API_KEY` (server, secret, optional), `WEBMENTION_URL` (client, public, optional), `WEBMENTION_PINGBACK` (client, public, optional)
- `postinstall`: `npm rebuild sharp --force`

## 6. Flags and special patterns

- **Co-located images with `image()` Zod type**: `coverImage.src` uses `image()` which expects importable local files. Incompatible with CC image uploads to `public/images/`. Must migrate to `z.string()`.
- **Remark admonitions**: `:::note`, `:::tip`, `:::caution` etc. These are markdown extensions that CC's content editor will NOT preserve on round-trip. Present in `admonitions.md` example post. Document as limitation.
- **Remark github-card**: `::github{repo="..."}` directive. Same CC limitation. Present in `markdown-elements/index.md`.
- **Markdown tables**: 18 occurrences in `markdown-elements/index.md`. Need `markdown.options.table: true`.
- **No inline HTML snippets**: No `<figure>`, `<video>`, `<details>`, `<iframe>` in content files.
- **No MDX files**: Despite `@astrojs/mdx` being installed, all content is `.md`.
- **Expressive Code**: Code blocks with syntax highlighting via `astro-expressive-code`. Works at build time, no CC implications.
- **Date format inconsistency**: Some posts use informal dates ("11 Oct 2023", "6 December 2024"), others use ISO format. Astro coerces all to Date objects. CC datetime inputs expect ISO 8601.
- **Astro 6 `content.config.ts`**: Uses the modern `src/content.config.ts` pattern (not legacy `src/content/config.ts`).
