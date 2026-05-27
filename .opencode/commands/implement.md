---
description: "Phase 4: Execute the plan one phase at a time — writer + parallel reviewers (architecture, security, plan-conformance, code quality)"
---

# /implement — Implementation Phase

**Purpose:** Phase 4 of the four-phase pipeline. Execute the plan one phase at a time.

## Usage

```
/implement <feature-slug>                # start from current pending phase
/implement <feature-slug> <phase-number> # start from specific phase
```

## Preconditions

- `plan/README.md` and `plan/phase-NN-*.md` files exist.
- Working branch is not `main`/`master`.

## What To Do

For each phase in order:

1. **Load phase context** — phase file, design docs, research, project standards.

2. **Spawn writer agent** — `@pipeline-research-worker` (or general agent) to produce code for this phase:
   - Reads phase file and files to modify
   - Writes production code and tests
   - Runs build + tests
   - Reports: files changed, build status, test status

3. **Spawn 4 reviewers in parallel** — invoke these subagents simultaneously:
   - `@pipeline-architecture-reviewer`
   - `@pipeline-security-reviewer`
   - `@pipeline-plan-conformance-reviewer`
   - `@pipeline-code-quality-reviewer`

4. **Collect verdicts** — all pass → phase complete. Any fail → send writer back to fix (max 3 iterations).

5. **Run project quality checks** — linters, formatters, full build + tests.

6. **Stop between phases** — report results and wait for user to continue.

**Hard limits:** max 3 writer-review iterations per phase, max 25 tool calls per writer turn.

**Do NOT auto-commit.** Let user review and commit manually.
