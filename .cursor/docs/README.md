# Deep-Dive Documentation

Reference documentation for CloudCannon's live editing system. These are detailed, token-heavy docs -- read only the specific file you need, not the whole directory.

The skill files in `.cursor/skills/migrating-to-cloudcannon/` contain all the guidance needed for typical migrations. Only consult these docs when you need deeper understanding of internals, the JavaScript API, or are debugging unexpected behaviour.

## Editable Regions (library internals)

| File | Lines | What it covers |
|---|---|---|
| [editable-regions-overview.md](editable-regions-overview.md) | ~170 | Architecture layers, full lifecycle trace of a text editable region |
| [editable-regions-core-and-types.md](editable-regions-core-and-types.md) | ~130 | Hydration engine, Editable base class, path resolution, event bus, all region types |
| [editable-regions-framework-integrations.md](editable-regions-framework-integrations.md) | ~130 | Astro and Eleventy integration internals, comparison table |
| [editable-regions-data-flow.md](editable-regions-data-flow.md) | ~160 | Full data flow diagram (build → page load → live editing), API actions, file map |

## CloudCannon JavaScript API

| File | Lines | What it covers |
|---|---|---|
| [cloudcannon-api-reference.md](cloudcannon-api-reference.md) | ~230 | API overview, connecting to the API, files/collections/datasets, read/write operations |
| [cloudcannon-api-editors.md](cloudcannon-api-editors.md) | ~140 | `createTextEditableRegion` and `createCustomDataPanel` — signatures, usage, critical behaviours |
| [cloudcannon-api-html-attributes.md](cloudcannon-api-html-attributes.md) | ~120 | All `data-editable` attributes, `data-prop` path forms, custom elements, usage examples |
| [cloudcannon-api-data-flow.md](cloudcannon-api-data-flow.md) | ~110 | Data up/down flow, hydration engine, MutationObserver, parent-child listener tree |
| [cloudcannon-api-config-and-quirks.md](cloudcannon-api-config-and-quirks.md) | ~200 | Framework integrations overview, `cloudcannon.config.yml` API settings, all known quirks |
