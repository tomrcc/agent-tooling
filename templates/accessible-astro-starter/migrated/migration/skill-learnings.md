# Skill Learnings — Accessible Astro Starter Migration

Patterns, gotchas, and potential improvements discovered during this migration.
To be merged with shared skill docs after both parallel migrations complete.

---

## API-to-file blog conversion

**Pattern**: When a template fetches content from an external API at build time (e.g. JSONPlaceholder), convert to a local content collection with sample posts.

**Steps that worked well**:
1. Create `src/content/blog/` with 5-6 sample `.md` posts matching a well-defined schema
2. Add the collection to `content.config.ts` with Zod validation
3. Rewrite listing pages to use `getCollection()` with sort/filter/paginate
4. Rewrite detail pages to use `getEntry()` + `render()`
5. Update any components that fetched from the API (FeaturedPosts, LauncherConfig)
6. Remove the env var and its schema from `astro.config.mjs`

**Gotcha**: The API was referenced in multiple components (FeaturedPosts, LauncherConfig) beyond just the page routes. The audit should search globally for the env var or fetch URL, not just in `src/pages/`.

**Skill doc improvement**: Add a "Blog conversion" subsection to the Astro content phase doc. Currently the docs assume content already exists as files. Pattern: "search for all references to the API URL or env var before removing the env config."

---

## Homepage extraction to content collection

**Pattern**: When a homepage has 3+ structured sections with arrays (features, FAQ items, team members, counters), extract all data into frontmatter of a content collection entry rather than using source editables.

**What worked well**:
- Using `z.union([homepageSchema, pageSchema])` for the `pages` collection schema so it supports both the complex homepage and simple pages
- Defining structures in CC config that match the Zod sub-schemas exactly
- Using `_schema: homepage` to trigger the correct CC schema for the homepage entry

**Gotcha**: Counter `count` values like `"1.100+"` must be quoted as strings in YAML to avoid numeric parsing. The Zod schema should use `z.string()` not `z.number()` for display values that contain formatting.

**Gotcha**: The `hero.title` and `hero.gradient_text` were originally implemented as a single slot (`<span class="text-gradient">Accessible</span> Starter for Astro`) in the Hero component. When extracting to frontmatter, these become two separate fields. The Hero component itself continues to use slots — the page template injects the data.

**Skill doc improvement**: Add a pattern for "Homepage extraction" to the content phase doc, including the `z.union` approach and guidance on when to extract vs. when source editables are sufficient.

---

## Auto-import for MDX snippets

**Pattern**: When MDX content files have explicit `import` statements for components that will be managed as CloudCannon snippets, set up `astro-auto-import` so editors don't see import statements in the Content Editor.

**Steps**:
1. `npm install astro-auto-import`
2. Add `AutoImport({ imports: [...] })` to integrations **before** `mdx()` in `astro.config.mjs`
3. Remove explicit import statements from existing MDX files
4. Keep imports that can't be auto-imported (e.g. `{ Image } from 'astro:assets'`)

**Update**: `astro-auto-import` DOES support named exports from virtual modules using the object syntax: `{ 'astro:assets': [['Image', 'Image']] }`. This works because auto-import just injects the import statement at build time — it doesn't need to resolve the module itself. All import statements can be removed from MDX files, keeping the Content Editor clean.

**Gotcha**: The template had peer dependency conflicts (eslint versions). Required `--legacy-peer-deps` for npm install.

**Skill doc improvement**: The snippets doc should note that auto-import works for virtual modules too. Use `{ 'virtual:module': [['NamedExport', 'NamedExport']] }` syntax.

---

## npm package components and visual editing

**Pattern**: Components from npm packages (like `accessible-astro-components`) can be rendered in the initial build but won't live-update via `registerAstroComponent()` unless you create display fallback components.

**Affected components in this migration**:
- `Accordion`, `AccordionItem` from `accessible-astro-components`
- `Avatar`, `AvatarGroup` from `accessible-astro-components`
- `Card`, `Heading`, `Link`, etc. from `accessible-astro-components`

**Workaround**: These sections are still editable via the sidebar data editor. The visual editor shows a stale render until a full rebuild. This is acceptable for the initial migration.

**Skill doc improvement**: Add a section to the visual-editing doc about "Third-party component limitations" with guidance on when display fallbacks are worth creating vs. when sidebar editing is sufficient.

---

## Source editables on .astro pages

**Pattern**: For `.astro` pages with mostly component-based layouts (like the contact form and thank-you page), there are often very few plain text elements suitable for source editables. Don't force editables onto content that's wrapped in component props or complex JSX.

**Guidance**: If a page has fewer than 2-3 editable text areas, it may not be worth adding to the CC collection. The thank-you page in this migration had zero suitable targets — all text was inside component attributes.

---

## Catch-all route for CMS-created pages

**Pattern**: When using a `pages` content collection, add a `[...slug].astro` catch-all route so editors can create new pages from CloudCannon without developer intervention.

**Important**: The catch-all must filter out `index` (or any page that has its own dedicated route) to avoid conflicts:
```
.filter((page) => page.id !== 'index')
```

