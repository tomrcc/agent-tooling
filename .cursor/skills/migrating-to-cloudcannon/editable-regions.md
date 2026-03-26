# Editable Regions — Overview

`@cloudcannon/editable-regions` is a client-side system that makes elements on a page interactive within CloudCannon's Visual Editor. It:

1. **Scans the DOM** for specially-annotated elements (`data-editable` attributes or `<editable-*>` web components)
2. **Builds a tree of `Editable` nodes** that mirror the data hierarchy
3. **Connects to the CloudCannon JavaScript API** to receive data changes and dispatch user mutations back

The framework integrations (Astro, Eleventy) are **only needed for component re-rendering** — they provide a way to re-run a template/component in the browser when its data changes. Simpler editable region types like text and image work purely with the shared core, no integration required.

For the full lifecycle trace and core internals, see [editable-regions-lifecycle.md](editable-regions-lifecycle.md).
For SSG-specific integration details (how component re-rendering works for a particular framework), see the visual-editing doc in the relevant SSG directory (e.g. [astro/visual-editing.md](astro/visual-editing.md)).
For the JavaScript API, HTML attributes, and known quirks, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md) (only consult when debugging or needing precise API semantics).

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

**Complex arrays (page building):** When array items have different structures (e.g., different block types in a page builder), the array and its items need additional attributes beyond `data-editable` and `data-prop`. See the [CloudCannon complex array docs](https://cloudcannon.com/documentation/developer-guides/set-up-visual-editing/visually-edit-complex-arrays-and-page-building/) for the canonical reference.

Required attributes on the **array wrapper**:

| Attribute | Purpose | Example |
|---|---|---|
| `data-editable="array"` | Identifies the element as an array region | |
| `data-prop` | Path to the array in the file's data | `"content_blocks"` |
| `data-component-key` | Which frontmatter key identifies the registered component name | `"_type"` |
| `data-id-key` | Which frontmatter key provides a unique ID per item | `"_type"` |

Required attributes on each **array item**:

| Attribute | Purpose | Example |
|---|---|---|
| `data-editable="array-item"` | Identifies the element as an array item | |
| `data-component` | The registered component name for this item (must match a `registerAstroComponent` key) | `"hero"` |
| `data-id` | Unique identifier for this item (used for stable reordering) | `"hero"` |

Array items must use a **plain HTML element** (`<section>`, `<div>`, etc.) — not the `<editable-component>` custom element. Since `EditableArrayItem` extends `EditableComponent`, the `data-component` attribute on an array-item element enables component re-rendering without needing a separate wrapper. Using `<editable-component>` for array items causes a hydration conflict between `EditableComponent` and `EditableArrayItem`.

`<editable-component>` is reserved for **standalone component regions** that are NOT inside an array (e.g., a fixed hero section on a non-page-builder page).

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

## When to use component editable regions

Primitive editables (`EditableText`, `EditableImage`, `EditableArray`, `EditableSource`) handle their own DOM updates for the content they manage — typing text, swapping an image src, adding/removing/reordering array items. They do **not** re-render the surrounding template. This means non-content changes are invisible in the visual editor:

- **Conditional elements** — a button that appears/disappears based on a boolean (`button.enable`)
- **Style or class bindings** — alternating background colours, layout order driven by index
- **Computed/derived content** — a badge or label that changes based on a category field

When any of these exist inside a section, wrap the section in an `EditableComponent` (or `<editable-component>`) and register a renderer. The component re-renders its entire subtree whenever any of its data changes, so all conditionals, styles, and derived content update live.

**Array items inside a component don't override the re-rendering boundary.** The component handles re-rendering for the entire tree, including nested arrays. Array editables within the component still provide their CRUD controls (add, remove, reorder, drag-and-drop), but the visual output comes from the component renderer.

**When in doubt, prefer a component.** The cost is one registration call and a wrapper element. The benefit is that every data-driven change inside the section live-updates, not just text and images.

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
