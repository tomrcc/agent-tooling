# Audit — astro-nano

## 1. Astro version and dependencies

- **Astro**: ^5.0.5 (Astro 5, but using legacy content collections API)
- **MDX**: @astrojs/mdx ^4.0.2
- **CSS**: Tailwind CSS ^3.4.1 via @astrojs/tailwind, plus @tailwindcss/typography
- **Fonts**: @fontsource/inter, @fontsource/lora
- **Package manager**: pnpm (lockfile present)
- **Node version**: not specified (no .nvmrc or engines field)
- **No framework islands** (no React/Vue/Svelte)

## 2. Content collections

Config location: `src/content/config.ts` (legacy API, `type: "content"`).

### blog
- **Path**: `src/content/blog/` — folder-per-post (`01-getting-started/index.md`)
- **Schema**: title (string), description (string), date (coerce date), draft (boolean, optional)
- **Consumed by**: `/blog/` listing (grouped by year), `/blog/[...slug]` detail, homepage (latest 3)
- **Body**: rendered on detail page
- **Note**: One MDX post (`06-mdx-syntax/index.mdx`) imports components

### work
- **Path**: `src/content/work/` — flat files (`apple.md`, `google.md`, etc.)
- **Schema**: company (string), role (string), dateStart (coerce date), dateEnd (union: date | string)
- **Consumed by**: `/work/` listing, homepage (latest 2)
- **Body**: rendered inline on both listing pages (not just detail)
- **Note**: No detail pages for work entries — they only appear in lists

### projects
- **Path**: `src/content/projects/` — folder-per-project (`project-1/index.md`)
- **Schema**: title (string), description (string), date (coerce date), draft (boolean, optional), demoURL (string, optional), repoURL (string, optional)
- **Consumed by**: `/projects/` listing, `/projects/[...slug]` detail, homepage (latest 3)
- **Body**: rendered on detail page

### Data outside collections
- `src/consts.ts` — site name, email, page metadata, social links, homepage limits. TypeScript constants, not CMS-editable. Could be moved to a YAML/JSON data file for CMS editing but low priority for a minimal site.

## 3. Pages and routing

| Route | Type | Data source |
|---|---|---|
| `/` | Static | blog, work, projects collections + consts.ts |
| `/blog/` | Static listing | blog collection (grouped by year) |
| `/blog/[...slug]` | Dynamic | blog collection, `post.slug` |
| `/projects/` | Static listing | projects collection |
| `/projects/[...slug]` | Dynamic | projects collection, `project.slug` |
| `/work/` | Static listing | work collection |
| `/rss.xml` | Utility | blog collection |
| `/robots.txt` | Utility | static |

Dynamic routes use `entry.slug` (legacy collection slug from folder name or filename). ArrowCard builds URLs as `/${entry.collection}/${entry.slug}`.

## 4. Layouts and components

- **PageLayout** — wraps Head, Header, main slot, Footer
- **Container** — max-width wrapper
- **Head** — meta tags, fonts, theme script, view transitions (`ClientRouter`)
- **Header** — site name + nav links (blog/work/projects), reads from consts.ts
- **Footer** — copyright, light/dark/system theme buttons
- **ArrowCard** — card link for blog/project entries
- **FormattedDate** — date formatting component
- **BackToPrev** / **BackToTop** — navigation helpers
- **Link** — styled anchor with optional external/underline props

### Static page classification

**Homepage (`/`)**: Source editables. Has hardcoded hero text ("Hi, I'm Nano" + 3 paragraphs) and a "Let's Connect" section. The collection-powered sections (latest posts, work, projects) are already dynamic. The hero text and connect copy are good candidates for source editables.

**Listing pages** (`/blog/`, `/projects/`, `/work/`): No hardcoded content worth editing — headings are just "Blog", "Projects", "Work".

## 5. Build pipeline

- **Build command**: `astro check && astro build`
- **Output**: `dist/` (default static)
- **astro.config.mjs**: `site` set to vercel URL, integrations: mdx, sitemap, tailwind. No custom `trailingSlash`, `build.format`, or `base`.
- **No pre-build scripts** beyond astro check
- **No environment variables** required

## 6. Flags and special patterns

- **Legacy content collections**: Uses `src/content/config.ts` with `type: "content"` — this is Astro's legacy API but still supported in Astro 5. `slug` is available on entries. The `editable-regions` Astro integration requires modern collections (`glob()` loader) for component re-rendering, so visual editing will use the HTML-attribute approach unless we upgrade the content config.
- **MDX component usage**: Blog post `06-mdx-syntax/index.mdx` imports `FormattedDate` and a local `component.astro`. These are demo content — might be worth keeping as-is or configuring snippets for.
- **Inline HTML in markdown**: `project-1/index.md` has a `<div>` with deploy button links/images. This is a snippet candidate if we want CMS editing of it, but it's demo content.
- **View transitions**: Uses `ClientRouter` (Astro view transitions) — this works fine with CloudCannon.
- **No `set:html`** directives found.
- **`readingTime()` uses `post.body`**: Legacy collection `.body` is a raw markdown string. This works but will need attention if upgrading to modern collections (where `.body` is different).
