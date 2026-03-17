---
description: How and when to develop evals for agent skills.
alwaysApply: true
---

## What evals are

Evals are automated checks that grade the output of an agent skill. They answer: "did the skill produce the right result?" Evals live in `evals/` and are developed alongside skills, not after.

## When to write evals

- When adding a new skill phase or capability, write at least one eval for it.
- When a skill change fixes a failure mode, capture that failure as an eval case so it doesn't regress.
- When a migration reveals a gap (e.g. missing file, wrong config key), add it to the relevant task's expectations.

## How to write evals

- **Deterministic first**: file existence, YAML/JSON validity, schema validation, build success. These are fast, free, and reproducible. Only add LLM rubrics when deterministic checks can't express the criterion.
- **Grade outcomes, not steps**: check that the config file is correct, not that the agent ran a specific command. Agents find creative solutions -- that's the point.
- **Narrow scope**: each eval tests one phase or capability, not the whole migration. This makes failures easier to diagnose.
- **Known-good references**: use existing migrated templates as baselines to validate graders themselves. If a grader fails against a known-good template, the grader is wrong.

## Running evals

Always run migrations against `templates/<name>/migrated/`, never `pristine/`. Grade `migrated/` after the agent finishes:

```bash
cd evals && npx tsx run-grader.ts <task> ../templates/<name>/migrated
```

To start fresh, delete `migrated/` and copy `pristine/` again. Graders only look at directory state, so they don't care how the agent ran. If we ever need automated multi-trial runs (e.g. for CI or pass@k metrics), we can add a runner script later -- but it's not needed for our current dev workflow.
