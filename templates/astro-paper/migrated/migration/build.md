# Build — astro-paper

## Build result

`npx astro build` succeeded. 43 pages built in ~19s.

## Editable attributes verified

- Post detail pages: `data-editable="text" data-prop="title"` on h1, `data-editable="text" data-type="block" data-prop="@content"` on article
- About page: same pattern (title h1 + body div)
- Homepage: no editable attributes (correct — hero is hardcoded)

## Build warnings

- `Generated an empty chunk: "Layout.astro_astro_type_script_index_1_lang"` — expected, the registerComponents script only has comments since no components are registered for this migration

## CloudCannon build command

```
npx astro build && npx pagefind --site dist
```

Pagefind generates the search index in `dist/pagefind/` after Astro builds.

## Manual testing checklist (Fog Machine)

- [ ] Blog posts show in the "Content" sidebar group
- [ ] About page shows in the "Pages" sidebar group
- [ ] Creating a new blog post uses the schema template with correct fields
- [ ] Post detail page: inline text editing works on the title
- [ ] Post detail page: rich text editing works on the article body
- [ ] About page: inline text editing works on the title
- [ ] About page: rich text editing works on the body content
- [ ] Tags multiselect allows creating new tags
- [ ] Featured and draft toggles work in the data editor
- [ ] Hidden fields (slug, layout, canonicalURL, etc.) don't appear in the data editor
- [ ] Markdown tables in posts survive round-tripping through the rich text editor
