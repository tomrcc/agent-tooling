# Skill Learnings — astro-cactus Migration

Findings from this migration to review for merging into skill docs alongside the parallel migration.

---

## 1. Astro's `image()` Zod type vs CloudCannon uploads

**Problem**: Astro's `image()` helper in content collection schemas validates that the referenced image exists as a local file at the given relative path. It produces `ImageMetadata` for Astro's `<Image>` component optimization. CloudCannon editors upload images to `public/images/` (or wherever `paths.uploads` points), producing absolute paths like `/images/photo.png` — these fail `image()` validation.

**Solution applied**: Changed `image()` to `z.string()` in the Zod schema and switched from `<Image>` (astro:assets) to plain `<img>` in the component. Moved existing co-located images to `public/images/` and updated frontmatter paths.

**Trade-off**: Loses Astro's automatic image optimization (resizing, format conversion, responsive srcsets) for that field. For a cover image displayed once per page, this is acceptable. For a site with many optimized images, a different approach might be needed.

**Potential skill doc addition**: The `image()` vs `z.string()` decision should be documented in the Astro configuration or content phase docs. Options:
1. Change to `z.string()` (simplest, loses optimization)
2. Keep `image()` and set `paths.uploads` to the content directory (images land next to content files — more complex for editors)
3. Keep `image()` and use a prebuild script to copy uploaded images from `public/` into `src/content/` (fragile)

The recommendation for most templates is option 1 unless image optimization is critical.

## 2. `[full_slug]` for collections with subdirectories

**Finding**: When posts live in subdirectories (e.g. `testing/cover-image/index.md`, `markdown-elements/admonitions.md`), the CC URL pattern `[slug]` only captures the filename — not the path. `[full_slug]` (`[relative_base_path]/[slug]`) handles nested paths correctly.

**Key behavior**: Astro's glob loader strips `/index` from the id for `index.md` files (so `testing/cover-image/index.md` → id `testing/cover-image`). CC's `[full_slug]` also collapses `index` filenames. These align perfectly — no special handling needed.

**Potential skill doc addition**: The configuration.md docs mention `[full_slug]` briefly but don't have a clear recommendation for when to use it. Add guidance: "Use `[full_slug]` instead of `[slug]` when a collection's content lives in subdirectories and the routing preserves the directory structure in URLs."

## 3. Tag collection as metadata-only taxonomy

**Pattern**: The `tag` collection provides optional titles, descriptions, and body content for tag pages. But tag pages are generated from `post.data.tags` — the tag collection doesn't drive page creation. If a tag exists in posts but not in the tag collection, the page still works (just without custom metadata). If a tag file exists but no posts use that tag, no page is generated.

**CC implications**: The collection has `url: "/tags/[slug]/"` so CC can open it in the visual editor when the page exists. Editors can create tag entries to add custom descriptions, but this won't create a tag page by itself.

**Potential skill doc addition**: This is a common Astro pattern for taxonomy enrichment. Worth documenting as a pattern in the configuration phase — "taxonomy enrichment collections" that provide metadata for programmatically-generated pages.

## 4. Remark directive syntax and CC content editing

**Limitation found**: Custom remark directives (`:::note`, `:::tip`, `::github{repo="..."}`) are parsed by remark plugins at build time but CC's content editor treats them as plain text. Editing posts through CC's content editor will mangle these directives.

**Mitigation**: Documented in the editor README that some markdown features are "build-only." For affected posts, editors should prefer the data editor for frontmatter changes and avoid editing body content.

**Potential skill doc addition**: The audit phase mentions documenting remark plugin limitations, but the configuration/visual-editing docs could be more explicit: "When a site uses custom remark/rehype plugins that extend markdown syntax, document which posts are affected and recommend data-editor-only editing for those posts."

## 5. Gadget `source` path issue

**Observed**: Running `gadget generate` from within the `migrated/` directory caused Gadget to detect a nested `source` path and write files to `migrated/templates/astro-cactus/migrated/`. Had to manually move files and clean up.

**Already documented**: The skill docs say to always remove `source` if Gadget generates one. But the nested-path write behavior is a practical gotcha — the files end up in the wrong directory entirely, not just with a wrong `source` key in the YAML.

**Potential skill doc addition**: Add a note that Gadget may write files to a nested path when run from a subdirectory of a monorepo-like structure. Always verify the output file locations.

## 6. Date format normalization

**Observation**: Astro's Zod schema with `.string().or(z.date()).transform(val => new Date(val))` accepts any date format JavaScript's `Date()` constructor can parse — "11 Oct 2023", "6 December 2024", ISO strings, etc. But CC's datetime input expects and outputs ISO 8601 format.

**Action taken**: Normalized all dates to `"YYYY-MM-DDTHH:mm:ssZ"` format. This is mechanical and could be scripted.

**Potential skill doc addition**: The content phase could recommend a script that normalizes dates in frontmatter to ISO 8601 when the Zod schema uses a Date transform. This would save time on templates with many content files.

## 7. Editor styles vs snippets for custom-classed elements

**Pattern found**: The about page has a `<ul class="list-inside list-disc">` inside a source editable block region. CC's rich text editor strips Tailwind utility classes on round-trip, breaking the list styling.

**Solution applied**: Created `public/css/editor-styles.css` defining a `ul.feature-list` class, wired it to `_editables.block.styles` in the CC config, and replaced the Tailwind utilities with the semantic class. The `prose` parent provides base list styling; the editor style provides the override.

