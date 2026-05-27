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

- `.artifacts/<feature>/plan/README.md` and `plan/phase-NN-*.md` files exist.
- Working branch is not `main`/`master`.

## What To Do

For each phase in order:

1. **Load phase context** — phase file, design docs, research, project standards.

2. **Spawn writer agent** — general-purpose subagent to produce code for this phase:
   - Reads phase file and files to modify
   - Writes production code
   - Runs any applicable checks
   - Reports: files changed, build status, test status

3. **Save reviewer reports** in `.artifacts/<feature>/reviews/phase-NN/`:
   - `architecture-review.md`
   - `security-review.md`
   - `plan-conformance-review.md`
   - `code-quality-review.md`
   - Include header: `<!-- feature: <slug> | phase: implement-NN | date: <date> | reviewer: <name> -->`

4. **Collect verdicts** — all pass → phase complete. Any fail → send writer back to fix (max 3 iterations).

5. **Run project quality checks** — linters, formatters, full build + tests.

6. **Commit code + reviews** — `git add -A && git commit -m "<feature>: phase NN — <phase-name>"`.

7. **Auto-advance** — proceed to next pending phase without human gate.

**Hard limits:** max 3 writer-review iterations per phase, max 25 tool calls per writer turn.
