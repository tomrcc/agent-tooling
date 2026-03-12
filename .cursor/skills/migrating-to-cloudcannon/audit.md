# Audit

Guidance for analyzing a site before migrating it to CloudCannon. Run this phase before making any changes.

## Repeatable audit format

Use the sections below as a template. Copy the headings and fill in the details for each new migration. The output lives in the template directory as `MIGRATION.md` (or similar) and feeds into later phases.

### 1. SSG and dependencies

Identify the SSG, its version, and any dependencies that affect the CloudCannon integration:

- SSG name and version
- Framework integrations (React, Vue, Svelte, etc.) and their versions
- CSS framework (Tailwind, etc.)
- Markdown processing (remark/rehype plugins, MDX, shortcodes)
- Package manager and build tool (Vite, Webpack, esbuild)

### 2. Content structure

Map every content source that CloudCannon should expose for editing. For Astro sites using content collections, read `src/content.config.ts` (or `src/content/config.ts` in older versions).

For each collection, document:

- **Name** (as exported in `collections`)
- **Base directory** and glob pattern
- **Schema fields** with types, defaults, and optionality
- **File naming conventions** (e.g. `-index.md` for index pages)
- **How it's consumed** (`getCollection`, `getEntry`, dynamic routes)

Also check for data files outside collections (JSON, YAML) that contain editable site configuration.

### 3. Pages and routing

Map every page route and how it gets its data:

- Static pages and which collection/data they read
- Dynamic routes (`[slug].astro`, `[...path].astro`) and their `getStaticPaths` logic
- Pagination routes
- Taxonomy/tag/category routes (generated from frontmatter, not their own collections)

Note any routes that CloudCannon cannot generate (API-driven, server-rendered, etc.).

### 4. Layouts and components

Document the component hierarchy:

- Base layout and what it wraps (head, header, footer, slots)
- Page-level layouts (e.g. `PostSingle`)
- Partials that render shared sections (CTA, testimonials, sidebars)
- Interactive islands (React/Vue/Svelte components with `client:*` directives)
- Shortcode components (auto-imported for MDX/markdown)

Flag components that are good candidates for visual editing vs. those better suited to the data panel.

### 5. Build pipeline

Identify anything beyond `astro build` that must run:

- Pre-build scripts (theme generation, search index generation, etc.)
- Post-build steps
- Environment variables the build depends on
- The existing `build` command from `package.json`

CloudCannon's build must reproduce the full pipeline.

### 6. Flags and special patterns

Note anything that needs special handling in later phases:

- Non-standard content paths or file naming conventions
- Content that references other content by string rather than ID
- Computed/derived pages (taxonomies, pagination) that aren't backed by their own files
- SSG-specific markdown extensions that CloudCannon can't preview
- Existing CMS configuration (e.g. `.sitepins/`, `netlify.toml` CMS config)
- Pre-build code generation that must run for the site to work

---

**Example:** See `templates/astroplate/migration/audit.md` for a completed audit using this format.
