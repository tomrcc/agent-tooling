# Astroplate Configuration Notes

## Gadget Baseline

Ran the step-by-step Gadget path:

1. `gadget detect-ssg` -- detected `astro` (score 50, next highest `hugo` at 6)
2. `gadget collections --ssg astro` -- detected 12 collections including non-content paths
3. `gadget build --ssg astro` -- suggested `npm run build`, `yarn build`, `npx astro build`; output `dist`
4. `gadget generate --auto --init-settings --ssg astro` -- generated baseline files

## Issues with Gadget Baseline

1. **`pages` collision**: Gadget created a `pages` collection pointing to `src/pages` (Astro page templates) and a separate `content_pages` for `src/content/pages`. Renamed `content_pages` to `pages` and removed the template collection.
2. **Non-content collections**: Gadget suggested `source` (project root), `lib` (src/lib), and `migration` (our notes directory) as collections. Removed all three.
3. **No `_inputs`, `_structures`, or `collection_groups`**: Gadget produces only structural config. All editor customization was manual.
4. **No `url` on collections**: Gadget doesn't set URLs. Added manually based on the Astro routing from the audit.
5. **Default uploads path**: Changed from `public/uploads` to `public/images` since images are the primary use case.

## Customizations Applied

### Prebuild

Created `.cloudcannon/prebuild` script to run `themeGenerator.js` and `jsonGenerator.js` before the build. The build command is now just `astro build` -- pre-build steps are separated.

### Collection URLs

Every collection that maps to a built page has a `url` defined (the built path, not the source path):

| Collection | URL |
|------------|-----|
| homepage | `/` |
| about | `/about` |
| contact | `/contact` |
| pages | `/[slug]` |
| blog | `/blog/[slug]` |
| authors | `/authors/[slug]` |
| sections | (none -- embedded content, no standalone page) |
| config | (none -- data files) |

### Editor Preference

Visual editor is listed first in `_enabled_editors` for all content collections that have built pages. Data-only collections (sections, config) use the data editor.

### collection_groups

Organized into: Pages (pages), Data (data), Blogging (blog, authors), Site Settings (config).

### _inputs (scoped)

Collection-specific inputs are scoped to their collection's `_inputs`:
- **blog**: `author` (select from authors), `categories` (multiselect), `tags` (multiselect)
- **authors**: `icon` (text with comment for React Icons)
- **sections**: `designation` (text), `avatar` (image)

Global inputs cover fields used across multiple collections: `title`, `meta_title`, `description`, `image`, `date`, `draft`, `enable`, `content`, `link`, `label`, `name`.

### Schemas for index pages

Collections with `index.md` files have separate schemas to differentiate the index page from regular items:

- **blog**: `default` (Blog Post) and `blog_index` (Blog Index) schemas in `.cloudcannon/schemas/`
- **authors**: `default` (Author) and `authors_index` (Authors Index) schemas in `.cloudcannon/schemas/`

The `[slug]` URL pattern collapses `index` to an empty string, so `blog/index.md` resolves to `/blog/` and `authors/index.md` resolves to `/authors/` without any special URL handling.

### _structures

Global structures for: `social` (author social links), `features` (homepage feature blocks), `testimonials` (testimonial entries).
