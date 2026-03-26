# Configuration (Astro)

Guidance for creating and configuring `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` for an Astro site.

## Baseline generation with Gadget

Use the Gadget CLI to generate a baseline configuration. See [../gadget-guide.md](../gadget-guide.md) for the full CLI reference.

### Quick path

```bash
gadget generate --auto --init-settings --ssg astro
```

### Step-by-step path (recommended for migrations)

Running subcommands individually lets you cross-reference Gadget's output against the Phase 1 audit.

1. **Confirm the SSG detection:**

   ```bash
   gadget detect-ssg
   ```

2. **Inspect detected collections** and compare against content collections from the audit:

   ```bash
   gadget collections --ssg astro
   ```

   Review `suggested: true/false` flags. Collections the audit identified but Gadget missed (or vice versa) need manual adjustment.

3. **Review build suggestions:**

   ```bash
   gadget build --ssg astro
   ```

4. **Generate the config:**

   ```bash
   gadget generate --auto --init-settings --ssg astro
   ```

   Or get raw JSON for inspection:

   ```bash
   gadget generate --auto --json --ssg astro
   ```

## Review the generated config

After generation, read `cloudcannon.config.yml` and check:

- **`source`** -- typically empty for Astro (source is the project root)
- **`collections_config`** -- are all content collections present? Do paths match the `base` directories from `content.config.ts`?
- **`paths`** -- `static` should be `public`, `uploads` should be `public/images` (or wherever the site stores uploaded assets)
- **Build settings** (in `.cloudcannon/initial-site-settings.json`) -- `ssg` should be `"astro"`, `build_command` should be `"astro build"` (or the full pipeline if pre-build scripts exist), `output_path` should be `"dist"`

## Customize the config

### Targeted content fixes during configuration

The migration phases are sequential, but don't treat them as rigid boundaries. When a CC config pattern requires content files to have a field that's inconsistent or missing, **add it** rather than settling for a worse config. Examples: adding `slug` frontmatter so `{slug}` URL patterns work, adding `_schema` to disambiguate collection schemas, normalizing a `date` field format. These are small, mechanical changes in service of the configuration — not a restructuring of the content model (which belongs in the content phase).

The decision rule: if skipping the change means the config is wrong or fragile, make the change now. If the change is structural (moving files, adding new fields that alter rendering, reorganizing collections), defer to the content phase.

### Customization checklist

Gadget produces a structural baseline. The following customizations are almost always needed, informed by the Phase 1 audit:

- **`_inputs`** -- configure how fields appear in the editor (dropdowns, date pickers, image uploaders, comments, hidden fields). Map these from the Zod schemas discovered in the audit.
- **`_structures`** -- define reusable component structures for array-based page building. Derive these from the component inventory in the audit.
- **`collection_groups`** -- organize collections into sidebar groups for a clean editing experience.
- **`_editables`** -- configure rich text editor toolbars per collection or globally.
- **`markdown`** -- if content files contain Markdown-syntax tables (`| col | col |`), set `markdown.options.table: true` so CloudCannon round-trips them as Markdown rather than converting to HTML, and add `table: true` to `_editables.content` (alongside all other desired toolbar options -- see gotchas). Grep content directories for `^\|.*\|` to detect this. Leave both at the default (`false`) when no Markdown tables exist.
- **`_snippets`** -- configure snippets for MDX components used in rich text content. Built-in templates like `mdx_component` resolve automatically — no `_snippets_imports` needed. See [snippets.md](snippets.md) for the full workflow.
- **`_select_data`** -- define shared dropdown options for fields used across collections.
- **Schemas** -- define templates for creating new content files, based on the content patterns found in the audit.
- **`file_config`** -- a root-level key that targets specific files via glob and scopes `_inputs` to them. Use it when key names would collide at broader scopes, or to configure inputs for settings/data files. Supports `$` to reference the root of the file or structure. Example:

```yaml
file_config:
  - glob: src/config/theme.json
    _inputs:
      theme_color.primary:
        type: color
      font_family.primary:
        type: text
```

