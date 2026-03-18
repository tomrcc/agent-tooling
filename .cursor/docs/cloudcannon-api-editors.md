# CloudCannon API — Editor Creation

How to create inline text editors (`createTextEditableRegion`) and floating data panels (`createCustomDataPanel`) using the CloudCannon JavaScript API.

For the core API reference, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md).

---

## createTextEditableRegion

Creates an inline ProseMirror rich text editor on an existing DOM element.

### Signature

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

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `element` | `HTMLElement` | The DOM element to make editable |
| `onChange` | `(content?) => void` | Called when the user edits content. Also fires on initialization. |
| `options.elementType` | `string` | `"span"` for inline, `"text"` for plain text, `"block"` for block-level rich text |
| `options.editableType` | `string` | Set to `"content"` when editing HTML/markdown source content |
| `options.inputConfig` | `object` | Rich text input configuration (toolbar options, allowed elements, etc.) |

### Return Value

```typescript
{ setContent(content?: string | null): void }
```

There is **no** `destroy()` method. Once created, a ProseMirror editor instance cannot be removed.

### Usage

```javascript
const editor = await api.createTextEditableRegion(
  element,
  (content) => {
    if (content == null) return;
    file.data.set({ slug: "title", value: content });
  },
  { elementType: "block" }
);

editor.setContent("<p>Hello world</p>");
```

### Critical Behaviours

1. **Editor starts empty**: The editor does not read the element's existing `innerHTML`. You must call `editor.setContent(value)` after creation.

2. **`onChange` fires on initialization**: ProseMirror normalizes the content on mount and triggers `onChange`. Guard against unwanted writes with a setup flag:

   ```javascript
   let setupComplete = false;
   const editor = await api.createTextEditableRegion(el, (content) => {
     if (!setupComplete) return;
     file.data.set({ slug, value: content });
   });
   editor.setContent(value);
   setupComplete = true;
   ```

3. **No `destroy()`**: Old editors stay alive after DOM removal and fire `onChange` when the DOM changes. Use a generation counter to make stale closures no-ops:

   ```javascript
   let generation = 0;

   function setup() {
     generation++;
     const myGeneration = generation;

     const editor = await api.createTextEditableRegion(el, (content) => {
       if (myGeneration !== generation) return; // stale — ignore
       file.data.set({ slug, value: content });
     });
   }
   ```

4. **Skip `setContent` on focused editors**: Calling `setContent` while the user is typing resets the cursor position. Track focus state and skip updates:

   ```javascript
   let focused = false;
   element.addEventListener("focus", () => { focused = true; });
   element.addEventListener("blur", () => { focused = false; });

   if (!focused) {
     editor.setContent(newValue);
   }
   ```

---

## createCustomDataPanel

Opens a floating data panel with custom input fields. Used by `EditableImage` for image editing (src, alt, title).

### Signature

```typescript
api.createCustomDataPanel({
  title: string;
  data: Record<string, any>;
  position: DOMRect;
  config: {
    _inputs: Record<string, InputConfig>;
  };
  onChange: (value: Record<string, any>) => void;
});
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `title` | `string` | Panel title (e.g. `"Edit Image"`) |
| `data` | `object` | Current values for the panel's fields |
| `position` | `DOMRect` | Position hint for the floating panel (typically `element.getBoundingClientRect()`) |
| `config._inputs` | `object` | Input configuration for each field |
| `onChange` | `function` | Called with updated values when the user changes any field |

### Example: Image Editing

```javascript
api.createCustomDataPanel({
  title: "Edit Image",
  data: { src: currentSrc, alt: currentAlt, title: currentTitle },
  position: imgElement.getBoundingClientRect(),
  config: {
    _inputs: {
      src: { type: "image" },
      alt: { type: "text" },
      title: { type: "text" },
    },
  },
  onChange: (value) => {
    imgElement.src = value.src;
    imgElement.alt = value.alt;
    imgElement.title = value.title;
    file.data.set({ slug: "hero_image", value });
  },
});
```

### Related: `getPreviewUrl`

When displaying uploaded images, use `getPreviewUrl` to resolve DAM/asset URLs:

```javascript
const previewSrc = api.getPreviewUrl(originalUrl, inputConfig);
imgElement.src = previewSrc;
```
