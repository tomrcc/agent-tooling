# Editable Regions — Lifecycle & Core Internals

Deep reference for how `@cloudcannon/editable-regions` works under the hood. Start with [editable-regions.md](editable-regions.md) for the overview and region type reference. For the JavaScript API, HTML attributes, and known quirks, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md).

---

## The Simplest Case: A Text Editable Region

The best way to understand the system is to trace a single text editable region from HTML to live editing. No framework integration or component registration is needed for this — it's all shared core.

### 1. The HTML

A text editable region is just an HTML element with two data attributes:

```html
<p data-editable="text" data-prop="title">Welcome to my site</p>
```

- `data-editable="text"` — tells the hydration engine what type of editable this is
- `data-prop="title"` — the data path, pointing to the `title` key in the current file's front matter

Alternatively, you can use the Web Component form:

```html
<editable-text data-prop="title">Welcome to my site</editable-text>
```

Both forms produce identical behaviour.

### 2. Hydration

When the page loads, `components/index.ts` runs:

```javascript
hydrateDataEditableRegions(document.body);
observer.observe(document, { childList: true, subtree: true });
```

The hydration function walks the DOM looking for `[data-editable]` elements. It finds our `<p>`, sees `data-editable="text"`, and:

1. Instantiates `new EditableText(element)` — this attaches the editable instance to the element as `element.editable`
2. Calls `editable.connect()`

A `MutationObserver` is also set up to catch any future DOM changes (view transitions, dynamic content, component re-renders), automatically hydrating new elements and disconnecting removed ones.

For Web Components (`<editable-text>`), hydration happens via the Custom Element lifecycle instead — `connectedCallback()` calls `this.editable.connect()`, `disconnectedCallback()` calls `this.editable.disconnect()`.

### 3. Waiting for the CloudCannon API

`connect()` doesn't do anything immediately. It waits for the CloudCannon API:

```javascript
this.connectPromise = apiLoadedPromise.then(() => {
    this.setupListeners();
    this.connected = true;
    if (!this.mounted && this.shouldMount()) {
        this.mounted = true;
        this.mount();
        this.update();
    }
});
```

`apiLoadedPromise` resolves when `window.CloudCannonAPI` becomes available (CloudCannon injects this into the Visual Editor iframe). It grabs the v1 API:

```javascript
_cloudcannon = window.CloudCannonAPI.useVersion("v1", true);
```

If the API is already loaded by the time the code runs, the promise resolves immediately. Otherwise it listens for the `cloudcannon:load` CustomEvent on `document`.

### 4. Setting Up Listeners

Once the API is ready, `setupListeners()` runs. For our text editable, this:

