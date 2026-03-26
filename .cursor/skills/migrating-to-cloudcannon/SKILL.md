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
2. **Configuration** -- Generate a baseline `cloudcannon.config.yml` and `.cloudcannon/initial-site-settings.json` using Gadget, then customize. Includes snippet configuration for sites using MDX/shortcode components in content (see [snippets.md](snippets.md)).
3. **Content** -- Restructure content files if needed so they're CMS-friendly.
4. **Visual editing** -- Add support for CloudCannon's Visual Editor with editable regions.
5. **Build and test** -- Validate the migration works end-to-end.

Not every site needs all phases. Small sites may skip Phase 3 if content is already well-structured. Visual editing (Phase 4) is optional but high-value.

## Scripts

Deterministic migration steps are automated as scripts in [scripts/](scripts/). Run these before or during the relevant phase to save time and tokens. New scripts should be added as repetitive patterns emerge.

## Migration notes

Store per-phase migration notes alongside the project (e.g. in a `migration/` directory), with one file per phase (`audit.md`, `content.md`, `configuration.md`, `visual-editing.md`, `build.md`). Phase docs in SSG-specific directories contain only generic guidance -- project-specific findings go in the project's migration notes.

## Adding a new SSG

Create a new directory (e.g. `hugo/`) with the same file structure as `astro/` and add it to the supported SSGs table above.
