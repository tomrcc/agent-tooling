# Built-in Snippet Templates

Reference for built-in snippet templates shipped with CloudCannon's snippet parser (`@cloudcannon/scrap-booker`). These resolve automatically when referenced by name in `_snippets` — no `_snippets_imports` required for template resolution.

For how to use templates in migrations, see [template-based.md](template-based.md). For raw snippet syntax, see [raw.md](raw.md).

> Only MDX templates are documented here (the only SSG currently supported). Templates for Hugo, Jekyll, Eleventy, and Markdoc exist in CloudCannon but are not covered until those SSGs are added to this skill.

---

## MDX (Astro, generic MDX)

Templates for JSX/MDX component syntax. Used by Astro and any generic MDX site.

### Templates

| Template | Pattern | Required definitions |
|---|---|---|
| `mdx_component` | `<[[name]][[args]]/>` | `component_name`, `named_args` |
| `mdx_paired_component` | `<[[name]][[args]]>[[content]]</[[name]]>` | `component_name`, `named_args`, `content_key` |

See [template-based.md](template-based.md) for full usage guidance and examples.

### Internal format: `mdx_format`

The format object used internally by MDX templates. Useful when writing raw snippets that need to match MDX template behavior:

```yaml
root_value_delimiter: '='
root_value_boundary:
  start: '{'
  end: '}'
root_value_boundary_optional:
  string: true
root_pair_delimiter:
  - ' '
string_boundary:
  - '"'
  - "'"
forbidden_tokens:
  - '/>'
  - '>'
allow_implied_values: true
```

Key behaviors from this format:
- String attributes use quotes: `prop="value"`
- Non-string attributes use braces: `prop={true}`, `prop={42}`
- Both single and double quotes accepted
- `/>` and `>` stop the key-value parser (end of tag)
- Bare attributes like `disabled` are allowed (`allow_implied_values`)

### Hidden catchall snippets

These ship with the MDX defaults and match unrecognized content as hidden fallback snippets. They only activate when `_snippets_imports` loads the MDX defaults.

| Snippet | What it catches |
|---|---|
| `import` | `import X from 'y'` statements |
| `_cc_mdx_unknown` | Self-closing components: `<Unknown ... />` |
| `_cc_mdx_paired_unknown` | Paired components: `<Unknown ...>content</Unknown>` |
| `_cc_mdx_unknown_template` | Expression templates: `{expression}` |
| `_cc_mdx_unknown_export` | Named exports: `export const x = value;` |

---

## Parser Internals

### `repeating_literal` parser

Matches a literal character repeated N or more times. Used for patterns like variable-length backtick fences.

```yaml
params:
  backticks:
    parser: repeating_literal
    options:
      literal: '`'
      minimum: 3
      default: 3
```

### `_cc_` prefix deprioritization

Snippet types starting with `_cc_` are sorted after all other snippets in the matching loop. User-defined snippets always get first chance to match before hidden catchall patterns.

### Round-trip safety

When CloudCannon serializes snippet data back to source text, it re-parses the output and compares the result. If re-parsing produces a different snippet sequence, it throws `"Stringified content would be unparseable"`. Fix the snippet config ambiguity rather than working around it.

### `alternate_formats`

An array of alternative snippet configurations tried when the primary parse fails. Each entry is a full snippet config. The first successful match wins. On save, CloudCannon always uses the primary format — `alternate_formats` only affects parsing of existing content.
