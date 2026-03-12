# Visual Editing

Guidance for adding CloudCannon Visual Editor support.

This doc will be filled in as we work through real template migrations. Expected topics:

- Adding data bindings to elements and components
- Editable region types (text, image, component, array) and when to use each
- Registering components for live re-rendering
- Framework-specific integration setup (Astro, Eleventy, etc.)

## Editable regions reference

Detailed documentation on the `@cloudcannon/editable-regions` library is split across three files:

- [editable-regions.md](editable-regions.md) — Overview, region types, path syntax, API actions, file map
- [editable-regions-lifecycle.md](editable-regions-lifecycle.md) — Full lifecycle trace, core internals, data flow diagram
- [editable-regions-integrations.md](editable-regions-integrations.md) — Astro and Eleventy/Liquid framework integrations
