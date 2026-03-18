# Editable Regions — Overview

`@cloudcannon/editable-regions` is a client-side system that makes elements on a page interactive within CloudCannon's Visual Editor. It:

1. **Scans the DOM** for specially-annotated elements (`data-editable` attributes or `<editable-*>` web components)
2. **Builds a tree of `Editable` nodes** that mirror the data hierarchy
3. **Connects to the CloudCannon JavaScript API** to receive data changes and dispatch user mutations back

The framework integrations (Astro, Eleventy) are **only needed for component re-rendering** — they provide a way to re-run a template/component in the browser when its data changes. Simpler editable region types like text and image work purely with the shared core, no integration required.

For the full lifecycle trace and core internals, see [editable-regions-lifecycle.md](editable-regions-lifecycle.md).
For framework-specific integration details, see [editable-regions-integrations.md](editable-regions-integrations.md).
For deeper dives into library internals, the JavaScript API, or debugging, see the [deep-dive docs index](../../docs/README.md).

---

## Architecture Layers

| Layer | Key Files | Role |
|---|---|---|
| **Hydration Engine** | `helpers/hydrate-editable-regions.ts`, `components/index.ts` | Scans the DOM, instantiates `Editable` nodes, watches for DOM mutations |
| **CloudCannon API Bridge** | `helpers/cloudcannon.mjs` | Connects to the CloudCannon API, manages component/snippet registries |
| **Editable Nodes** | `nodes/editable-*.ts` | Behaviour classes — one per region type (text, image, component, array, source, snippet) |
| **Web Components** | `components/editable-*-component.ts` | Thin Custom Element wrappers that self-hydrate via `connectedCallback` |
| **UI Controls** | `components/ui/` | Overlay controls for editing, array reordering, error display |
| **Astro Integration** | `integrations/astro/` | Vite plugin + client-side SSR wrapper for Astro component re-rendering |
| **11ty Integration** | `integrations/eleventy.mjs`, `integrations/liquid/` | esbuild bundler + LiquidJS engine for Liquid template re-rendering |

---

## Editable Region Types

### EditableText

The inline rich text editor. Creates a ProseMirror instance via `CloudCannon.createTextEditableRegion()`.

- Supports `data-type` of `"span"` (inline), `"text"` (plain text), or `"block"` (block-level rich text)
- Tracks focus state to avoid overwriting what the user is typing
- Supports deferred mounting (`data-defer-mount`) for performance — the editor only initialises when the user clicks
- `onChange` dispatches a `set` action back up the tree

### EditableImage

Handles image editing with a CloudCannon data panel.

- Expects a child `<img>` element (or can be applied directly to an `<img>`)
- Manages `src`, `alt`, and `title` — each can be bound independently via `data-prop-src`, `data-prop-alt`, `data-prop-title`, or together via `data-prop`
- On click, opens `CloudCannon.createCustomDataPanel()` with image upload, alt text, and title fields
- Updates `img.src` via `CloudCannon.getPreviewUrl()` for DAM/asset preview URLs
- Also updates `<source>` elements within parent `<picture>` elements

### EditableComponent

Re-renders a component when its data changes. This is where the framework integrations plug in.

- Looks up a renderer function from `window.cc_components` by the `data-component` key
- Calls the renderer with the current props to get new HTML
- **Diffs the result into the live DOM** via `updateTree()` rather than wholesale replacing — this preserves focused text editors, ProseMirror state, and other live editable instances
- Adds an edit button overlay (via `<editable-component-controls>`) that opens the sidebar editor
- If the component renderer isn't registered yet, retries with polling (up to 4 seconds) and listens for a registration event

### EditableArray & EditableArrayItem

Manages ordered lists of items with full CRUD and drag-and-drop.

**EditableArray**:
- Validates its value is an array (or a CloudCannon API collection/dataset/file)
- Creates/removes/reorders child `EditableArrayItem` elements to match the data
- Supports keyed arrays (`data-id-key` or `data-component-key`) for stable identity across reorders
- Uses `<template>` children as blueprints for new items
- Detects flex direction (`data-direction` or computed styles) to orient drag-and-drop indicators
- Shows an "Add Item" button when the array is empty

**EditableArrayItem** (extends `EditableComponent`):
- Adds array item controls (move up/down, add, duplicate, delete)
- Full drag-and-drop: `dragstart`, `dragover`, `drop` with position detection (before/after based on mouse position and array direction)
- Cross-array drag-and-drop support via structure matching
- Dispatches `move-array-item`, `remove-array-item`, `add-array-item` actions

### EditableSource

