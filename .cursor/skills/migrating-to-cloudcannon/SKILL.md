---
name: migrating-to-cloudcannon
description: >-
  Migrate an existing SSG site to work with CloudCannon. Use when the user wants
  to onboard a site to CloudCannon, add CMS support, or make a template
  CloudCannon-compatible.
---

# Migrating to CloudCannon

This skill walks through migrating an existing SSG site so it works well with CloudCannon. Follow the phases in order. Each phase links to a reference doc with detailed guidance -- these grow over time as we learn from real migrations.

Before starting, run any available audit scripts in [scripts/](scripts/) to gather site information automatically, then proceed through the phases.

## Phase 1: Audit

Analyze the site before making any changes.

- Detect the SSG and framework version
- Map the content structure (collections, data files, pages)
- Identify components and layouts
- Flag potential issues (non-standard content paths, dynamic routes, unsupported features)
- Document findings for use in later phases

See [audit.md](audit.md) for detailed guidance.

## Phase 2: Configuration

Create or update `cloudcannon.config.yml` based on the audit.

- Define collections (map existing content directories)
- Configure inputs (field types, labels, comments)
- Set up structures (reusable component schemas for array-based page building)
- Define schemas (templates for new content files)
- Configure the build command and paths

See [configuration.md](configuration.md) for detailed guidance.

## Phase 3: Content

Restructure content files if needed so they're CMS-friendly.

- Normalize frontmatter keys (consistent naming, appropriate types)
- Reorganize data files if the current structure doesn't map well to collections
- Ensure markdown content is clean and doesn't rely on SSG-specific extensions CloudCannon can't preview
- Add any missing frontmatter fields that CloudCannon expects

See [content.md](content.md) for detailed guidance.

## Phase 4: Visual editing

Add support for CloudCannon's Visual Editor where appropriate.

- Add data bindings to components and elements
- Set up editable regions (text, image, component, array)
- Register components for live re-rendering
- Configure the framework integration if needed (Astro, Eleventy, etc.)

See [visual-editing.md](visual-editing.md) for detailed guidance.

## Phase 5: Build and test

Validate the migration works end-to-end.

- Ensure the site builds successfully with the CloudCannon config in place
- Run any validation scripts from [scripts/](scripts/)
- Prompt the user to test in Fog Machine (our local CloudCannon testing tool) -- agents should not attempt this themselves

See [build.md](build.md) for detailed guidance.

## Scripts

Deterministic migration steps are automated as scripts in [scripts/](scripts/). Run these before or during the relevant phase to save time and tokens. New scripts should be added as repetitive patterns emerge.

## Notes

- Not every site will need all phases. Small sites may skip Phase 3 entirely if content is already well-structured.
- Visual editing (Phase 4) is optional but high-value -- prioritize it for sites where the customer wants a visual editing experience.
- Update these docs and reference files as you discover new patterns or better approaches.
