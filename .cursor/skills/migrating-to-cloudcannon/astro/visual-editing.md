# Visual Editing (Astro)

Guidance for adding CloudCannon Visual Editor support to an Astro site using `@cloudcannon/editable-regions`. For the full editable regions reference (region types, path syntax, API actions), see [../editable-regions.md](../editable-regions.md).

## Setup steps

Run the setup script to handle steps 1-3 automatically:

```bash
bash .cursor/skills/migrating-to-cloudcannon/scripts/setup-editable-regions.sh .
```

This installs the package (falling back to `--legacy-peer-deps` if needed), adds the Astro integration to `astro.config.mjs`, and creates `src/cloudcannon/registerComponents.ts`. Verify the results and then import the registerComponents script from the base layout:

```astro
<script>
  import "@/cloudcannon/registerComponents";
</script>
```

The details of what the script sets up are below for reference.

### 1. Install the package

```bash
npm install @cloudcannon/editable-regions
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

**Astro 4 compatibility:** The integration references `window` at module evaluation time in `helpers/cloudcannon.mjs`. In Astro 4's legacy content collections, `astro sync` (which runs at the start of `astro build`) evaluates the integration before the Vite plugin can shim browser globals, causing a `window is not defined` crash. The integration requires Astro 5+. For Astro 4 sites, skip the integration — `data-editable` HTML attributes still work for CloudCannon's Visual Editor (text editing, image picking, array CRUD), but component re-rendering (`registerAstroComponent`) is not available.

### 3. Create the `registerComponents` script

Create `src/cloudcannon/registerComponents.ts`. This is where Astro components are registered for live re-rendering in the Visual Editor. Initially it contains only commented-out examples -- uncomment and add registrations as components are wired up.

```typescript
// Enable React components (e.g. react-icons) inside registered Astro components.
// import "@cloudcannon/editable-regions/astro-react-renderer";

// Register Astro components for live re-rendering in the Visual Editor.
// Import each component and call registerAstroComponent() to enable
// EditableComponent regions to re-render when data changes.
//
// import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
// import CallToAction from "@/layouts/partials/CallToAction.astro";
// registerAstroComponent("call-to-action", CallToAction);
```

When the site uses a page builder with a `BlockRenderer`, create a shared `src/cloudcannon/componentMap.ts` that maps `_type` keys to their Astro component imports. Both `registerComponents.ts` and `BlockRenderer.astro` import from it, keeping the mapping in one place:

```typescript
// componentMap.ts
import Hero from '~/components/widgets/Hero.astro';
import Features from '~/components/widgets/Features.astro';
// ...

export const componentMap: Record<string, any> = {
  hero: Hero,
  features: Features,
  // ...
};
```

```typescript
// registerComponents.ts
import { registerAstroComponent } from '@cloudcannon/editable-regions/astro';
import { componentMap } from './componentMap';

for (const [key, component] of Object.entries(componentMap)) {
  registerAstroComponent(key, component);
}
```

### Package exports reference

| Import path | Purpose |
|---|---|
| `@cloudcannon/editable-regions/astro-integration` | Astro integration for `astro.config.mjs` (build-time) |
| `@cloudcannon/editable-regions/astro` | `registerAstroComponent()` for client-side component re-rendering |
| `@cloudcannon/editable-regions/astro-react-renderer` | Side-effect import: registers React as a framework renderer for Astro's client-side SSR (needed when React components like `react-icons` are used inside registered Astro components) |
| `@cloudcannon/editable-regions/react` | `registerReactComponent()` for standalone React component re-rendering — **unreliable, use Astro display fallback instead** |

## Adding editable regions

### Guard optional fields

The primary defence against `undefined` errors is ensuring all fields exist in the content frontmatter via structure definitions (see [../structures.md](../structures.md) — field completeness rule). Conditional guards are the safety net for cases where a field is legitimately optional even when the structure defines it.

Every element with a `data-editable` attribute must be conditionally rendered if its field can be undefined or null. CloudCannon's editable regions actively inspect the resolved value — rendering an element with `data-prop="subtitle"` when `subtitle` is undefined causes a runtime error, even if the original template rendered unconditionally.

```astro
<!-- Bad: errors if subtitle is undefined -->
<p set:html={subtitle} data-editable="text" data-prop="subtitle" />