A specialisation of `EditableText` that edits raw HTML source files rather than front matter values.

- Uses `data-path` (the file path) and `data-key` (a unique identifier within the file) instead of `data-prop`
- Reads the full file source via `CloudCannon.file(path).get()`
- Finds the editable region within the source by locating the `data-key` attribute in the raw HTML
- On change, splices the edited content back into the full file source, preserving the original indentation
- Writes back via `file.set(content)` (sets the entire file, not a front matter key)

### EditableSnippet

Extends `EditableComponent` for editing snippets (shortcodes) within rich text content.

- Uses `data-cms-snippet-id` to identify which snippet in the content it represents
- Manages its own data locally (mutations like `set`, `move-array-item` are applied directly to the snippet's value object) rather than going through the file API
- Dispatches a `snippet-change` CustomEvent after mutations, which the rich text editor listens for to update the content

---

## Path Resolution & Data Sources

The `data-prop` attribute (and variants like `data-prop-src`, `data-prop-alt`) describes where the editable's data lives. Paths can be:

| Path Form | Example | Resolves To |
|---|---|---|
| Relative | `data-prop="title"` | Key on the current file's data, or on the parent editable's value |
| Absolute file | `data-prop="@file[/content/page.md].hero.title"` | Specific file, specific path |
| Absolute collection | `data-prop="@collections[posts].0.title"` | Collection → item → path |
| Absolute dataset | `data-prop="@data[authors].name"` | Dataset → path |
| Content | `data-prop="@content"` | The file's content body (markdown/HTML), not front matter |
| Special | `data-prop="@length"`, `data-prop="@index"` | Computed values from parent arrays |

When a path is relative, the editable registers as a listener on its parent editable. When absolute, it binds directly to the CloudCannon API object.

---

## Supported API Actions

| Action | CloudCannon API Call | Typical Trigger |
|---|---|---|
| `set` | `file.data.set()` or `file.content.set()` | Typing in a text region, changing an image |
| `edit` | `file.data.edit()` | Clicking a component's edit button |
| `add-array-item` | `file.data.addArrayItem()` | Array "add" button, duplicate button |
| `remove-array-item` | `file.data.removeArrayItem()` | Array item delete button |
| `move-array-item` | `file.data.moveArrayItem()` | Drag-and-drop, reorder buttons |
| `get-input-config` | `file.getInputConfig()` | Mounting editors to get field configuration |

---

## File Map

```
integrations/
  astro/
    astro-integration.mjs     — Astro integration & Vite plugin (build-time)
    index.mjs                 — registerAstroComponent, client-side SSR wrapper
    react-renderer.mjs        — React component bridge for Astro islands
    modules/
      content.js              — Client-side shim for astro:content
      assets.js               — Client-side shim for astro:assets
      secrets.js              — Client-side shim for astro:env/server
  eleventy.mjs                — Eleventy plugin: discovers files, generates bundle, runs esbuild
  liquid/
    index.mjs                 — LiquidJS engine setup, component/filter/tag registration
    fs.mjs                    — In-memory filesystem (reads from window.cc_files)
    shortcodes.mjs            — Eleventy shortcode → LiquidJS tag adapters
    11ty-filters.mjs          — Browser-compatible Eleventy built-in filters (slugify, url, log)
    logger.mjs                — Verbose logging utilities
  react.mjs                   — React component registration

helpers/
  cloudcannon.mjs             — CloudCannon API connection, component/snippet registries
  cloudcannon.d.mts           — Type declarations for the above
  hydrate-editable-regions.ts — DOM scanner that instantiates Editable nodes
  checks.ts                   — Type guards and element checks

nodes/
  editable.ts                 — Base class: listener system, path parsing, API dispatch
  editable-text.ts            — Inline rich text editing (ProseMirror via CC API)
  editable-image.ts           — Image editing with custom data panel
  editable-component.ts       — Component re-rendering with DOM diffing
  editable-array.ts           — Array management (create/remove/reorder items)
  editable-array-item.ts      — Individual array items with drag-and-drop
  editable-source.ts          — Raw HTML source editing (extends EditableText)
  editable-snippet.ts         — Snippet/shortcode editing within rich text

components/
  editable-*-component.ts     — Web Component wrappers (Custom Elements)
  index.ts                    — Entry point: runs hydration, starts MutationObserver
  ui/
    editable-component-controls.ts  — Edit button overlay for components
    editable-array-item-controls.ts — Reorder/delete/add controls for array items
    editable-region-button.ts       — Shared button component
    editable-region-error-card.ts   — Error display for misconfigured regions

styles/
  *.css                       — Styling for each editable type and UI control
```
