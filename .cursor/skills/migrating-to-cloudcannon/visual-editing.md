# Visual Editing

Guidance for adding CloudCannon Visual Editor support using `@cloudcannon/editable-regions`.

## Editable regions reference

Detailed documentation on the `@cloudcannon/editable-regions` library is split across three files:

- [editable-regions.md](editable-regions.md) -- Overview, region types, path syntax, API actions, file map
- [editable-regions-lifecycle.md](editable-regions-lifecycle.md) -- Full lifecycle trace, core internals, data flow diagram
- [editable-regions-integrations.md](editable-regions-integrations.md) -- Astro and Eleventy/Liquid framework integrations

For deeper dives into library internals, the JavaScript API, or debugging unexpected behaviour, see the [deep-dive docs index](../../docs/README.md). Only consult those when the skill-level docs above aren't enough.

## Setup steps (Astro)

### 1. Install the package

```bash
npm install @cloudcannon/editable-regions --legacy-peer-deps
```

Also install `js-beautify` which is a required but not automatically resolved dependency:

```bash
npm install js-beautify --legacy-peer-deps
```

### 2. Add the Astro integration

In `astro.config.mjs`:

```javascript
import editableRegions from "@cloudcannon/editable-regions/astro-integration";

export default defineConfig({
  integrations: [
    // ...other integrations
    editableRegions(),
  ],
});
```

This registers a Vite plugin that enables client-side rendering of Astro components (needed for `EditableComponent` regions).

### 3. Create the `registerComponents` script

Create `src/cloudcannon/registerComponents.ts`. This is where Astro components are registered for live re-rendering in the Visual Editor. Initially it contains only commented-out examples -- uncomment and add registrations as components are wired up.

```typescript
// Register Astro components for live re-rendering in the Visual Editor.
// Import each component and call registerAstroComponent() to enable
// EditableComponent regions to re-render when data changes.
//
// import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
// import CallToAction from "@/layouts/partials/CallToAction.astro";
// registerAstroComponent("call-to-action", CallToAction);
```

Then import it from the base layout (loaded on every page):

```astro
<script>
  import "@/cloudcannon/registerComponents";
</script>
```

This keeps component registrations in one place rather than scattering them across individual pages.

### Package exports reference

| Import path | Purpose |
|---|---|
| `@cloudcannon/editable-regions/astro-integration` | Astro integration for `astro.config.mjs` (build-time) |
| `@cloudcannon/editable-regions/astro` | `registerAstroComponent()` for client-side component re-rendering |

## Adding editable regions

### Text editing

Add `data-editable="text"` and `data-prop="<path>"` to any element whose text content should be inline-editable:

```astro
<h1
  set:html={markdownify(title)}
  class="mb-4"
  data-editable="text"
  data-prop="title"
/>
```

For block-level rich text (paragraphs, headings, lists), add `data-type="block"`:

```astro
<div class="content" data-editable="text" data-type="block" data-prop="@content">
  <Content />
</div>
```

The `@content` path targets the file's markdown body (not frontmatter).

### Image editing

Wrap an image with `data-editable="image"` and `data-prop="<path>"`. The editable region looks for a child `<img>` element:

```astro
<div data-editable="image" data-prop="image">
  <ImageMod src={image} width={1200} height={600} alt={title} format="webp" />
</div>
```

When the user clicks the image in the visual editor, CloudCannon opens the image picker. The `<img>` src is updated live.

### Button/link text

For text inside links or buttons, wrap the text content in a `<span>`:

```astro
<a class="btn btn-primary" href={button.link}>
  <span data-editable="text" data-prop="banner.button.label">
    {button.label}
  </span>
</a>
```

### Array editing

Wrap the container with `data-editable="array"` and each item with `data-editable="array-item"`. Child editable regions use paths relative to their array item:

