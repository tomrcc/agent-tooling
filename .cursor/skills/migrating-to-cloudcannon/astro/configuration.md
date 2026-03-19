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

The full set of configuration keys is defined in the [CloudCannon Configuration JSON Schema](https://raw.githubusercontent.com/CloudCannon/configuration-types/main/cloudcannon-config.schema.json). Generated files include a schema reference that provides IDE autocomplete and validation -- preserve these references when editing.

## Consolidating single-file collections

After Gadget generates collections, review the result for collections that contain only a single file. A collection of one doesn't add value in the CloudCannon sidebar and should be consolidated. Two strategies, applied in order:

### Strategy A: Merge simple pages into the `pages` collection

If a single-file collection uses the same schema as `pages` (e.g. an `about` or `contact` collection with standard title/description/image/body fields), merge it into the `pages` collection:

- Move the content file into the `pages` directory (e.g. `src/content/about/index.md` -> `src/content/pages/about.md`)
- Remove the separate collection from `content.config.ts` and `cloudcannon.config.yml`
- Update the page's rendering template in `src/pages/` to fetch from the `pages` collection instead
- The page still uses its own rendering template for routing

### Strategy B: Group related files into a meaningful collection

If a page has a unique schema that justifies its own collection (e.g. a homepage with structured `banner`/`features` data), check whether it has related data files -- sections, partials, or other content files -- that are only used on that page. If so, group them together:

- Move the related files into the same directory as the page (e.g. `src/content/sections/call-to-action.md` -> `src/content/homepage/call-to-action.md`)
- In `content.config.ts`, keep separate collection definitions for type safety (different Zod schemas) but point them at the same base directory with file-specific glob patterns
- In CloudCannon, configure a single collection covering the whole directory
- Set the collection `url` to the page's URL (e.g. `"/"` for homepage) -- clicking "open" on any file in the collection navigates to the page where all sections are visible

Only group files that are exclusive to one page. Shared data files stay in their own collection.

### Fallback: Merge unique pages into `pages` with multiple schemas

If a page has a unique schema but doesn't have related files that would make the collection more than one file, merge it into the `pages` collection instead of leaving it as a singleton:

- Add a `type` discriminator field to the frontmatter (e.g. `type: "homepage"` vs `type: "page"`)
- In `content.config.ts`, use a Zod discriminated union on `type` so both schemas are type-safe within the same collection
- In CloudCannon, define multiple schemas for the `pages` collection so editors get the correct fields for each page type
- The page still uses its own rendering template in `src/pages/` -- routing is independent of collection structure

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

## Patterns and gotchas

This section grows as we complete more migrations. Document template-specific findings in the template's own `migration/configuration.md`, not here.

> **Note:** Commands use `gadget` directly (via `npm link` during development). Once the package is published, these become `npx @cloudcannon/gadget` instead.

---

**Example:** See `templates/astroplate/migrated/migration/configuration.md` for a completed configuration phase.
