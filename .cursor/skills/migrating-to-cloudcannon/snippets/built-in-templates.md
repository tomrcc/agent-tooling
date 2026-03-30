# Built-in Snippet Templates

Reference for all built-in snippet templates and default snippet instances shipped with CloudCannon's snippet parser (`@cloudcannon/scrap-booker`). These resolve automatically when referenced by name in `_snippets` — no `_snippets_imports` required for template resolution.

For how to use templates in migrations, see [template-based.md](template-based.md). For raw snippet syntax, see [raw.md](raw.md).

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
| `_cc_mdx_unknown_export_expression` | Expression exports: `export const x = expression;` |
| `_cc_mdx_unknown_export_default` | Default exports: `export default value;` |

---

## Docusaurus MDX

Extends MDX defaults. Adds Docusaurus-specific snippets (not templates — these are pre-configured snippet instances).

### Built-in snippet instances

**`docusaurus_mdx_admonition`**

Pattern: `:::[[type]][[title]]\n[[content]]:::`

```yaml
_snippets:
  my_admonition:
    # Not template-based — Docusaurus admonitions use raw snippet syntax
    snippet: ':::[[type]][[title]]\n[[content]]:::'
    params:
      type:
        parser: argument
        options:
          model:
            editor_key: type
          format:
            string_boundary: ['']
      title:
        parser: content
        options:
          editor_key: title
          allow_nested: false
          raw: true
          forbidden_tokens: ['\n']
          style:
            output: inline
            inline:
              leading: ' '
              trailing: ''
      content:
        parser: content
        options:
          editor_key: content
          style:
            output: block
            block:
              leading: '\n'
              trailing: '\n\n'
```

Built-in admonition types: `note`, `tip`, `info`, `caution`, `danger`.

**Caveat — remark-directive syntax mismatch**: The Docusaurus admonition uses space-separated titles (`:::note My Title`). Sites using `remark-directive` (common in Astro) use bracket syntax (`:::note[My Title]`). Importing `docusaurus_mdx_admonition` via `_snippets_imports` for a remark-directive site will mangle content — the type keyword and inner text leak out as plain text between snippet blocks. For remark-directive sites, define a custom raw snippet instead, using `style.inline.leading: '['` / `trailing: ']'` on the title param and `optional: true` to handle the no-title case.

**`docusaurus_mdx_tabs`**

Pattern: `<Tabs[[tabs_args]]>[[repeating_tabs]]</Tabs>`

This is the canonical example of the `repeating` parser with MDX format. The child template is `<TabItem[[item_args]]>[[content]]</TabItem>`. See [raw.md](raw.md) for the `repeating` parser reference.

**`docusaurus_mdx_truncate`**

Pattern: `<!--truncate-->` — simple marker with no params.

**`docusaurus_mdx_codeblock`**

Pattern: `` [[backticks]][[language]][[args]]\n[[code]][[backticks]] ``

Uses the `repeating_literal` parser for backtick fences:

```yaml
params:
  backticks:
    parser: repeating_literal
    options:
      literal: '`'
      minimum: 3
      default: 3
```

This matches ` ``` `, ` ```` `, ` ````` `, etc. — any fence of 3+ backticks.

---

## Hugo

### Templates

| Template | Pattern | Required definitions |
|---|---|---|
| `hugo_shortcode` | `{{< [[name]] >}}` | `shortcode_name` |
| `hugo_markdown_shortcode` | `{{% [[name]] %}}` | `shortcode_name` |
| `hugo_paired_shortcode` | `{{< [[name]] >}}[[content]]{{< /[[name]] >}}` | `shortcode_name`, `content_key` |
| `hugo_paired_markdown_shortcode` | `{{% [[name]] %}}[[content]]{{% /[[name]] %}}` | `shortcode_name`, `content_key` |
| `hugo_shortcode_positional_args` | `{{< [[name]] [[positional]] >}}` | `shortcode_name`, `positional_args` |
| `hugo_shortcode_named_args` | `{{< [[name]] [[named]] >}}` | `shortcode_name`, `named_args` |
| `hugo_markdown_shortcode_positional_args` | `{{% [[name]] [[positional]] %}}` | `shortcode_name`, `positional_args` |
| `hugo_markdown_shortcode_named_args` | `{{% [[name]] [[named]] %}}` | `shortcode_name`, `named_args` |
| `hugo_paired_shortcode_positional_args` | `{{< [[name]] [[positional]] >}}[[content]]{{< /[[name]] >}}` | `shortcode_name`, `positional_args`, `content_key` |
| `hugo_paired_shortcode_named_args` | `{{< [[name]] [[named]] >}}[[content]]{{< /[[name]] >}}` | `shortcode_name`, `named_args`, `content_key` |
| `hugo_paired_markdown_shortcode_positional_args` | `{{% [[name]] [[positional]] %}}[[content]]{{% /[[name]] %}}` | `shortcode_name`, `positional_args`, `content_key` |
| `hugo_paired_markdown_shortcode_named_args` | `{{% [[name]] [[named]] %}}[[content]]{{% /[[name]] %}}` | `shortcode_name`, `named_args`, `content_key` |

**`{{< >}}` vs `{{% %}}`**: The `<>` delimiters tell Hugo to treat inner content as plain HTML. The `%%` delimiters tell Hugo to process inner content as Markdown. Choose the template variant that matches the shortcode's actual behavior.

### Internal format: `hugo_shortcode_format`

```yaml
root_pair_delimiter:
  - ' '