```astro
<div data-editable="array" data-prop="features">
  {features.map((feature) => (
    <section data-editable="array-item">
      <h2 data-editable="text" data-prop="title">{feature.title}</h2>
      <div data-editable="image" data-prop="image">
        <ImageMod src={feature.image} ... />
      </div>
      <p data-editable="text" data-prop="content">{feature.content}</p>
    </section>
  ))}
</div>
```

Array items get CRUD controls (reorder, add, delete) automatically. Without a registered component renderer, items won't visually re-render after data changes -- the user saves and refreshes. Text/image editable regions within items still work in real-time.

## Data path patterns

### Relative paths (same file)

When the editable region is on the same page as the file being edited, use simple relative paths:

```
data-prop="title"           → frontmatter.title
data-prop="banner.title"    → frontmatter.banner.title
data-prop="@content"        → file content body (markdown)
```

### Absolute file paths (cross-file editing)

When a section's data comes from a different file (e.g. a shared CTA section rendered on the homepage), use absolute file paths:

```
data-prop="@file[src/content/sections/call-to-action.md].title"
data-prop="@file[src/content/sections/call-to-action.md].description"
data-prop="@file[src/content/sections/call-to-action.md].image"
```

File paths are relative to the repository root.

### Nested relative paths (inside arrays)

Within an `EditableArrayItem`, paths are relative to the current array element:

```
data-prop="title"    → features[N].title
data-prop="image"    → features[N].image
data-prop="content"  → features[N].content
```

## What to make editable vs. what to leave for the sidebar

Not everything benefits from visual editing. Guidelines:

**Good for visual editing (inline text/image):**
- Page titles, headings, descriptions
- Hero/banner content
- Images (hero, feature, author avatar)
- Content body (`@content`)
- CTA copy

**Better for sidebar/data editor:**
- Navigation menus (complex nested structures)
- Social links
- Theme settings (colors, fonts)
- SEO metadata (meta_title, meta_description)
- Boolean toggles (draft, enable)
- URL/link fields
- Taxonomy arrays (categories, tags)

**Provide visual editing fallbacks with `ENV_CLIENT`**
- Components with complex DOM management (Swiper carousels, etc.) -- their JavaScript conflicts with editable region DOM manipulation, and often are hard to edit if functioning like they do on prod.

**Skip visual editing entirely:**
- MDX content with shortcodes -- shortcodes won't render in the visual editor
- Header/footer (too many moving parts, better in data editor)

## Component re-rendering (advanced)

For full live preview (not just text/image), components need to be registered with the Astro integration. This enables `EditableComponent` to re-render the component in the browser when data changes.

Add registrations to `src/cloudcannon/registerComponents.ts`:

```typescript
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import CallToAction from "@/layouts/partials/CallToAction.astro";

registerAstroComponent("call-to-action", CallToAction);
```

The component wrapper element needs:

```html
<div data-editable="component" data-component="call-to-action" data-prop="...">
```

**Caveats:**
- Astro components that use `astro:content` or `astro:assets` imports need the integration's Vite plugin (which shims these modules for client-side rendering)
- React islands within components work via `addFrameworkRenderer()`
- Components must be self-contained -- external data fetching won't work client-side

This was not implemented in the astroplate migration (Phase 4). Text/image editable regions provide the most value with the least complexity. Component registration is the next step for templates where full live preview is a priority.

## Verification checklist

After adding editable regions, work through these checks before moving to the build phase:

- [ ] `@cloudcannon/editable-regions` is in `package.json` dependencies
- [ ] The Astro integration (`@cloudcannon/editable-regions/astro-integration`) is registered in `astro.config.mjs`
- [ ] `src/cloudcannon/registerComponents.ts` exists and is imported from the base layout
- [ ] Key page templates contain `data-editable` attributes -- spot-check the homepage, a content page, and any shared partials (CTA, testimonials, etc.)

---

**Example:** See `templates/astroplate/migration/visual-editing.md` for a completed visual editing implementation summary.
