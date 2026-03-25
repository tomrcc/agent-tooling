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

This keeps component registrations in one place rather than scattering them across individual pages.

### Package exports reference

| Import path | Purpose |
|---|---|
| `@cloudcannon/editable-regions/astro-integration` | Astro integration for `astro.config.mjs` (build-time) |
| `@cloudcannon/editable-regions/astro` | `registerAstroComponent()` for client-side component re-rendering |
| `@cloudcannon/editable-regions/astro-react-renderer` | Side-effect import: registers React as a framework renderer for Astro's client-side SSR (needed when React components like `react-icons` are used inside registered Astro components) |
| `@cloudcannon/editable-regions/react` | `registerReactComponent()` for standalone React component re-rendering — **unreliable, use Astro display fallback instead** |

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

**Provide visual editing fallbacks with `ENV_CLIENT`:**
- Components with complex DOM management (Swiper carousels, etc.) -- their JavaScript conflicts with editable region DOM manipulation, and often are hard to edit if functioning like they do on prod.

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

Add registrations to `src/cloudcannon/registerComponents.ts`:

```typescript
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import CallToAction from "@/layouts/partials/CallToAction.astro";

registerAstroComponent("call-to-action", CallToAction);
```

### React / non-Astro components (Astro display fallback)

`registerReactComponent` exists but is unreliable -- live updates silently fail in the visual editor (see bug report in `templates/astroplate/migrated/migration/registerReactComponent-bug.md`). Instead, create a display-only `.astro` component that reproduces the same markup and register it with `registerAstroComponent`. The live site still uses the real React component via `client:load`; only the visual editor renderer is swapped.

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

---

**Example:** See `templates/astroplate/migrated/migration/visual-editing.md` for a completed visual editing implementation summary.
