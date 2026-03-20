# Astro Migration Guide

Guidance for migrating an Astro site to CloudCannon. Follow the phases in order. Before starting, run any available audit scripts in [../scripts/](../scripts/) to gather site information automatically.

## Astro scope

This guide covers Astro sites that use:

- Astro content collections (`src/content/` with `content.config.ts` or `src/content/config.ts`)
- `.astro` single-file components
- Static output (`output: "static"` -- the default)
- Islands architecture with optional framework integrations (React, Vue, Svelte via `client:*` directives)
- Vite as the build tool

Server-rendered Astro sites (`output: "server"` or `output: "hybrid"`) are not covered -- CloudCannon requires static output.

## Phases

### Phase 1: Audit

Analyze the site before making any changes. Map content collections, routing, components, and the build pipeline.

See [audit.md](audit.md).

### Phase 2: Configuration

Generate a baseline `cloudcannon.config.yml` using Gadget, then customize based on the audit findings.

See [configuration.md](configuration.md).

### Phase 3: Content

Review and restructure content files if needed so they work well in the CMS.

See [content.md](content.md).

### Phase 4: Visual editing

Add `@cloudcannon/editable-regions` for inline editing in CloudCannon's Visual Editor.

See [visual-editing.md](visual-editing.md). Also reference the core [editable regions overview](../editable-regions.md). Only read the [lifecycle docs](../editable-regions-lifecycle.md) if debugging unexpected editable region behavior.

### Phase 5: Build and test

Validate the migration works end-to-end and prompt the user to test in Fog Machine.

See [build.md](build.md).

## Notes

- Not every site needs all phases. Small sites may skip Phase 3 if content is already well-structured.
- Visual editing (Phase 4) is optional but high-value -- prioritize it for sites where the customer wants a visual editing experience.
- Template-specific findings go in `templates/<name>/migrated/migration/`, not in these docs.
