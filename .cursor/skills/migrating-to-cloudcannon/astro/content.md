# Content (Astro)

Guidance for reviewing and restructuring content files to be CMS-friendly in an Astro site. Run this phase after the audit and before (or alongside) configuration.

## When to skip this phase

If the audit shows content is already well-structured -- consistent frontmatter, clean markdown, no unusual extensions in content bodies -- skip content changes and just document the patterns. Not every migration needs file edits.

## Review checklist

Work through these checks for every migration. Document findings even when no changes are needed.

### Frontmatter consistency

For each content collection, compare the files against the Zod schema in `content.config.ts`:

- **Required fields are present in every file.** If the schema defines a field as required but files omit it, either add it to the files or make the schema `z.optional()`. Prefer matching what the schema expects.
- **Optional fields with defaults.** When a field has `z.default()`, Astro fills in the default at runtime. CloudCannon editors see what's in the file, not the runtime default. If a field is commonly used and should be visible in the editor, add it explicitly to content files even if the schema doesn't require it.
- **`draft` field.** If the site filters on `draft`, ensure it's present where needed. When the filter uses `!data.draft`, omitting the field is equivalent to `draft: false` (since `!undefined === true`), so missing `draft` fields are safe. But for CloudCannon's UI, an explicit `draft: false` is better -- it gives editors a visible toggle.
- **Date formats.** Use ISO 8601 (`2022-04-04T05:00:00Z`). Astro's `z.coerce.date()` handles both Date objects and ISO strings, but CloudCannon expects consistent date formatting.
- **Image paths.** Prefer absolute paths from the site root (`/images/banner.png`) for consistency. Relative paths work but are harder to manage across collections.

### Field naming

- Use `snake_case` consistently for frontmatter keys (`meta_title`, not `metaTitle`).
- Avoid name collisions with CloudCannon reserved keys (e.g. `_inputs`, `_structures`, `_schema`).
- Keep field names descriptive and consistent across collections (e.g. always `image`, not sometimes `image` and sometimes `thumbnail`).

### Index files and the `-index` convention

Some Astro templates use a `-index.md` file to hold listing/index page metadata (title, description, image for the `/blog` listing page, for example). This pattern works by:

1. The glob loader in `content.config.ts` picks up all `.md` files including `-index.md`
2. A helper like `getSinglePage()` filters out IDs starting with `-` (so `-index` never appears as a regular item)
3. A helper like `getListPage(collection, "-index")` fetches it by exact ID for listing page metadata

**Migration action:** Rename `-index.md` to `index.md` in every collection that uses this convention and refactor the helpers accordingly:

1. **Rename the files.** `src/content/blog/-index.md` becomes `src/content/blog/index.md`, and so on for every collection.
2. **Update `getSinglePage()`** to filter on `id === "index"` instead of `id.startsWith("-")`.
3. **Update `getListPage()` callers** from `"-index"` to `"index"`.

**Why `index`:** CloudCannon's `[slug]` placeholder collapses `index` to an empty string. A collection with `url: "/blog/[slug]/"` produces `/blog/` for `index.md` and `/blog/my-post/` for `my-post.md`. This means the index page gets the correct listing URL without any special-case URL config.

**CloudCannon implications:** The index file stays in the same collection as its siblings -- no separate collection or filter needed. In Phase 2 (configuration), define a separate schema on the collection for the index page so editors get the right fields when editing it vs. a regular item. See the "Schemas for index pages" section in configuration.md.

### Content references (string-based)

Some templates reference related content by string rather than by collection ID. For example, blog posts might use `author: "John Doe"` where the matching is done by slugifying the name and comparing to author filenames.

This works but is fragile -- renaming an author breaks the link. In Phase 2, configure CloudCannon's select input for these fields so editors pick from a list of valid values rather than typing freeform.

No content file changes are needed for this pattern.

### Markdown content body

Check for:

- **MDX components and shortcodes** -- auto-imported components or explicit `import` statements in `.mdx` files. CloudCannon's content editor can't render these. They're fine in files but won't be live-previewable. Document which files use them.
- **Inline HTML** in markdown. CloudCannon's rich text editor handles standard HTML, but complex embedded HTML (especially with `set:html` directives in the rendering template) may not round-trip cleanly. Usually not an issue for content bodies.
- **Empty content bodies.** Index files and section data often have no body content (all data lives in frontmatter). This is normal and CloudCannon handles it fine.
- **Remark/rehype plugin output.** If custom remark or rehype plugins transform markdown in ways that affect the content structure (e.g. adding IDs to headings, wrapping images), note them but don't change the content. The plugins run at build time.

### Data files (JSON/YAML config)

Site configuration stored in JSON or YAML files outside content collections (e.g. `src/config/` directory with navigation, social links, theme settings) is editable in CloudCannon as "data" collections. Verify:

- JSON is valid and well-formatted
- Nested structures aren't so deep that CloudCannon's editor becomes unwieldy (3+ levels of nesting is a flag)
- Arrays of objects have consistent shapes across items

---

**Example:** See `templates/astroplate/migrated/migration/content.md` for a completed content review.
