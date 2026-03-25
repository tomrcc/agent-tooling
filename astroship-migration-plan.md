# Astroship CloudCannon Migration

## Current state

Astroship is a small Astro 5 marketing site with:

- Two content collections: `blog` (4 posts, one `.mdx`) and `team` (3 members) in `src/content/config.ts`
- All page content hardcoded directly in components: `hero.astro`, `features.astro`, `cta.astro`, `pricing.astro`, `about.astro`, `contact.astro`
- MDX support with one file (`kitchensink.mdx`) that imports `Button` and contains markdown tables
- Tailwind CSS v4, pnpm, no pre-build scripts, output to `dist/`
- No existing CloudCannon configuration

## Key decisions

**Externalize hardcoded content into a `pages` collection.** Every page with editable content gets a markdown file in `src/content/pages/`. Components become prop-driven instead of self-contained. This is the biggest code change.

**Use `z.union()` for the pages schema.** Homepage (banner + features + CTA), pricing (plans array), contact (address/email/phone), and about (heading + description) all have different shapes. A union schema validates each correctly without a discriminator field -- `_schema` in frontmatter tells CloudCannon which editor fields to show.

**Leave the logos section hardcoded.** It's just Iconify icon references (`simple-icons:react`, etc.) -- not meaningful editor content. Making icon names editable adds complexity for zero real-world value.

**Skip the `BlogLayout.astro` file.** It's unused in the codebase (blog posts render via `[slug].astro`). Leave it as-is.

**Move the hero image to `public/images/`.** Currently imported from `@/assets/hero.png` via Astro's asset pipeline. For CMS compatibility, images in frontmatter should be string paths. The `Picture` component can accept string paths from public.

## Phase 1: Audit

- Run `bash .cursor/skills/migrating-to-cloudcannon/scripts/audit-astro.sh .` from the migrated directory
- Write findings to `templates/astroship/migrated/migration/audit.md` (summary of what's above)

## Phase 2: Content

Create `src/content/pages/` with content files that replace hardcoded data:

- **`index.md`** (homepage): `_schema: homepage`, frontmatter with `banner` (title, description, buttons array), `features` (array of title/description/icon), `cta` (title, description, button)
- **`about.md`**: `_schema: about`, title, description, heading, body_text
- **`pricing.md`**: `_schema: pricing`, title, description, `plans` array (name, price, popular, features array, button)
- **`contact.md`**: `_schema: contact`, title, description, heading, body_text, address, email, phone

Add a `pages` collection to `src/content/config.ts` with a `z.union()` covering all four page types.

Update page templates to read from the pages collection via `getEntry("pages", "index")` etc. Refactor components (`hero.astro`, `features.astro`, `cta.astro`, `pricing.astro` component) to accept data as props.

## Phase 3: Configuration

- Run `gadget generate --auto --init-settings --ssg astro` from the migrated directory
- Customize `cloudcannon.config.yml`:
  - **Collections**: `pages` (path: `src/content/pages`, url: `/[slug]/`), `blog` (path: `src/content/blog`, url: `/blog/[slug]/`), `team` (path: `src/content/team`)
  - **Collection groups**: Pages (pages), Blogging (blog, team)
  - **URLs**: Trailing slash (default `build.format: "directory"`)
  - **Schemas**: homepage, about, pricing, contact schemas in `.cloudcannon/schemas/` for the pages collection; post schema for blog
  - **`_inputs`**: Configure field types -- `title` (text), `description` (textarea), `draft` (switch), `image` (image with `{src, alt}` object handling), `publishDate` (datetime), `author` (text), `category` (text), `tags` (multiselect), pricing plan fields, contact fields
  - **`_structures`**: `features` (title, description, icon), `plans` (name, price, popular, features, button), `buttons` (label, link, style)
  - **`markdown`**: `engine: commonmark`, `options.table: true` (kitchensink.mdx has markdown tables)
  - **`_editables.content`**: Include `table: true` plus standard toolbar options
  - **`_snippets`**: `button` snippet using `mdx_component` template for the `Button` component used in kitchensink.mdx
  - **`paths`**: `static: public`, `uploads: public/images`

## Phase 4: Visual editing

- Run `bash .cursor/skills/migrating-to-cloudcannon/scripts/setup-editable-regions.sh .`
- Import `registerComponents.ts` from `Layout.astro`
- Add editable regions to templates:
  - **Homepage** (`index.astro`): Wrap hero as a component (has conditional buttons), features as array with component, CTA as component
  - **Blog `[slug].astro`**: `data-editable="text"` on title, `data-editable="text" data-type="block" data-prop="@content"` on content body
  - **About**: Text editables on heading/description
  - **Pricing**: Component editable on the pricing section (conditional `popular` styling)
  - **Contact**: Text editables on heading/description/contact details
- Register key components in `registerComponents.ts` for live re-rendering (hero, features, CTA, pricing)

## Phase 5: Build and test

- Run `pnpm install && pnpm build` to verify the site builds cleanly
- Grep `dist/` for `data-editable` attributes to confirm they survive the build
- Prompt user to test in Fog Machine

## Phase 6: Update docs

- Write migration notes to `templates/astroship/migrated/migration/` (one file per phase)
- Review skill docs for any new patterns or gotchas discovered
