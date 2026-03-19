# Astroplate Migration Audit

## SSG and Dependencies

| Property | Value |
|----------|-------|
| SSG | Astro 6.0.2 |
| Package manager | Yarn 1.22.22 |
| Node version | 22.12.0 (.nvmrc) |
| Framework integrations | React 19, MDX |
| CSS | Tailwind CSS v4 (via `@tailwindcss/vite`), `@tailwindcss/forms`, `@tailwindcss/typography` |
| Image processing | Sharp |
| Markdown | remark-toc, remark-collapse, shiki (one-dark-pro) |
| Build tool | Vite 7 |

## Content Structure

All content lives in `src/content/` as `.md` or `.mdx` files. Collections are defined in `src/content.config.ts` using Astro's `glob` loader and Zod schemas.

### Collections

| Collection | Directory | Glob | Description |
|------------|-----------|------|-------------|
| homepage | `src/content/homepage/` | `index.{md,mdx}` | Banner + features for the homepage |
| blog | `src/content/blog/` | `**/*.{md,mdx}` | Blog posts |
| authors | `src/content/authors/` | `**/*.{md,mdx}` | Author profiles |
| pages | `src/content/pages/` | `**/*.{md,mdx}` | Static pages (privacy policy, elements) |
| about | `src/content/about/` | `**/*.{md,mdx}` | About page content |
| contact | `src/content/contact/` | `**/*.{md,mdx}` | Contact page content |
| ctaSection | `src/content/sections/` | `call-to-action.{md,mdx}` | Call-to-action section |
| testimonialSection | `src/content/sections/` | `testimonial.{md,mdx}` | Testimonials section |

### Schema Fields

**commonFields** (shared by pages, about, contact):
- `title` (string, required)
- `description` (string, required)
- `meta_title` (string, optional)
- `date` (coerced date, optional)
- `image` (string, optional)
- `draft` (boolean, required)

**blog**:
- `title` (string, required)
- `meta_title` (string, optional)
- `description` (string, optional)
- `date` (coerced date, optional)
- `image` (string, optional)
- `author` (string, default: "Admin")
- `categories` (string[], default: ["others"])
- `tags` (string[], default: ["others"])
- `draft` (boolean, optional)

**authors**:
- commonFields + `draft` overridden to optional
- `social` (optional array of { name, icon, link })

**homepage**:
- `banner` (object: title, content, image, button: { enable, label, link })
- `features` (array of: title, image, content, bulletpoints, button)

**ctaSection**:
- `enable`, `title`, `description`, `image`
- `button` (object: enable, label, link)

**testimonialSection**:
- `enable`, `title`, `description`
- `testimonials` (array of: name, avatar, designation, content)

### File Inventory

| Collection | Files |
|------------|-------|
| homepage | `index.md` (renamed from `-index.md`) |
| blog | `index.md` (renamed from `-index.md`), `post-1.md`, `post-2.md`, `post-3.md`, `post-4.md` |
| authors | `index.md` (renamed from `-index.md`), `john-doe.md`, `sam-wilson.md`, `william-jacob.md` |
| pages | `privacy-policy.md`, `elements.mdx` |
| about | `-index.md` (merged into pages as `about.md`) |
| contact | `-index.md` (merged into pages as `contact.md`) |
| sections | `call-to-action.md`, `testimonial.md` |

### `index.md` Convention (originally `-index.md`)

Files named `index.md` (renamed from `-index.md` during the content phase) serve as listing/index pages for their collection. The homepage glob (`index.{md,mdx}`) specifically targets this file. Other collections include it alongside regular items and filter it out via `id === "index"` in `getSinglePage()`. These are fetched via `getListPage(collection, "index")`. CloudCannon's `[slug]` collapses `index` to an empty string, so the URL resolves correctly (e.g. `/blog/` for `blog/index.md`).

## Data Files (outside content/)

| File | Purpose |
|------|---------|
| `src/config/config.json` | Site title, base_url, favicon, logo, search, pagination (2), announcement bar, nav button, GTM, Disqus, metadata |
| `src/config/menu.json` | Main nav and footer nav structures |
| `src/config/social.json` | Footer social links (facebook, x, github, linkedin) |
| `src/config/theme.json` | Colors (default + darkmode), fonts (Heebo, Signika), font sizes |

The `scripts/themeGenerator.js` converts `theme.json` into `src/styles/generated-theme.css` (Tailwind v4 `@theme` block). The `scripts/jsonGenerator.js` generates `.json/posts.json` and `.json/search.json` from blog content for client-side search.

## Pages and Routing

### Static Pages

| Route | File | Data Source |
|-------|------|-------------|
| `/` | `pages/index.astro` | homepage, ctaSection, testimonialSection |
| `/about` | `pages/about.astro` | about |
| `/contact` | `pages/contact.astro` | contact, config.json |
| `/404` | `pages/404.astro` | none |
| `/blog` | `pages/blog/index.astro` | blog (list + index), taxonomy |
| `/tags` | `pages/tags/index.astro` | blog tags taxonomy |
| `/categories` | `pages/categories/index.astro` | blog categories taxonomy |
| `/authors` | `pages/authors/index.astro` | authors |

### Dynamic Routes (getStaticPaths)

| Route | File | Data Source |
|-------|------|-------------|
| `/{slug}` | `pages/[regular].astro` | pages collection |
| `/blog/{slug}` | `pages/blog/[single].astro` | blog collection |
| `/blog/page/{n}` | `pages/blog/page/[slug].astro` | blog (paginated, pages 2+) |
| `/tags/{tag}` | `pages/tags/[tag].astro` | blog filtered by tag |
| `/categories/{cat}` | `pages/categories/[category].astro` | blog filtered by category |
| `/authors/{slug}` | `pages/authors/[single].astro` | authors + blog filtered by author |