1. **Walks up the DOM** looking for a parent editable element (there isn't one in this simple case)
2. **Parses `data-prop="title"`** — since there's no `@collections[...]` or `@file[...]` prefix, this is a relative path with no parent, so it resolves to `CloudCannon.currentFile()` (the file being edited)
3. **Binds to the API file object**:
   ```javascript
   const file = CloudCannon.currentFile();
   file.addEventListener("change", handleAPIChange);
   file.addEventListener("delete", handleAPIChange);
   handleAPIChange(); // initial data fetch
   ```
4. **Listens for the `cloudcannon-api` CustomEvent** on the element itself (for upward data flow — more on this later)

### 5. Mounting the Editor

When the initial data arrives, `pushValue()` resolves the path `"title"` against the file's front matter, stores the result, and calls `mount()`.

`EditableText.mount()` sets up interaction listeners on the element (click prevention, focus/blur tracking), then calls `mountEditor()`:

```javascript
this.editor = await CloudCannon.createTextEditableRegion(
    this.element,      // the DOM element to make editable
    this.onChange,      // callback when user types
    {
        elementType: this.element.dataset.type,  // "span", "text", or "block"
        inputConfig,                              // field config from CloudCannon
    },
);
```

This hands the element over to CloudCannon's editor (ProseMirror-based), which makes it `contenteditable` and provides inline rich text editing.

### 6. Data Flows Down

When data changes in CloudCannon (e.g. user edits the `title` field in the sidebar), the API file object fires a `change` event. The flow is:

```
CloudCannon API file fires "change"
    → handleAPIChange() calls pushValue()
    → pushValue() resolves path "title" against file data
    → Calls EditableText.update()
    → update() calls editor.setContent(newValue)
    → The text on the page updates live
```

`EditableText.shouldUpdate()` checks that the editor isn't currently focused (to avoid clobbering what the user is typing) and that the value actually changed.

### 7. Data Flows Up

When the user types directly into the text element on the page, the ProseMirror editor fires the `onChange` callback:

```javascript
onChange(value) {
    this.value = value;
    this.dispatchSet("title", value);
}
```

`dispatchSet()` dispatches a bubbling CustomEvent:

```javascript
this.element.dispatchEvent(
    new CustomEvent("cloudcannon-api", {
        bubbles: true,
        detail: { action: "set", source: "title", value },
    }),
);
```

Since this element has no parent editable, the event is caught by its own `handleApiEvent()` listener, which calls `executeApiCall()`:

```javascript
file.data.set({ slug: "title", value: "New Title" });
```

This sends the change to the CloudCannon API, which saves it to the file.

That's the complete round trip for the simplest case — no framework integration involved.

---

## The Core in Detail

### Hydration Engine

Two mechanisms ensure every editable element gets an `Editable` instance:

**Data attribute scanning** (`helpers/hydrate-editable-regions.ts`): Finds `[data-editable]` elements, maps the type string to a class (`"text"` → `EditableText`, `"image"` → `EditableImage`, etc.), and calls `.connect()`.

**Web Components** (`components/editable-*-component.ts`): Custom Elements like `<editable-text>` that create their `Editable` instance in the constructor and call `.connect()` / `.disconnect()` in lifecycle callbacks.

Both share the same `MutationObserver` in `components/index.ts` which watches the entire document, hydrating new nodes and dehydrating removed ones.

Custom editable region types can be registered at runtime via `addCustomEditableRegion()`, which adds to the type map and re-runs hydration.

### The Editable Base Class

`nodes/editable.ts` is the base class for all editable region types. Key responsibilities:

- **Lifecycle management**: `connect()`, `disconnect()`, `mount()`, `update()`
- **Data path parsing**: `parseSource()` resolves `@collections[x]`, `@file[y]`, `@data[z]` prefixes into CloudCannon API objects
- **Value resolution**: `lookupPathAndContext()` traverses nested data structures (collections → files → data → nested keys), tracking context (which file, which collection) along the way
- **Listener management**: Parent-child registration, API event binding, DOM event binding
- **API dispatch**: `executeApiCall()` routes actions (`set`, `edit`, `add-array-item`, etc.) to the correct CloudCannon API method
- **Event handling**: `handleApiEvent()` catches bubbling `cloudcannon-api` events and adds path context

### The Bubbling Event Bus

Mutations (set, edit, add, remove, move) flow upward through the DOM via a custom `cloudcannon-api` event:

1. A leaf editable dispatches the event with `bubbles: true` and a relative source path
2. Each parent editable's `handleApiEvent()` intercepts it and prepends its own path segment
3. When the event reaches an editable with an absolute data source (or no parent), `executeApiCall()` fires the actual API call

This means deeply nested editables never need to know their full data path — they just say "set `title`" and the path builds itself as the event bubbles up.

### Parent-Child Listener Tree

Editables form a tree that mirrors the DOM hierarchy:

- On `setupListeners()`, each editable walks up the DOM to find its nearest parent editable
- If the parent is already hydrated, the child registers as a listener immediately
- If the parent hasn't hydrated yet, the listener is queued in `__pendingEditableListeners` on the parent element and replayed when the parent connects

Parents push data to children via `registerListener()` → `pushValue()`. Children can also have multiple `data-prop*` attributes that pull different slices of the parent's data.

---

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BUILD TIME                                  │
│                                                                     │
│  ┌─ Astro ──────────────────────┐  ┌─ Eleventy ──────────────────┐ │
│  │ Vite plugin:                 │  │ esbuild bundle:              │ │
│  │ • shims astro:* modules      │  │ • discovers .liquid files    │ │
│  │ • enables client-side SSR    │  │ • bundles as text strings    │ │
│  │ • patches astro:build plugin │  │ • imports filters/shortcodes │ │
│  └──────────────────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                  PAGE LOAD (in Visual Editor iframe)                 │
│                                                                     │
│  ┌─ Integration layer (optional) ─────────────────────────────────┐ │
│  │ Registers component renderers in window.cc_components          │ │
│  │ (Only needed for EditableComponent regions)                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌─ Core (always runs) ──────────────────────────────────────────┐  │
│  │ 1. hydrateDataEditableRegions(document.body)                  │  │
│  │    → scans all [data-editable] elements                       │  │
│  │    → instantiates Editable subclasses                         │  │
│  │ 2. MutationObserver watches for future DOM changes            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONNECTION PHASE                                │
│                                                                     │
│  Each Editable.connect() waits for apiLoadedPromise                 │
│  ┌──────────────────────────────────────────────────┐               │
│  │ Resolves when:                                    │               │
│  │  • window.CloudCannonAPI already exists, OR       │               │
│  │  • document "cloudcannon:load" event fires        │               │
│  │ Then: CloudCannonAPI.useVersion("v1", true)       │               │
│  └──────────────────────────────────────────────────┘               │
│                                                                     │
│  Then setupListeners():                                             │
│  ┌──────────────────────────────────────────────────────┐           │
│  │ • Walk DOM upward to find parent editable            │           │
│  │ • Parse data-prop* into data paths                   │           │
│  │ • Relative paths → register on parent                │           │
│  │ • Absolute paths → bind to CloudCannon API objects   │           │
│  │ • Listen for "cloudcannon-api" CustomEvent (bubbling)│           │
│  └──────────────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     LIVE EDITING DATA FLOW                           │
│                                                                     │
│  DATA DOWN (CloudCannon → Page)                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ CloudCannon API fires "change" on file/collection/dataset    │   │
│  │       │                                                      │   │
│  │       ▼                                                      │   │
│  │ Root Editable.pushValue()                                    │   │
│  │       │  resolves path, stores value                         │   │
│  │       ▼                                                      │   │
│  │ Editable.update()                                            │   │
│  │       │  pushes to child listeners                           │   │
│  │       ▼                                                      │   │
│  │ ┌────────────┬──────────────┬───────────────┬──────────────┐ │   │
│  │ │ Text       │ Image        │ Component     │ Array        │ │   │
│  │ │            │              │               │              │ │   │
│  │ │ editor     │ updates      │ re-renders    │ creates/     │ │   │
│  │ │ .setContent│ img src/alt  │ template then │ reorders     │ │   │
│  │ │            │              │ diffs DOM     │ child items  │ │   │
│  │ └────────────┴──────────────┴───────────────┴──────────────┘ │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  DATA UP (Page → CloudCannon)                                       │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ User types / clicks image / drags array item                 │   │
│  │       │                                                      │   │
│  │       ▼                                                      │   │
│  │ Leaf dispatches CustomEvent("cloudcannon-api", {             │   │
│  │     bubbles: true,                                           │   │
│  │     detail: { action: "set", source: "title", value }       │   │
│  │ })                                                           │   │
│  │       │  (bubbles up DOM)                                    │   │
│  │       ▼                                                      │   │
│  │ Each parent prepends its path → "hero.title"                 │   │
│  │       │                                                      │   │
│  │       ▼                                                      │   │
│  │ Root calls executeApiCall()                                  │   │
│  │   → file.data.set({ slug: "hero.title", value })            │   │
│  │       │                                                      │   │
│  │       ▼                                                      │   │
│  │ CloudCannon API → Visual Editor → saves to file              │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```