<!-- Good: only renders when subtitle exists -->
{subtitle && <p set:html={subtitle} data-editable="text" data-prop="subtitle" />}
```

This applies to text, image, and any other editable type. When a shared sub-component like `Headline.astro` renders the editable elements, the guards belong in that sub-component.

**Object fields**: Guard on a meaningful inner field, not the object itself. Empty objects from content files (e.g. `image: { src: null, alt: null }`) are truthy. Use `image?.src &&` instead of `image &&`, and `callToAction?.text &&` instead of `callToAction &&`. See [../structures.md](../structures.md#guarding-empty-objects-in-components).

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

**Editables inside slot content:** `<Fragment>` elements can't carry HTML attributes. When passing editable text into a slot, use a concrete element (e.g. `<span>`) instead:

```astro
<!-- Won't work: Fragment can't carry data-editable -->
<Fragment slot="title">{title}</Fragment>

<!-- Works: span carries the editable attribute into the slot -->
<span slot="title" data-editable="text" data-prop="title">{title}</span>
```

### Image editing

Wrap an image with `data-editable="image"` and a data path attribute. The editable region looks for a child `<img>` element. There are two binding modes depending on the shape of the data:

**String image path** (most common -- the frontmatter field is a plain string like `"/images/hero.jpg"`):

Use `data-prop-src` to bind the image `src`. Optionally add `data-prop-alt` or `data-prop-title` if alt/title are stored in separate fields:

```astro
<div data-editable="image" data-prop-src="image">
  <ImageMod src={image} width={1200} height={600} alt={title} format="webp" />
</div>
```

**Object image field** (the frontmatter field is an object with `src`, `alt`, and `title` properties):

Use `data-prop` to bind the entire object at once:

```astro
<div data-editable="image" data-prop="hero_image">
  <img src={hero_image.src} alt={hero_image.alt} />
</div>
```

Most Astro templates store images as simple string paths, so `data-prop-src` is the correct choice in the majority of cases. Using `data-prop` on a string field will not work -- it expects an object.

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
      <div data-editable="image" data-prop-src="image">
        <ImageMod src={feature.image} ... />
      </div>
      <p data-editable="text" data-prop="content">{feature.content}</p>
    </section>
  ))}
</div>
```

Array items get CRUD controls (reorder, add, delete) automatically. Without a registered component renderer, items won't visually re-render after data changes -- the user saves and refreshes. Text/image editable regions within items still work in real-time. If the array contains conditional elements, style bindings, or computed content, wrap the parent section as a component -- see [When to use a component editable region](#when-to-use-a-component-editable-region) below.

### Page builder blocks

