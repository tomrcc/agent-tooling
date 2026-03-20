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
| [Template-based snippets](snippets/template-based.md) | Component syntax matches an imported template (most common). Covers MDX templates, snippet model reference, example lifecycle. |
| [Raw snippets](snippets/raw.md) | Component needs custom syntax (e.g. `client:load`). Covers parser types, snippet format reference, custom templates. |
| [Gotchas](snippets/gotchas.md) | Debugging or reviewing. Common pitfalls and workarounds. |

---

## Configuration hierarchy

Four root-level config keys relate to snippets, listed from most to least commonly used:

| Key | Purpose |
|---|---|
| `_snippets_imports` | Import pre-built snippet templates for an SSG/framework |
| `_snippets` | Define individual snippet configurations (the main key agents write) |
| `_snippets_templates` | Define custom reusable snippet templates (when imported ones don't cover your syntax) |
| `_snippets_definitions` | Define reusable values shared across snippets via `{ ref: "key" }` syntax |

Most migrations only need `_snippets_imports` + `_snippets`.

---

## Available imports

`_snippets_imports` provides pre-built templates. Each key maps to an SSG or content format:

| Import key | Templates provided | Use for |
|---|---|---|
| `mdx` | `mdx_component`, `mdx_paired_component` | Astro MDX, generic MDX |
| `docusaurus_mdx` | Docusaurus-specific MDX templates | Docusaurus sites |
| `hugo` | Hugo shortcode templates | Hugo sites |
| `jekyll` | Jekyll include templates | Jekyll sites |
| `eleventy_liquid` | Eleventy Liquid shortcode templates | Eleventy (Liquid) |
| `eleventy_nunjucks` | Eleventy Nunjucks shortcode templates | Eleventy (Nunjucks) |
| `markdoc` | Markdoc tag templates | Markdoc content |
| `python_markdown_extensions` | Python Markdown extension templates | MkDocs, Pelican |

There is **no `astro` key** — Astro sites use `mdx` since Astro's `.mdx` files use standard MDX component syntax.

**Filtering imports:** `true` imports all default snippets for that format, which may include unwanted matches (e.g. MDX defaults match fenced code blocks as snippets). Use `include` to import only specific defaults, or `include: []` to import no defaults while still making the template types available:

```yaml
_snippets_imports:
  mdx:
    include: []
```

This is the recommended approach when you're defining all snippets manually — you get the templates without default snippet instances interfering with your content.

---

## Which approach?

- **Template-based** → component syntax matches an imported template exactly (no extra directives, standard attribute format). See [template-based.md](snippets/template-based.md).
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

**SSG-specific guidance:**
- Astro: [astro/snippets.md](astro/snippets.md)
