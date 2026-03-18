# CloudCannon Live Editing API — Reference

Overview of CloudCannon's client-side live editing system, how to connect to the API, and the full JavaScript API reference for files, collections, and datasets.

For editor creation (text, data panels), see [cloudcannon-api-editors.md](cloudcannon-api-editors.md).
For HTML attributes, see [cloudcannon-api-html-attributes.md](cloudcannon-api-html-attributes.md).

> **Source**: Compiled from the `@cloudcannon/editable-regions` source code and the `@cloudcannon/javascript-api` type definitions.

---

## Overview and Architecture

CloudCannon's live editing system makes elements on a page interactive within the Visual Editor. It consists of two layers:

| Layer | Package | Role |
|---|---|---|
| **JavaScript API** | `@cloudcannon/javascript-api` | Core client API: files, collections, datasets, data read/write, editor creation, file uploads |
| **Editable Regions** | `@cloudcannon/editable-regions` | DOM integration layer: scans for `data-editable` attributes, creates editor instances, manages data flow via a parent-child listener tree |

The Visual Editor loads your site in an iframe and injects the CloudCannon API into the page. Editable regions (or custom code) then use this API to create inline editors and synchronise data.

The framework integrations (Astro, Eleventy) are **only needed for component re-rendering**. Text, image, and source editable regions work with just the core.

---

## Getting Started

### Detecting the Visual Editor

CloudCannon sets `window.inEditorMode = true` when the page is loaded inside the Visual Editor iframe. Use this to gate editor-only code:

```javascript
if (window.inEditorMode) {
  // Load editing scripts
}
```

### Waiting for the API

The API is injected asynchronously. Two approaches:

**Option A: Event listener**

```javascript
document.addEventListener("cloudcannon:load", () => {
  const api = window.CloudCannonAPI.useVersion("v1", true);
  // API is ready
});
```

**Option B: Check-then-listen**

```javascript
if (window.inEditorMode && window.CloudCannonAPI) {
  init();
} else {
  document.addEventListener("cloudcannon:load", init);
}

function init() {
  const api = window.CloudCannonAPI.useVersion("v1", true);
  // ...
}
```

### `useVersion()`

```typescript
window.CloudCannonAPI.useVersion(
  key: "v0" | "v1",
  preventGlobalInstall?: boolean
): CloudCannonJavaScriptV1API;
```

- `"v1"` is the current version. `"v0"` is a legacy fallback.
- `preventGlobalInstall: true` prevents the API from installing itself as a global. The editable-regions library uses `true`.

---

## JavaScript API Reference

All methods are on the object returned by `useVersion("v1", true)`.

### Core Access

| Method | Returns | Description |
|---|---|---|
| `currentFile()` | `File` | Handle for the page currently being edited |
| `file(path: string)` | `File` | Handle for a specific file by path |
| `collection(key: string)` | `Collection` | Handle for a collection (e.g. `"posts"`) |
| `dataset(key: string)` | `Dataset` | Handle for a dataset defined in `data_config` |
| `files()` | `Promise<File[]>` | All files |
| `collections()` | `Promise<Collection[]>` | All collections |

### Editor Creation

| Method | Returns | Description |
|---|---|---|
| `createTextEditableRegion(el, onChange, opts?)` | `Promise<{ setContent }>` | Create an inline ProseMirror text editor (see [cloudcannon-api-editors.md](cloudcannon-api-editors.md)) |
| `createCustomDataPanel(opts)` | `void` | Open a floating data panel (see [cloudcannon-api-editors.md](cloudcannon-api-editors.md)) |

### Utilities

| Method | Returns | Description |
|---|---|---|
| `getPreviewUrl(url: string, inputConfig?)` | `string` | Resolve a preview URL for DAM/asset files |
| `uploadFile(file: File, inputConfig?)` | `Promise<string>` | Upload a file, returns the URL |
| `setLoading(data?)` | `void` | Update the editor's loading state |
| `prefetchedFiles()` | `Promise<Blob[]>` | Retrieve prefetched file blobs |
| `findStructure(structure, value)` | `any` | Look up a structure value |
| `getInputType(key, value?, inputConfig?)` | `string` | Determine the input type for a given key |

### Type Guards

| Method | Description |
|---|---|
| `isAPIFile(obj)` | `obj is CloudCannonJavaScriptV1APIFile` |
| `isAPICollection(obj)` | `obj is CloudCannonJavaScriptV1APICollection` |
| `isAPIDataset(obj)` | `obj is CloudCannonJavaScriptV1APIDataset` |

---

## Files, Collections, and Datasets

### File Data Operations

```typescript
interface File {
  data: {
    get(opts?: { slug?: string; rewriteUrls?: boolean }): Promise<any>;
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
  removeEventListener(event: "change" | "delete", listener: () => void): void;
}
```

**Reading data:**

```javascript
const allData = await file.data.get();
const title = await file.data.get({ slug: "title" });
const heroTitle = await file.data.get({ slug: "hero.title" });
const body = await file.content.get();
```

**Writing data:**

```javascript
await file.data.set({ slug: "title", value: "New Title" });
await file.data.set({ slug: "hero.title", value: "New Hero Title" });
await file.content.set("# New Content\n\nHello world.");
```

**Array operations:**

```javascript
await file.data.addArrayItem({ slug: "items" });
await file.data.addArrayItem({ slug: "items", item: { name: "New" } });
await file.data.removeArrayItem({ slug: "items", index: 2 });
await file.data.moveArrayItem({ slug: "items", from: 0, to: 3 });
```

### Slug Path Separator

CloudCannon uses `.` (dot) as the path separator for slugs:

```javascript
// For data structure: { hero: { title: "Hello" } }
file.data.get({ slug: "hero.title" });

// Colons are literal characters, not separators:
file.data.get({ slug: "my:key.value" });
```

### Datasets

```typescript
interface Dataset {
  datasetKey: string;
  items(): Promise<File | File[]>;
  addEventListener(event: "change" | "delete", listener: () => void): void;
  removeEventListener(event: "change" | "delete", listener: () => void): void;
}
```

### Collections

```typescript
interface Collection {
  collectionKey: string;
  items(): Promise<File[]>;
  addEventListener(event: "change" | "delete", listener: () => void): void;
  removeEventListener(event: "change" | "delete", listener: () => void): void;
}
```

### Events

Files, collections, and datasets all support `change` and `delete` events:

```javascript
file.addEventListener("change", async () => {
  const data = await file.data.get();
});
```

The `change` event does **not** indicate which specific key changed — you must re-read any keys you care about.
