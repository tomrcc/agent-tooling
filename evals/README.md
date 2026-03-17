# Skill Evals

Automated grading for agent skill output. Run a grader against a directory to score how well the agent followed a skill.

## How it works

1. Run the agent manually in Cursor against a template.
2. Run the grader against the template directory to score the result.

```
Run agent in Cursor ──► Migrated template directory ──► Grader ──► Score
```

**Tasks** define what to evaluate: a prompt for the agent and structured success criteria. **Graders** score the result with deterministic checks (file exists, valid YAML, schema validation) against the target directory.

## Usage

```bash
cd evals
npm install
npx tsx run-grader.ts <task> <target-dir>
```

Example — grade the astroplate config generation:

```bash
npx tsx run-grader.ts config-generation ../templates/astroplate/migrated
```

## Directory structure

```
evals/
├── run-grader.ts                     # CLI entry point
├── graders/
│   └── config-generation.ts          # Phase 2 deterministic checks
├── tasks/
│   └── config-generation/
│       ├── prompt.md                 # Paste into Cursor to run the eval
│       └── expectations.yaml         # Per-template success criteria
└── results/                          # Gitignored, scored results
```

## Adding a new eval

1. Create a task directory under `tasks/` with a `prompt.md` and `expectations.yaml`.
2. Create a grader in `graders/` that exports `{ name, grade(targetDir, expectations) }`.
3. Register the grader in `run-grader.ts`.
4. Validate it against a known-good template first.

## Design decisions

- **Graders only look at directory state.** No dependency on how the agent ran -- just check what it produced.
- **Deterministic checks first.** LLM rubrics are expensive and non-deterministic. Only add them when file/schema checks can't express the criterion.
- **One task per phase.** Narrow scope makes failures easier to diagnose.
