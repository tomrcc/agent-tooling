# CloudCannon API — Integrations, Configuration & Known Quirks

Framework integrations overview, `cloudcannon.config.yml` settings relevant to the API, and known quirks/constraints.

For the JavaScript API, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md).
For detailed integration internals, see [editable-regions-framework-integrations.md](editable-regions-framework-integrations.md).

---

## Framework Integrations

Framework integrations are **only needed for `EditableComponent` regions**. They provide a way to re-render components in the browser when data changes. Text, image, and source regions work without any integration.

Both integrations produce the same output: a function in `window.cc_components[key]` that takes props and returns an `HTMLElement`.

### Astro

Two parts: build-time Vite plugin and runtime client-side SSR.

**Build-time** (`@cloudcannon/editable-regions/astro-integration`):

- Registers a Vite plugin that enables client-side SSR for Astro components
- Shims `astro:content`, `astro:assets`, and `astro:env/server` for browser use
- Patches Astro's build plugin to support `renderToString()` in the browser

**Runtime** (`@cloudcannon/editable-regions/astro`):

```typescript
import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import Hero from "./components/Hero.astro";

registerAstroComponent("hero", Hero);
```

`registerAstroComponent` creates a wrapper that calls Astro's `renderToString()` in the browser with a fake `SSRResult`, strips Astro scaffolding, and returns clean HTML.

**React islands** are supported via `@cloudcannon/editable-regions/astro-react-renderer`, which handles `<astro-island>` re-rendering on the client.

### Eleventy / Liquid

Bundles a standalone LiquidJS engine with all templates pre-loaded.

**Build-time** (`@cloudcannon/editable-regions/eleventy`):

```javascript
import editableRegions from "@cloudcannon/editable-regions/eleventy";

export default function(eleventyConfig) {
  eleventyConfig.addPlugin(editableRegions, {
    liquid: {
      components: [
        { name: "hero", file: "_includes/hero.liquid" },
      ],
      filters: [
        { name: "formatDate", file: "_filters/format-date.js" },
      ],
    },
  });
}
```

The plugin discovers Liquid templates, bundles them with esbuild into `live-editing.js`, and stores them as text strings in `window.cc_files`.

**Runtime**: LiquidJS `parseAndRender()` with an in-memory filesystem reads from `window.cc_files`. Each registered component calls `liquidEngine.parseAndRender(templateString, props)` and returns an element.

### Integration Comparison

| Aspect | Astro | Eleventy/Liquid |
|---|---|---|
| Template engine | Astro (JSX-like) | LiquidJS |
| Build tool | Vite plugin | esbuild bundle |
| How templates reach the browser | Vite bundles as JS modules | esbuild imports as text strings |
| How templates render | `renderToString()` with fake SSRResult | `parseAndRender()` with in-memory filesystem |
| Registration API | `registerAstroComponent(key, Component)` | `registerLiquidComponent(key, template)` (auto-generated) |
| Renderer location | `window.cc_components[key]` | `window.cc_components[key]` |

### How EditableComponent Uses Renderers

1. Looks up `window.cc_components[dataComponent]` by the `data-component` attribute
2. Calls the renderer with current props to get new HTML
3. **Diffs the result** into the live DOM (preserves focused editors, ProseMirror state)
4. If the renderer isn't registered yet, retries with polling (up to 4 seconds) and listens for a registration event

---

## Configuration (`cloudcannon.config.yml`)

### `data_config`

Exposes data files to the JavaScript API as datasets:

```yaml
data_config:
  locales_fr:
    path: rosey/locales/fr.json
  footer:
    path: data/footer.json
  navigation:
    path: data/navigation.json
```

The key (e.g. `locales_fr`) maps directly to `api.dataset("locales_fr")` in JavaScript.

### `collections_config`

Defines collections that can be accessed via `api.collection(key)`:

```yaml
collections_config:
  pages:
    path: src/content/pages
    _enabled_editors:
      - visual
  posts:
    path: src/content/blog
    _enabled_editors:
      - visual
      - content
```

### Input Configuration