The full set of configuration keys is defined in the [CloudCannon Configuration JSON Schema](https://raw.githubusercontent.com/CloudCannon/configuration-types/main/cloudcannon-config.schema.json). Generated files include a schema reference that provides IDE autocomplete and validation -- preserve these references when editing.

## Consolidating single-file collections

After Gadget generates collections, review the result for collections that contain only a single file. A collection of one doesn't add value in the CloudCannon sidebar, is semantically less correct, and should be consolidated. Two strategies, applied in order:

### Strategy A: Merge simple pages into the `pages` collection

If a single-file collection uses the same schema as `pages` (e.g. an `about` or `contact` collection with standard title/description/image/body fields), merge it into the `pages` collection:

- Move the content file into the `pages` directory (e.g. `src/content/about/index.md` -> `src/content/pages/about.md`)
- Remove the separate collection from `content.config.ts` and `cloudcannon.config.yml`
- Update the page's rendering template in `src/pages/` to fetch from the `pages` collection instead
- The page still uses its own rendering template for routing

### Strategy B: Use `data_config` for reusable section data

If a page has data coming from a file separate from the content page, or a page has data that is consistent across the site (CTA, testimonials, etc.), extract it into JSON data files and configure `data_config` rather than trying to group it into a collection with the page:

- Move section data from `.md` frontmatter into `src/data/*.json` files
- Add `data_config` entries in `cloudcannon.config.yml` pointing to each JSON file
- Import the JSON directly in Astro components (no collection needed)
- Use `@data[key].path` editable regions for visual editing

This avoids the `@file` limitation where CloudCannon resolves the file's URL from its collection's `url` pattern and navigates away from the current page. Data files don't have URL patterns, so `@data` editables work correctly on any page.

For pages with unique schemas (e.g. a homepage with `banner`/`features`), merge the page into the `pages` collection using a `z.union` in the Zod schema and CC schemas for the correct editor fields (see Fallback below).

### Fallback: Merge unique pages into `pages` with a z.union

If a page has a unique schema but doesn't have related files that would make the collection more than one file, merge it into the `pages` collection instead of leaving it as a singleton:

- Define separate named Zod schemas for each page type (e.g. `pageSchema`, `contactPageSchema`, `homepageSchema`), each spreading `commonFields` plus their own required fields
- Combine them with `z.union([mostSpecific, ..., leastSpecific])` -- Zod tries each member in order and returns the first that validates, so ordering most-specific first ensures correct discrimination without a discriminator field
- In CloudCannon, define multiple schemas for the `pages` collection so editors get the correct fields for each page type
- In templates, narrow the union type with an `in` check (e.g. `if (!("banner" in data)) throw new Error(...)`) before accessing schema-specific fields
- The page still uses its own rendering template in `src/pages/` -- routing and layouts is independent of collection structure

```typescript
const pageSchema = z.object({ ...commonFields });
const contactPageSchema = z.object({ ...commonFields, name_label: z.string(), /* ... */ });
const homepageSchema = z.object({ ...commonFields, banner: z.object({ /* ... */ }), features: z.array(/* ... */) });

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.union([homepageSchema, contactPageSchema, pageSchema]),
});
```

No discriminator field is needed -- the required fields themselves differentiate each schema. Homepage requires `banner`/`features`, contact requires form labels, and the default page is the fallback with just common fields.

Every Zod schema in the union should have a matching CC schema in `.cloudcannon/schemas/` and a corresponding entry under the collection's `schemas` key in `cloudcannon.config.yml`. Add `_schema: <key>` to each content file's frontmatter so CloudCannon matches it explicitly rather than guessing from the frontmatter shape. The Zod schemas control build-time validation; the CC schemas control which fields editors see in the CMS.

## Splitting nested subdirectories into their own collections

When the `pages` collection contains subdirectories that represent a distinct group of content with their own URL prefix (e.g. `pages/homes/`, `pages/landing/`), split them into separate CloudCannon collections rather than keeping everything flat under `pages`. This gives each group its own sidebar entry, correct URL pattern, and cleaner editorial experience.

1. **Exclude the subdirectories from `pages`** using glob negation:

```yaml
pages:
  path: src/content/pages
  glob:
    - "!homes/**"
    - "!landing/**"
  url: "/[slug]/"
```

2. **Add a collection for each subdirectory** with its own `path` and `url`:

```yaml
homes:
  path: src/content/pages/homes
  url: "/homes/[slug]/"
  # schemas, _enabled_editors, add_options same as pages
landing:
  path: src/content/pages/landing
  url: "/landing/[slug]/"
```

3. **Add the new collections to `collection_groups`** under the same heading as `pages`.

No changes are needed on the Astro side — the content collection's glob loader (`**/*.md` from `src/content/pages`) already picks up all nested files, and the catch-all route (`[...slug].astro`) uses `entry.id` which includes the subdirectory path (e.g. `homes/mobile-app`), so routing works automatically.

The alternative is keeping everything in `pages` with `url: "/[full_slug]/"`, but separate collections are more semantically correct and give editors a clearer sidebar.

## Data config for shared data

Use `data_config` when you have reusable data (CTAs, testimonials, site settings) that doesn't belong in a content collection. Data files are edited in the CloudCannon data editor and referenced from templates via JSON import.

```yaml
data_config:
  call-to-action:
    path: src/data/call-to-action.json
  testimonial:
    path: src/data/testimonial.json
```

In Astro templates, import the JSON directly:

```astro
---
import callToActionData from "@/data/call-to-action.json";
---
<CallToAction call_to_action={callToActionData} />
```

For visual editing, use `@data[key].path` syntax in editable regions:

```astro
<h2 data-editable="text" data-prop="@data[call-to-action].title">
  {call_to_action.title}
</h2>
```

Data files appear in the sidebar under their own collection group (typically "Data"). Configure `_inputs` and `_structures` globally since data files don't have collection-scoped config.

## Collection URLs

Collections that produce pages need a `url` pattern so CloudCannon can open them in the visual editor and display the correct URL in the collection file list. **A wrong `url` is the most common reason a page fails to load in the visual editor.** If the visual editor shows a blank page or the wrong page for a supported file type, check the `url` pattern first -- including the trailing slash.

### Fixed placeholders

Use square brackets for fixed (filename-based) placeholders:

- `[slug]` -- filename without extension. If the filename is `index`, resolves to an empty string.
- `[filename]` -- filename with extension.
- `[relative_base_path]` -- file path without extension, relative to the collection path.
- `[full_slug]` -- alias for `[relative_base_path]/[slug]`.
- `[collection]` -- the collection key name.
- `[ext]` -- the file extension.

```yaml
pages:   url: "/[slug]/"
blog:    url: "/blog/[slug]/"
authors: url: "/authors/[slug]/"
```

A `pages` collection with `url: "/[slug]/"` produces `/` for `index.md` and `/about/` for `about.md`.

### Data placeholders (frontmatter fields)

Use curly braces to reference frontmatter data. This is essential when the output URL is derived from a frontmatter field rather than the filename -- a common pattern where templates use a `slug`, `permalink`, or `title` field to control the output path.

```yaml
blog:    url: "/posts/{slug}/"
news:    url: "/news/{category|slugify}/{title|slugify}/"
```

**Filters** are applied with `|` after the key name. Multiple filters can be chained. Full reference: [CloudCannon template strings docs](https://cloudcannon.com/documentation/developer-articles/configure-your-template-strings/).

Common filters for URLs:

- `slugify` -- converts non-alphanumeric characters to hyphens, collapses sequential hyphens, strips leading/trailing hyphens
- `lowercase` / `uppercase` -- case transformation
- `year`, `month`, `day` -- extract date parts (2-digit month/day, 4-digit year)
- `default=value` -- fallback when the field is empty
- `truncate=N` -- limit to N characters

**Nested keys and arrays** are supported: `{seo.description}` for nested objects, `{tags[0]}` for specific array items, `{tags[*]}` for all items (joined with `, `).

**When to use data placeholders:** During the audit, check how the SSG generates output URLs. If the routing uses a frontmatter field (e.g. `getStaticPaths` returns `params: { slug: post.data.slug }` rather than using the filename), use `{field}` in the CloudCannon `url`. Compare a few filenames against their build output paths in `dist/` -- if they don't match, the URL is frontmatter-driven.

### Astro glob loader and `slug` frontmatter

Astro's `glob()` loader has a built-in feature: if a content file's frontmatter contains a `slug` field, it overrides the auto-generated `id` (which is normally the filename without extension). This means `post.id` — which most templates use for routing — can come from either:

1. The frontmatter `slug` field (when present)
2. The filename (when `slug` is absent)

This is easy to miss because the `slug` field doesn't need to be in the Zod schema — the glob loader consumes it before validation. The application code doesn't reference `data.slug` either; it's already baked into `post.id`.

**Implications for CC URLs:** When a template uses `post.id` for routing (common pattern: `params: { slug: post.id }` in `getStaticPaths`), and some content files have a `slug` frontmatter that differs from the filename, CC's `[slug]` placeholder (filename-based) will produce the wrong URL. Use `{slug}` (frontmatter-based) instead.

**Ensuring consistency:** If only some posts have `slug` frontmatter, add it to the rest (matching the filename) so `{slug}` works uniformly. Also add `slug` to the CC schema template so new posts get the field, and make the `slug` input visible so editors can control their URL.

### Content in subdirectories within a collection

When a collection has subdirectories (e.g. `blog/examples/`, `blog/releases/`) and the SSG routing preserves the subdirectory in the output URL (e.g. `/posts/examples/my-post/`), the `{slug}` placeholder alone won't match — it only contains the slug portion, not the directory prefix.

**How to detect this:** Compare the build output paths in `dist/` against the `{slug}` values. If a post's output URL is `/posts/examples/my-post/` but `{slug}` resolves to just `my-post`, there's a mismatch. Check any SSG routing utilities (like `getPath()`) that construct URLs from both file paths and entry IDs — these often prepend the subdirectory.

**Two fixes:**

1. **Prefix the frontmatter `slug`** — include the subdirectory in the slug value (e.g. `slug: examples/my-post` instead of `slug: my-post`). This keeps the collection unified and the `{slug}` URL template working. Check that the SSG's routing utility still produces the correct output — many (like AstroPaper's `getPath`) take the last segment of `post.id` as the slug and derive the directory from the file path, so prefixing the slug doesn't double up the directory.

2. **Split into separate collections** — give the subdirectory its own CC collection with a URL pattern that includes the prefix (e.g. `url: "/posts/examples/{slug}/"`). Better when the subdirectory represents a genuinely different content type with its own editorial workflow.

Prefer option 1 for small subdirectories within a content collection (example posts, archived posts). Prefer option 2 when the subdirectory is large enough to warrant its own sidebar entry.

Note: directories prefixed with `_` (e.g. `_releases/`) are often excluded from routing by the SSG — their posts get URLs without the directory prefix. These work fine with plain `{slug}`. Check the SSG's path utility for `_`-prefix filtering before deciding.

### Trailing slash rule

The URL must match the built output path exactly. Check `astro.config.mjs` for `trailingSlash` and `build.format`:

- **`build.format: "directory"` (default)** -- Astro builds pages as `dir/index.html`. URLs need a trailing slash: `/about/`, `/blog/my-post/`. This is the default even when `trailingSlash` is set to `"never"`.
- **`build.format: "file"`** -- Astro builds pages as `page.html`. URLs do not have a trailing slash: `/about`, `/blog/my-post`.
- **`build.format: "preserve"`** -- matches the source file structure. Check the output to determine the pattern.

### Troubleshooting

If a page doesn't load in the visual editor:

1. **Check the `url` pattern** -- compare the configured URL against the actual build output in `dist/`. The most common issues are wrong placeholders (`[slug]` vs `{slug}`) and wrong prefix paths.
2. **Check the trailing slash** -- a missing or extra trailing slash causes a mismatch. Compare against the `build.format` setting.
3. **Check fixed vs data placeholders** -- `[slug]` is the filename; `{slug}` is the frontmatter `slug` field. If the SSG uses a frontmatter field for routing, you need curly braces.
4. **Build and inspect** -- when in doubt, build the site and inspect the `dist/` directory to see the actual output paths.

## Schemas for index pages

When a collection contains an `index.md` file alongside regular items (e.g. `blog/index.md` for the listing page metadata alongside `blog/post-1.md`, `blog/post-2.md`), define separate schemas so editors get the correct fields for each file type.

```yaml
blog:
  path: src/content/blog
  url: "/blog/[slug]/"
  schemas:
    default:
      path: .cloudcannon/schemas/post.md
      name: Blog Post
    blog_index:
      path: .cloudcannon/schemas/blog-index.md
      name: Blog Index
```

The `default` schema controls what editors see when creating or editing regular items. The index schema provides the right fields for the listing page. CloudCannon matches the schema to existing files automatically based on frontmatter shape, or you can set `_schema: blog_index` in the index file's frontmatter to be explicit.

The `[slug]` collapse behavior means no special URL handling is needed -- `index.md` resolves to `/blog/` while `post-1.md` resolves to `/blog/post-1/`.

Create the schema template files in `.cloudcannon/schemas/` with representative frontmatter for each type. These serve as blueprints when editors create new files from within CloudCannon.

## New preview URL for schemas

When an editor creates a new file from a schema, it hasn't been built yet so it has no output URL. CloudCannon needs an existing page to show in the visual editor while the editor fills in the initial content. The `new_preview_url` key on a schema tells CloudCannon which page to load as the preview for newly created files.

```yaml
schemas:
  default:
    path: .cloudcannon/schemas/page.md
    name: Page
    new_preview_url: /elements/
  page_builder:
    path: .cloudcannon/schemas/page-builder.md
    name: Page Builder
    new_preview_url: /services/
```

Pick a `new_preview_url` that uses the same layout or template as the schema. For a page builder schema, choose an existing page builder page; for a standard page schema, choose an existing standard page. This gives editors a representative preview while editing.

If the page used as the preview URL is later deleted or renamed, newly created files will show a broken preview. The editor-facing `.cloudcannon/README.md` should explain this to editors so they know what happened and can ask a developer to update the setting.

`new_preview_url` is optional. If omitted, CloudCannon falls back to showing the site's homepage for new files.

## Controlling the Add button with `add_options`

By default, CloudCannon shows all schemas in the "+ Add" button dropdown. Use `add_options` to restrict which schemas editors can create new files from. This is important when a collection has schemas that should only exist once (like index pages) or schemas tied to dedicated routes that can't be duplicated.

```yaml
collections_config:
  pages:
    add_options:
      - name: Page
        schema: default
        icon: wysiwyg
      - name: Page Builder
        schema: page_builder
        icon: dashboard
  blog:
    add_options:
      - name: Blog Post
        schema: default
        icon: event_available
  authors:
    add_options:
      - name: Author
        schema: default
        icon: person
```

Each `add_options` entry supports:

- **`name`** -- text shown in the menu. Defaults to the schema's `name`.
- **`schema`** -- which schema template to use.
- **`icon`** -- Material Icons name shown next to the text.
- **`editor`** -- which editor to open (`content`, `data`, or `visual`).
- **`base_path`** -- enforce a path for new files.

When `add_options` is defined, **only** the listed options appear. Schemas not listed (like index page schemas or one-off page schemas) are still used for editing existing files but can't be used to create new ones.

### When to use `add_options`

- **Index pages in content collections**: Blog, authors, tags -- where `index.md` has its own schema but shouldn't be duplicable.
- **One-off pages with dedicated routes**: Homepage, contact -- where the Astro route is hardcoded to load a specific entry. Creating a second one would have no route to display it.
- **Page builder pages**: When offering multiple schema types for new pages, `add_options` curates the list editors see.

## Page building patterns

Two approaches for letting editors create new pages, which can coexist.

For the full structures reference (inline vs split, field completeness, previews, deriving from components), see [../structures.md](../structures.md). Structures must be defined during the configuration phase because the content phase uses them as the blueprint for field completeness — every block in a content file must include all fields from its structure definition.

### Schema-based pages (fixed layouts)

Each schema maps to a pre-designed layout. The editor picks a schema from the Add dropdown and gets a page with a fixed structure. Editing happens through the data editor (frontmatter fields) and visual editor (source editables).

This is the default approach -- every collection with schemas already supports it. Use it for pages with well-defined structures like contact forms, landing pages, or about pages.

### Array-based page builder

A schema with a `content_blocks` array lets editors assemble pages from reusable blocks in any order. The schema pairs a hardcoded hero section (guaranteeing an h1 and consistent page structure) with the flexible array below.

**When to use it**: When the site has 3+ reusable block components (banners, features, CTAs, testimonials, rich text). Fewer than 3 blocks doesn't justify the added complexity.

**Schema structure**:

```yaml
_schema: page_builder
title:
description:
meta_title:
image:
hero_content:
draft: false
content_blocks: []
```

**Zod schema**: Add a `pageBuilderSchema` to the union with `content_blocks` as a discriminated union array:

```typescript
const contentBlock = z.discriminatedUnion("_type", [
  z.object({ _type: z.literal("banner"), title: z.string(), /* ... */ }),
  z.object({ _type: z.literal("features"), items: z.array(/* ... */) }),
  z.object({ _type: z.literal("rich_text"), content: z.string() }),
  z.object({ _type: z.literal("call_to_action") }),
  z.object({ _type: z.literal("testimonial") }),
]);

const pageBuilderSchema = z.object({
  ...commonFields,
  hero_content: z.string().optional(),
  content_blocks: z.array(contentBlock),
});
```

Place `pageBuilderSchema` before the generic `pageSchema` in the union so it matches before the catch-all.

**CC structures**: Define structures for each block type using `_type` as the discriminator. For sites with 5+ block types, use the split co-located approach (see [../structures.md](../structures.md)):

```yaml
# Split approach — one file per component
_inputs:
  content_blocks:
    type: array
    options:
      structures:
        values_from_glob:
          - /src/components/widgets/*.cloudcannon.structure-value.yml

# Inline approach — for sites with fewer than 5 block types
_structures:
  content_blocks:
    values:
      - label: Banner
        value:
          _type: banner
          title:
          content:
          image:
      - label: Rich Text
        value:
          _type: rich_text
          content:
```

**Reference blocks vs inline blocks**: Blocks like CTA and Testimonial that pull from global JSON data files are "reference" blocks -- they have no inline data, just a `_type` marker. The rendering code imports the global data and passes it to the component. This keeps the data DRY (edited once in the Data section) while letting editors place these sections anywhere on the page. Visual editing still works via `@data[key]` editable regions.

**Rendering**: The catch-all route detects `content_blocks` in the page data and switches between plain body rendering and block-based rendering. Each block must be a **component editable region** — this is integral to the rendering pattern, not a separate visual-editing step. Create a `BlockRenderer.astro` component that maps `_type` to the matching widget:

```astro
<!-- [...slug].astro -->
{isPageBuilder ? (
  <div
    data-editable="array"
    data-prop="content_blocks"
    data-component-key="_type"
    data-id-key="_type"
  >
    {data.content_blocks.map((block) => (
      <BlockRenderer block={block} />
    ))}
  </div>
) : (
  <>
    <h1 data-editable="text" data-prop="title">{title}</h1>
    <div data-editable="text" data-type="block" data-prop="@content"><Content /></div>
  </>
)}
```

```astro
<!-- BlockRenderer.astro -->
---
const { block } = Astro.props;
const { _type, ...props } = block;
---
<section data-editable="array-item" data-component={_type} data-id={_type}>
  {_type === 'banner' && <Banner {...props} />}
  {_type === 'features' && <Features {...props} />}
  {_type === 'call_to_action' && <CallToAction {...props} />}
  <!-- ...other block types... -->
</section>
```

The array wrapper uses `data-component-key` and `data-id-key` to tell CloudCannon which frontmatter key identifies the component type and item identity. Each array item uses a plain HTML element (`<section>`) with `data-editable="array-item"`, `data-component`, and `data-id`. `EditableArrayItem` inherits from `EditableComponent`, so `data-component` on an array-item element gives both array CRUD controls and component re-rendering. Do not use `<editable-component>` for array items — see [visual-editing.md § Page builder blocks](../astro/visual-editing.md#page-builder-blocks) for the full pattern and rationale.

Every widget component inside also needs nested `data-editable` attributes (text, image). Every `_type` value used in content files must have a matching `registerAstroComponent(_type, Component)` call in `registerComponents.ts`.

## Prebuild script

If the audit identified pre-build scripts (theme generation, JSON generation, search indexing), create `.cloudcannon/prebuild`:

```bash
#!/usr/bin/env bash
set -e

node scripts/themeGenerator.js
node scripts/jsonGenerator.js
```

This runs before the build command on CloudCannon. Alternatively, chain the scripts in the build command itself:

```
node scripts/themeGenerator.js && node scripts/jsonGenerator.js && astro build
```

## Editor README

Create `.cloudcannon/README.md` as an editor-facing guide that appears on the Site Dashboard when the site is opened in CloudCannon. This is the first thing editors see, so it should orient non-technical users.

The README should cover:

- **Welcome and site overview** -- what the site is and what content it manages
- **Quick links** -- `cloudcannon:collections/<name>` links to each collection for one-click navigation
- **Collections guide** -- for each collection, explain what it contains and how to create, edit, and delete items. Mention which editing views are available (visual, content, data)
- **Data files** -- if the site has `data_config` entries, explain what each file controls (e.g. "Navigation controls the header and footer links")
- **Site settings** -- where to find site-wide config (theme, navigation, social links)
- **New preview URL** -- if any schemas use `new_preview_url`, explain in plain language that newly created pages show a temporary preview of an existing page, and that deleting that page will break the preview for new files
- **Rich text components** -- if the site has `_snippets`, briefly list the available components editors can insert

Write in plain language throughout. Avoid technical terms like YAML, frontmatter, Zod, schema, SSG, or Astro. Use `cloudcannon:` protocol links where helpful (e.g. `[Blog posts](cloudcannon:collections/blog)`).

The README is purely for editors. Developer notes belong in the project's own `readme.md` or migration notes.

## Verification checklist

After generating and customizing the config, work through these checks before moving to the next phase:

- [ ] `cloudcannon.config.yml` exists and is valid YAML
- [ ] `.cloudcannon/initial-site-settings.json` exists with `"ssg": "astro"` and correct `build_command` and `output_path`
- [ ] `collections_config` has entries for every collection from the audit
- [ ] No non-content directories leaked into `collections_config` (e.g. `lib`, `source`, `migration`)
- [ ] No collections contain only a single file -- consolidate or group as needed
- [ ] `collection_groups` organise collections into logical sidebar groups
- [ ] `_inputs` is configured for common field types (images, dates, dropdowns, hidden fields)
- [ ] Icon fields use `type: select` with `allow_create: true`, `value_key: id`, and named values (`name` + `id`) for friendly display names
- [ ] Numeric values in content frontmatter that map to `text` inputs are quoted as strings (e.g. `price: "29"` not `price: 29`)
- [ ] Developer-only fields (`layout`, `_schema`, routing/rendering keys) have `hidden: true`
- [ ] Collections that produce pages have a `url` pattern with correct trailing slash for the site's `build.format`. Compare a few filenames against `dist/` output paths -- if they differ, the URL is frontmatter-driven and needs `{data_field}` placeholders instead of `[slug]`
- [ ] Collections with content in subdirectories: compare `dist/` output for nested files against the URL template. If the SSG routing preserves the subdirectory in the output path, ensure `{slug}` values include the directory prefix (or split into separate collections)
- [ ] Collections with `index.md` files have separate schemas for the index page and regular items
- [ ] `paths.uploads` is set to `public/images` (or the correct static asset directory)
- [ ] `.cloudcannon/prebuild` exists if pre-build steps are needed
- [ ] `file_config` entries exist for files with inputs not covered by global or collection-level config
- [ ] Object inputs have `type: object` with `preview.icon` — both top-level data file objects and nested objects inside structures (`callToAction`, `image`, etc.)
- [ ] All arrays with structures are explicitly linked via `type: array` + `options.structures` (don't rely on naming conventions)
- [ ] Structures use both `picker_preview` and `preview` (see [../structures.md](../structures.md))
- [ ] Sites with 5+ block types use the split co-located approach (`values_from_glob`)
- [ ] Structure previews have `icon` fallbacks where `image` may be empty
- [ ] `_snippets` entries exist for each MDX component used in content files (no `_snippets_imports` needed). See [snippets.md](snippets.md)
- [ ] `_snippets` entries exist for inline HTML in `.md` content that has no markdown equivalent (`<figure>`, `<video>`, `<details>`, etc.), identified during audit. See [../snippets.md § Raw snippets for inline HTML](../snippets.md#raw-snippets-for-inline-html-in-md-files)
- [ ] `markdown.options.table` is `true` if any content files contain Markdown-syntax tables
- [ ] `add_options` restricts the Add button to only creatable schemas (excludes index pages and one-off pages with dedicated routes)
- [ ] Collections using `.md` files with no rendered body content have `_enabled_editors: [data]`
- [ ] If the site has 3+ reusable block components, a page builder schema with `content_blocks` array is available
- [ ] Schemas for creatable page types have `new_preview_url` pointing to an existing page with the same layout
- [ ] `.cloudcannon/README.md` exists with editor-facing documentation (collections, data files, settings, quick links)

## Patterns and gotchas

This section grows as we complete more migrations. Document template-specific findings in the template's own `migration/configuration.md`, not here.

### Configure icon fields as select inputs

When a template uses an icon library (e.g. `astro-icon` with Iconify sets like `tabler:*` and `flat-color-icons:*`), configure the `icon` input as a `select` with `allow_create: true` rather than a plain `text` field. Non-technical editors can't guess icon names, but they can pick from a curated list with friendly display names.

1. Grep the content files for every unique `icon:` value used in the template.
2. Add them as object values with `name` (human-readable label) and `id` (the actual Iconify value).
3. Set `value_key: id` so the stored value is the Iconify ID, not the whole object.
4. Set `preview.text` to show the friendly name in the dropdown.
5. Set `allow_create: true` so developers can still type custom icon names.
6. Add a `comment` linking to the icon set's browser (e.g. Iconify) so developers know where to find new names.

Derive friendly names from the icon ID: strip the collection prefix (`tabler:`, `flat-color-icons:`), replace hyphens with spaces, title-case. For icons from secondary collections, add a suffix to distinguish them (e.g. "Template (Color)" for `flat-color-icons:template` vs "Template" for `tabler:template`).

```yaml
_inputs:
  icon:
    type: select
    comment: "Pick an icon or type a custom [Iconify](https://icon-sets.iconify.design/) name"
    options:
      allow_create: true
      value_key: id
      preview:
        text:
          - key: name
      values:
        - name: Rocket
          id: tabler:rocket
        - name: Check
          id: tabler:check
        - name: Template (Color)
          id: flat-color-icons:template
        # ... all icons used in the template's content
```

This applies to any field that accepts icon names — items in features, steps, stats, buttons, etc. A single global `icon` input definition covers all of them since the key name is the same.

A data file isn't worth the complexity here. Adding new icons requires knowing the icon set's naming scheme, which is a developer task. The hardcoded list is easy for a developer to extend directly in config.

### Quote numeric values that map to text inputs

YAML parses bare numbers (`price: 29`) as integers, not strings. If the corresponding CloudCannon input is `type: text` (or defaults to text), CC throws "This text input is misconfigured. This input must have a text value." This affects both structure default values and content file frontmatter.

**Fix:** Either quote the value as a string (`price: "29"`) or configure the input as `type: number`. Quoting as a string is usually better — it's simpler and avoids breaking component code that does string operations on the value.

This is easy to miss during content migration — agents must check every numeric value in frontmatter and ask: is this field's input type `text` or `number`? If it's `text` (or unspecified), quote it. Common culprits: `price`, `amount`, `count`, `order`, `rating`.

Structure default values follow the same rule. If a structure defines `price:` (null/empty), no problem. But if it has a numeric default like `columns: 3`, the input must be `type: number` or the value must be quoted.

### Verify Gadget's `source` path

Gadget may generate an incorrect `source` path (e.g. pointing into `node_modules/`). Always check this field after generation. For most Astro sites, `source` should be empty or omitted (the project root is the source). Remove it if Gadget set it to something wrong.

### Set `markdown.options.table` when content has Markdown tables

CloudCannon defaults `markdown.options.table` to `false`, meaning the rich text editor outputs `<table>` HTML. If the site's content files already use Markdown table syntax (`| col | col |`), set this to `true` so tables survive round-tripping through the editor. Grep content directories for the pipe-delimited pattern to detect this:

```bash
rg '^\|.*\|' src/content/
```

```yaml
markdown:
  engine: commonmark
  options:
    table: true
```

You also need `table: true` in `_editables.content` so the table button appears in the rich text toolbar. Because CloudCannon treats any omitted `_editables` key as `false` once you define one, you must re-declare all the defaults you want to keep:

```yaml
_editables:
  content:
    blockquote: true
    bold: true
    bulletedlist: true
    format: p h1 h2 h3 h4 h5 h6
    image: true
    italic: true
    link: true
    numberedlist: true
    removeformat: true
    snippet: true
    table: true
```

`markdown.options.table` controls serialization (Markdown vs HTML); `_editables.content.table` controls the toolbar button.

### `collection_groups` requires matching `collections_config` entries

`collection_groups` only organizes collections that are already defined in `collections_config` -- it does not create them. If you reference a collection name in `collection_groups` that has no `collections_config` entry, it silently does nothing. A common case: data files handled via `data_config` still need a separate collection in `collections_config` if you want them to appear as a browsable group in the sidebar. `data_config` controls `@data` references for visual editing; `collections_config` controls what appears in the sidebar.

### Always link arrays to structures explicitly

Don't rely on CC's naming-convention heuristic (where an array key `foo` auto-matches `_structures.foo`). Use `type: array` with `options.structures` to make the link visible and intentional. This avoids mystery for editors and ensures arrays work even if a structure gets renamed.

### Add preview icon fallbacks on structures

When a structure preview uses `image` from a field that may be empty (e.g. `avatar`), add an `icon` entry so CC shows a meaningful fallback instead of the default generic icon:

```yaml
preview:
  text:
    - key: name
  icon:
    - format_quote
  image:
    - key: avatar
```

### Configure object inputs with preview icons

Object inputs without a `preview.icon` show a generic icon in the data editor. Configure `type: object` with `options.preview.icon` on any object key that editors will see — both top-level data file objects and nested objects inside structures.

**Top-level objects in data/config files** — use `file_config` to scope the input:

```yaml
file_config:
  - glob: src/config/config.json
    _inputs:
      site:
        type: object
        options:
          preview:
            icon: language
      metadata:
        type: object
        options:
          preview:
            icon: manage_search
```

**Nested objects inside structures** — common objects like `callToAction`, `image`, `textarea`, etc. appear inside structure values. Define them in global `_inputs` so the icon applies everywhere the key name appears:

```yaml
_inputs:
  callToAction:
    type: object
    options:
      preview:
        icon: ads_click
  image:
    type: object
    options:
      preview:
        icon: image
```

Use [Material Icons](https://fonts.google.com/icons) names. Pick icons that reflect the object's purpose (e.g. `tune` for settings, `analytics` for tracking, `ads_click` for CTAs, `image` for media objects).

**Watch for key collisions.** A key like `image` may be a string path (`type: image`) in some contexts and an object (`{ src, alt }`) in others. You can't define both `type: image` and `type: object` for the same key in global `_inputs`. In these cases, keep the `type: image` definition (which serves the simpler/more common case) and skip the object icon — the nested structure value already defines the object's fields.

### Array item previews go on `[*]`, not on the array

When configuring how items appear inside an array, target `arrayName[*]` (the item), not `arrayName` (the array itself). The array input controls the list; the `[*]` input controls each card within it.

Do **not** add `type: object` to `arrayName[*]` for snippet array items. The repeating parser already defines the item shape via its params — adding `type: object` overrides the inferred structure and causes a "misconfigured object input" error when adding new items (CloudCannon no longer knows what fields to create).

Also note that `preview.text`, `preview.icon`, and `preview.image` use cascade format — an array of lookup objects, not a single object:

```yaml
# Wrong — preview on the array, text as a bare object
_inputs:
  tab_items:
    type: array
    options:
      preview:
        text:
          key: name
        icon: tab

# Correct — preview on the array item, text as a cascade array
_inputs:
  tab_items:
    type: array
  tab_items[*]:
    options:
      preview:
        text:
          - key: name
        icon: tab
```

### Hide developer-only frontmatter fields

Fields like `layout`, `_schema`, and other routing/rendering keys are set by developers and shouldn't be exposed to editors. Mark them `hidden: true` in `_inputs`:

```yaml
_inputs:
  layout:
    hidden: true
  _schema:
    hidden: true
```

These fields still exist in the frontmatter and are read at build time, but editors won't see or accidentally change them. Apply this to any field that controls rendering plumbing rather than visible content.

### Data-only markdown collections

When `.md` files are used purely for frontmatter (team members, testimonials, authors) with no body content rendered on any page, set `_enabled_editors: [data]` to restrict editing to the data editor. Without this, editors see the content editor with an empty body area that does nothing. Alternatively, convert these files to `.yml` or `.json`.

```yaml
team:
  path: src/content/team
  _enabled_editors:
    - data
```

### `_inputs` key collision across nesting levels

`_inputs` matches by key name regardless of nesting depth. If the same key (e.g. `primary`) appears with different types in different nested objects, use dot syntax to disambiguate: `parent_object.primary` targets only the `primary` key inside `parent_object`.

```yaml
_inputs:
  theme_color.primary:
    type: color
  font_family.primary:
    type: text
```

### TypeScript config files are not CC-editable

Some Astro templates store site configuration in TypeScript files with `as const` objects (e.g. `src/config.ts` with site title, author, feature flags). These cannot be edited in CloudCannon's data editor because CC only handles JSON/YAML/Markdown files.

Options, in order of preference:
1. **Leave as-is** — document as developer-only. Best for small blogs where the config rarely changes.
2. **Convert to JSON** — extract the config into a `.json` file, import it in TypeScript, configure as `data_config` in CC. Requires updating all imports across the project. Worth it for templates where site owners need to change titles, descriptions, or feature flags.
3. **Hybrid** — move frequently-edited fields (title, description, social links) to JSON while keeping developer-only settings (build flags, pagination counts) in TypeScript.

The same applies to `constants.ts` files with hardcoded arrays (social links, navigation). If these need to be editor-accessible, extract to JSON and configure `data_config`.

### Pages collection: including `.astro` pages

The pages collection should include both `.md` content pages and `.astro` template pages that have editable content. Set the collection to visual-only editing since that's the only editor that works for both file types:

```yaml
pages:
  path: src/pages
  icon: wysiwyg
  url: "/[slug]/"
  glob:
    - "*.md"
    - "index.astro"
  _enabled_editors:
    - visual
  add_options: []
```

Only include `.astro` pages that actually have editable regions (source editables or other `data-editable` attributes). Pages with no visually editable content (e.g. search, 404, tag listing) should be excluded -- they just clutter the collection with unopenable items.

The `[slug]` pattern handles `index.astro` correctly -- `[slug]` resolves to an empty string for `index` filenames, producing `/`.

`add_options: []` prevents creating new pages since the routes are hardcoded. Hide the `layout` field in `_inputs` for `.md` pages.

#### When to use source editables vs. refactoring to `.md`

Many `.astro` pages have hardcoded text (hero titles, descriptions, CTA copy) that editors should be able to change. There are two approaches:

**Source editables (preferred for most cases):** Add `data-editable="source"` attributes directly to elements in the `.astro` file. Low effort, no structural changes needed. See [visual-editing.md § Source editables](visual-editing.md#source-editables-for-hardcoded-content).

**Refactor to `.md` with layouts (for component-heavy pages):** When a page is composed of many distinct sections/components, extract the content into a `.md` file with structured frontmatter and render it through a layout. This enables array-based page building where editors can reorder, add, and remove sections. Worth the effort when the page has 3+ distinct component sections.

**Decision rule:** If the page has a few pieces of hardcoded text in a fixed layout, use source editables. If the page is built from many components that editors might want to rearrange, refactor to `.md` with a `content_blocks` array approach.

