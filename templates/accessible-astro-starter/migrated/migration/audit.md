# Audit — Accessible Astro Starter

## 1. Astro version and dependencies

- **Astro 5.18+** (glob loader, `src/content.config.ts`)
- **MDX**: `@astrojs/mdx ^4.3.13`
- **Sitemap**: `@astrojs/sitemap ^3.7.0`
- **CSS**: Tailwind 4.2 via `@tailwindcss/vite`, SCSS via `sass`
- **Icons**: `astro-icon` with `@iconify-json/lucide`
- **SEO**: `astro-seo`
- **Compression**: `astro-compress` + `compressHTML: true`
- **A11y components**: `accessible-astro-components ^5.2.0`, `accessible-astro-launcher ^2.0.0`
- **Partytown**: in package.json but NOT wired in `astro.config.mjs`
- **Package manager**: npm (no lockfile present)
- **Node**: `.nvmrc` says `v20.5.1`
- **No framework integrations** (no React/Vue/Svelte)

## 2. Content collections

### `projects`

- **Loader**: `glob({ pattern: '**/*.mdx', base: './src/content/projects' })`
- **Schema**: `title` (string), `author` (string), `description` (string), `tags` (string[] default [])
- **Files**: 7 MDX files (`project-01.mdx` through `project-07.mdx`)
- **Body content**: rendered on `/portfolio/[project]` detail pages via `render(project)`
- **Consumed by**: `getCollection('projects')` in portfolio listing, tag listing, FeaturedProjects, sitemap

### No other collections

Blog is API-driven (see section 6). No data files outside collections.

### `theme.config.ts`

TypeScript config file with site name, SEO defaults, colors, navigation items, and social links. Not CC-editable (TypeScript). Leave as developer-only.

## 3. Pages and routing

| Route | File | Data source | Classification |
|---|---|---|---|
| `/` | `index.astro` | Hardcoded sections | Content collection candidate |
| `/blog`, `/blog/2` | `blog/[...page].astro` | API fetch (JSONPlaceholder) | Needs conversion to file-based |
| `/blog/:post` | `blog/[post].astro` | API fetch | Needs conversion |
| `/portfolio`, `/portfolio/2` | `portfolio/[...page].astro` | `getCollection('projects')` | OK |
| `/portfolio/:id` | `portfolio/[project].astro` | `getCollection('projects')` | OK |
| `/portfolio/tag/:tag/:page` | `portfolio/tag/[tag]/[...page].astro` | Computed from project tags | Computed, non-editable |
| `/contact` | `contact.astro` | Hardcoded | Source editables |
| `/thank-you` | `thank-you.astro` | Hardcoded | Source editables |
| `/markdown-page` | `markdown-page.md` | Markdown body | Include in CC collection |
| `/mdx-page` | `mdx-page.mdx` | MDX body | Include in CC collection |
| `/accessibility-statement` | `accessibility-statement.mdx` | MDX body | Include in CC collection |
| `/accessible-components` | `accessible-components.astro` | Hardcoded demo | Skip |
| `/accessible-launcher` | `accessible-launcher.astro` | Hardcoded demo | Skip |
| `/color-contrast-checker` | `color-contrast-checker.astro` | Tool | Skip |
| `/sitemap` | `sitemap.astro` | Generated | Skip |
| `/404` | `404.astro` | Hardcoded | Skip |

**URL generation**: Portfolio uses `project.id` (filename-based, no frontmatter slug). Blog uses custom `slugify()` on truncated API titles. After conversion, blog will use `post.id` or frontmatter slug.

**`slugify()` function** at `src/utils/slugify.ts`: lowercases, replaces non-alphanumeric runs with hyphens, strips leading/trailing hyphens. Matches CC's `slugify` filter for simple titles.

## 4. Layouts and components

**Layouts:**
- `DefaultLayout.astro` — full HTML shell, SEO via `astro-seo`, theme colors from `theme.config.ts`, Header + Footer, ClientRouter (view transitions)
- `MarkdownLayout.astro` — wraps DefaultLayout, renders slot with optional PageHeader

**Homepage components (all hardcoded in `index.astro`):**
- `Hero` — title via slot, image, 2 CTA buttons (hardcoded links)
- `Feature` — icon + title + slot description (9 instances)
- `ContentMedia` — image + slot content, optional `reverseImg` (2 instances)
- `FeaturedProjects` — fetches from projects collection, renders top 6
- `FeaturedPosts` — fetches from blog API, renders top 6
- `Counter` — count + title + sub (4 instances)
- FAQ section uses `Accordion`/`AccordionItem` from `accessible-astro-components` (5 items)
- Community section uses `Avatar`/`AvatarGroup` from `accessible-astro-components` (9 members)

**Shared components from `accessible-astro-components` (npm package):**
- Accordion, AccordionItem, Avatar, AvatarGroup, Badge, Button, Card, Checkbox, DarkMode, Fieldset, Form, Heading, Input, Link, Media, Modal, Notification, Pagination, Radio, Textarea

These are npm package components — they won't re-render via `registerAstroComponent` without a display fallback.

**Source editable candidates:**
- Hero title and CTA buttons on homepage → will become content collection fields instead
- Contact page heading, subtitle, contact info text
- Thank-you page heading and subtitle

## 5. Build pipeline

- Build script: `astro build` (no pre-build steps)
- Output: `dist/`
- `compressHTML: true` in astro config
- `astro-compress` integration for additional compression
- Default `build.format: "directory"` → trailing slashes needed in CC URLs
- `BLOG_API_URL` env var via `astro:env/server` — needs adjustment after blog conversion
- No `trailingSlash` explicitly set (defaults to "ignore")

## 6. Flags and special patterns

- **API-driven blog**: Fetches from `BLOG_API_URL` (defaults to JSONPlaceholder). No local blog files. Must convert to file-based for CC editing.
- **MDX components in project content**: All 7 project MDX files import `BreakoutImage`, `BlockQuote`, `Image`. Need snippet configs.
  - `BreakoutImage`: props `src` (string), `decorative` (boolean) or `alt` (string)
  - `BlockQuote`: props `author` (string, optional), children (content)
  - `Image` from `astro:assets`: props `src`, `alt`, `width`, `height`, `class` — complex, skip for snippets
  - Gallery `<div class="grid ...">` wrapping multiple `<Image>` — structural pattern, skip
- **MDX in src/pages/mdx-page.mdx**: Uses `Notification` from `accessible-astro-components` (props: `type`, children) and `Icon`
- **`theme.config.ts`**: TypeScript config not editable in CC, leave as developer-only
- **`accessible-astro-components`** and **`accessible-astro-launcher`**: npm packages with custom web components; won't re-render in CC visual editor
- **No markdown tables** in content files
- **No dash-index files** (-index.md pattern not used)
- **View transitions**: `ClientRouter` from `astro:transitions` used in DefaultLayout
- **Workspace config**: `scripts/workspace-config.js` enhances Vite config for symlinked packages — harmless for CC
