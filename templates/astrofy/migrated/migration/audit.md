# Audit — Astrofy

## 1. Astro version and dependencies

- **Astro**: 4.0.2
- **Integrations**: `@astrojs/mdx` 2.0.3, `@astrojs/sitemap` 3.0.1, `@astrojs/tailwind` 5.0.3
- **CSS**: Tailwind 3.3.5 + daisyUI (theme: `lofi`, dark theme: `dark`)
- **Other**: `dayjs` (date formatting), `sharp` (image optimization), `@astrojs/rss`
- **Package manager**: pnpm (lockfile present)
- **Node version**: No `.nvmrc` or `engines` constraint

## 2. Content collections

**Config location**: `src/content/config.ts` (legacy, pre-Astro 5)

### blog

- **Path**: `src/content/blog/`
- **Schema**: `blogSchema` — title (string), description (string), pubDate (coerced date), updatedDate (optional string), heroImage (optional string), badge (optional string), tags (optional unique string array)
- **Files**: `post1.md`, `post2.md`, `post3.md`
- **Consumed by**: `getCollection("blog")` in `blog/[...page].astro`, `blog/[slug].astro`, `blog/tag/[tag]/[...page].astro`, `index.astro`, `rss.xml.js`
- **Body**: Rendered on single post pages via `PostLayout`

### store

- **Path**: `src/content/store/`
- **Schema**: `storeSchema` — title, description, custom_link_label, custom_link (optional), updatedDate (coerced date), pricing (optional), oldPricing (optional), badge (optional), checkoutUrl (optional), heroImage (optional)
- **Files**: `item1.md`, `item2.md`, `item3.md`
- **Consumed by**: `getCollection("store")` in `store/[...page].astro`, `store/[slug].astro`
- **Body**: Rendered on single item pages via `StoreItemLayout`

### Data files outside collections

- `src/config.ts` — TypeScript exports: `SITE_TITLE`, `SITE_DESCRIPTION`, `GENERATE_SLUG_FROM_TITLE` (true), `TRANSITION_API` (true). Developer-only; not converting to JSON.

## 3. Pages and routing

| Route | File | Data source |
|-------|------|-------------|
| `/` | `index.astro` | Hardcoded hero + cards; `getCollection("blog")` for latest 3 posts |
| `/projects` | `projects.astro` | Hardcoded HorizontalCards (5 cards in 2 sections) |
| `/services` | `services.astro` | Hardcoded HorizontalCards (4 cards in 1 section) |
| `/cv` | `cv.astro` | Hardcoded profile, timelines, certifications, skills |
| `/404` | `404.astro` | Static |
| `/blog/` | `blog/[...page].astro` | `getCollection("blog")`, paginated (10/page) |
| `/blog/<slug>` | `blog/[slug].astro` | `getCollection("blog")`, slug from `createSlug(title, entry.slug)` |
| `/blog/tag/<tag>/` | `blog/tag/[tag]/[...page].astro` | Derived from blog post tags, paginated |
| `/store/` | `store/[...page].astro` | `getCollection("store")`, paginated (10/page) |
| `/store/<slug>` | `store/[slug].astro` | `getCollection("store")`, slug from `entry.slug` (filename) |
| `/rss.xml` | `rss.xml.js` | Blog posts; uses `post.slug` (filename, not createSlug) |

**Blog slug**: `GENERATE_SLUG_FROM_TITLE = true`, so blog URLs are title-derived via `createSlug()`. The function: trim → lowercase → spaces to hyphens → strip `[^\w-]` → strip leading/trailing hyphens. For simple titles ("Demo Post 1" → "demo-post-1") this matches CC's slugify. For titles with special chars they'd differ. Adding `slug` frontmatter is the safe approach.

**Store slug**: Filename-based (`entry.slug`). `[slug]` works directly.

**RSS inconsistency**: `rss.xml.js` uses `post.slug` (filename) not `createSlug(title)`. Pre-existing bug in the template.

**Build format**: No `trailingSlash` or `build.format` in config → defaults → `build.format: "directory"` → trailing slashes needed.

## 4. Layouts and components

### Layouts

- **BaseLayout**: html shell with BaseHead, Header, Footer, SideBar (optional via `includeSidebar`). Props: title, description, image, includeSidebar, sideBarActiveItemID, ogType. Uses ViewTransitions when `TRANSITION_API` is true.
- **PostLayout**: Blog article wrapper. Props extend `BlogSchema`. Renders hero image, title, date, badge, tags, content slot.
- **StoreItemLayout**: Store item wrapper. Props extend `StoreSchema`. Renders hero image, title, pricing, badge, custom link, checkout button, content slot.

### Components

- **HorizontalCard**: Card with image, title, badge, description, tags. Props: title, img, desc, url, badge, tags, target. Used on homepage, projects, services, blog listing, store listing.
- **HorizontalShopItem**: Store listing card. Props: title, img, desc, url, badge, pricing, oldPricing, details, custom_link, custom_link_label, target.
- **TimeLine**: CV timeline entry with dot/line. Props: title, subtitle. Content via slot.
- **SideBarMenu**: Hardcoded navigation links (Home, Projects, Services, Store, Blog, CV, Contact mailto).
- **SideBar/SideBarFooter**: Profile image, social icons, RSS link.
- **Card**: Vertical card variant — appears unused in current pages.

### Hardcoded text candidates

No interactive islands (`client:*` directives) in the template.

## 5. Static page classification

| Page | Classification | Rationale |
|------|---------------|-----------|
| `index.astro` | Content collection (homepage) | Hero with 6+ text fields, projects card array, dynamic blog posts |
| `projects.astro` | Content collection (card_listing) | 5 HorizontalCards in 2 sections — editors need CRUD |
| `services.astro` | Content collection (card_listing) | 4 HorizontalCards in 1 section — editors need CRUD |
| `cv.astro` | Content collection (cv) | Profile text, education/experience timelines, certifications, skills — all repeated/structured |
| `404.astro` | Skip | No editable content |

**Reusable page type**: `card_listing` (used by projects and services). Same component (HorizontalCard), same rendering pattern.

## 6. Build pipeline

- `build` script: `astro build` (no pre-build steps)
- No environment variables required
- No prebuild scripts needed

## 7. Flags and gotchas

- `services.astro` has `title="Projects"` — a bug in the original template; the title should be "Services"
- `store/[slug].astro` passes `heroImage={item.heroImage}` twice — harmless duplicate prop
- `rss.xml.js` uses old `get()` export (Astro 3 pattern) instead of `GET()` — may cause build warning in Astro 4
- No markdown tables in content files
- No MDX content (all `.md` files despite `@astrojs/mdx` being installed)
- No inline HTML patterns in content that need snippets
- `Card.astro` component appears unused
