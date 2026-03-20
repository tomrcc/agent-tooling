---
name: migrating-to-cloudcannon
description: >-
  Migrate an existing SSG site to work with CloudCannon. Use when the user wants
  to onboard a site to CloudCannon, add CMS support, or make a template
  CloudCannon-compatible.
---

# Migrating to CloudCannon

This skill walks through migrating an existing SSG site so it works well with CloudCannon. The migration follows five phases, with SSG-specific guidance for each.

## Supported SSGs

| SSG | Guide |
|---|---|
| Astro | [astro/overview.md](astro/overview.md) |

## Step 1: Detect the SSG

Before starting, identify the SSG. Run from the project root:

```bash
gadget detect-ssg
```

This returns the detected SSG and confidence scores. Use the result to select the correct SSG guide above.

## Migration phases (summary)

Each SSG guide walks through these phases in order with SSG-specific instructions:

1. **Audit** -- Analyze the site's content structure, components, routing, and build pipeline before making changes.
2. **Configuration** -- Generate a baseline `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` using Gadget, then customize.
3. **Content** -- Restructure content files if needed so they're CMS-friendly.
4. **Visual editing** -- Add support for CloudCannon's Visual Editor with editable regions.
5. **Build and test** -- Validate the migration works end-to-end.

Not every site needs all phases. Small sites may skip Phase 3 if content is already well-structured. Visual editing (Phase 4) is optional but high-value.

## Scripts

Deterministic migration steps are automated as scripts in [scripts/](scripts/). Run these before or during the relevant phase to save time and tokens. New scripts should be added as repetitive patterns emerge.

## Migration output

Each template has two directories: `templates/<name>/pristine/` (the untouched original -- never modify this) and `templates/<name>/migrated/` (where the agent works). Always run migrations against `migrated/`, which starts as a copy of `pristine/`.

Store migration notes in `templates/<name>/migrated/migration/`, with one file per phase (`audit.md`, `content.md`, `configuration.md`, `visual-editing.md`, `build.md`). Phase docs in SSG-specific directories contain only generic guidance -- template-specific findings go in the template's migration directory.

## Notes

- Update these docs and reference files as you discover new patterns or better approaches.
- When adding support for a new SSG, create a new directory (e.g. `hugo/`) with the same file structure as `astro/`.
