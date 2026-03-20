# Snippet Gotchas

Common pitfalls when configuring CloudCannon snippets.

---

### `root_value_delimiter` has no default

When using raw snippets with the `key_values` parser, `root_value_delimiter` must be set explicitly in `format:`. There is no default. Without it, CloudCannon cannot parse `key="value"` pairs. Template-based snippets handle this internally, so it only affects raw snippets.

```yaml
# Works
format:
  root_value_delimiter: '='
  string_boundary:
    - '"'

# Broken — missing root_value_delimiter
format:
  string_boundary:
    - '"'
```

---

### `key_values` models must be an array

Despite some CC docs examples showing `models` as an object (with source keys as map keys), the runtime validates `models` as an **array**. Use the same array format as template-based `named_args`:

```yaml
# Correct
models:
  - editor_key: id
    type: string

# Wrong — CloudCannon rejects this at runtime
models:
  id:
    editor_key: id
    type: string
```

---

### Default imports can match unintended content

`_snippets_imports: mdx: true` imports default MDX snippets that may match fenced code blocks or other markup you don't want treated as snippets. Use `include: []` to disable defaults while keeping templates available:

```yaml
_snippets_imports:
  mdx:
    include: []
```

---

### Import statements in content

Rich text editors show everything in the file. Import statements (`import X from 'y'`) will be visible to non-technical editors. Use your SSG's auto-import mechanism to avoid import statements in content files. See SSG-specific docs for details (e.g. `astro-auto-import` for Astro).

---

### Nested components are flat

CC snippets don't support a compound model where child components map to array items in a single snippet. For nested patterns like `<Tabs><Tab>...</Tab></Tabs>`, use `allow_nested: true` on the content parser so inner components are recognized as separate snippets within the parent's content area. See [raw.md](raw.md) for the `content` parser options.