Input types and options are configured in `_inputs` at various levels (global, collection, structure):

```yaml
_inputs:
  title:
    type: text
    options:
      empty_type: string
      required: true
  description:
    type: markdown
    options:
      bold: true
      italic: true
      link: true
  hero_image:
    type: image
    options:
      resize_style: crop
```

These configurations are accessible via `file.getInputConfig({ slug: "title" })` and can be passed to `createTextEditableRegion` as `inputConfig` or to `createCustomDataPanel` as `config._inputs`.

### Structures

Structures define the shape of array items and components:

```yaml
_structures:
  features:
    style: select
    values:
      - value:
          item:
          active_feature:
```

---

## Known Quirks and Constraints

### `createTextEditableRegion`

| Quirk | Impact | Mitigation |
|---|---|---|
| **No `destroy()` method** | Old ProseMirror instances stay alive after DOM removal and fire `onChange` on any DOM change | Use a `switchGeneration` counter; stale closures check generation and no-op |
| **`onChange` fires on init** | ProseMirror normalizes content on mount, triggering `onChange` before the user has typed | Guard with a `setupComplete` flag that's set after all editors are created |
| **Editor starts empty** | Does not read existing `innerHTML` | Call `editor.setContent(value)` immediately after creation |
| **`setContent` resets cursor** | Calling `setContent` while focused steals focus and resets cursor position | Track focus state; skip `setContent` on focused editors |

### Data API

| Quirk | Detail |
|---|---|
| **Slug separator is `.`** | Not `/`. For nested data `{ hero: { title: "X" } }`, use slug `"hero.title"`. Colons and other characters in key names are literal. |
| **`dataset.items()` return type varies** | Can return a single `File` or `File[]`. Always handle both: `Array.isArray(result) ? result[0] : result` |
| **`change` events are coarse** | The event doesn't indicate which key changed. Re-read all keys you care about on every `change` event. |
| **`change` fires for own writes** | Setting a value via `file.data.set()` can trigger a `change` event on the same dataset. Guard against echo loops. |

### DOM and Content

| Quirk | Detail |
|---|---|
| **HTML in values** | Many CMS values contain HTML (from Markdown rendering, rich text, etc.). Always use `innerHTML`, never `textContent`, when setting element content. |
| **`<editable-text>` replacement tag** | When stripping CC custom elements from a clone, `<editable-text>` should be replaced with `<span>` (inline) but upgraded to `<div>` if `data-type="block"\|"text"` or the element contains block-level children. Prevents invalid HTML nesting. |
| **MutationObserver timing** | Processing cloned DOM trees while detached avoids MutationObserver callbacks, `connectedCallback` firings, and race conditions. Attach to the document only after cleanup is complete. |

### Events

| Event | Fired On | When |
|---|---|---|
| `cloudcannon:load` | `document` | CloudCannon API is ready; `window.CloudCannonAPI` is available |
| `change` | File, Collection, Dataset | Data has changed (including external changes and own writes) |
| `delete` | File, Collection, Dataset | Data has been deleted |
| `cloudcannon-api` | DOM elements (bubbles) | Internal action event for the editable regions event bus |
| `editable:focus` | DOM elements (bubbles) | An editable region gained focus |
| `editable:blur` | DOM elements (bubbles) | An editable region lost focus |

### Global State

| Global | Type | Set By | Purpose |
|---|---|---|---|
| `window.inEditorMode` | `boolean` | CloudCannon Visual Editor | `true` when the page is inside the editor iframe |
| `window.CloudCannonAPI` | `object` | CloudCannon Visual Editor | API router; call `.useVersion("v1", true)` to get the API |
| `window.cc_components` | `Record<string, Function>` | Framework integrations | Component renderer registry |
| `window.cc_snippets` | `Record<string, Function>` | Framework integrations | Snippet renderer registry |
| `window.cc_files` | `Record<string, string>` | Eleventy integration | In-memory filesystem for Liquid templates |
| `window.editableRegionMap` | `Record<string, class>` | Editable regions core | Type map for custom editable region classes |
