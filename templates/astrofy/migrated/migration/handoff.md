# Handoff — Astrofy Migration

> **Token budget**: The first migration pass used ~200k tokens. When this follow-up work is complete, prompt the user to:
> 1. Delete this handoff doc
> 2. Run stat tracking: `python3 scripts/transcript-metrics.py <transcript-uuid> astrofy --tokens <total>` where `<total>` includes both the ~200k from the first pass and the tokens used in this follow-up session

## Current state

The astrofy template has been migrated through all 5 phases (audit, configuration, content, visual editing, build). The build succeeds, all 16 pages generate, and `data-editable` attributes are present in the output. The migration was done on Astro 4 (legacy content collections) without the `editableRegions()` Astro integration, which requires Astro 5+.

Key files:
- `cloudcannon.config.yml` — full CC config with 3 collections, 5 structures, input config
- `src/content/pages/` — 4 content files (index, projects, services, cv) extracted from hardcoded pages
- `src/content/config.ts` — Zod schemas with `z.discriminatedUnion` on `_schema`
- `.cloudcannon/` — schemas, initial-site-settings, README
- `migration/` — audit, configuration, content, visual-editing, build notes

## Code fixes

### 1. Remove `source` from CC config

Verify no `source:` key exists in `cloudcannon.config.yml`. This is a monorepo-specific setting added manually by the user — agents should never add it. The previous agent added `source: templates/astrofy/migrated` but it was later removed; confirm it stays gone.

### 2. Clean Astro expression artifacts from content

`src/content/pages/index.md` line 19 has:

```yaml
projects_heading: 'My last projects {"</>"}'
```

Strip this to `My last projects`. Search all content files for `{"` patterns — these are Astro JSX expression artifacts that leaked from the original `.astro` templates during content extraction.

### 3. Nest text/image editables inside array items

Array items currently only have `data-editable="array-item"` but no nested text or image editables. Without nested editables, array items only get CRUD controls (add/remove/reorder) — no inline text editing or live visual updates. This is critical since we don't have component re-rendering on Astro 4, but it applies universally anyway.

**Homepage items array** (`src/pages/index.astro` lines 42-55): The `HorizontalCard` component inside each array item needs `data-editable="text" data-prop="title"`, `data-editable="image" data-prop-src="img"`, and `data-editable="text" data-prop="desc"` on the relevant elements. The best approach is to add these directly inside `src/components/HorizontalCard.astro` so all usages benefit.

**Projects and services** (`src/pages/projects.astro`, `src/pages/services.astro`): Same component, same fix.

**CV education and experience** (`src/pages/cv.astro`): The `TimeLineElement` component renders `title` and `subtitle` as plain text. Add `data-editable="text" data-prop="title"` on the `<h3>` and `data-editable="text" data-prop="subtitle"` on the `<span>` inside `src/components/cv/TimeLine.astro`. For the experience description (passed via slot), consider whether wrapping it with a text editable is feasible given slot semantics.

**CV skills** (`src/pages/cv.astro` lines 71-74): Each `<li>` is `data-editable="array-item"` but the skill text inside needs to be editable. Since skills are plain strings (not objects), this may require wrapping the text in a `<span data-editable="text">`.

**CV certifications**: Already has `data-editable="text" data-prop="text"` on the `<span>` — no change needed.

### 4. Fix hero description input type

`cloudcannon.config.yml` line 98-99 defines:

```yaml
description:
  type: textarea
```

The homepage hero description contains markdown (`**Astrofy**`). The visual editor renders it as rich text but the sidebar shows a plain textarea. Add a scoped input for `hero.description` set to `type: markdown` so the sidebar matches the visual editor. Example:

```yaml
hero.description:
  type: markdown
```

Or use `type: html` if markdown input doesn't round-trip well with the inline `set:html` rendering.

### 5. Add rebuild comment on style-only inputs

The `variant` select input (line 146) controls button styling. Without component re-rendering (Astro 4), changes to style fields don't update visually until a save and rebuild. Add a `comment` to these inputs:

```yaml
variant:
  type: select
  comment: Requires a save and rebuild to preview (Astro 4 limitation)
  options:
    values:
      - primary
      - outline
```