---

## `compressHTML` and data attributes

The template uses `compressHTML: true` in astro config. This minifies HTML output but preserves `data-*` attributes. No issues observed — all 81 `data-editable` attributes on the homepage survived compression.

---

## Gadget cleanup

Gadget's baseline config included a `migration` collection (picking up the `migration/` notes directory) and a `source` collection (the repo root). Both need to be removed during customization. This is expected but worth noting — always review Gadget output before moving on.

---

## Multiple references to removed env vars

After removing `BLOG_API_URL` from `astro.config.mjs`, the build failed because `LauncherConfig.astro` still imported it. The audit phase should flag all files that reference environment variables, not just page routes.

**Skill doc improvement**: Add to the audit checklist: "Search globally for env var usage (`astro:env/server`, `import.meta.env`) and list all consuming files."

---

## Don't include .astro template files in site_pages collection

**Gotcha**: When setting up a `site_pages` collection with `path: src/pages`, including `.astro` files like `index.astro` and `contact.astro` in the glob creates duplicate entries. The homepage already exists in the `pages` content collection (as `index.md`), so `index.astro` (the template that renders it) shouldn't be editable content. Only include `*.md` and `*.mdx` files in the site_pages glob.

**Skill doc improvement**: Configuration doc should explicitly warn against including `.astro` template files that render content collection entries in the site_pages collection.

---

## Component re-rendering requires data-shape prop matching

**Pattern**: For `data-component` on array items to trigger component re-rendering, the component must accept spread props matching the frontmatter data shape. If a component uses slots or different prop names than the data, re-rendering won't populate the content correctly.

**Example**: Feature component originally accepted `{ icon, title }` with description as a slot. The frontmatter array items have `{ icon, title, description }`. The re-renderer passes the array item as spread props, so `description` must be a prop, not a slot.

**Fix**: Update components to accept the full data shape. Use optional props with slot fallbacks for backward compatibility.

**Hero buttons**: The Hero component had hardcoded CTA buttons. Since the frontmatter contains `hero.buttons[]` with `label`, `href`, `type`, `icon`, the Hero needed to accept and render buttons from props. Wrap with `<editable-component data-component="hero" data-prop="hero">` for live re-rendering.

**Skill doc improvement**: Visual editing doc should emphasize that components used with `data-component` must accept spread props matching their frontmatter data shape — slots won't receive data during re-rendering.

---

## Tags data file pattern

**Pattern**: For taxonomy fields like `tags` that appear across multiple collections, create a shared data file (`data/tags.yml`) with a `data` collection in CC config. Reference it from select inputs with `values: data.tags`.

**Benefits**:
- Single source of truth for valid tag values
- Editors can manage tags without developer help
- CC link protocol in input comment lets editors jump to the data file: `[Manage tags](cloudcannon:collections/data/tags.yml)`
- `allow_create: true` lets editors add new ones inline too

**Skill doc improvement**: Configuration doc should include a "Shared data files" pattern for taxonomy/enum values.

---

## Extract complex HTML into components for cleaner snippets

**Pattern**: When MDX content contains complex HTML blocks (e.g. a `<div>` grid with multiple nested `<Image>` tags), the snippet syntax struggles to represent it — and editors see raw HTML in the content editor.

**Fix**: Extract the complex block into a dedicated Astro component with flat props, auto-import it, and configure a simple snippet for the component tag instead of the raw HTML. Moves complexity into the component, keeping the MDX clean and the snippet config straightforward.

**Example**: A 2x2 image gallery grid with 4 `<Image>` tags, each with `src`, `alt`, `width`, `height`, `class` — replaced by `<ImageGallery src1="..." alt1="..." src2="..." alt2="..." src3="..." alt3="..." src4="..." alt4="..." />`. The component handles the grid layout and Image imports internally.

**Benefits**:
- Content editor shows a clean snippet block instead of raw HTML
- Snippet config uses simple named args instead of trying to parse nested HTML
- Component encapsulates layout/styling decisions
- `Image` import no longer needed in MDX files at all (component handles it)

**Skill doc improvement**: Snippets doc should recommend extracting complex HTML patterns into components rather than trying to configure snippets for raw HTML blocks.

---

## What to expose as CMS collections

**Rule of thumb**: Only expose files as CMS collections if an editor would reasonably want to edit them.

- **Page/content files that build to URLs** — yes, expose them. Even if they're "template" demo pages that shipped with the starter, they produce real output. Editors can delete them if they want; that's not CC's business.
- **Data files** (e.g. `data/tags.yml`) — yes, expose them. They don't build to URLs but they're explicitly for editor management. Use `disable_url: true`.
- **Schema files** (e.g. `.cloudcannon/schemas/*`) — no. These are developer scaffolding for CC's schema system. Editors shouldn't see or touch them.
- **Layout/template `.astro` files** that don't produce standalone content (e.g. `index.astro` that just renders a content collection entry) — no. These are developer-managed templates, not editor content.

**Gotcha**: Gadget's auto-generated config may create a `source` collection for `.cloudcannon/` files. Remove it — those are internal to the CC integration.

