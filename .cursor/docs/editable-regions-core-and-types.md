# Editable Regions — Core Internals & Region Types

Deep dive into the hydration engine, the `Editable` base class, path resolution, the event bus, and each editable region type.

For the high-level overview and lifecycle trace, see [editable-regions-overview.md](editable-regions-overview.md).

---

## Hydration Engine

Two mechanisms ensure every editable element gets an `Editable` instance:

**Data attribute scanning** (`helpers/hydrate-editable-regions.ts`): Finds `[data-editable]` elements, maps the type string to a class (`"text"` → `EditableText`, `"image"` → `EditableImage`, etc.), and calls `.connect()`.

**Web Components** (`components/editable-*-component.ts`): Custom Elements like `<editable-text>` that create their `Editable` instance in the constructor and call `.connect()` / `.disconnect()` in lifecycle callbacks.

Both share the same `MutationObserver` in `components/index.ts` which watches the entire document, hydrating new nodes and dehydrating removed ones.

Custom editable region types can be registered at runtime via `addCustomEditableRegion()`, which adds to the type map and re-runs hydration.

## The Editable Base Class

`nodes/editable.ts` is the base class for all editable region types. Key responsibilities:

- **Lifecycle management**: `connect()`, `disconnect()`, `mount()`, `update()`
- **Data path parsing**: `parseSource()` resolves `@collections[x]`, `@file[y]`, `@data[z]` prefixes into CloudCannon API objects
- **Value resolution**: `lookupPathAndContext()` traverses nested data structures (collections → files → data → nested keys), tracking context (which file, which collection) along the way
- **Listener management**: Parent-child registration, API event binding, DOM event binding
- **API dispatch**: `executeApiCall()` routes actions (`set`, `edit`, `add-array-item`, etc.) to the correct CloudCannon API method
- **Event handling**: `handleApiEvent()` catches bubbling `cloudcannon-api` events and adds path context

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

## The Bubbling Event Bus

Mutations (set, edit, add, remove, move) flow upward through the DOM via a custom `cloudcannon-api` event:

1. A leaf editable dispatches the event with `bubbles: true` and a relative source path
2. Each parent editable's `handleApiEvent()` intercepts it and prepends its own path segment
3. When the event reaches an editable with an absolute data source (or no parent), `executeApiCall()` fires the actual API call

This means deeply nested editables never need to know their full data path — they just say "set `title`" and the path builds itself as the event bubbles up.

## Parent-Child Listener Tree

Editables form a tree that mirrors the DOM hierarchy:

- On `setupListeners()`, each editable walks up the DOM to find its nearest parent editable
- If the parent is already hydrated, the child registers as a listener immediately
- If the parent hasn't hydrated yet, the listener is queued in `__pendingEditableListeners` on the parent element and replayed when the parent connects

Parents push data to children via `registerListener()` → `pushValue()`. Children can also have multiple `data-prop*` attributes that pull different slices of the parent's data.

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
