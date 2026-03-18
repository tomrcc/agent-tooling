# CloudCannon API — Data Flow & Hydration

How data flows between CloudCannon and the page, how the hydration engine works, and the MutationObserver that keeps editable regions in sync with DOM changes.

For the JavaScript API, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md).

---

## Data Down (CloudCannon to Page)

When data changes in CloudCannon (sidebar edit, external save, etc.):

```
CloudCannon API fires "change" on file/collection/dataset
    │
    ▼
Root Editable.pushValue()
    │  Resolves path against file data, stores value
    ▼
Editable.update()
    │  Pushes data to child listeners
    ▼
┌────────────┬──────────────┬───────────────┬──────────────┐
│ Text       │ Image        │ Component     │ Array        │
│            │              │               │              │
│ editor     │ updates      │ re-renders    │ creates/     │
│ .setContent│ img src/alt  │ template then │ reorders     │
│            │              │ diffs DOM     │ child items  │
└────────────┴──────────────┴───────────────┴──────────────┘
```

The `shouldUpdate()` check on `EditableText` prevents overwriting content while the user is focused on the editor.

## Data Up (Page to CloudCannon)

When the user types, clicks an image, or drags an array item:

```
User interaction (typing, clicking, dragging)
    │
    ▼
Leaf editable dispatches CustomEvent("cloudcannon-api", {
    bubbles: true,
    detail: { action: "set", source: "title", value: "New Title" }
})
    │  Event bubbles up the DOM
    ▼
Each parent editable intercepts, prepends its path segment
    │  "title" → "hero.title" → "content_blocks.0.hero.title"
    ▼
Root editable calls executeApiCall()
    │
    ▼
file.data.set({ slug: "content_blocks.0.hero.title", value: "New Title" })
    │
    ▼
CloudCannon API → Visual Editor → saves to file
```

Deeply nested editables never need to know their full data path. They dispatch relative paths, and each parent prepends its own segment as the event bubbles up.

### Supported API Actions

| Action | API Call | Typical Trigger |
|---|---|---|
| `set` | `file.data.set()` or `file.content.set()` | Typing in a text region, changing an image |
| `edit` | `file.data.edit()` | Clicking a component's edit button (opens sidebar) |
| `add-array-item` | `file.data.addArrayItem()` | Array "add" button, duplicate button |
| `remove-array-item` | `file.data.removeArrayItem()` | Array item delete button |
| `move-array-item` | `file.data.moveArrayItem()` | Drag-and-drop, reorder buttons |
| `get-input-config` | `file.getInputConfig()` | Mounting editors to get field configuration |

---

## Hydration and the MutationObserver

### Initial Hydration

On page load, the editable regions entry point runs:

```javascript
hydrateDataEditableRegions(document.body);
observer.observe(document, { childList: true, subtree: true });
```

The hydration function:

1. Queries `[data-editable]` elements
2. Maps the type string to an `Editable` subclass (`"text"` → `EditableText`, `"image"` → `EditableImage`, etc.)
3. Creates an instance and attaches it to the element as `element.editable`
4. Calls `editable.connect()`, which waits for the API then sets up listeners

### MutationObserver

A document-level `MutationObserver` watches `{ childList: true, subtree: true }`:

```javascript
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.removedNodes.forEach((el) => {
      if (el instanceof HTMLElement) dehydrateDataEditableRegions(el);
    });
    mutation.addedNodes.forEach((el) => {
      if (el instanceof HTMLElement) hydrateDataEditableRegions(el);
    });
  });
});
observer.observe(document, { childList: true, subtree: true });
```

- **Nodes added to the DOM**: Automatically hydrated (editable instances created, listeners connected)
- **Nodes removed from the DOM**: Automatically dehydrated (listeners removed, editables disconnected)

### Parent-Child Listener Tree

Editables form a tree mirroring the DOM hierarchy:

1. On `setupListeners()`, each editable walks up the DOM to find its nearest parent editable
2. If the parent is hydrated, the child registers as a listener immediately
3. If the parent hasn't hydrated yet, the listener is queued in `__pendingEditableListeners` on the parent element and replayed when the parent connects

Parents push data to children via `registerListener()` → `pushValue()`.

### Custom Editable Region Types

Register custom editable types at runtime:

```javascript
addCustomEditableRegion("my-type", MyEditableClass);
```

This adds to the type map and re-runs hydration on `document.body`.
