# Visual Editing — astro-cactus

## Setup

Ran `setup-editable-regions.sh` which:
1. Installed `@cloudcannon/editable-regions` via pnpm
2. Added `editableRegions()` integration to `astro.config.ts`
3. Created `src/cloudcannon/registerComponents.ts`

Manually added `import "@/cloudcannon/registerComponents"` script tag to `src/layouts/Base.astro`.

## Editable regions added

### Source editables (hardcoded page content)

**`src/pages/index.astro`**:
- `hero-title` — the "Hello World!" heading
- `hero-description` — the intro paragraph

**`src/pages/about.astro`**:
- `about-title` — the "About" heading
- `about-content` — the entire prose div (block-level rich text)

### Content body editing

**`src/layouts/BlogPost.astro`**:
- `@content` on the prose div wrapping `<slot />` — enables inline rich text editing of the post body

**`src/components/blog/Masthead.astro`**:
- `title` text editable on the `<h1>` — inline title editing on post pages

**`src/components/note/Note.astro`**:
- `title` text editable on the note title (detail view only, not preview)
- `@content` on the content div (detail view only, not preview)
- Conditional: `isPreview` branch has no editables (used on homepage where note data comes from a different collection scope)

## What was NOT made editable

- **Navigation** (`menuLinks` in `src/site.config.ts`) — TypeScript config, developer-only
- **Social links** (`SocialList.astro`) — hardcoded links, developer-only
- **Footer/header** — structural, not content
- **Tag lists on posts** — programmatic from `post.data.tags`
- **Post/note lists on homepage** — cross-collection programmatic content
- **Search** — Pagefind widget, no content to edit

## Component registration

`registerComponents.ts` is currently empty (commented examples only). No components need registration for this template:
- No page builder blocks
- No conditional rendering that needs live re-render
- Text/image editables and source editables cover all editing needs