root_value_delimiter: '='
string_boundary:
  - '"'
  - '`'
  - ''
allow_booleans: true
allow_numbers: true
allow_null: false
forbidden_tokens:
  - '>}}'
  - '%}}'
```

Key behaviors: supports unquoted strings (empty `''` boundary), backtick-quoted strings, booleans and numbers.

### Built-in snippet instances

**`hugo_figure`** — `hugo_shortcode_named_args` with 12 optional named args (`src`, `title`, `alt`, `caption`, `link`, `target`, `rel`, `attr`, `attrlink`, `class`, `width`, `height`).

**`hugo_youtube`** — `hugo_shortcode_named_args` with `id`, `autoplay`, `title`, `class`. Has `alternate_formats` accepting positional syntax too.

**`hugo_gist`** — `hugo_shortcode_positional_args` with `username`, `id`, optional `file`.

**`hugo_instagram`** — `hugo_shortcode_positional_args` with `id` and optional `hidecaption` (implied boolean).

**`hugo_highlight`** — `hugo_paired_shortcode_positional_args` with `language` and `content`.

**`hugo_vimeo`** — `hugo_shortcode_named_args` with `id`, `class`, `title`. Has `alternate_formats` accepting positional syntax.

**`hugo_tweet`** — `hugo_shortcode_named_args` with `user` and `id`.

**`hugo_param`** — `hugo_shortcode_positional_args`, inline. Displays a front matter parameter.

**`hugo_ref`** / **`hugo_relref`** — `hugo_shortcode_named_args`, inline. Links to other pages. Both have `alternate_formats` accepting positional syntax.

**`hugo_summary_divider`** — `<!--more-->`, inline marker.

### Usage example

```yaml
_snippets:
  my_figure:
    template: hugo_shortcode_named_args
    inline: false
    definitions:
      shortcode_name: figure
      named_args:
        - editor_key: src
          type: string
        - editor_key: caption
          type: string
          optional: true
          remove_empty: true
