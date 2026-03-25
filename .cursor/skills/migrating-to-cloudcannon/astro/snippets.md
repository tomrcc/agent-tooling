# Snippets (Astro)

Guidance for configuring CloudCannon snippets for MDX components in an Astro site. Read the cross-SSG [snippets overview](../snippets.md) first for CC snippet concepts and reference.

## Prerequisites

- MDX integration (`@astrojs/mdx`) installed and registered in `astro.config.mjs`
- Content files using components must be `.mdx` (not `.md`)

## Auto-import: keeping import statements out of content

CloudCannon's Content Editor displays the raw file contents. Import statements (`import Button from '../components/Button'`) would be visible to editors in the rich text view — confusing for non-technical users. Astro content must use an auto-import mechanism so components are available without explicit imports.

### `astro-auto-import`

The recommended approach. This Astro integration injects imports into MDX files at build time.

```bash
npm install astro-auto-import
```

In `astro.config.mjs`, register it **before** the `mdx()` integration:

```javascript
import AutoImport from "astro-auto-import";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Notice",
        "@/shortcodes/Youtube",
      ],
    }),
    mdx(),
  ],
});
```

Each entry maps a module to a default import. The component is available in MDX by its filename (e.g. `Button`, `Notice`). Named exports use object syntax:

```javascript
imports: [{ "astro-embed": ["Tweet", "YouTube"] }]
```

### Alternative: `components` prop

Pass components explicitly when rendering content:

```astro
---
import Button from "@/shortcodes/Button";
const { Content } = await entry.render();
---
<Content components={{ Button }} />
```

Less scalable but avoids the extra dependency. The `astro-auto-import` approach is better for templates with many shortcodes. If auto-import fails to resolve components (path alias issues, pnpm hoisting), fallback to this approach -- it's reliable and sufficient for sites with only 1-2 MDX components.

## Built-in templates for Astro

Astro MDX files use standard MDX component syntax. The built-in `mdx_component` and `mdx_paired_component` templates match JSX/MDX syntax and resolve automatically when referenced by name in `_snippets` — no `_snippets_imports` needed.

## Workflow: from component to snippet config

For each component used in MDX content:

