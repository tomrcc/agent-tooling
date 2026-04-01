# Build and Test — astro-nano

## Build result

`pnpm build` (`astro check && astro build`) completed successfully:

- 0 errors, 0 warnings from `astro check`
- 14 pages built
- All draft posts correctly excluded (08-draft-example not in output)
- Sitemap generated

## Editable attributes verified

| Page | `data-editable` count |
|---|---|
| Homepage (`/`) | 6 source editables |
| Blog detail (`/blog/01-getting-started/`) | 2 (title + @content) |
| Project detail (`/projects/project-1/`) | 2 (title + @content) |

## Note

The `registerComponents.ts` script generates an empty chunk since no components are registered. This is expected and harmless.

## Manual testing

Test in Fog Machine to verify:

- Source editables on the homepage (hero heading, section headings, connect text)
- Inline text editing on blog post titles
- Rich text body editing on blog/project detail pages
- Data editor fields for all collections (blog, projects, work)
- New content creation from schemas (blog post, project, work entry)
