# Audit — astro-paper

## 1. Astro version and dependencies

- **Astro**: ^5.16.6
- **Framework integrations**: None (no React/Vue/Svelte)
- **CSS**: Tailwind CSS 4 via `@tailwindcss/vite` + `@tailwindcss/typography`
- **Markdown**: `remark-toc`, `remark-collapse`, Shiki with `min-light`/`night-owl` themes + notation transformers
- **No MDX** — all content is plain `.md`
- **Package manager**: pnpm (lockfile present)
- **Node version**: Not specified (no `.nvmrc` or `engines`)

## 2. Content collections

### `blog`

- **Loader**: `glob({ pattern: "**/[^_]*.md", base: "./src/data/blog" })`
- **Base directory**: `src/data/blog/` (non-standard — not in `src/content/`)
- **Pattern**: Excludes files starting with `_` in the filename, but `_releases/` subdirectory files are included if the filename itself doesn't start with `_`
- **Schema fields**:
  - `author`: string, default `SITE.author`
  - `pubDatetime`: date (required)
  - `modDatetime`: date, optional, nullable
  - `title`: string (required)
  - `featured`: boolean, optional
  - `draft`: boolean, optional
  - `tags`: string array, default `["others"]`
  - `ogImage`: image() or string, optional
  - `description`: string (required)
  - `canonicalURL`: string, optional
  - `hideEditPost`: boolean, optional
  - `timezone`: string, optional
- **Extra frontmatter**: Posts include `slug` in frontmatter but it's NOT in the Zod schema — ignored at build time. URLs derive from file path via `getPath()`.
- **Consumed by**: `getCollection("blog")` in multiple pages, filtered through `getSortedPosts()`, `postFilter()`, `getPostsByTag()`, `getUniqueTags()`
- **Body content**: Rendered on post detail pages via `<Content />`

### Data files outside collections

- `src/config.ts` — `SITE` object (`as const`): website URL, author, title, desc, ogImage, feature flags (lightAndDarkMode, showArchives, showBackButton, editPost, dynamicOgImage), pagination (postPerIndex, postPerPage), scheduling, i18n (lang, dir, timezone)
- `src/constants.ts` — `SOCIALS` and `SHARE_LINKS` arrays with icon imports (TypeScript, not editable in CC)

## 3. Pages and routing

| Route | File | Data source |
|-------|------|-------------|
| `/` | `index.astro` | `blog` collection (featured + recent), hardcoded hero text |
| `/about` | `about.md` | Markdown body, `layout` frontmatter |
| `/posts/`, `/posts/2/` | `posts/[...page].astro` | `blog` collection, paginated |
| `/posts/<path>/` | `posts/[...slug]/index.astro` | Single blog post via `getPath()` |
| `/tags/` | `tags/index.astro` | Derived from blog tags |
| `/tags/<tag>/` | `tags/[tag]/[...page].astro` | Blog posts filtered by tag, paginated |
| `/archives` | `archives/index.astro` | Blog posts grouped by year/month |
| `/search` | `search.astro` | Pagefind UI (no content data) |
| `/rss.xml` | `rss.xml.ts` | Blog collection |
| `/robots.txt` | `robots.txt.ts` | Site URL |
| `/og.png` | `og.png.ts` | Site-level OG image (satori) |
| `/posts/<slug>/index.png` | `posts/[...slug]/index.png.ts` | Per-post dynamic OG images |

Tags, archives, and pagination are computed routes — not backed by content files.

## 4. Layouts and components

### Layout hierarchy

- `Layout.astro` — root HTML shell (head, meta, OG, JSON-LD, theme script)
- `Main.astro` — inner chrome for list pages (breadcrumb, title, description, slot)
- `PostDetails.astro` — single post (title, datetime, edit link, article body, tags, share, prev/next)
- `AboutLayout.astro` — markdown pages with `layout` frontmatter (breadcrumb, title, prose body)

### Components

`BackButton`, `BackToTopButton`, `Breadcrumb`, `Card`, `Datetime`, `EditPost`, `Footer`, `Header`, `LinkButton`, `Pagination`, `ShareLinks`, `Socials`, `Tag`

No interactive islands (no `client:*` directives). All components are `.astro` files.

### Visual editing candidates

- **PostDetails**: title (h1), article body — good for inline text editing
- **AboutLayout**: title (h1), body content — good for inline text editing
- **Homepage hero**: hardcoded in `index.astro`, no backing content file — skip
- **Header/Footer**: site chrome driven by `SITE` and `SOCIALS` constants — skip

## 5. Build pipeline

- `build` script: `astro check && astro build && pagefind --site dist && cp -r dist/pagefind public/`
- `astro check` — TypeScript type checking
- `pagefind` — static search index, runs post-build, output copied to `public/` for local dev
- `astro.config.ts`: static output (default), `trailingSlash` not set (default), `build.format` not set (default = `directory`)
- Site URL from `SITE.website` in `src/config.ts`
- Optional env: `PUBLIC_GOOGLE_SITE_VERIFICATION`
- Integrations: `@astrojs/sitemap`
- Experimental: `preserveScriptOrder`, Google Sans Code font

## 6. Flags and special patterns

- **Non-standard content path**: `src/data/blog/` instead of `src/content/blog/`
- **TypeScript config**: `SITE` and `SOCIALS` are `as const` objects — not CC-editable
- **`slug` in frontmatter**: Present in posts but not in Zod schema; URLs derived from file path via `getPath()`
- **`getPath()` path manipulation**: Strips `_`-prefixed path segments, slugifies each segment
- **Markdown tables**: 5 blog posts contain markdown table syntax — need `markdown.options.table: true`
- **Pagefind post-build**: Must include in CC build command
- **Dynamic OG images**: satori + resvg-js per post — works at build time, no CC impact
- **`layout` frontmatter**: `about.md` uses Astro's markdown page convention — hide this field in CC
