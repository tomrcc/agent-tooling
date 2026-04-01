# Configuration — astro-nano

## Gadget baseline

Gadget produced a `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json`. The baseline needed heavy rework:

- **Removed `source`** — not needed for single-project repos
- **Collapsed per-folder blog collections** into a single `blog` collection at `src/content/blog`
- **Collapsed per-folder project collections** into a single `projects` collection at `src/content/projects`
- **Removed `migration` collection** — not user-facing content
- **Added `work` collection** at `src/content/work`
- **Added `pages` collection** for `src/pages/index.astro` (homepage source editables)

## URL patterns

Used `{slug}` (data/frontmatter placeholder) rather than `[slug]` (filename-based) for blog and projects. The content uses folder-per-post structure (`01-getting-started/index.md`) where the filename is `index` and `[slug]` resolves to empty string. Added `slug` frontmatter to all blog and project content files to support `{slug}`.

- Blog: `/blog/{slug}/`
- Projects: `/projects/{slug}/`
- Work: no URL (no detail pages)
- Pages: `/[slug]/` (handles `index.astro` → `/`)

## Schemas

Created schemas in `.cloudcannon/schemas/`:
- `post.md` — blog post with title, description, date, draft, slug
- `project.md` — project with title, description, date, draft, slug, demoURL, repoURL
- `work.md` — work entry with company, role, dateStart, dateEnd

All add_options use `editor: content` since this is a writing-focused site.

## Input configuration

- `dateEnd` configured as `text` (not datetime) because it accepts "Current" for active positions
- `draft` uses `switch` type
- `demoURL`/`repoURL` use `url` type
- `slug` visible with comment explaining URL impact
- Markdown tables enabled (`markdown.options.table: true` + `_editables.content.table: true`) — many content files use markdown tables

## Decisions

- **consts.ts left as-is** — site settings (name, email, socials, homepage limits) stay in TypeScript. Low edit frequency, documented as developer-only in README.
- **No snippets configured** — the MDX post is demo content with non-reusable component imports. The inline HTML in project content (deploy buttons) is also demo-specific.
- **Homepage only in pages collection** — listing pages (blog/projects/work index) have minimal hardcoded text not worth the overhead of source editables.
- **Work collection has no URL** — work entries render inline on listing pages with no detail pages.
