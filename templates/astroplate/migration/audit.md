# Astroplate audit

Completed during the first migration. This serves as a reference example of the audit format in the skill phase doc.

## 1. SSG and dependencies

- **Astro 6.0.2** with content collections using the `glob` loader
- **React 19.2.4** for interactive islands (`client:load`)
- **Tailwind CSS 4.2.1** via `@tailwindcss/vite`
- **MDX** via `@astrojs/mdx` with `astro-auto-import` for shortcodes
- Remark plugins: `remark-toc`, `remark-collapse`
- Package manager: Yarn 1.22.22, build tool: Vite 7.3.1
- Image processing: Sharp

## 2. Content structure

All collections defined in `src/content.config.ts` using Astro's `glob` loader.

**`homepage`** -- `src/content/homepage`, pattern `**/-*.{md,mdx}`
- Only loads files starting with `-` (i.e. `-index.md`)
- Schema: `banner` (object with `title`, `content`, `image`, `button`), `features` (array of objects with `title`, `image`, `content`, `bulletpoints[]`, `button`)
- No `title`/`draft`/`description` top-level fields -- uses a unique schema
- Consumed via `getListPage("homepage", "-index")` on the index page

**`blog`** -- `src/content/blog`, pattern `**/*.{md,mdx}`
- Schema: `title`, `meta_title?`, `description?`, `date?`, `image?`, `author` (default "Admin"), `categories[]` (default ["others"]), `tags[]` (default ["others"]), `draft?`
- `-index.md` holds listing page metadata (title, description); excluded by `getSinglePage` (filters out IDs starting with `-`)
- Individual posts consumed via `getStaticPaths` in `blog/[single].astro`

**`authors`** -- `src/content/authors`, pattern `**/*.{md,mdx}`
- Schema: common fields + `social[]` (array of `{name?, icon?, link?}`)
- `-index.md` holds listing page metadata
- Individual authors consumed via `getStaticPaths` in `authors/[single].astro`
- No `draft` field on individual author files (schema allows optional)

**`pages`** -- `src/content/pages`, pattern `**/*.{md,mdx}`
- Schema: common fields (`title`, `description`, `meta_title?`, `date?`, `image?`, `draft`)
- Consumed via `getStaticPaths` in `[regular].astro` (generates `/privacy-policy`, `/elements`, etc.)

**`about`** -- `src/content/about`, pattern `**/*.{md,mdx}`
- Schema: common fields
- Single file: `-index.md`, consumed via `getListPage("about", "-index")`

**`contact`** -- `src/content/contact`, pattern `**/*.{md,mdx}`
- Schema: common fields
- Single file: `-index.md`, consumed via `getListPage("contact", "-index")`

**`ctaSection`** -- `src/content/sections`, pattern `call-to-action.{md,mdx}`
- Schema: `enable`, `title`, `description`, `image`, `button` object
- Single file, consumed via `getListPage("ctaSection", "call-to-action")`

**`testimonialSection`** -- `src/content/sections`, pattern `testimonial.{md,mdx}`
- Schema: `enable`, `title`, `description`, `testimonials[]` (array of `{name, avatar, designation, content}`)
- Single file, consumed via `getListPage("testimonialSection", "testimonial")`

**JSON config files** (not content collections):

| File | Purpose |
|---|---|
| `src/config/config.json` | Site title, URLs, logos, settings (search, pagination, sticky header, theme switcher), announcement, contact form action, copyright, GTM, Disqus, metadata |
| `src/config/menu.json` | Main nav (with nested children) and footer nav |
| `src/config/social.json` | Social media links with icon names |
| `src/config/theme.json` | Color palette (light/dark), font families, font sizes. Consumed by `themeGenerator.js` to produce CSS. |

## 3. Pages and routing

