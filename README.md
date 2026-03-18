# CloudCannon Agent Tooling

AI agent tooling for migrating existing SSG sites to [CloudCannon](https://cloudcannon.com) -- a git-based CMS.

This repo contains Cursor skills, rules, and scripts that teach AI agents how to take an existing static site and make it work well with CloudCannon. The goal is to package this tooling so it can be given to prospective customers, letting an AI agent guide them through onboarding.

## How it works

We develop the tooling by working through real site templates:

1. Pick an existing SSG template that has no CloudCannon knowledge
2. Add the untouched template to `templates/<name>/pristine/` and copy it to `templates/<name>/migrated/`
3. Use an AI agent (armed with our skills and rules) to migrate `migrated/`
4. Review the result and refine the skills, rules, and scripts based on what we learn

The skills and rules are **living documents** -- agents are expected to update them as they discover new patterns, edge cases, or better approaches.

## Repository structure

```
.cursor/
  rules/                              # Cross-cutting agent rules
    project-context.md                # Repo purpose and working philosophy (alwaysApply)
    tone.md                           # Agent tone and coding conventions (alwaysApply)
    testing.md                        # What agents vs. humans should test (alwaysApply)
    casing.md                         # Naming conventions (applyIntelligently)
    astro.md                          # Astro-specific patterns (applyIntelligently)
  skills/
    migrating-to-cloudcannon/         # Main migration workflow skill
      SKILL.md                        # Orchestrator -- 5-phase migration checklist
      audit.md                        # Phase 1: Analyze the site
      configuration.md                # Phase 2: cloudcannon.config.yml
      content.md                      # Phase 3: Restructure content
      visual-editing.md               # Phase 4: Visual editor support
      build.md                        # Phase 5: Build and validate
      editable-regions.md             # Reference: editable regions overview
      editable-regions-lifecycle.md   # Reference: lifecycle and core internals
      editable-regions-integrations.md # Reference: Astro and Eleventy integrations
      scripts/                        # Deterministic migration scripts (TBD)

templates/
  astroplate/
    pristine/                         # Untouched original (never modify)
    migrated/                         # Agent works here
```

## Key principles

**Scripts first**: Anything deterministic and repetitive should be a script, not an agent task. This saves tokens, improves consistency, and makes the process more predictable.

**Skills vs. rules vs. scripts**:
- **Rules** are cross-cutting conventions that agents should always or contextually know (naming, tone, testing approach)
- **Skills** are procedural workflows with ordered steps (the migration process)
- **Scripts** are standalone automation that skills can invoke

**Graduated structure**: Reference docs inside a skill start small and grow. When they exceed ~300 lines or need their own scripts, they get promoted to standalone skills. See `project-context.md` for the full set of graduation criteria.

## Getting started

### Prerequisites

- [Cursor](https://cursor.com) IDE with agent mode
- [Fog Machine](https://github.com/CloudCannon/fog-machine) for testing CloudCannon locally (human-operated, not for agents)

### Working on a template

1. Add the untouched template to `templates/<name>/pristine/`
2. Copy `pristine/` to `migrated/` (this is where the agent works)
3. Open the repo in Cursor and ask the agent to migrate `migrated/` -- it will pick up the `migrating-to-cloudcannon` skill automatically
4. As the agent works, review its changes and prompt it to update skills/rules if it discovers something new
5. To start fresh, delete `migrated/` and copy `pristine/` again

### Updating the tooling directly

The files in `.cursor/rules/` and `.cursor/skills/` are the primary output of this project. Edit them directly or let agents update them during migrations. The `project-context.md` rule describes the overall philosophy and growth strategy.

## Templates

| Template | SSG | Status |
|----------|-----|--------|
| [astroplate](templates/astroplate/) | Astro | Ready for migration |

## Current state

The tooling scaffolding is in place: migration skill with 5 phases and Gadget CLI integration. Astroplate's `pristine/` directory needs to be populated, then `migrated/` gets a copy to work on.