```

### Hidden catchall snippets

| Snippet | Pattern |
|---|---|
| `_cc_hugo_unknown` | `{{< [[name]] [[args]] >}}` |
| `_cc_hugo_unknown_paired` | `{{< [[name]] [[args]] >}}[[content]]{{< /[[name]] >}}` |
| `_cc_hugo_unknown_processed` | `{{% [[name]] [[args]] %}}` |
| `_cc_hugo_unknown_paired_processed` | `{{% [[name]] [[args]] %}}[[content]]{{% /[[name]] %}}` |

---

## Jekyll

### Templates

Jekyll templates all include `trim_left` / `trim_right` params (or `trim_top_left` / `trim_top_right` / `trim_bottom_left` / `trim_bottom_right` for paired tags) to handle Liquid whitespace trimming (`{%- ... -%}`).

| Template | Pattern | Required definitions |
|---|---|---|
| `jekyll_include` | `{%[[trim]] include [[name]] [[args]] [[trim]]%}` | `include_name`, `named_args` |
| `jekyll_tag` | `{%[[trim]] [[name]] [[trim]]%}` | `tag_name` |
| `jekyll_tag_positional_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}` | `tag_name`, `positional_args` |
| `jekyll_tag_named_args` | `{%[[trim]] [[name]] [[named]] [[trim]]%}` | `tag_name`, `named_args` |
| `jekyll_tag_text_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}` | `tag_name`, `text_key` |
| `jekyll_paired_tag` | `{%[[trim]] [[name]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `tag_name`, `content_key` |
| `jekyll_paired_tag_named_args` | `{%[[trim]] [[name]] [[named]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `tag_name`, `named_args`, `content_key` |
| `jekyll_paired_tag_positional_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `tag_name`, `positional_args`, `content_key` |
| `jekyll_paired_tag_text_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `tag_name`, `text_key`, `content_key` |
| `jekyll_bookshop_include` | `{%[[trim]] bookshop_include [[name]] [[args]] [[trim]]%}` | `include_name`, `named_args` |
| `jekyll_bookshop_component` | `{%[[trim]] bookshop [[name]] [[args]] [[trim]]%}` | `component_name`, `named_args` |

**Note**: `[[trim]]` is shorthand in this table. The actual patterns use named trim params (`trim_left`/`trim_right` or `trim_top_left` etc.). These are handled automatically by the templates — you don't need to define them.

### Internal format: `jekyll_liquid_format`

```yaml
root_value_delimiter: '='
root_pair_delimiter:
  - ''
string_boundary:
  - "'"
  - '"'
  - ''
forbidden_tokens:
  - '%}'
  - '-%}'
  - '}}'
  - ','
allow_null: false
```

Key behaviors: empty `root_pair_delimiter` means args are space-delimited. Supports unquoted strings.

The format is referenced in templates via `{ ref: "jekyll_liquid_format" }`, so you must include it in `_snippets_definitions` if writing custom templates that need it:

```yaml
_snippets_definitions:
  jekyll_liquid_format:
    root_value_delimiter: '='
    root_pair_delimiter: ['']
    string_boundary: ["'", '"', '']
    forbidden_tokens: ['%}', '-%}', '}}', ',']
    allow_null: false
```

### Built-in snippet instances

**`jekyll_highlight`** — `jekyll_paired_tag_positional_args`. Syntax highlighting with `language` and optional `linenos`.

**`jekyll_raw`** — Raw Liquid output (disables tag processing).

**`jekyll_link`** — `jekyll_tag_positional_args`, inline. Links to a page by path.

**`jekyll_post_url`** — `jekyll_tag_positional_args`, inline. Outputs the URL of a blog post.

**`_cc_jekyll_template`** — Hidden. Catches `{{ expression }}` Liquid template tags.

### Usage example

```yaml
_snippets:
  my_include:
    template: jekyll_include
    definitions:
      include_name: video.html
      named_args:
        - editor_key: url
          type: string
        - editor_key: title
          type: string
          optional: true
          remove_empty: true
```

---

## Eleventy Liquid

Very similar to Jekyll but with `eleventy_liquid_` prefix and support for optional trailing commas via the `optional` parser.

### Templates

| Template | Pattern | Required definitions |
|---|---|---|
| `eleventy_liquid_shortcode` | `{%[[trim]] [[name]] [[trim]]%}` | `shortcode_name` |
| `eleventy_liquid_paired_shortcode` | `{%[[trim]] [[name]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `shortcode_name`, `content_key` |
| `eleventy_liquid_shortcode_positional_args` | `{%[[trim]] [[name]][[,]] [[args]] [[trim]]%}` | `shortcode_name`, `positional_args` |
| `eleventy_liquid_paired_shortcode_positional_args` | `{%[[trim]] [[name]][[,]] [[args]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `shortcode_name`, `positional_args`, `content_key` |
| `eleventy_liquid_include` | `{%[[trim]] include [[name]][[,]] [[args]] [[trim]]%}` | `include_name`, `named_args` |
| `eleventy_liquid_render` | `{%[[trim]] render [[name]][[,]] [[args]] [[trim]]%}` | `render_name`, `named_args` |
| `eleventy_liquid_bookshop_component` | `{%[[trim]] bookshop [[name]] [[args]] [[trim]]%}` | `component_name`, `named_args` |
| `eleventy_liquid_bookshop_include` | `{%[[trim]] bookshop_include [[name]] [[args]] [[trim]]%}` | `include_name`, `named_args` |

**Note**: `[[,]]` represents an `optional` parser that matches an optional trailing comma. This is handled internally.

### Internal format: `eleventy_liquid_format`

```yaml
root_value_delimiter: ': '
root_pair_delimiter:
  - ''
  - ','
string_boundary:
  - '"'
  - "'"
forbidden_tokens:
  - '%}'
  - '-%}'
  - '}}'
  - ','
allow_null: false
```

Key difference from Jekyll: `root_value_delimiter` is `': '` (colon-space) instead of `'='`.

---

## Eleventy Nunjucks

Similar structure to Eleventy Liquid but with Nunjucks syntax conventions.

### Templates

| Template | Pattern | Required definitions |
|---|---|---|
| `eleventy_nunjucks_shortcode` | `{%[[trim]] [[name]] [[trim]]%}` | `shortcode_name` |
| `eleventy_nunjucks_paired_shortcode` | `{%[[trim]] [[name]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `shortcode_name`, `content_key` |
| `eleventy_nunjucks_shortcode_positional_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}` | `shortcode_name`, `positional_args` |
| `eleventy_nunjucks_paired_shortcode_positional_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `shortcode_name`, `positional_args`, `content_key` |
| `eleventy_nunjucks_shortcode_named_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}` | `shortcode_name`, `named_args` |
| `eleventy_nunjucks_paired_shortcode_named_args` | `{%[[trim]] [[name]] [[args]] [[trim]]%}[[content]]{%[[trim]] end[[name]] [[trim]]%}` | `shortcode_name`, `named_args`, `content_key` |
| `eleventy_nunjucks_include` | `{%[[trim]] include [[name]] [[trim]]%}` | `include_name` |

### Internal format: `eleventy_nunjucks_format`

```yaml
root_value_delimiter: '='
root_pair_delimiter:
  - ','
string_boundary:
  - '"'
  - "'"
forbidden_tokens:
  - '%}'
  - '-%}'
  - '}}'
allow_null: false
```

Key difference from Liquid: `root_pair_delimiter` is `[","]` (comma) instead of `[""]` (space). Also supports inline objects and arrays via `object_boundary`/`array_boundary`.

---

## Markdoc

### Templates

| Template | Pattern | Required definitions |
|---|---|---|
| `markdoc_tag` | `{% [[tag_name]] [[args]] /%}` | `tag_name`, `named_args` |
| `markdoc_paired_tag` | `{% [[tag_name]] [[args]] %}[[content]]{% /[[tag_name]] %}` | `tag_name`, `named_args`, `content_key` |
| `markdoc_partial` | `{% partial file=[[partial_file]] /%}` | `partial_file` |
| `markdoc_partial_named_args` | `{% partial file=[[partial_file]] variables=[[args]] /%}` | `partial_file`, `named_args` |

### Internal format: `markdoc_format`

```yaml
root_value_delimiter: '='
root_pair_delimiter:
  - ''
string_boundary:
  - '"'
```

The `markdoc_partial_named_args` template uses a different format for the `variables=` block:

```yaml
root_boundary:
  start: '{'
  end: '}'
root_value_delimiter: ': '
root_pair_delimiter:
  - ','
string_boundary:
  - '"'
```

### Built-in snippet instances

**`markdoc_id_annotation`** — `{% #[[id]] %}`, inline.

**`markdoc_class_annotation`** — `{% .[[class]] %}`, inline.

**`markdoc_table`** — `markdoc_paired_tag` with `tag_name: table`.

### Usage example

```yaml
_snippets:
  callout:
    template: markdoc_paired_tag
    definitions:
      tag_name: callout
      content_key: body
      named_args:
        - editor_key: type
          type: string
```

---

## Parser internals

### `repeating_literal` parser

Matches a literal character repeated N or more times. Not documented in CloudCannon's public docs but used internally for patterns like variable-length backtick fences.

Options:
- `literal` (string) — the character to repeat
- `minimum` (number) — minimum repetitions required
- `default` (number) — repetitions to use when creating a new snippet

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

Snippet types starting with `_cc_` are sorted after all other snippets in the matching loop. User-defined snippets always get first chance to match before hidden catchall patterns. This means you can safely define specific snippets for components that would otherwise be caught by `_cc_*_unknown` patterns.

### Round-trip safety

When CloudCannon serializes snippet data back to source text, it re-parses the output and compares the result. If re-parsing produces a different snippet sequence (different types or different order), it throws `"Stringified content would be unparseable"`. This safety check prevents silent data corruption.

If you encounter this error, the snippet config likely has an ambiguity — two snippets matching overlapping syntax, or a format issue causing the re-parse to match differently. Fix the config rather than disabling the check.

### `alternate_formats`

An array of alternative snippet configurations tried when the primary `snippet`/`template` parse fails. Each entry is a full snippet config (can use `template` + `definitions`). The first successful match wins.

Used in Hugo defaults for shortcodes that accept both positional and named arg syntax:

```yaml
_snippets:
  hugo_youtube:
    template: hugo_shortcode_named_args
    definitions:
      shortcode_name: youtube
      named_args:
        - editor_key: id
          type: string
    alternate_formats:
      - template: hugo_shortcode_positional_args
        definitions:
          shortcode_name: youtube
          positional_args:
            - editor_key: id
```

On save, CloudCannon always uses the primary format. `alternate_formats` only affects parsing of existing content.

### Hidden catchall snippets

Each SSG default ships `_cc_*_unknown` and `_cc_*_unknown_paired` patterns that match unrecognized shortcodes/components as hidden snippets. These only activate when `_snippets_imports` loads the SSG defaults — custom `_snippets` entries do not trigger them.

The catchalls use `content` parsers with `raw: true` for the argument region, preserving the original text verbatim. This prevents data loss for shortcodes that don't have explicit snippet configs.
