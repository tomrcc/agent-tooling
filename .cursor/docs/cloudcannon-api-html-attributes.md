# CloudCannon API — HTML Attributes Reference

Complete reference for all `data-editable` attributes, `data-prop` path forms, and custom element equivalents.

For the JavaScript API, see [cloudcannon-api-reference.md](cloudcannon-api-reference.md).

---

## Core Editing Attributes

| Attribute | Values | Description |
|---|---|---|
| `data-editable` | `text`, `image`, `array`, `array-item`, `component`, `source` | Declares an editable region type |
| `data-prop` | Path string | Data path for the editable value |
| `data-prop-src` | Path string | Image `src` data path |
| `data-prop-alt` | Path string | Image `alt` data path |
| `data-prop-title` | Path string | Image `title` data path |
| `data-type` | `span`, `text`, `block` | Text editor mode (inline, plain, block-level rich text) |
| `data-component` | Component key | Component identifier for re-rendering lookup |
| `data-path` | File path | Source file path (for `EditableSource`) |
| `data-key` | Unique key | Identifier within a source file |
| `data-cloudcannon-ignore` | *(presence)* | Exclude element from editable region scanning |
| `data-hide-controls` | *(presence)* | Hide CloudCannon overlay controls |
| `data-defer-mount` | *(presence)* | Lazy initialization — editor mounts on first click |
| `data-id-key` | Key name | Array item identity key for stable reordering |
| `data-component-key` | Key name | Component identity key |
| `data-direction` | `horizontal`, `vertical` | Array drag-and-drop orientation |
| `data-cms-snippet-id` | Snippet ID | Identifies a snippet within rich text content |

## `data-prop` Path Forms

| Form | Example | Resolves To |
|---|---|---|
| Relative | `data-prop="title"` | Key on the current file or parent editable |
| File reference | `data-prop="@file[/content/page.md].hero.title"` | Specific file, specific path |
| Collection | `data-prop="@collections[posts].0.title"` | Collection item by index |
| Dataset | `data-prop="@data[footer].copyright"` | Dataset data path |
| Content body | `data-prop="@content"` | File body (markdown/HTML), not front matter |
| Computed | `data-prop="@length"`, `data-prop="@index"` | Array metadata (item count, current index) |

Relative paths register on the nearest parent editable and inherit its data context. Absolute paths (prefixed with `@`) bind directly to a CloudCannon API object.

## Custom Elements

| Custom Element | Equivalent | Purpose |
|---|---|---|
| `<editable-text>` | `<span data-editable="text">` | Inline text editor |
| `<editable-source>` | `<div data-editable="source">` | Raw HTML source editor |
| `<editable-image>` | `<div data-editable="image">` | Image editor |
| `<editable-component>` | `<div data-editable="component">` | Component editor |
| `<editable-array-item>` | `<div data-editable="array-item">` | Array item wrapper |

Both forms produce identical behaviour. Custom elements self-hydrate via `connectedCallback` / `disconnectedCallback`.

---

## Usage Examples

**Text editing:**

```html
<h1 data-editable="text" data-prop="title">Welcome</h1>

<editable-text data-prop="title">Welcome</editable-text>

<div data-editable="text" data-type="block" data-prop="description">
  <p>Rich text content here.</p>
</div>
```

**Image editing:**

```html
<!-- Single data-prop (object with src/alt/title) -->
<div data-editable="image" data-prop="hero_image">
  <img src="/images/hero.jpg" alt="Hero" />
</div>

<!-- Per-attribute paths -->
<div data-editable="image" data-prop-src="featured_image.image" data-prop-alt="featured_image.image_alt">
  <img src="/images/featured.jpg" alt="Featured" />
</div>

<!-- From a data file -->
<div data-editable="image" data-prop-src="@data[footer].logo" data-prop-alt="@data[footer].logo_alt">
  <img src="/images/logo.svg" alt="Logo" />
</div>
```

**Array editing:**

```html
<div data-editable="array" data-prop="content_blocks" data-id-key="_name" data-component-key="_name">
  <div data-editable="array-item" data-id="hero" data-component="hero">
    <!-- Component content -->
  </div>
  <div data-editable="array-item" data-id="counter" data-component="counter">
    <!-- Component content -->
  </div>
</div>
```

**Component editing:**

```html
<editable-component data-component="layouts/Navigation" data-prop="@data[navigation]">
  <nav><!-- Server-rendered navigation --></nav>
</editable-component>
```

**Source editing:**

```html
<div data-editable="source" data-path="/content/page.html" data-key="main-content">
  <p>Raw HTML that can be edited inline.</p>
</div>
```