**Skill doc improvement**: Configuration doc should include guidance on which file types to expose as collections and which to exclude.

---

## data_config required for data file select inputs

**Gotcha**: `values: data.tags` in a select/multiselect input config does NOT work by itself. You must also add a `data_config` entry at the root of `cloudcannon.config.yml` that maps the key to the file path:

```yaml
data_config:
  tags:
    path: data/tags.yml
```

Without `data_config`, CC has no way to resolve `data.tags` to the actual file.

**Skill doc improvement**: Configuration doc should mention `data_config` is required alongside `values: data.<key>` references.

---

## Wrapper components for third-party library elements

**Pattern**: When a third-party component (e.g. `AccordionItem`, `Avatar` from `accessible-astro-components`) renders props internally and you can't add `data-editable` attributes to its output, create a thin wrapper component in your project.

**Example**: `FaqItem.astro` wraps `AccordionItem` and passes `title`/`content`/`open` as props. `CommunityMember.astro` wraps `Avatar` and passes `initials`/`name`/`role`. Register these wrappers with `registerAstroComponent` and use `data-component` on the array items.

**Why**: The re-renderer needs a registered component that accepts the full data shape as spread props. Third-party components often have different prop names (Avatar uses `title`/`subtitle`, frontmatter uses `name`/`role`), so the wrapper also handles the mapping.

**Skill doc improvement**: Visual editing doc should cover the wrapper pattern for third-party components that can't be directly registered.

---

## PageHeader editability via optional props

**Pattern**: Shared layout components like `PageHeader` that render title/subtitle should support optional editable props (`titleProp`, `subtitleProp`, `imageProp`). When provided, the component wraps the rendered text in `data-editable="text" data-prop={titleProp}` spans. When not provided, renders plain text (for listing pages with hardcoded strings).

**Benefit**: Single component, opt-in editability per usage. Blog/portfolio single pages pass `titleProp="title" subtitleProp="description"`, listing pages don't.

---

## MarkdownLayout needs data-editable for visual editing

**Pattern**: Pages using a Markdown layout (`MarkdownLayout.astro`) that renders content via `<slot />` need `data-editable="text" data-type="block" data-prop="@content"` on the slot wrapper div for the visual editor to pick up the content body.

---

## Input type matters for URLs

**Pattern**: Any frontmatter field that contains a URL (`href`, `link_href`, etc.) should use `type: url` in `_inputs`. This gives editors a proper URL input with validation instead of a plain text field.

**Skill doc improvement**: Configuration doc should note common field-to-type mappings (url fields → url type, dates → datetime, etc.).

---

## Live toggling boolean sections with CloudCannon events

**Pattern**: For boolean frontmatter fields that show/hide sections (e.g. `show_featured_projects`), don't conditionally render — always render the content and use `display: none` when false. Add a small inline `<script>` using CC's vanilla JS event API:

1. Listen for `cloudcannon:load` to get the `CloudCannon` object
2. Call `CloudCannon.enableEvents()`
3. Listen for `cloudcannon:update`, call `CloudCannon.value()` for latest data
4. Toggle `display` on section wrapper elements

This avoids the problem where editable-component re-rendering can't call server-side APIs like `getCollection()`. The content stays in the DOM; the script just toggles visibility.

**Skill doc improvement**: Visual editing doc should include a pattern for boolean toggle sections using CC's JS event API.

---

## Shared data files for people/entities used across collections

**Pattern**: When the same entity (e.g. team members) appears in multiple places — blog author, community section, project author — extract them into a shared data file (`data/team.yml`).

**Setup**:
- `data_config.team` points to the YAML file
- Select/multiselect inputs use `values: data.team` with `value_key: name`
- Frontmatter stores just the name string (not the full object)
- A build-time utility (`src/utils/team.ts`) reads the YAML and resolves names to full objects

**Benefits**:
- Single source of truth for team member details (initials, role, image, bio)
- Editors manage team via the data file, select from a dropdown in posts
- CC link protocol lets editors jump to the data file: `[Manage team](cloudcannon:collections/data/team.yml)`

**Implementation detail**: `js-yaml` is available as a transitive dependency in most Astro projects. Use it with `fs.readFileSync` to parse the YAML at build time. Cache the result to avoid re-reading per page.

**Skill doc improvement**: Configuration doc should include a "Shared entity data files" pattern with the `data_config` + `value_key` + build-time resolution approach.

---

## Wrapping component sections for live editing of non-text props

**Pattern**: When a section has props that aren't simple text (e.g. a CTA button with `link_text` + `link_href`), inline `data-editable="text"` only handles the text. To make non-text props (URLs, booleans) update live, extract the section into its own component, register it, and wrap in `<editable-component>`.

**Example**: The FAQ left column (title, description, CTA button) was extracted into `FaqInfo.astro`. The component accepts `title`, `description`, `link_text`, `link_href` as props. When any FAQ field changes in the sidebar, the component re-renders with updated props, including the button URL.

**Skill doc improvement**: Visual editing doc should clarify when to use `data-editable="text"` (simple text) vs `<editable-component>` (complex props like URLs, booleans, icons).
