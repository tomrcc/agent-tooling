# Repeating Parser — Resolution

## Original problem

Nested `<Tabs><Tab>...</Tab></Tabs>` snippets failed in CloudCannon. The `<Tab>` elements were matched as standalone snippets before the parent's `repeating` parser ran, leaving `<Tabs>` empty and falling back to raw HTML.

## Root cause

The config defined `tab` as a separate `_snippets` entry and referenced it by name in the `repeating` parser's `options.snippet`. This was wrong on two counts:

1. **`options.snippet` is an inline template string, not a snippet name reference.** The repeating parser's sub-parser is constructed in `snippet-parser.js` (`consumeParserTemplate`, `case "repeating"`) by spreading the parent's full config and overriding `snippet` with the option value. When `snippet: tab`, the sub-parser literally tried to match the three-character string `"tab"` — not the `<Tab ...>...</Tab>` pattern.

2. **The sub-parser inherits the parent's `params`, not the child's.** Even if the template string were resolved, `[[named_args]]` and `[[tab_content]]` would not be found in the parent's `params` block and would be treated as literal text.

3. **A separate child snippet matches standalone.** The content parser (`content-parser.js`, main parse loop) tries all registered snippets at each character position. With `tab` registered as a standalone snippet, it consumed `<Tab>` elements independently, preventing the parent from ever matching.

## Fix

Use a single `tabs` snippet with the `repeating` parser's `options.snippet` set to the **full inline template** for the child. Define the child's params (`named_args`, `tab_content`) in the parent's `params` block. Remove the separate `tab` snippet entirely.

The correct pattern matches CloudCannon's own Docusaurus MDX tabs default (`docusaurus_mdx.js` in scrap-booker), which uses the same approach: inline template + shared params + no separate child snippet.

See the updated `cloudcannon.config.yml` (tabs snippet) and the skill docs at `.cursor/skills/migrating-to-cloudcannon/snippets/raw.md` for the reference.