**Decision framework**:
- **Use editor styles** when the element is standard markdown/HTML (p, h1-h6, ul, ol, blockquote, span) and the only customization is a CSS class. Stripping the class leaves valid content the editor understands.
- **Use snippets** when the element has structural complexity beyond what the rich text editor can represent — custom attributes, nested children, wrapper elements, non-standard HTML. Removing the markup loses structural information.

**Potential skill doc addition**: Add this framework to the visual-editing docs as guidance for deciding between styles and snippets during migration.

## 8. `data-editable="image"` with object-shaped cover images

**Pattern**: The `coverImage` field is an object `{ src, alt }` rather than a plain string. Using `data-prop="coverImage"` on a `data-editable="image"` wrapper binds the entire object. CC's image panel manages both `src` and `alt` fields.

**Contrast with string images**: When the image field is a plain string path, use `data-prop-src="fieldName"` instead of `data-prop`. Using `data-prop` on a string field won't work — it expects an object.

**Potential skill doc addition**: The visual-editing docs already describe both patterns. Worth adding an explicit note that object-shaped images need `data-prop` (whole object) while string images need `data-prop-src` (src only).

## 9. `@file` for cross-page collection item editing

**Path must start with `/`**: The `@file` path is repo-root-relative and must have a leading slash. `@file[/src/content/note/welcome.md].title` works; `@file[src/content/note/welcome.md].title` does not.

**Pattern**: Notes rendered on the homepage as previews can link to their source files using `@file[/src/content/note/${note.id}.md].title`. When the target collection has a `url` pattern, clicking the editable navigates to the item's editing page — useful click-through UX.

**@file vs @collections**: `@collections[note].INDEX.field` uses a numeric index into CC's collection array, which is fragile — the index depends on CC's sort order and won't match the loop order on a page that sorts/slices differently. `@file` is more precise since it targets the exact file path. Downside: requires knowing the repo-relative path, which could break in monorepos.

**Potential skill doc addition**: The visual-editing docs describe `@file` for cross-collection editing but could add guidance on when `@file` is preferred over `@collections` (always, for now, given the index fragility).

## 10. Admonition snippets — custom raw snippet for remark-directive

**Finding**: CC's `docusaurus_mdx_admonition` import does NOT work for remark-directive syntax. The Docusaurus format uses space-separated titles (`:::note My Title`) while remark-directive uses bracket syntax (`:::note[My Title]`). Importing the built-in mangles content on round-trip.

**Resolution**: Removed `docusaurus_mdx` import and defined a custom raw snippet instead. The pattern `:::[[type]][[title]]\n[[content]]:::` uses `argument` parser for the type (bare word after `:::`), `content` parser with `optional: true` and bracket-style leading/trailing (`[` / `]`) for the optional title, and `content` parser for the body. A `select` input constrains the type to valid admonition types.

**Untested**: Whether the `content` parser with `style.inline.leading: '['` / `trailing: ']'` and `optional: true` correctly handles both `:::note[title]` and `:::note` (no title) variants. If brackets don't work as content delimiters, `alternate_formats` (one with title, one without) would be the fallback.

**Skill doc updated**: Added caveat to `snippets/built-in-templates.md` Docusaurus section about the remark-directive syntax mismatch.

## 11. Source editables use `_editables.content` for toolbar config

**Confirmed**: Source editables (`data-editable="source"`) use `_editables.content` for their toolbar configuration, not `_editables.block`. The `data-type` attribute on the element doesn't change which config key is used.

**Styles work, list items have bugs**: Editor styles via the `styles` property are supported and the dropdown appears. However, list item styles specifically don't apply correctly — this is a known CC bug (reported, under investigation).

**Skill doc updated**: Added toolbar config note to `editable-regions.md` EditableSource section.

## 12. Tags data file for consistent taxonomy management

**Pattern**: Instead of free-text `type: multiselect` with `allow_create: true`, create a managed tags list as a JSON data file (`src/data/tags.json`). Configure `data_config` to register it, then use `values: data.tags` on the tags input. Keep `allow_create: true` so editors can add new tags, but the dropdown pre-populates from the managed list.

**Benefits**: Consistent casing, discoverable options, editors can browse/edit the tag list via the data collection in the sidebar.

**Potential skill doc addition**: Add this as a recommended pattern in the configuration phase for sites with taxonomy tags. Especially useful when multiple content types share the same tag set.

## 13. Editor styles vs. snippets decision framework

**Rule of thumb**: Use **editor styles** when the customization is just a CSS class on an otherwise standard markdown/HTML element (e.g., a `<ul>` with `list-inside list-disc`, a `<p>` with a highlight class). The element structure is unchanged — it's just styled differently.

Use **snippets** when the element requires non-standard structure: custom data attributes, nested children the editor can't represent, wrapper `<div>`s, or complex multi-field content blocks.

**Example**: A feature list with `list-inside list-disc` styling → editor style. An admonition block with `:::type\ncontent\n:::` → snippet (complex structure with typed variant and inner content).

**Potential skill doc addition**: Add this as guidance in the visual-editing docs under a "customizing the editor toolbar" section.

## 14. Empty registerComponents chunk warning

**Observed**: Vite warning during build: "Generated an empty chunk: Base.astro_astro_type_script_index_0_lang". This happens because `registerComponents.ts` contains only comments — no actual code. The warning is harmless and disappears once component registrations are added.

**Not a skill doc issue**: This is expected behavior for blog templates that don't need component registration.
