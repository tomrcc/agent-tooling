# Snippets — Overview

Snippets let editors insert and edit complex markup (components, shortcodes, embeds) inside CloudCannon's rich text Content Editor. CloudCannon doesn't execute the component — it just needs to understand the syntax well enough to parse, display, and re-serialize it.

**Two distinct layers:**

- **SSG layer**: The component implementation, how it's imported/registered, build directives (`client:load` in Astro, etc.). This is what makes the component work at build time.
- **CloudCannon layer**: The `_snippets` config that teaches the Content Editor the component's syntax — its name, attributes, whether it wraps content, and what editor inputs to show. This is purely for the editing experience.

Agents must handle both layers during a migration, but keep them conceptually separate. SSG-specific snippet guidance lives in each SSG's `snippets.md` (e.g. `astro/snippets.md`).

---

## Sub-docs

| Doc | When to read |
|---|---|
| [Template-based snippets](snippets/template-based.md) | Component syntax matches a built-in template (most common). Covers MDX templates, snippet model reference, example lifecycle. |
| [Raw snippets](snippets/raw.md) | Component needs custom syntax (e.g. `client:load`). Covers parser types, snippet format reference, custom templates. |
| [Built-in templates](snippets/built-in-templates.md) | Reference for all built-in templates per SSG (MDX, Hugo, Jekyll, Eleventy, Markdoc), their patterns, required definitions, internal format configs, and parser internals. |
| [Gotchas](snippets/gotchas.md) | Debugging or reviewing. Common pitfalls and workarounds. |

---

## Configuration hierarchy

Root-level config keys that relate to snippets:

| Key | Purpose |
|---|---|
| `_snippets` | Define individual snippet configurations (the main key agents write) |
| `_snippets_templates` | Define custom reusable snippet templates (when built-in ones don't cover your syntax) |
| `_snippets_definitions` | Define reusable values shared across snippets via `{ ref: "key" }` syntax |

Most migrations only need `_snippets`.

> **Note:** `_snippets_imports` exists but should not be used during migrations. It auto-imports pre-built snippet instances for an SSG which can match content incorrectly (e.g. fenced code blocks, CSS/JS blocks). Custom `_snippets` entries give full control and work without any imports — built-in templates like `mdx_component` resolve automatically. Users can add `_snippets_imports` later if they want the pre-built defaults.

---

## Which approach?

- **Template-based** → component syntax matches a built-in template exactly (no extra directives, standard attribute format). See [template-based.md](snippets/template-based.md).
- **Raw** → extra syntax needs to appear literally, or non-standard attribute format, or fine-grained parsing control needed. See [raw.md](snippets/raw.md).

Most migrations use template-based for simple components and raw for anything with SSG-specific directives.

---

## Snippet properties

Every entry under `_snippets` supports these keys (shared by both approaches):

| Key | Type | Description |
|---|---|---|
| `template` | string | Template to inherit (mutually exclusive with `snippet`) |
| `snippet` | string | Raw matching pattern with `[[placeholder]]` markers (mutually exclusive with `template`) |
| `definitions` | object | Values for template variables (used with `template`) |
| `params` | object | Parser configs for each placeholder (used with `snippet`) |
| `inline` | boolean | Can this appear mid-sentence? Default `false` (block-level) |
| `preview` | object | Card appearance in the editor |
| `picker_preview` | object | Card appearance in the snippet picker (overrides `preview`) |
| `view` | string | Rendering mode: `card` (default), `inline`, `gallery` |
| `_inputs` | object | Input configurations scoped to this snippet's fields |
| `_structures` | object | Structure definitions for array/object fields in this snippet |
| `_select_data` | object | Fixed dropdown options scoped to this snippet |
| `strict_whitespace` | boolean | Match whitespace exactly? Default `false` (normalized) |
| `alternate_formats` | array | Other syntaxes that should also match this snippet |

---

## Enabling snippets in the toolbar

By default, CloudCannon shows the snippet toolbar action if snippets are configured. If you've customized `_editables`, include `snippet: true`:

```yaml
_editables:
  content:
    blockquote: true
    bold: true
    snippet: true
```

---

## When NOT to use a snippet

If a rich text field contains structured HTML with a fixed layout and only a few changing values (e.g. a banner with specific classes for centering and link styling), don't define it as a snippet. Instead, decompose the HTML into explicit props and let the component own the markup. See [astro/visual-editing.md > Structured props over rich text](astro/visual-editing.md#structured-props-over-rich-text) for the full pattern.

---

**SSG-specific guidance:**
- Astro: [astro/snippets.md](astro/snippets.md)
