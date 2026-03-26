# CloudCannon JavaScript API — Reference

Deep reference for the CloudCannon JavaScript API: method signatures, editor creation, HTML attributes, and known quirks. Only consult this file when debugging unexpected Visual Editor behaviour or when you need precise API semantics beyond what [editable-regions.md](editable-regions.md) covers.

---

## Connecting to the API

CloudCannon sets `window.inEditorMode = true` when the page is inside the Visual Editor iframe.

```javascript
document.addEventListener("cloudcannon:load", () => {
  const api = window.CloudCannonAPI.useVersion("v1", true);
});
```

If the API may already be loaded: check `window.CloudCannonAPI` first, then fall back to the event listener.

---

## Core Methods

All methods are on the object returned by `useVersion("v1", true)`.

| Method | Returns | Description |
|---|---|---|
| `currentFile()` | `File` | Handle for the page currently being edited |
| `file(path)` | `File` | Handle for a specific file by path |
| `collection(key)` | `Collection` | Handle for a collection (e.g. `"posts"`) |
| `dataset(key)` | `Dataset` | Handle for a dataset defined in `data_config` |
| `getPreviewUrl(url, inputConfig?)` | `string` | Resolve a preview URL for DAM/asset files |
| `uploadFile(file, inputConfig?)` | `Promise<string>` | Upload a file, returns the URL |
| `findStructure(structure, value)` | `any` | Look up a structure value |

### File

```typescript
interface File {
  data: {
    get(opts?: { slug?: string }): Promise<any>;
    set(opts: { slug: string; value: any }): Promise<any>;
    edit(opts: { slug: string }): void;
    addArrayItem(opts: { slug: string; item?: any }): Promise<any>;
    removeArrayItem(opts: { slug: string; index: number }): Promise<any>;
    moveArrayItem(opts: { slug: string; from: number; to: number }): Promise<any>;
  };
  content: {
    get(): Promise<string>;
    set(value: string): Promise<void>;
  };
  getInputConfig(opts: { slug: string }): any;
  addEventListener(event: "change" | "delete", listener: () => void): void;
}
```

Slug paths use `.` as the separator: `"hero.title"` for `{ hero: { title: "X" } }`.

### Dataset / Collection

```typescript
interface Dataset {
  items(): Promise<File | File[]>;
  addEventListener(event: "change" | "delete", listener: () => void): void;
}
interface Collection {
  items(): Promise<File[]>;
  addEventListener(event: "change" | "delete", listener: () => void): void;
}
```

`dataset.items()` can return a single `File` or `File[]` — always handle both.

---

## Editor Creation

### createTextEditableRegion

Creates an inline ProseMirror rich text editor on a DOM element.

```typescript
api.createTextEditableRegion(
  element: HTMLElement,
  onChange: (content?: string | null) => void,
  options?: {
    elementType?: "span" | "text" | "block";
    editableType?: "content";
    inputConfig?: RichTextInput;
  }
): Promise<{ setContent(content?: string | null): void }>;
```

There is **no** `destroy()` method. Once created, a ProseMirror instance cannot be removed.

**Critical behaviours:**

1. **Editor starts empty** — does not read existing `innerHTML`. Call `editor.setContent(value)` after creation.
2. **`onChange` fires on init** — ProseMirror normalizes content on mount. Guard with a setup flag.
3. **No `destroy()`** — old instances fire `onChange` after DOM removal. Use a generation counter to make stale closures no-ops.
4. **`setContent` resets cursor** — skip `setContent` on focused editors (track focus/blur state).

### createCustomDataPanel

Opens a floating data panel with custom input fields (used by `EditableImage` for src/alt/title).

```typescript
api.createCustomDataPanel({
  title: string;
  data: Record<string, any>;
  position: DOMRect;
  config: { _inputs: Record<string, InputConfig> };
  onChange: (value: Record<string, any>) => void;
});
```

Use `getPreviewUrl(url, inputConfig)` to resolve DAM/asset URLs for image display.

---

## HTML Attributes

### Core Editing Attributes

