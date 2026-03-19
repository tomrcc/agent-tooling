# Astroplate Content Review

## Summary

Content is well-structured overall. All field names use `snake_case`, dates use ISO 8601, image paths are absolute from root, and there are no CloudCannon reserved key collisions. Minor issues documented below; one change recommended (adding explicit `draft: false` to author files).

## Frontmatter Consistency

### Blog

All 4 posts and `index.md` have consistent frontmatter with all expected fields. `draft: false` is present in every file. Dates are ISO 8601 (`2022-04-04T05:00:00Z`). Image paths are absolute (`/images/image-placeholder.png`). No issues.

The `index.md` (renamed from `-index.md`) has `meta_title: ""` and `image: ""` (empty strings rather than omitted). These work fine but result in empty fields visible in the editor.

### Authors

Individual author files (`john-doe.md`, `sam-wilson.md`, `william-jacob.md`) are **missing the `draft` field**. The schema makes it optional (`z.boolean().optional()`) and the site's filter logic treats `undefined` as not-draft, so this works at build time. However, CloudCannon editors won't see the draft toggle without an explicit value. Recommend adding `draft: false` to each.

Authors also have an `email` field in frontmatter that is **not in the Zod schema**. Astro's content layer silently drops unrecognized fields at build time, so this data is unused. The email appears to be leftover from a previous setup. No content change needed -- if email is desired, it should be added to the schema in `content.config.ts`.

The `index.md` (renamed from `-index.md`) has all expected fields including `draft: false`.

### Pages

Both `privacy-policy.md` and `elements.mdx` have consistent frontmatter with `draft: false` present. No issues.

### About, Contact

Both files (originally `-index.md`, now merged into `pages` collection as `about.md` and `contact.md`) have consistent frontmatter with `draft: false`. No issues.

### Homepage

`index.md` (renamed from `-index.md`) has the expected `banner` and `features` structure. No `draft` field, which is correct -- the homepage schema doesn't define one.

### Sections

`call-to-action.md` and `testimonial.md` have all expected fields. No `draft` field, which is correct -- the section schemas don't define one. Both have `enable: true` for toggling visibility.

## Field Naming

All frontmatter keys use `snake_case` consistently (`meta_title`, `build_command`, etc.). No CloudCannon reserved key collisions (`_inputs`, `_structures`, `_schema`).

## Index Files (renamed from `-index.md` to `index.md`)

Present in: blog, authors, homepage. (About and contact were merged into the `pages` collection.) These serve as listing page metadata and are fetched via `getListPage(collection, "index")`. Renamed from `-index.md` to `index.md` so that CloudCannon's `[slug]` collapse resolves them to the correct listing URL (e.g. `/blog/` for `blog/index.md`). The `getSinglePage()` helper was updated to filter on `id === "index"` instead of `id.startsWith("-")`. Each collection with an index file has a separate schema in the CloudCannon config to differentiate index pages from regular items.

## Content References (String-Based)

Blog posts reference authors by name string (`author: "John Doe"`). Matching is done by slugifying the author title. This is handled in the CloudCannon config with a `select` input on the `author` field that pulls from the authors collection. No content changes needed.

## Markdown Content Bodies

| Collection | Body Type | Notes |
|------------|-----------|-------|
| Blog posts | Markdown | Standard markdown content, no issues |
| Authors | Markdown | Short bios |
| Pages (privacy-policy) | Markdown | Standard content |
| Pages (elements) | **MDX** | Uses auto-imported shortcodes: Accordion, Button, Notice, Tabs, Tab, Video, Youtube. Not visually editable in CloudCannon's content editor; must use source editor for this file. |
| About | Markdown | Standard content |
| Contact | Empty | All data in frontmatter |
| Homepage | Empty | All data in frontmatter |
| Sections | Empty | All data in frontmatter |

## Data Files (`src/config/`)

| File | Valid | Max Depth | Array Consistency | Notes |
|------|-------|-----------|-------------------|-------|
| `config.json` | Yes | 2 | N/A | `announcement.content` contains inline HTML. `params.copyright` uses markdown link syntax. Both work in text fields but worth documenting for editors. |
| `menu.json` | Yes | 5 (flagged) | Inconsistent | Main nav items have mixed shapes -- some have `children` array, some don't. Deep nesting makes editing cumbersome. Consider `_structures` in the CloudCannon config to define menu item shapes. |
| `social.json` | Yes | 3 | Consistent | Clean structure, no issues. |
| `theme.json` | Yes | 5 (flagged) | N/A | Deep nesting for colors (default + darkmode, each with theme_color + text_color). Font family values use Google Fonts syntax (`Heebo:wght@400;600`). Editing works but isn't intuitive for non-developers. |

## Changes Made

1. **Added `draft: false`** to `john-doe.md`, `sam-wilson.md`, `william-jacob.md` so the toggle is visible in CloudCannon's editor.
2. **Renamed `-index.md` to `index.md`** in blog, authors, and homepage collections. Updated `getSinglePage()` to filter on `id === "index"` and all `getListPage()` callers to use `"index"`. Updated the homepage collection glob from `**/-*.{md,mdx}` to `index.{md,mdx}`.

## Changes Not Made (Document Only)

1. **`email` field on authors** -- exists in frontmatter but not in the Zod schema. Silently dropped at build time. If email is desired, add it to the schema in `content.config.ts`. Not a content migration concern.
2. **`elements.mdx` with shortcodes** -- uses MDX components (Accordion, Button, etc.) that can't be visually edited. This file should use the source/code editor in CloudCannon.
3. **`menu.json` mixed shapes** -- main nav has inconsistent item shapes. Could benefit from `_structures` in the CloudCannon config to define menu item types (with and without children).
4. **`theme.json` deep nesting** -- 5 levels deep for color values. Works in CloudCannon's data editor but isn't the most user-friendly. No restructuring recommended since the theme generator script depends on this shape.
