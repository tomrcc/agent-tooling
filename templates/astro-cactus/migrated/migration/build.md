# Build — astro-cactus

## Build result

Clean build with `pnpm build` (which runs `astro build` then `pagefind --site dist`). 22 pages built in 8.6s. Pagefind indexed 9 pages, 627 words.

## URL verification

Post URLs in `dist/` match `[full_slug]` pattern correctly:

| Content file | `post.id` | Built URL |
|---|---|---|
| `webmentions.md` | `webmentions` | `/posts/webmentions/` |
| `markdown-elements/index.md` | `markdown-elements` | `/posts/markdown-elements/` |
| `markdown-elements/admonitions.md` | `markdown-elements/admonitions` | `/posts/markdown-elements/admonitions/` |
| `testing/cover-image/index.md` | `testing/cover-image` | `/posts/testing/cover-image/` |
| `testing/long-title.md` | `testing/long-title` | `/posts/testing/long-title/` |
| `testing/social-image.md` | `testing/social-image` | `/posts/testing/social-image/` |

Key finding: Astro's glob loader strips `/index` from the id for `index.md` files. CC's `[full_slug]` placeholder also collapses `index` filenames — so they align perfectly.

Note URL: `/notes/welcome/` — matches `[slug]` pattern.

Tag URLs: `/tags/test/`, `/tags/markdown/`, etc. — matches `[slug]` pattern.

## Editable attributes verified

| Page | `data-editable` count | Types |
|---|---|---|
| Homepage (`dist/index.html`) | 2 | source (hero-title, hero-description) |
| About (`dist/about/index.html`) | 2 | source (about-title, about-content) |
| Post (`dist/posts/webmentions/index.html`) | 2 | text (title, @content) |
| Note (`dist/notes/welcome/index.html`) | 2 | text (title, @content) |

## Warnings

- `astro-webmanifest` warned that `public/icon.svg` is not square — pre-existing, not related to migration
- `vite` warned about empty chunk for `Base.astro_astro_type_script_index_0_lang` — the registerComponents import is currently empty (only comments), so the chunk is empty. Will populate once components are registered (not needed for this template).

## Manual testing needed

Test in Fog Machine:
- Source editables work on homepage (hero title + description)
- Source editables work on about page (title + content block)
- Inline text editing works on post titles (via Masthead)
- Content body editing works on posts (@content)
- Content body editing works on notes (title + @content)
- Cover image displays correctly from `/images/cover-image.png` path
- New post creation works via schemas
- Tags multiselect works with `allow_create: true`
- Markdown tables survive round-tripping in the content editor