### Pagination

Blog pagination is configured in `config.json` (`settings.pagination: 2`). Page 1 is `/blog`, subsequent pages are `/blog/page/2`, `/blog/page/3`, etc.

## Layouts and Components

### Layouts

| Layout | Purpose | Used By |
|--------|---------|---------|
| `Base.astro` | Root HTML shell, meta tags, GTM, fonts, header/footer | All pages |
| `PostSingle.astro` | Blog post view (image, title, author, content, tags, share, Disqus, related) | `blog/[single].astro` |

### Key Partials

| Partial | Purpose |
|---------|---------|
| `Header.astro` | Logo, nav (from menu.json), search, theme switcher, CTA button |
| `Footer.astro` | Logo, footer links, social icons, copyright |
| `PageHeader.astro` | Page title + breadcrumbs |
| `CallToAction.astro` | CTA section: image, title, description, button |
| `Testimonial.astro` | Testimonial section with Swiper slider |
| `PostSidebar.astro` | Categories and tags sidebar for blog |

### Components

| Component | Purpose |
|-----------|---------|
| `BlogCard.astro` | Blog post preview card |
| `AuthorCard.astro` | Author profile card |
| `Breadcrumbs.astro` | Breadcrumb navigation |
| `ImageMod.astro` | Image wrapper with optimization |
| `Logo.astro` | Site logo (light/dark) |
| `Pagination.astro` | List pagination controls |
| `Share.astro` | Social share links |
| `Social.astro` | Social icons from config |
| `ThemeSwitcher.astro` | Dark/light toggle |

### Shortcodes (React, for MDX)

`Accordion.tsx`, `Button.tsx`, `Notice.tsx`, `Tab.tsx`, `Tabs.tsx`, `Video.tsx`, `Youtube.tsx`

Auto-imported via `astro-auto-import` so they're available in MDX without explicit imports.

### Interactive Islands (client:load)

| Component | Where |
|-----------|-------|
| `Announcement.tsx` | Base.astro |
| `SearchModal.tsx` | Base.astro |
| `Disqus.tsx` | PostSingle.astro |
| `Tabs`, `Accordion`, `Youtube` | elements.mdx |

### Shared Utilities (lib/)

| Utility | Purpose |
|---------|---------|
| `contentParser.astro` | `getSinglePage`, `getListPage` |
| `taxonomyParser.astro` | `getTaxonomy`, `getAllTaxonomy` |
| `textConverter.ts` | slugify, markdownify, humanize, titleify, plainify |
| `dateFormat.ts` | Date formatting (date-fns) |
| `readingTime.ts` | Estimated reading time |
| `taxonomyFilter.ts` | Filter posts by taxonomy |
| `sortFunctions.ts` | sortByDate, sortByWeight |
| `similarItems.ts` | Related posts by shared categories/tags |
| `bgImageMod.ts` | Background image optimization |

## Build Pipeline

```
themeGenerator.js → jsonGenerator.js → astro build
```

1. `themeGenerator.js` -- reads `theme.json`, writes `src/styles/generated-theme.css` (Tailwind v4 `@theme` block with color and font variables)
2. `jsonGenerator.js` -- reads `src/content/blog/*.md`, writes `.json/posts.json` and `.json/search.json` (excludes drafts and `index` files)
3. `astro build` -- full static build to `dist/`

Output directory: `dist`

## Flags and Special Patterns

1. **`index.md` convention** (originally `-index.md`): Files named `index.md` serve as collection listing pages. Renamed from `-index.md` during the content phase so that CloudCannon's `[slug]` collapses them to the correct listing URL. Each collection with an index file uses a separate schema in the CloudCannon config.

2. **String-based author references**: Blog posts reference authors by name string (`author: "John Doe"`), not by collection ID. The authors page matches posts by slugifying the author title. No content edits needed, but CloudCannon should configure a select input for the author field.

3. **Pre-build code generation**: Two scripts must run before `astro build` -- the theme CSS generator and the JSON search index generator. The CloudCannon build command must include these.

4. **Taxonomy routes are computed**: Tags and categories are derived from blog post frontmatter, not from dedicated collection files. CloudCannon can't generate taxonomy pages directly; they'll work as long as the build runs.

5. **Config-driven data**: Site config, menus, social links, and theme are JSON files in `src/config/`, not content collections. These should be modeled as data collections or non-collection editables in CloudCannon.

6. **Existing Sitepins config**: `.sitepins/` directory and `public/.well-known/sitepins.json` exist from a previous CMS integration. These don't affect the CloudCannon migration but could be cleaned up.

7. **Schema discrepancy**: Authors have an `email` field in frontmatter that isn't in the Zod schema. It's silently dropped at build time.

8. **Swiper in testimonials**: The Testimonial component uses `astro-swiper` for a carousel. Visual editing should target the content (text fields) rather than the slider behavior.

## Visual Editing Candidates

**Strong candidates** (structured content with text, images, CTAs):
- Homepage banner and features (from `homepage/index.md`)
- `CallToAction.astro` (from `sections/call-to-action.md`)
- `Testimonial.astro` (from `sections/testimonial.md`)
- `PageHeader.astro` (title + breadcrumbs)
- `BlogCard.astro` and `AuthorCard.astro`
- Blog post content body and headings

**Sidebar/data editor** (config-driven, not visual):
- Navigation (menu.json)
- Social links (social.json)
- Theme settings (theme.json)
- SEO metadata fields
- Draft toggles
