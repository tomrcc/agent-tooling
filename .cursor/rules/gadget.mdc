---
description: Rules for using the Gadget CLI tool during migrations.
alwaysApply: true
---

## Gadget is read-only

The `gadget/` directory (sibling to `agent-tooling/`) contains the `@cloudcannon/gadget` CLI. We consume it as a tool -- never modify files inside `gadget/`. Do not create, edit, or delete any files in that repo, and do not make git commits or pushes there.

## Usage

Gadget is `npm link`ed locally so it's available as `gadget <subcommand>` from any project directory. Once the package is published, commands become `npx @cloudcannon/gadget <subcommand>`.

Key commands for migrations:

- `gadget detect-ssg` -- detect the SSG (JSON output)
- `gadget generate --auto --init-settings --ssg <key>` -- generate baseline config files
- `gadget generate --auto --json` -- get raw JSON for inspection

Always use `--auto` to avoid interactive prompts.
