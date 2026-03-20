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

Gadget produces a structural baseline. The following customizations are almost always needed, informed by the Phase 1 audit:

- **`_inputs`** -- configure how fields appear in the editor (dropdowns, date pickers, image uploaders, comments, hidden fields). Map these from the Zod schemas discovered in the audit.
- **`_structures`** -- define reusable component structures for array-based page building. Derive these from the component inventory in the audit.
- **`collection_groups`** -- organize collections into sidebar groups for a clean editing experience.
- **`_editables`** -- configure rich text editor toolbars per collection or globally.
- **`_snippets_imports`** -- add snippet support for Astro component syntax. Use `"astro"` as the import key.
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

Collections that produce pages need a `url` pattern so CloudCannon can open them in the visual editor and display the correct URL in the collection file list.

### Syntax

Use `[slug]` as a placeholder for the filename (minus extension):

```yaml
pages:   url: "/[slug]/"
blog:    url: "/blog/[slug]/"
authors: url: "/authors/[slug]/"
```

If the filename is `index`, `[slug]` resolves to an empty string. So a `pages` collection with `url: "/[slug]/"` produces `/` for `index.md` and `/about/` for `about.md`.

### Trailing slash rule

The URL must match the built output path. Check `astro.config.mjs` for `trailingSlash` and `build.format`:

- **`build.format: "directory"` (default)** -- Astro builds pages as `dir/index.html`. URLs need a trailing slash: `/about/`, `/blog/my-post/`. This is the default even when `trailingSlash` is set to `"never"`.
- **`build.format: "file"`** -- Astro builds pages as `page.html`. URLs do not have a trailing slash: `/about`, `/blog/my-post`.
- **`build.format: "preserve"`** -- matches the source file structure. Check the output to determine the pattern.

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

## Verification checklist

After generating and customizing the config, work through these checks before moving to the next phase:

- [ ] `cloudcannon.config.yml` exists and is valid YAML
- [ ] `.cloudcannon/initial-site-settings.json` exists with `"ssg": "astro"` and correct `build_command` and `output_path`
- [ ] `collections_config` has entries for every collection from the audit
- [ ] No non-content directories leaked into `collections_config` (e.g. `lib`, `source`, `migration`)
- [ ] No collections contain only a single file -- consolidate or group as needed
- [ ] `collection_groups` organise collections into logical sidebar groups
- [ ] `_inputs` is configured for common field types (images, dates, dropdowns, hidden fields)
- [ ] Collections that produce pages have a `url` pattern with correct trailing slash for the site's `build.format`
- [ ] Collections with `index.md` files have separate schemas for the index page and regular items
- [ ] `paths.uploads` is set to `public/images` (or the correct static asset directory)
- [ ] `.cloudcannon/prebuild` exists if pre-build steps are needed
- [ ] `file_config` entries exist for files with inputs not covered by global or collection-level config
- [ ] All arrays with structures are explicitly linked via `type: array` + `options.structures` (don't rely on naming conventions)
- [ ] Structure previews have `icon` fallbacks where `image` may be empty

## Patterns and gotchas

This section grows as we complete more migrations. Document template-specific findings in the template's own `migration/configuration.md`, not here.

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

### `_inputs` key collision across nesting levels

`_inputs` matches by key name regardless of nesting depth. If the same key (e.g. `primary`) appears with different types in different nested objects, use dot syntax to disambiguate: `parent_object.primary` targets only the `primary` key inside `parent_object`.

```yaml
_inputs:
  theme_color.primary:
    type: color
  font_family.primary:
    type: text
```

> **Note:** Commands use `gadget` directly (via `npm link` during development). Once the package is published, these become `npx @cloudcannon/gadget` instead.

---

**Example:** See `templates/astroplate/migrated/migration/configuration.md` for a completed configuration phase.
