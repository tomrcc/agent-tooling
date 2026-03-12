# Astroplate content findings

**No content changes were made.** The content is well-structured for CloudCannon out of the box.

## What was reviewed

| Check | Result |
|---|---|
| Frontmatter consistency | Clean across all collections. Fields match schemas. |
| `draft` field | Present in blog posts, pages, and index files. Missing from author files and section files, but schemas allow optional/absent. No issue. |
| Date format | ISO 8601 in all blog posts. Same date used for all sample posts (placeholder content). |
| Image paths | All use absolute paths from root (`/images/...`). Some index files use `image: ""` which is fine. |
| Field naming | Consistent `snake_case` throughout. No collisions with CloudCannon reserved keys. |
| `-index` convention | Used in blog, authors, about, contact, homepage. Works correctly with the `getSinglePage`/`getListPage` split. |
| Author references | String-based (`author: "John Doe"`). Slugified for matching. Works but should get a select input in Phase 2. |
| Content bodies | Clean markdown. `elements.mdx` uses React shortcodes via auto-import (Tabs, Accordion, Notice, etc.) -- these won't be visually editable. All other files are standard markdown. |
| Section files | `call-to-action.md` and `testimonial.md` use deeply nested frontmatter (arrays, objects). Renders correctly. May benefit from CloudCannon structures config in Phase 2. |
| JSON config files | All valid, well-formatted, reasonable nesting depth. `theme.json` is 2 levels deep (colors > darkmode > theme_color). `menu.json` has nested children (1 level). |

## Minor cosmetic inconsistencies (not worth fixing)

- Frontmatter field ordering varies between files (e.g. `description` before vs. after `meta_title`). No functional impact.
- Some string values are quoted, others aren't (`"this is meta description"` vs `this is meta description`). YAML parses both identically.
- Author social link ordering varies (william-jacob puts linkedin first). No functional impact.