When a site uses an array-based page builder (`content_blocks` array with a `_type` discriminator), each block needs **three layers** of editable support. This is a common source of mistakes — agents often add the array wrapper but miss the component layer or nested editables. See the [CloudCannon complex array docs](https://cloudcannon.com/documentation/developer-guides/set-up-visual-editing/visually-edit-complex-arrays-and-page-building/) for the canonical reference. For the structure definitions that back these blocks, see [../structures.md](../structures.md).

**Layer 1: Array wrapper** on the catch-all route. The wrapper needs `data-component-key` and `data-id-key` to tell CloudCannon which frontmatter key identifies the component type and unique ID for each item:

```astro
<div
  data-editable="array"
  data-prop="content_blocks"
  data-component-key="_type"
  data-id-key="_type"
>
  {data.content_blocks.map((block) => (
    <BlockRenderer block={block} />
  ))}
</div>
```

Without `data-component-key`, CloudCannon cannot match array items to registered components. Without `data-id-key`, CloudCannon cannot uniquely identify items for reordering.

**Layer 2: Array items with component behaviour** in BlockRenderer. Each item must be a **plain HTML element** (like `<section>`) with `data-editable="array-item"`, `data-component`, and `data-id`. Use the shared `componentMap` (see below) to look up the component dynamically instead of a long conditional chain:

```astro
<!-- BlockRenderer.astro -->
---
import { componentMap } from '~/cloudcannon/componentMap';

interface Props {
  block: Record<string, unknown>;
}

const { block } = Astro.props;
const { _type, ...props } = block;
const Component = componentMap[_type as string];
---

{Component && (
  <section data-editable="array-item" data-component={_type} data-id={_type}>
    <Component {...props} />
  </section>
)}
```

`EditableArrayItem` extends `EditableComponent`, so `data-component` on an array-item element gives both array CRUD controls (add, remove, reorder) and component re-rendering — no separate wrapper needed.

**Do NOT use the `<editable-component>` custom element for array items.** That element self-hydrates as `EditableComponent`, which conflicts with the `EditableArrayItem` hydration triggered by `data-editable="array-item"`. `<editable-component>` is only for standalone component regions that are NOT inside an array (e.g. a fixed hero section on a page: `<editable-component data-component="hero" data-prop="banner">`).

**Layer 3: Nested editables** inside widget components — add `data-editable="text"` / `data-editable="image"` to the elements that render editable fields:

```astro
<!-- Inside Hero.astro -->
{title && <h1 set:html={title} data-editable="text" data-prop="title" />}
{subtitle && <p set:html={subtitle} data-editable="text" data-prop="subtitle" />}
{image && (
  <div data-editable="image" data-prop="image">
    <Image {...image} />
  </div>
)}
```

Paths are relative to the component's data scope (the array item), so `data-prop="title"` resolves to `content_blocks[n].title`.

**Registration:** Every `_type` value must have a matching `registerAstroComponent` call. The key string must match the `_type` value exactly (e.g., `_type: call_to_action` → `registerAstroComponent('call_to_action', CallToAction)`, not `'call-to-action'`).

**Shared sub-components (e.g. Headline):** When a shared component like `Headline.astro` renders title/subtitle for many widgets, adding `data-editable` attributes to it is acceptable — inside a page builder block, the editables are scoped to the parent component, so `data-prop="title"` resolves correctly to the block's title.

### Sub-arrays within widget components

Widget components often contain their own arrays — an `items` list in a Features or Content widget, an `actions` list of buttons in a Hero, a `steps` timeline, etc. These sub-arrays need `data-editable="array"` / `data-editable="array-item"` attributes just like the top-level page builder array. Without them, the user can only edit sub-array items via the sidebar modal — there are no inline CRUD controls (add, remove, reorder, drag-and-drop).

Inside a registered component, the component renderer handles visual updates for the entire subtree. The array editables layer on CRUD controls without interfering with re-rendering.

**On the array container**, add `data-editable="array"` and `data-prop` pointing to the array field name. **On each item**, add `data-editable="array-item"`. **Inside each item**, add primitive editables (`data-editable="text"`, `data-editable="image"`) on the editable fields.

```astro
<!-- Shared UI component: ItemGrid.astro -->
<div
  class="grid gap-8"
  data-editable="array"
  data-prop="items"
>
  {items.map(({ title, description, icon }) => (
    <div data-editable="array-item">
      <h3 data-editable="text" data-prop="title">{title}</h3>
      <p set:html={description} data-editable="text" data-prop="description" />
    </div>
  ))}
</div>
```

Since the sub-array lives inside a registered component (e.g. Features3 rendered as a page builder block), `data-prop="items"` resolves relative to the block's data scope — e.g. `content_blocks[n].items`. The array item paths then resolve to `content_blocks[n].items[m].title`, etc.

**Shared UI components:** When a shared component like `ItemGrid.astro` always receives the array as the same prop name (`items`), hardcode `data-prop="items"` directly. If different callers use different field names, accept the prop name as a component parameter instead.

**Don't forget sub-arrays.** This is a common omission — agents add the page builder array and primitives (text/image) inside widgets but skip internal arrays. Every array rendered by a widget component should get array editables unless the array structure is too complex for inline editing (e.g. deeply nested objects better suited to the sidebar).

**Check all variants of shared UI components.** Templates often have numbered variants of the same component (e.g. `ItemGrid.astro` and `ItemGrid2.astro`, `Features.astro` and `Features2.astro`). Adding editables to one variant doesn't cover the others — each must be checked independently. After wiring up a shared component, grep for similar filenames (`ItemGrid*.astro`) to find variants that need the same treatment.

**Watch for inline array rendering.** Adding editability to shared UI components (e.g. `ItemGrid`, `Timeline`) cascades to all widgets that delegate to them, but some widgets render arrays directly in their own template without using a shared component. These are easy to miss. After wiring up shared components, grep for `.map(` across widget files to catch any inline array rendering that still needs editability attributes added directly to the widget template.

## Data path patterns

### Empty data-prop (pass-through scope)

An empty `data-prop=""` passes the current data scope through without navigating deeper. This is useful when the parent's data IS the value the child needs — for example, an array editable inside an array-bound component:

```astro
<!-- Component data-prop points to an array -->
<editable-component data-component="pricing" data-prop="plans">
  <PricingSection {...plans} />
</editable-component>

<!-- Inside PricingSection.astro: data-prop="" passes the array through -->
<div data-editable="array" data-prop="">
  {plans.map((plan) => (
    <div data-editable="array-item">...</div>
  ))}
</div>
```

Without `data-prop=""`, using `data-prop="plans"` here would resolve to `plans.plans` (looking up `plans` on the array), which doesn't exist.

### Relative paths (same file)

When the editable region is on the same page as the file being edited, use simple relative paths:

```
data-prop="title"           -> frontmatter.title
data-prop="banner.title"    -> frontmatter.banner.title
data-prop="@content"        -> file content body (markdown)
```

### Data file paths (shared data editing)

When a section's data comes from a data file configured in `data_config` (e.g. a shared CTA or testimonial section), use `@data[key].path` syntax:

```
data-prop="@data[call-to-action].title"
data-prop="@data[call-to-action].description"
data-prop-src="@data[call-to-action].image"
data-prop="@data[testimonial].title"
```

The key matches the `data_config` entry name in `cloudcannon.config.yml`. This is the recommended approach for reusable data that appears on multiple pages or is shared across components.

### Absolute file paths (cross-file editing)

Use `@file[path]` for editing data in a specific file. File paths are relative to the repository root:

```
data-prop="@file[src/content/sections/cta.md].title"
```

**Limitation:** `@file` targets a specific file. If that file is in a collection with a `url` pattern, CloudCannon resolves the URL from the pattern and may navigate away from the current page when the user clicks the editable region. For shared/reusable data that appears on pages other than the file's own URL, prefer `data_config` + `@data` instead.

### Content body editing

Use `@content` to make the markdown body of a content file editable as rich text:

```astro
<div class="content" data-editable="text" data-type="block" data-prop="@content">
  <Content />
</div>
```

This works on any page backed by a content collection file -- about pages, blog posts, `[regular].astro` catch-all pages, etc.

### Non-source editables for hardcoded pages

When a page template (e.g. `contact.astro`) has its own rendering logic but reads data from a `.md` file in the pages collection, the editable regions still use relative paths since the collection file provides the data context. The `_enabled_editors` and `_schema` settings in CloudCannon ensure editors see the right fields.

### Nested relative paths (inside arrays)

Within an `EditableArrayItem`, paths are relative to the current array element:

```
data-prop="title"    -> features[N].title
data-prop="image"    -> features[N].image
data-prop="content"  -> features[N].content
```

### Cross-collection items on a page

When a page template fetches and renders items from a different collection (e.g. team members on an about page, testimonials on a landing page), add `@file` editables so those items are editable inline:

```astro
{teamMembers.map((member) => (
  <div>
    <div data-editable="image" data-prop={`@file[src/content/team/${member.id}].avatar`}>
      <img src={member.data.avatar.src} alt={member.data.avatar.alt} />
    </div>
    <h3 data-editable="text" data-prop={`@file[src/content/team/${member.id}].name`}>
      {member.data.name}
    </h3>
  </div>
))}
```

Note: `entry.id` in Astro content collections already includes the file extension (e.g. `janette-lynch.md`), so don't append `.md` again.

This only works when the target collection has no `url` pattern in its config. If it does, CloudCannon resolves the URL and navigates away from the current page.

## When to use a component editable region

Primitive editables (text, image, array, source) handle their own DOM updates but can't trigger re-rendering of the surrounding template. This matters when a section contains data-driven behaviour beyond simple content — see [editable-regions.md > When to use component editable regions](../editable-regions.md#when-to-use-component-editable-regions) for the general principle.

**Use a component when the section has any of:**

- Conditional elements — `{feature.button.enable && (<a>...</a>)}` won't show/hide live without a re-render
- Style/class bindings — `class={index % 2 === 0 && "bg-gradient"}` won't toggle live
- Computed content — a label derived from another field won't update live

**Example: features array with conditional buttons**

A features section where each item has an optional button controlled by `button.enable`. As a plain array with primitive editables, toggling the button in the sidebar does nothing visually. Wrapping the section as a registered component means the entire features block re-renders on any change:

```astro
<editable-component data-component="features" data-prop="features">
  <Features {...features} />
</editable-component>
```

Inside `Features.astro`, the array editables and text/image editables still work for inline editing and CRUD. The component handles the re-rendering.

### Component prop contract

When `editable-component` re-renders a component, it passes the value at `data-prop` directly as the component's props. The component **must accept spread props, not a named wrapper prop**. If the component expects `const { banner } = Astro.props` but the re-renderer passes `{ title, description, image }`, `banner` will be `undefined`.

**Object-bound components** (where `data-prop` points to an object in the frontmatter):

```astro
<!-- Page template: spread the object -->
<editable-component data-component="hero" data-prop="banner">
  <Hero {...banner} />
</editable-component>

<!-- Hero.astro: destructure the object's fields directly -->
const { title, description, image, buttons } = Astro.props;
```

**Array-bound components** (where `data-prop` points to an array):

The client-side renderer passes the array directly as props. Astro's template syntax can't pass a raw array, so spread the array and use `Object.values()` — this works identically for both SSR and client re-render:

```astro
<!-- Page template: spread the array -->
<editable-component data-component="pricing" data-prop="plans">
  <PricingSection {...plans} />
</editable-component>

<!-- PricingSection.astro: recover the array from spread indices -->
const plans = Object.values(Astro.props);
```

**Array items inside a component don't take over the re-rendering boundary.** The component renderer produces the full HTML for the section, including all array items. The array editables provide CRUD controls, but visual output comes from the component renderer. This is more useful than array items re-rendering independently, since cross-item concerns (alternating layouts, index-based styles) are handled correctly.

**When in doubt, make it a component.** The cost is one `registerAstroComponent()` call and a wrapper element. The benefit is that every data-driven change live-updates.

## Source editables for hardcoded content

Not all editable content lives in frontmatter or data files. Many templates have hardcoded text in `.astro` page templates -- hero headings, taglines, descriptions, CTA copy. These should still be visually editable using `EditableSource`.

Source editables work by reading and writing the raw source file (e.g. `src/pages/index.astro`) directly. They don't need a content collection or data file -- just a `data-path` pointing to the source file and a `data-key` to identify the region within it.

### When to use source editables

- Hardcoded text in `.astro` page templates (homepage hero, taglines, section headings)
- Static content that isn't backed by a content collection or data file
- Any visible text on a page that an editor should be able to change

**Do not dismiss content as "developer-only" just because it's hardcoded.** If an editor can see it on the page, they should be able to edit it. Source editables make this possible without refactoring to a data file or content collection.

### Including `.astro` pages in collections

Pages with source editables should be included in the pages collection so editors can find and open them. Add specific `.astro` filenames to the collection's glob alongside `"*.md"` -- only include pages that actually have editable regions. Pages with no visually editable content (search, 404, tag listings) should be excluded. Set `_enabled_editors: [visual]` for the collection -- `.astro` files can only use the visual editor (their JS frontmatter isn't parseable as data), and `.md` pages work well in the visual editor too when they have editable regions. See [configuration.md § Pages collection](configuration.md#pages-collection-including-astro-pages) for the full config pattern.

### Syntax

```astro
<h1
  class="text-4xl font-bold"
  data-editable="source"
  data-path="src/pages/index.astro"
  data-key="hero-title"
>
  Welcome to My Site
</h1>

<p
  data-editable="source"
  data-path="src/pages/index.astro"
  data-key="hero-description"
  data-type="block"
>
  A description paragraph that editors can change.
</p>
```

### How it works

1. CloudCannon reads the full source file via `CloudCannon.file(path).get()`
2. Finds the editable region by locating the `data-key` attribute in the raw HTML
3. When the editor changes the text, splices the new content back into the source file at the same location
4. Writes the entire file back via `file.set(content)`

### Limitations

- **Astro component syntax inside the editable region will not survive editing.** If a paragraph contains `<LinkButton>` or other Astro components, the rich text editor can't handle them. Keep source editables on elements with plain HTML content only.
- **`data-key` must be unique within the file.** Use descriptive keys like `hero-title`, `hero-description`, `cta-heading`.
- **`data-path` is relative to the project root**, not the current file. Use the full path from the repo root (e.g. `src/pages/index.astro`).

### Identifying source editable candidates during audit

During Phase 1, flag hardcoded text in page templates as source editable candidates. Common locations:

- Homepage hero sections (title, subtitle, description)
- CTA sections with static copy
- Section headings on listing pages
- Footer taglines or copyright text
- Any page that has visible text not sourced from frontmatter or a data file

## What to make editable vs. what to leave for the sidebar

Not everything benefits from visual editing. Guidelines:

**Good for visual editing (inline text/image/source):**
- Page titles, headings, descriptions
- Hero/banner content (from frontmatter via `data-prop`, or hardcoded via `data-editable="source"`)
- Images (hero, feature, author avatar)
- Content body (`@content`)
- CTA copy
- Hardcoded text in page templates

**Better for sidebar/data editor:**
- Navigation menus (complex nested structures)
- Social links
- Theme settings (colors, fonts)
- SEO metadata (meta_title, meta_description)
- Boolean toggles (draft, enable)
- URL/link fields
- Taxonomy arrays (categories, tags)

**Provide visual editing fallbacks with `ENV_CLIENT`:**
- Components with complex DOM management (Swiper carousels, etc.) -- their JavaScript conflicts with editable region DOM manipulation, and often are hard to edit if functioning like they do on prod.
- Components using server-only APIs (`import.meta.glob`, `getImage` from `astro:assets`, data fetching) -- guard with `import.meta.env.ENV_CLIENT` to provide a simplified client-side path that skips optimization and renders plain HTML. For example, an `Image` component that uses `findImage()` and `getImagesOptimized()` should render a plain `<img>` with the raw `src` prop when `ENV_CLIENT` is true.

**Skip visual editing entirely:**
- MDX content with shortcodes -- shortcodes won't render in the visual editor
- Header/footer (too many moving parts, better in data editor)

## Structured props over rich text

When a component renders HTML with specific classes or structure — e.g. a centered `<span>`, a link with an `underline` class — it's tempting to store the entire block as a single rich text `content` field. This causes problems:

- CloudCannon's rich text editor can't safely interact with non-standard HTML (custom classes, nested elements with styling) — these render with a red outline and are not editable inline.
- Defining the HTML as a snippet is overkill when the structure is fixed and only a few values change.

**Instead, decompose the structured HTML into explicit props and let the component own the markup.**

Before (single rich text field):
```json
{
  "content": "<span class='text-center block'>♥️ Loving Astroplate? <a class='underline' href='...'>Please ⭐️ on Github</a></span>"
}
```

After (explicit props):
```json
{
  "text": "♥️ Loving Astroplate?",
  "link_text": "Please ⭐️ on Github",
  "link_url": "https://github.com/zeon-studio/astroplate"
}
```

The component templates the values into the correct HTML structure with the right classes:
```tsx
<p className="text-center">
  {text} <a className="underline" href={link_url} target="_blank" rel="noopener">{link_text}</a>
</p>
```

Editors get clean labeled inputs (text, text, url) in the sidebar instead of a broken rich text region. This pattern applies whenever a "rich text" field is really just a few values templated into fixed HTML — pull them out as props.

## Component re-rendering

For full live preview (not just text/image), components need to be registered so `EditableComponent` can re-render them in the browser when data changes.

### Astro components

For page builder sites, add the component to `src/cloudcannon/componentMap.ts` -- it will be registered automatically by `registerComponents.ts` (see [setup step 3](#3-create-the-registercomponents-script)). For standalone components not in the page builder, add individual registrations directly in `registerComponents.ts`:

```typescript
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import CallToAction from "@/layouts/partials/CallToAction.astro";

registerAstroComponent("call-to-action", CallToAction);
```

### React / non-Astro components (Astro display fallback)

`registerReactComponent` exists but is unreliable -- live updates silently fail in the visual editor. Instead, create a display-only `.astro` component that reproduces the same markup and register it with `registerAstroComponent`. The live site still uses the real React component via `client:load`; only the visual editor renderer is swapped.

This "Astro display fallback" pattern is useful beyond just React bugs. Any component that is difficult to re-render client-side (complex hooks, third-party DOM libraries, Web Components with shadow DOM, animation frameworks) can use a simplified Astro stand-in for the visual editor. The stand-in only needs to produce the right visual output for the editor preview -- it doesn't need interactivity.

```astro
<!-- src/layouts/helpers/AnnouncementDisplay.astro -->
---
const { enable, text, link_text, link_url } = Astro.props;
---
{enable && text && (
  <div class="announcement-banner">
    <p>{text} {link_text && link_url && <a href={link_url}>{link_text}</a>}</p>
  </div>
)}
```

```typescript
// registerComponents.ts
import AnnouncementDisplay from "@/layouts/helpers/AnnouncementDisplay.astro";
registerAstroComponent("announcement", AnnouncementDisplay);
```

```astro
<!-- Base.astro — live site uses the real React component -->
<editable-component data-component="announcement" data-prop="@data[announcement]">
  <Announcement client:load {...announcementData} />
</editable-component>
```

**When to reach for this pattern:**
- React components (hooks, state, effects won't fire in the editor renderer)
- Components using third-party DOM libraries (Swiper, GSAP, etc.)
- Web Components with shadow DOM that don't serialize cleanly
- Any component where the live-site version is too complex for `registerAstroComponent` to handle directly

**Keep the display component in sync.** The Astro fallback duplicates markup, so changes to the real component's visual structure need to be mirrored. Keep both in the same directory and name them clearly (e.g. `Announcement.tsx` + `AnnouncementDisplay.astro`).

### Wrapping with web components

Component editable regions need a wrapper element with `data-component` and `data-prop` attributes. When there is no suitable existing container element, use the `<editable-component>` web component provided by the library rather than adding an unnecessary `<div>`:

```astro
<editable-component data-component="announcement" data-prop="@data[announcement]">
  <Announcement client:load {...announcementData} />
</editable-component>
```

The `<editable-component>` custom element self-hydrates via `connectedCallback`/`disconnectedCallback` -- no `data-editable="component"` attribute is needed since the tag itself identifies the region type. The same principle applies to other region types: prefer `<editable-text>`, `<editable-image>`, etc. over wrapper `<div>`s with `data-editable` when no suitable container exists.

If a suitable container already exists in the markup (e.g. a `<section>` wrapping the component output), add `data-editable="component"` directly to that element instead.

**Caveats:**
- Astro components that use `astro:content` or `astro:assets` imports need the integration's Vite plugin (which shims these modules for client-side rendering)
- React components inside registered Astro components (e.g. `react-icons`) need the React framework renderer. Add `import "@cloudcannon/editable-regions/astro-react-renderer"` to `registerComponents.ts` -- this is a side-effect import that registers a generic React renderer for Astro's client-side SSR. Without it, any React component encountered during re-rendering will fail with "NoMatchingRenderer".
- Components must be self-contained -- external data fetching won't work client-side

Text/image editable regions provide the most value with the least complexity. Component registration is the next step for templates where full live preview is a priority.

## How the Astro integration works

Understanding the integration internals helps when debugging unexpected behavior.

**Build-time** (`@cloudcannon/editable-regions/astro-integration`):

An Astro integration that registers a Vite plugin for the client build. The plugin:

1. Sets `ENV_CLIENT = true` for tree-shaking server-only code
2. Patches Astro's `astro:build` Vite plugin to force SSR transforms on client code -- this is what makes `renderToString()` work in the browser
3. Adds `vite-plugin-editable-regions` which intercepts `astro:*` virtual module imports and resolves them to local shims:
   - `astro:content` -> client-side shim
   - `astro:assets` -> client-side shim
   - `astro:env/server` -> client-side shim

Without this, Astro components that import from `astro:content` or `astro:assets` would fail to bundle for the client.

**Runtime** (`@cloudcannon/editable-regions/astro`):

`registerAstroComponent(key, AstroComponent)` creates a wrapper function that:

1. Constructs a fake Astro `SSRResult` (with renderers, metadata, crypto key for server islands, slot handling, etc.)
2. Calls Astro's `renderToString()` in the browser with the new props
3. Parses the resulting HTML into a document fragment
4. Triggers any queued client-side renders (e.g. React islands use `data-editable-region-csr-id`)
5. Strips Astro scaffolding (`<astro-island>`, `<link>`, server island metadata)
6. Returns the clean HTML element

The wrapper is stored in `window.cc_components[key]` where `EditableComponent` can find it.

## Verification checklist

After adding editable regions, work through these checks before moving to the build phase:

- [ ] `@cloudcannon/editable-regions` is in `package.json` dependencies
- [ ] The Astro integration is registered in `astro.config.mjs`
- [ ] `src/cloudcannon/registerComponents.ts` exists and is imported from the base layout
- [ ] Registered components accept spread props matching the shape of their `data-prop` value -- not a named wrapper prop (see [Component prop contract](#component-prop-contract))
- [ ] Pages that render items from other collections have `@file` editables on those items (when the target collection has no `url` pattern). Remember `entry.id` includes the file extension — don't double it.
- [ ] Slot content that should be editable uses concrete elements (e.g. `<span>`) instead of `<Fragment>`
- [ ] Key page templates contain `data-editable` attributes -- spot-check the homepage, a content page, and any shared partials (CTA, testimonials, etc.)
- [ ] **Source editables**: Hardcoded text in page templates (hero headings, descriptions, CTA copy) has `data-editable="source"` with `data-path` and `data-key` attributes -- don't skip content just because it's not in a content collection
- [ ] **Page builder array wrapper** has `data-component-key="_type"` and `data-id-key="_type"` alongside `data-editable="array"` and `data-prop="content_blocks"`
- [ ] **Page builder blocks** use a plain HTML element (`<section>`) with `data-editable="array-item"`, `data-component={_type}`, and `data-id={_type}` — NOT the `<editable-component>` custom element
- [ ] **Page builder blocks**: Widget components rendered inside blocks have nested `data-editable="text"` / `data-editable="image"` attributes on their key text and image elements
- [ ] **Sub-arrays within widgets**: Widget components that render internal arrays (`items`, `actions`, `steps`, etc.) have `data-editable="array"` + `data-prop` on the container and `data-editable="array-item"` on each item — check both shared UI components and widgets that render arrays inline
- [ ] **All UI component variants**: Numbered variants of shared components (e.g. `ItemGrid.astro` / `ItemGrid2.astro`) all have editable attributes — don't assume wiring one covers the rest
- [ ] **Sub-array item editables**: Array items within widget sub-arrays have nested `data-editable="text"` / `data-editable="image"` on their editable fields (title, description, image, etc.)
- [ ] **Shared component map**: Page builder sites have a `src/cloudcannon/componentMap.ts` that both `BlockRenderer.astro` and `registerComponents.ts` import from — no duplicated mapping
- [ ] **Registration keys match `_type`**: Every key in `componentMap` (or direct `registerAstroComponent` call) uses the exact `_type` string from the content files (e.g., `call_to_action` not `call-to-action`)
- [ ] **All block types registered**: Every `_type` value that appears in content files has a corresponding entry in `componentMap` — missing entries mean no edit button and no live re-rendering for that block type
- [ ] **Conditional guards**: Every `data-editable` element whose field can be undefined/null is wrapped in a conditional — object fields check an inner key (`{image?.src && ...}`, `{callToAction?.text && ...}`), scalar fields check the value directly (`{title && ...}`)
- [ ] Build output contains `data-component-key`, `data-id-key`, `data-component=`, `data-id=`, and `data-editable="array-item"` attributes (grep `dist/` to verify)