| Route | File | Data source | Type |
|---|---|---|---|
| `/` | `src/pages/index.astro` | homepage, ctaSection, testimonialSection | Static |
| `/about` | `src/pages/about.astro` | about `-index` | Static |
| `/contact` | `src/pages/contact.astro` | contact `-index` | Static |
| `/blog` | `src/pages/blog/index.astro` | blog `-index` + blog posts (page 1) | Static |
| `/blog/post-1` etc. | `src/pages/blog/[single].astro` | blog collection | Dynamic (`getStaticPaths`) |
| `/blog/page/2` etc. | `src/pages/blog/page/[slug].astro` | blog posts | Dynamic (pagination) |
| `/authors` | `src/pages/authors/index.astro` | authors `-index` + all authors | Static |
| `/authors/john-doe` etc. | `src/pages/authors/[single].astro` | authors collection + author's posts | Dynamic |
| `/categories` | `src/pages/categories/index.astro` | taxonomies from blog posts | Derived |
| `/categories/application` etc. | `src/pages/categories/[category].astro` | taxonomy + filtered posts | Derived |
| `/tags` | `src/pages/tags/index.astro` | taxonomies from blog posts | Derived |
| `/tags/nextjs` etc. | `src/pages/tags/[tag].astro` | taxonomy + filtered posts | Derived |
| `/privacy-policy`, `/elements` | `src/pages/[regular].astro` | pages collection | Dynamic |
| `/404` | `src/pages/404.astro` | N/A | Static |

Taxonomy and pagination routes are derived from blog post frontmatter, not their own collections.

## 4. Layouts and components

**Base layout** (`src/layouts/Base.astro`): wraps all pages with `<head>`, header, search modal, footer, optional GTM.

**PostSingle** (`src/layouts/PostSingle.astro`): single blog post with image, meta, content, tags, share buttons, Disqus, related posts.

**Partials** (good visual editing candidates):
- `CallToAction.astro` -- CTA section from `ctaSection` collection
- `Testimonial.astro` -- Swiper carousel from `testimonialSection` collection
- `PageHeader.astro` -- breadcrumbs + page title
- `PostSidebar.astro` -- category/tag links with counts

**Interactive islands** (React, `client:load`):
- `SearchModal.tsx` -- site search
- `Announcement.tsx` -- dismissable announcement bar
- `Disqus.tsx` -- comment system
- Swiper (via `astro-swiper`) in Testimonial

**Shortcode components** (auto-imported for MDX):
- `Button`, `Accordion`, `Notice`, `Video`, `Youtube`, `Tabs`, `Tab`

## 5. Build pipeline

Existing build command from `package.json`:
```
node scripts/themeGenerator.js && node scripts/jsonGenerator.js && astro build
```

- **`themeGenerator.js`**: reads `src/config/theme.json`, writes `src/styles/generated-theme.css`. Must run before build for theme colors/fonts to apply.
- **`jsonGenerator.js`**: reads `src/content/blog/*.md` with `gray-matter`, writes `.json/posts.json` and `.json/search.json`. Must run before build for search to work.

CloudCannon build command should be the same: `node scripts/themeGenerator.js && node scripts/jsonGenerator.js && astro build`.

## 6. Flags and special patterns

- **`-index` filename convention**: index/listing metadata lives in files named `-index.md`. `getSinglePage` filters these out (IDs starting with `-`), while `getListPage` fetches them by exact ID. CloudCannon needs to understand this pattern -- these files should be editable but not treated as collection items.
- **Author references are strings**: blog posts reference authors by `author: "John Doe"` (the author's `title` field). Matching is done by slugifying the name. This is fragile but functional. In CloudCannon config (Phase 2), consider a select input tied to the authors collection.
- **Taxonomy pages are derived**: categories and tags come from blog post frontmatter arrays, slugified. No dedicated collection for them. CloudCannon users edit categories/tags on individual posts.
- **MDX shortcodes**: `elements.mdx` uses React shortcodes (Tabs, Accordion, etc.) via auto-import. These won't be live-editable in the visual editor.
- **Existing `.sitepins/` config**: the template has a SitePins configuration with schema files for `blog` and `authors`. This is a prior CMS setup and can be ignored for CloudCannon migration.
- **Pre-build code generation**: both `themeGenerator.js` and `jsonGenerator.js` must run. The theme generator is particularly important -- editing `theme.json` without running it produces no visible change.