1. **Find the component source** — check the auto-import config or shortcodes directory
2. **Read its props** — look at the TypeScript interface or function parameters
3. **Check how it's used in content** — self-closing or wrapping content? Uses `client:load`?
4. **Choose the approach**:
   - No `client:load` + self-closing → `mdx_component` template
   - No `client:load` + wraps content → `mdx_paired_component` template
   - Has `client:load` → raw snippet syntax (template-based can't output directives)
5. **Write the snippet config** — map props to named_args/models, add `_inputs` for good editor UX
6. **Add `_inputs` for constrained values** — use `select` for props with known options, `url` for links, etc.

## Handling `client:load` directives

Astro's `client:load`, `client:idle`, `client:visible` directives trigger client-side hydration for interactive components. The MDX templates (`mdx_component`, `mdx_paired_component`) don't output these directives — they produce plain `<Component />` syntax.

Use raw snippet syntax to include the directive as literal text:

### Self-closing with `client:load`

```yaml
youtube:
  snippet: '<Youtube client:load [[named_args]] />'
  inline: false
  preview:
    text: YouTube Video
    icon: play_circle
  params:
    named_args:
      parser: key_values
      options:
        models:
          - editor_key: id
            type: string
          - editor_key: title
            type: string
        format:
          root_value_delimiter: '='
          string_boundary:
            - '"'
  _inputs:
    id:
      type: text
      comment: YouTube video ID
```

### Paired with `client:load`

```yaml
accordion:
  snippet: '<Accordion client:load [[named_args]]>[[inner_content]]</Accordion>'
  inline: false
  preview:
    text: Accordion
    icon: expand_more
  params:
    named_args:
      parser: key_values
      options:
        models:
          - editor_key: title
            type: string
        format:
          root_value_delimiter: '='
          string_boundary:
            - '"'
    inner_content:
      parser: content
      options:
        editor_key: inner_content
```

The directive appears literally in the `snippet` string outside any `[[placeholder]]`, so it's preserved as-is during parsing and re-serialization.

### Custom template for multiple `client:load` components

If several components all need `client:load`, define a custom template to avoid repetition:

```yaml
_snippets_templates:
  astro_client_component:
    snippet: '<[[component_name]] client:load [[named_args]] />'
    params:
      component_name:
        parser: literal
        options:
          literal:
            ref: component_name
      named_args:
        parser: key_values
        options:
          models:
            ref: named_args
          format:
            root_value_delimiter: '='
            string_boundary:
              - '"'
```

Then individual snippets inherit from it:

```yaml
_snippets:
  youtube:
    template: astro_client_component
    definitions:
      component_name: Youtube
      named_args:
        - editor_key: id
          type: string
        - editor_key: title
          type: string
```

## Nested components (repeating parser)

For nested patterns like `<Tabs><Tab>...</Tab></Tabs>`, use a single snippet with the `repeating` parser. The child component's template is defined **inline** in the repeating parser's `options.snippet`, and its params live in the **parent's** `params` block. Do NOT define the child as a separate `_snippets` entry — it would match standalone and steal content from the parent.

```yaml
tabs:
  snippet: '<Tabs client:load>[[repeating_tabs]]</Tabs>'
  inline: false
  preview:
    text: Tabs
    icon: tab
  _inputs:
    tab_items:
      type: array
    tab_items[*]:
      options:
        preview:
          text:
            - key: name
          icon: tab
    tab_items[*].name:
      type: text
    tab_items[*].tab_content:
      type: markdown
  params:
    repeating_tabs:
      parser: repeating
      options:
        snippet: '<Tab [[named_args]]>[[tab_content]]</Tab>'
        editor_key: tab_items
        default_length: 2
        style:
          output: block
          between: "\n\n"
          block:
            leading: "\n\n"
            trailing: "\n\n"
    named_args:
      parser: key_values
      options:
        models:
          - editor_key: name
            type: string
        format:
          root_value_delimiter: '='
          string_boundary:
            - '"'
    tab_content:
      parser: content
      options:
        editor_key: tab_content
        style:
          block:
            leading: "\n\n"
            trailing: "\n\n"
```

Key points:

- `repeating_tabs.options.snippet` is the full inline template for a single `<Tab>`, not a reference to another snippet name. The repeating parser creates a sub-parser from this template using the parent's `params`.
- `named_args` and `tab_content` are defined alongside `repeating_tabs` in the same `params` block — the sub-parser inherits all of them.
- The `style` controls output formatting: `between` is the delimiter between repeated items, `block.leading`/`trailing` wrap the group.
- `_inputs` uses the `editor_key` from the repeating parser (`tab_items`) as the array input, and `tab_items[*]` as the array item input. Item-level `preview` and `type: object` go on the `[*]` target, not on the array itself. Use `[*].field` syntax (e.g. `tab_items[*].name`) to configure inputs for individual fields within each item.
- Editors see a structured array of Tab items they can add, remove, and reorder.

See the [raw snippets doc](../snippets/raw.md) for full `repeating` parser reference.

## What's practical as a snippet

Not every component in MDX content is worth configuring as a snippet.

**Good snippet candidates:**
- Self-closing components with string/number/boolean props (Button, Youtube, Video)
- Paired components with simple content and a few props (Notice, Accordion)
- Components editors would want to insert from the toolbar

**Better left for the source editor:**
- Components with deeply nested children beyond two levels
- Components whose props reference complex data structures (arrays of objects with sub-arrays)
- Components that are only used in a single file and unlikely to be added/edited by non-technical editors

When a component isn't worth a snippet config, document it in the migration notes so editors know to use the source editor for that file.

## Verification

After adding snippet configs:

- [ ] `_snippets` entries exist in `cloudcannon.config.yml` (no `_snippets_imports` needed — built-in templates resolve automatically)
- [ ] Every component used in MDX content has a corresponding `_snippets` entry (or is documented as source-editor-only)
- [ ] Components with `client:load` use raw snippet syntax, not templates
- [ ] `_inputs` are configured for constrained values (select dropdowns, url inputs, etc.)
- [ ] `astro build` passes cleanly
- [ ] Components in existing `.mdx` files should round-trip correctly (CC parses and re-serializes without losing attributes)

---

**Example:** See `templates/astroplate/migrated/cloudcannon.config.yml` for a complete snippet configuration covering Button, Video, Notice, Youtube, Accordion, and Tabs/Tab.
