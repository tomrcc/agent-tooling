# Content

Guidance for reviewing and restructuring content files to be CMS-friendly. Run this phase after the audit and before (or alongside) configuration.

## When to skip this phase

If the audit shows content is already well-structured -- consistent frontmatter, clean markdown, no SSG-specific extensions in content bodies -- skip content changes and just document the patterns. Not every migration needs file edits.

## Review checklist

Work through these checks for every migration. Document findings even when no changes are needed.

### Frontmatter consistency

For each collection, verify:

- **Required fields are present in every file.** If the schema defines a field as required but files omit it, either add it to the files or make the schema default/optional. Prefer matching what the schema expects.
- **Optional fields with defaults behave correctly.** When a field has a Zod `.default()` or `.optional()`, the SSG fills in the default at runtime. CloudCannon editors see what's in the file, not the runtime default. If a field is commonly used and should be visible in the editor, consider adding it explicitly to content files even if the schema doesn't require it.
- **`draft` field.** If the site filters on `draft`, ensure it's present where needed. When the filter uses `!data.draft`, omitting the field is equivalent to `draft: false` (since `!undefined === true`), so missing `draft` fields are safe. But for CloudCannon's UI, having an explicit `draft: false` is better -- it gives editors a visible toggle.
- **Date formats.** Use ISO 8601 (`2022-04-04T05:00:00Z`). Avoid ambiguous formats. Astro's `z.coerce.date()` handles both Date objects and ISO strings.
- **Image paths.** Prefer absolute paths from the site root (`/images/banner.png`) for consistency. Relative paths work but are harder to manage across collections.

### Field naming

- Use `snake_case` consistently for frontmatter keys (`meta_title`, not `metaTitle`).
- Avoid name collisions with CloudCannon reserved keys (e.g. `_inputs`, `_structures`, `_schema`).
- Keep field names descriptive and consistent across collections (e.g. always `image`, not sometimes `image` and sometimes `thumbnail`).

### Index files and the `-index` convention

Some Astro templates use a `-index.md` file to hold listing/index page metadata (title, description, image for the `/blog` listing page, for example). This pattern works by:

1. The glob loader picks up all `.md` files including `-index.md`
2. `getSinglePage()` filters out IDs starting with `-` (so `-index` never appears as a "post")
3. `getListPage(collection, "-index")` fetches it by exact ID for listing page metadata

**CloudCannon implications:** These files are part of the collection but serve a different purpose than regular items. In Phase 2 (configuration), they should be handled by either:
- Placing them in a separate collection with a narrow glob (e.g. pattern `**/-*.{md,mdx}`)
- Using CloudCannon's `filter` to hide them from the main collection list while keeping them editable

For now, leave the files as-is. The naming convention doesn't need to change.

### Content references (string-based)

Some templates reference related content by string rather than by ID or file path. For example, blog posts might use `author: "John Doe"` where the matching is done by slugifying the name and comparing to author filenames.

This works but is fragile -- renaming an author breaks the link. In Phase 2, configure CloudCannon's select input for these fields so editors pick from a list of valid values rather than typing freeform.

No content file changes are needed for this pattern.

### Markdown content body

Check for:

- **SSG-specific extensions** (MDX components, shortcodes) that CloudCannon's content editor can't render. These are fine in files but won't be live-previewable. Document which files use them.
- **Inline HTML** in markdown. CloudCannon's rich text editor handles standard HTML but complex embedded HTML (especially with framework-specific attributes like `set:html`) may not round-trip cleanly. Usually not an issue for content bodies.
- **Empty content bodies.** Index files and section data often have no body content (all data lives in frontmatter). This is normal and CloudCannon handles it fine.

### Data files (JSON/YAML config)

Site configuration stored in JSON or YAML files (navigation menus, social links, theme settings) is editable in CloudCannon as "data" collections. These rarely need restructuring, but verify:

- JSON is valid and well-formatted
- Nested structures aren't so deep that CloudCannon's editor becomes unwieldy (3+ levels of nesting is a flag)
- Arrays of objects have consistent shapes across items

---

**Example:** See `templates/astroplate/migration/content.md` for a completed content review using this format.
