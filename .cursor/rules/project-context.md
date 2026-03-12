---
description: What this repo is, how we work in it, and how our tooling should grow over time.
alwaysApply: true
---

## Purpose

This repo develops agent tooling (skills, rules, scripts) that helps customers onboard existing SSG sites to CloudCannon -- a git-based CMS. The tooling is designed to be given to prospective customers so AI agents can assist with the migration.

## How we work

We pick existing site templates that have no knowledge of CloudCannon, use agents to migrate them, and refine our skills/rules/scripts along the way. Migrated templates accumulate in `templates/`.

**Scripts first**: Use scripts for any migration step that is deterministic and repetitive. Reserve AI agents for judgment calls. The fewer places we need an agent, the better -- it saves tokens and improves consistency.

**Living documents**: Skills, rules, and reference docs are actively maintained. Agents should update them when they discover new patterns, edge cases, or better approaches during a migration. Don't treat them as read-only.

## Skills vs. rules vs. scripts

- **Rules** (`alwaysApply` / `applyIntelligently`): Cross-cutting conventions and knowledge that agents should always or contextually know. Not procedural.
- **Skills**: Procedural workflows triggered by user intent. "How to do X" with ordered steps, decision trees, and checklists.
- **Scripts**: Deterministic automation that lives alongside the skill that uses it. Saves tokens, improves consistency.

## When to split a reference doc into its own skill

Reference docs inside a skill directory should be promoted to standalone skills when any of these apply:

1. The doc exceeds ~300 lines
2. It needs its own scripts directory
3. It should be independently triggerable (useful outside the parent skill's workflow)
4. An SSG-specific section within it exceeds ~100 lines

## SSG-specific knowledge

Start with inline sections within phase docs (e.g. "For Astro: ..."). Graduate to separate reference files when a second SSG is added or sections become crowded.
