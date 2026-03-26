# Audit (Astro)

Analyze the site before making any changes. Start by running the audit script to gather data automatically:

```bash
bash .cursor/skills/migrating-to-cloudcannon/scripts/audit-astro.sh .
```

This runs Gadget detection and collects project metadata. Use its output as a starting point, then fill in the sections below with findings that require judgment. Output lives in the template's `migration/audit.md`.

## 1. Astro version and dependencies

- Astro version (check `package.json`)
- Framework integrations and versions (React, Vue, Svelte, Solid -- look for `@astrojs/*` packages)
- CSS framework (Tailwind, etc.)
- Markdown processing: remark/rehype plugins, MDX support (`@astrojs/mdx`)
- Package manager (npm, pnpm, yarn) and any lockfile present
- Node version requirements (`.nvmrc`, `engines` in `package.json`)

## 2. Content collections

Read `src/content.config.ts` (Astro 5+) or `src/content/config.ts` (older versions). For each collection:

- **Name** as exported in `collections`
- **Loader** type: `glob({ pattern, base })`, `file()`, or legacy folder-based
- **Base directory** and glob pattern
- **Schema fields** with Zod types, defaults (`z.default()`), and optionality (`z.optional()`)
- **File naming conventions** (e.g. `-index.md` for listing page metadata -- these get renamed to `index.md` in the content phase)
- **How it's consumed**: `getCollection()`, `getEntry()`, or helper functions wrapping these
- **Body content usage**: Is the markdown body rendered on any page, or is the file used only for its frontmatter? Flag data-only `.md` collections (e.g. team members, testimonials, authors) -- these need `_enabled_editors: [data]` in the configuration phase.

Also check for data files outside collections (JSON, YAML in `src/config/` or similar) that contain editable site configuration.

## 3. Pages and routing

Map every page route in `src/pages/` and how it gets its data:

- **Static pages** (`index.astro`, `about.astro`) and which collection/data they read
- **Dynamic routes** (`[slug].astro`, `[...path].astro`) and their `getStaticPaths()` logic. Check whether the route param comes from `post.id`, `post.data.slug`, or the filename -- this determines whether the CC `url` pattern needs `[slug]` (filename) or `{slug}` (frontmatter). Note that Astro's `glob()` loader uses frontmatter `slug` to override `post.id` when present, so `post.id` may not match the filename.
- **Pagination routes** using `paginate()`
- **Taxonomy routes** (tags, categories) -- these are typically generated from frontmatter values, not backed by their own collections

Note any routes that CloudCannon cannot generate (API-driven, server-rendered, redirects defined in `astro.config.mjs`).

## 4. Layouts and components

Document the component hierarchy:

- **Base layout** (`BaseLayout.astro` or similar) -- what it wraps (head, header, footer, default slot)
- **Page-level layouts** (e.g. `PostSingle.astro`) -- which pages use them, what props they expect
- **Partials** that render shared sections (CTA, testimonials, sidebars, feature grids)
- **Interactive islands** -- React/Vue/Svelte components with `client:*` directives (`client:load`, `client:visible`, `client:idle`)
- **Shortcode components** auto-imported for MDX (check `astro.config.mjs` for MDX `remarkPlugins` or custom components)

Flag components that are good candidates for visual editing (hero banners, feature sections, CTAs) vs. those better suited to the data panel (navigation, social links, theme settings).

Also flag **hardcoded text in page templates** as source editable candidates. Common locations: homepage hero sections, CTA copy, section headings on listing pages. These don't need a content collection or data file -- they use `EditableSource` to edit the raw `.astro` file directly. See [visual-editing.md § Source editables](visual-editing.md#source-editables-for-hardcoded-content).

## 5. Build pipeline

Check `package.json` scripts and `astro.config.mjs`:

- The `build` script -- is it just `astro build` or does it run pre-build steps?
- Pre-build scripts (theme generation, search index generation, JSON data generation)
- `astro.config.mjs` settings: `output` mode, `trailingSlash`, `build.format`, `site`, `base`
- Environment variables the build depends on (`.env` files, `astro:env` usage)
- Integrations registered in `astro.config.mjs` and their configuration

CloudCannon's build must reproduce the full pipeline, including pre-build scripts.

## 6. Flags and special patterns

Note anything that needs special handling in later phases:

- Non-standard content paths or file naming conventions
- Content that references other content by string rather than ID (e.g. `author: "John Doe"` matched by slugifying)
- Computed/derived pages (taxonomies, pagination) that aren't backed by their own content files
- SSG-specific markdown extensions that CloudCannon can't preview (MDX components, custom remark plugins)
- Existing CMS or deployment configuration (`.sitepins/`, `netlify.toml`, `vercel.json`)
- `set:html` directives in templates (these render raw HTML and affect how content editing works)
- Pre-build code generation that must run for the site to build