Apply the same pattern to `target` and any other fields that affect rendering but aren't covered by text/image editables.

### 6. Add object input config for `hero`

The `hero` object in the data editor has no icon or preview config. Add to `_inputs`:

```yaml
hero:
  type: object
  options:
    preview:
      icon: person
```

### 7. Consider Astro 5 upgrade

The previous agent should have asked the user upfront whether they wanted to upgrade from Astro 4 to Astro 5. This was a missed opportunity. Astro 5 would unlock:
- `editableRegions()` integration (component re-rendering)
- Modern content layer (`src/content.config.ts` with `glob()` loader)
- No reserved `slug` field in schemas
- `page.id` without `.md` extension

Ask the user now whether they want to upgrade. The Astro 4→5 migration guide is well-documented at https://docs.astro.build/en/guides/upgrade-to/v5/. If declined, the current Astro 4 setup works but with the limitations above.

## Skill doc updates

Each item below specifies the skill file and the addition needed.

### A. Ask about Astro upgrade during audit

**File**: `.cursor/skills/migrating-to-cloudcannon/astro/audit.md`

Add to the audit checklist: when a site is on Astro 4 or older, the agent should ask the user whether they want to upgrade to Astro 5+ before proceeding. Document the specific limitations of Astro 4: no `editableRegions()` integration, no component re-rendering, `slug` is a reserved field, `page.id` includes the file extension.

### B. Always nest editables inside array items

**File**: `.cursor/skills/migrating-to-cloudcannon/astro/visual-editing.md`

Strengthen the array item guidance: array items should ALWAYS have nested `data-editable="text"` / `data-editable="image"` on their key text and image fields. Without nested editables, array items only get CRUD controls — no inline text editing or live visual updates. This applies universally, not just when component re-rendering is unavailable. Text and image editables handle their own re-rendering independently of the component system.

### C. Phases are not rigid

**File**: `.cursor/skills/migrating-to-cloudcannon/SKILL.md`

Add a note that migration phases are guidelines, not rigid boundaries. Agents should feel free to modify files "outside their current phase" when needed. For example: updating CC config during the content or visual-editing phase, fixing content during configuration, etc. The phases exist to organize the work, not to restrict when changes can be made.

### D. Don't add `source` to CC config

**File**: `.cursor/skills/migrating-to-cloudcannon/astro/configuration.md`

Add a note that the `source` key in `cloudcannon.config.yml` should not be added by the agent. It's deployment-specific (used in monorepo setups) and should be left for the user to add manually based on their hosting configuration.

### E. Clean Astro template artifacts from extracted content

**File**: `.cursor/skills/migrating-to-cloudcannon/astro/content.md`

Add a check to the content review: when extracting hardcoded data from `.astro` templates into content frontmatter, watch for Astro JSX expression artifacts like `{""}`, `{"</>"}`, or similar. These are template syntax that makes no sense in YAML content. Strip them to plain text.

### F. Markdown inputs for rich text fields

**File**: `.cursor/skills/migrating-to-cloudcannon/astro/configuration.md`

Add guidance: when a frontmatter field contains markdown (e.g., a hero description with `**bold**` text), the CC input should be `type: markdown` or `type: html`, not `type: textarea`. Using `textarea` creates an inconsistent experience where the visual editor shows rich text but the sidebar shows plain text.

### G. Disclose past migration references

The previous agent referenced the `astroplate` migration during planning but did not explicitly disclose this to the user. Per project rules, agents must: (a) disclose that they referenced a past migration, (b) evaluate whether the pattern should be in skill docs, (c) ask or act. This rule is already in `project-context.mdc` — no new rule needed, but the handoff agent should be aware of the requirement.

## Previous agent disclosures

The first-pass agent referenced `templates/astroplate/migrated/` during the planning phase to learn patterns for:
- `z.union` / `z.discriminatedUnion` for pages collection
- `data_config` patterns
- Editable regions setup
- Migration note structure

This was not properly disclosed to the user. The follow-up agent does not need to reference past migrations for the remaining fixes — the feedback items above are self-contained.
