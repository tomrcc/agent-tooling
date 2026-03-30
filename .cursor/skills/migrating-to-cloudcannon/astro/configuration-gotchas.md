# Configuration Gotchas (Astro)

Common patterns and pitfalls discovered during Astro migrations. Document template-specific findings in the template's own `migration/configuration.md`, not here.

## Configure icon fields as select inputs

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
```

A single global `icon` input definition covers all fields that accept icon names.

## Quote numeric values that map to text inputs

YAML parses bare numbers (`price: 29`) as integers, not strings. If the corresponding CloudCannon input is `type: text` (or defaults to text), CC throws "This text input is misconfigured. This input must have a text value." This affects both structure default values and content file frontmatter.

**Fix:** Either quote the value as a string (`price: "29"`) or configure the input as `type: number`. Quoting as a string is usually better — it's simpler and avoids breaking component code that does string operations on the value.

Common culprits: `price`, `amount`, `count`, `order`, `rating`. Structure default values follow the same rule.

## Verify Gadget's `source` path

Agents should never add `source` and should remove it if Gadget generates one. See [configuration.md § Review the generated config](configuration.md#review-the-generated-config).

## Title-derived slugs and `{title|slugify|lowercase}`

Some templates compute URLs from titles at build time using a custom slugify function. Don't assume CC's `slugify` filter produces identical output.

CC's `slugify` replaces non-alphanumeric characters with hyphens and collapses them. A typical custom function may remove non-alphanumeric characters instead. For simple titles both produce the same result, but for titles with apostrophes or special characters they diverge:

- "What's New" → CC slugify: `what-s-new` (apostrophe → hyphen) vs custom: `whats-new` (apostrophe removed)

**Recommendation:** Compare the custom function's algorithm against CC's `slugify` filter behavior. If they differ for edge cases, add a frontmatter field with the pre-computed slug value and use it in the CC URL pattern (e.g. `{permalink}`). This is safer than `{title|slugify|lowercase}`.

**Astro 4 gotcha: `slug` is reserved.** In Astro 4's legacy content collections (`src/content/config.ts`), the `slug` field is reserved by Astro. Adding `slug` to the Zod schema throws `ContentSchemaContainsSlugError`. Use a different field name like `permalink` instead. This restriction does not apply to Astro 5+ with the `glob()` loader.

## Set `markdown.options.table` when content has Markdown tables

CloudCannon defaults `markdown.options.table` to `false`, meaning the rich text editor outputs `<table>` HTML. If the site's content files already use Markdown table syntax (`| col | col |`), set this to `true` so tables survive round-tripping through the editor. Grep content directories for the pipe-delimited pattern:

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

## `collection_groups` requires matching `collections_config` entries

`collection_groups` only organizes collections that are already defined in `collections_config` -- it does not create them. If you reference a collection name in `collection_groups` that has no `collections_config` entry, it silently does nothing. A common case: data files handled via `data_config` still need a separate collection in `collections_config` if you want them to appear as a browsable group in the sidebar.

## Always link arrays to structures explicitly

Don't rely on CC's naming-convention heuristic (where an array key `foo` auto-matches `_structures.foo`). Use `type: array` with `options.structures` to make the link visible and intentional.

## Add preview icon fallbacks on structures

When a structure preview uses `image` from a field that may be empty (e.g. `avatar`), add an `icon` entry so CC shows a meaningful fallback:

```yaml
preview:
  text:
    - key: name
  icon:
    - format_quote
  image:
    - key: avatar
```

## Configure object inputs with preview icons

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
```

**Nested objects inside structures** — define in global `_inputs` so the icon applies everywhere:

```yaml
_inputs:
  callToAction:
    type: object
    options:
      preview:
        icon: ads_click
```

Use [Material Icons](https://fonts.google.com/icons) names. **Watch for key collisions** — a key like `image` may be a string path (`type: image`) in some contexts and an object (`{ src, alt }`) in others. Keep the simpler/more common definition globally.

## Array item previews go on `[*]`, not on the array

Target `arrayName[*]` (the item), not `arrayName` (the array itself). Do **not** add `type: object` to `arrayName[*]` for snippet array items — the repeating parser already defines the item shape.

```yaml
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

## Hide developer-only frontmatter fields

Fields like `layout`, `_schema`, and other routing/rendering keys should be hidden from editors:

```yaml
_inputs:
  layout:
    hidden: true
  _schema:
    hidden: true
```

## Data-only markdown collections

When `.md` files are used purely for frontmatter (team members, testimonials, authors) with no body content rendered, set `_enabled_editors: [data]` to restrict editing to the data editor. Alternatively, convert these files to `.yml` or `.json`.

## `_inputs` key collision across nesting levels

`_inputs` matches by key name regardless of nesting depth. Use dot syntax to disambiguate when the same key appears with different types:

```yaml
_inputs:
  theme_color.primary:
    type: color
  font_family.primary:
    type: text
```

## TypeScript config files are not CC-editable

Some Astro templates store site configuration in TypeScript files with `as const` objects. These cannot be edited in CloudCannon's data editor.

Options, in order of preference:
1. **Leave as-is** — document as developer-only. Best for small blogs where the config rarely changes.
2. **Convert to JSON** — extract the config into a `.json` file, import it in TypeScript, configure as `data_config` in CC.
3. **Hybrid** — move frequently-edited fields to JSON while keeping developer-only settings in TypeScript.

## Pages collection: including `.astro` pages

There are two distinct approaches for pages in CloudCannon:

- **`src/content/pages/` collection**: For templates with structured data that should become content collection entries. See [page-building.md](page-building.md).
- **`src/pages/` collection**: For templates where static pages stay as `.astro` files with source editables. Simpler, but no Zod validation and limited to source editables for `.astro` pages.

Choose based on the audit classification. Templates with many structured pages typically need the content collection approach. Blog-focused templates with a few static pages use this simpler approach.

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
  disable_add: true
```

Only include `.astro` pages that actually have editable regions. The `[slug]` pattern handles `index.astro` correctly — resolves to `/`.

### Deciding whether to enable page creation

**Disable page creation (`disable_add: true`)** when:
- The template is blog-focused and standalone pages are one-offs with hardcoded layouts
- Enabling creation would give editors a broken or unstyled result

**Enable page creation** when:
- The template has a generic page layout that works for arbitrary content
- New `.md` pages would render correctly with the existing layout and navigation

Use `disable_add: true` to hide the Add button. Do not use `add_options: []` for this purpose -- it has no effect.

### Source editables vs. refactoring to `.md`

**Source editables (preferred for most cases):** Add `data-editable="source"` attributes directly. Low effort, no structural changes needed. See [visual-editing.md § Source editables](visual-editing.md#source-editables-for-hardcoded-content).

**Refactor to `.md`:** When a page has a handful of distinct sections that editors should control, extract the content into a `.md` file with structured frontmatter.

**Decision rule:** If the page has a few pieces of hardcoded text in a fixed layout, use source editables. If the page has structured data that editors need CRUD control over, the content collection approach is usually better -- see [page-building.md](page-building.md).
