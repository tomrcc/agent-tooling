# Configuration

Guidance for creating and configuring `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json`.

## Baseline generation with Gadget

Use the Gadget CLI to generate a baseline configuration from the project's file structure. Gadget detects the SSG, discovers collections, and produces config files that work out of the box. See [gadget-guide.md](gadget-guide.md) for the full CLI reference.

### Quick path

From the target project root, run:

```bash
gadget generate --auto --init-settings
```

This produces both `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` with sensible defaults based on file detection.

### Step-by-step path (recommended for migrations)

When migrating a template, running subcommands individually lets you cross-reference Gadget's output against your Phase 1 audit before committing to the generated config.

1. **Detect the SSG** and confirm it matches the audit:

   ```bash
   gadget detect-ssg
   ```

2. **Inspect detected collections** and compare against the content structure from the audit:

   ```bash
   gadget collections --ssg <key>
   ```

   Review the `suggested: true/false` flags. Collections the audit identified but Gadget missed (or vice versa) should be noted for manual adjustment.

3. **Review build suggestions** and compare against the audit's build pipeline findings:

   ```bash
   gadget build --ssg <key>
   ```

4. **Generate the config** using the confirmed SSG key:

   ```bash
   gadget generate --auto --init-settings --ssg <key>
   ```

   Or to get raw JSON for inspection before writing files:

   ```bash
   gadget generate --auto --json --ssg <key>
   ```

## Review the generated config

After generation, read `cloudcannon.config.yml` and check:

- **`source`** -- does it match the project's source directory from the audit?
- **`collections_config`** -- are all expected collections present? Are paths correct?
- **`paths`** -- are static asset and upload paths right for this SSG?
- **Build settings** (in `.cloudcannon/initial-site-settings.json`) -- do the install command, build command, and output path match what the audit found?

## Customize the config

Gadget produces a structural baseline. The following customizations are almost always needed after generation, informed by the Phase 1 audit:

- **`_inputs`** -- configure how fields appear in the editor (dropdowns, date pickers, image uploaders, comments, hidden fields). Map these from the frontmatter schemas discovered in the audit.
- **`_structures`** -- define reusable component structures for array-based page building. Derive these from the component inventory in the audit.
- **`collection_groups`** -- organize collections into sidebar groups for a clean editing experience.
- **`_editables`** -- configure rich text editor toolbars per collection or globally.
- **`_snippets_imports`** -- add snippet support for the SSG's component syntax (e.g., Astro components, Hugo shortcodes).
- **`_select_data`** -- define shared dropdown options for fields used across collections.
- **Schemas** -- define templates for creating new content files, based on the content patterns found in the audit.

The full set of configuration keys is defined in the [CloudCannon Configuration JSON Schema](https://raw.githubusercontent.com/CloudCannon/configuration-types/main/cloudcannon-config.schema.json). Generated files include a schema reference that provides IDE autocomplete and validation -- preserve these references when editing.

## Patterns and gotchas

This section will grow as we complete more migrations. Document template-specific configuration findings in the template's own `migration/configuration.md`, not here.

> **Note:** Commands use `gadget` directly (via `npm link` during development). Once the package is published, these become `npx @cloudcannon/gadget` instead.
