# Before Publishing

Things to resolve before shipping this tooling to external consumers. Update this list as new items surface during development.

- [ ] **Update gadget commands to use `npx`** -- Replace all bare `gadget` commands with `npx @cloudcannon/gadget` once the package is published. Affected files:
  - `.cursor/skills/migrating-to-cloudcannon/configuration.md`
  - `.cursor/skills/migrating-to-cloudcannon/gadget-guide.md`
  - `.cursor/skills/migrating-to-cloudcannon/SKILL.md`
  - `.cursor/rules/gadget.md`
- [ ] **Remove the `gadget.md` rule** -- The read-only rule at `.cursor/rules/gadget.md` exists because the gadget repo sits alongside agent-tooling during development. External consumers install gadget from npm and don't need this rule.