| Attribute | Values | Description |
|---|---|---|
| `data-editable` | `text`, `image`, `array`, `array-item`, `component`, `source` | Declares an editable region type |
| `data-prop` | Path string | Data path for the editable value |
| `data-prop-src` | Path string | Image `src` data path |
| `data-prop-alt` | Path string | Image `alt` data path |
| `data-prop-title` | Path string | Image `title` data path |
| `data-type` | `span`, `text`, `block` | Text editor mode |
| `data-component` | Component key | Component identifier for re-rendering lookup |
| `data-id-key` | Key name | Array item identity key for stable reordering |
| `data-component-key` | Key name | Component identity key |
| `data-direction` | `horizontal`, `vertical` | Array drag-and-drop orientation |
| `data-path` | File path | Source file path (for `EditableSource`) |
| `data-key` | Unique key | Identifier within a source file |
| `data-defer-mount` | *(presence)* | Lazy initialization — editor mounts on first click |
| `data-cloudcannon-ignore` | *(presence)* | Exclude element from editable region scanning |
| `data-hide-controls` | *(presence)* | Hide CloudCannon overlay controls |
| `data-cms-snippet-id` | Snippet ID | Identifies a snippet within rich text content |

### Custom Elements

| Custom Element | Equivalent |
|---|---|
| `<editable-text>` | `<span data-editable="text">` |
| `<editable-source>` | `<div data-editable="source">` |
| `<editable-image>` | `<div data-editable="image">` |
| `<editable-component>` | `<div data-editable="component">` |
| `<editable-array-item>` | `<div data-editable="array-item">` |

Both forms produce identical behaviour. Custom elements self-hydrate via `connectedCallback`.

### Usage Examples

```html
<!-- Text -->
<h1 data-editable="text" data-prop="title">Welcome</h1>
<div data-editable="text" data-type="block" data-prop="description">
  <p>Rich text content here.</p>
</div>

<!-- Image (per-attribute paths) -->
<div data-editable="image" data-prop-src="featured_image.image" data-prop-alt="featured_image.image_alt">
  <img src="/images/featured.jpg" alt="Featured" />
</div>

<!-- Image from data file -->
<div data-editable="image" data-prop-src="@data[footer].logo" data-prop-alt="@data[footer].logo_alt">
  <img src="/images/logo.svg" alt="Logo" />
</div>

<!-- Array -->
<div data-editable="array" data-prop="content_blocks" data-id-key="_name" data-component-key="_name">
  <div data-editable="array-item" data-id="hero" data-component="hero">...</div>
</div>

<!-- Standalone component -->
<editable-component data-component="layouts/Navigation" data-prop="@data[navigation]">
  <nav><!-- Server-rendered navigation --></nav>
</editable-component>

<!-- Source -->
<div data-editable="source" data-path="/content/page.html" data-key="main-content">
  <p>Raw HTML that can be edited inline.</p>
</div>
```

---

## Known Quirks

### Text Editor

| Quirk | Mitigation |
|---|---|
| No `destroy()` — old ProseMirror instances stay alive after DOM removal | Use a generation counter; stale closures check and no-op |
| `onChange` fires on init (ProseMirror normalizes on mount) | Guard with a `setupComplete` flag set after editor creation |
| Editor starts empty — does not read `innerHTML` | Call `setContent(value)` immediately after creation |
| `setContent` resets cursor position | Track focus state; skip `setContent` on focused editors |

### Data API

| Quirk | Detail |
|---|---|
| Slug separator is `.` not `/` | `"hero.title"` for `{ hero: { title: "X" } }` |
| `dataset.items()` return type varies | Can return `File` or `File[]` — always handle both |
| `change` events are coarse | Doesn't indicate which key changed — re-read all keys you care about |
| `change` fires for own writes | Setting a value can trigger `change` on the same dataset — guard against echo loops |

### DOM and Content

| Quirk | Detail |
|---|---|
| Values often contain HTML | Use `innerHTML` not `textContent` when setting element content |
| `<editable-text>` replacement tag | When stripping CC elements from a clone, replace with `<span>` (inline) or `<div>` (block/text `data-type`) |
| MutationObserver timing | Process cloned DOM trees while detached to avoid observer callbacks and race conditions |

### Events

| Event | Fired On | When |
|---|---|---|
| `cloudcannon:load` | `document` | CloudCannon API is ready |
| `change` | File, Collection, Dataset | Data changed (including own writes) |
| `delete` | File, Collection, Dataset | Data deleted |
| `cloudcannon-api` | DOM elements (bubbles) | Internal editable regions event bus |
| `editable:focus` / `editable:blur` | DOM elements (bubbles) | Editable region focus state changes |

### Global State

| Global | Purpose |
|---|---|
| `window.inEditorMode` | `true` when inside the Visual Editor iframe |
| `window.CloudCannonAPI` | API router — call `.useVersion("v1", true)` |
| `window.cc_components` | Component renderer registry (set by framework integrations) |
| `window.cc_snippets` | Snippet renderer registry |
| `window.cc_files` | In-memory filesystem for Liquid templates (Eleventy only) |
