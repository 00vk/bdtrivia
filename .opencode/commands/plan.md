---
description: "Phase 3: Implementation plan — break design into sequential, self-contained phases"
---

# /plan — Implementation Plan Phase

**Purpose:** Phase 3 of the four-phase pipeline. Take the approved design and break it into sequential implementation phases.

## Usage

```
/plan <feature-slug>
```

## Preconditions

- `research.md` and `design/architecture.md` exist.

## What To Do

1. **Load context** — read `research.md`, all `design/*.md` files, and project standards.

2. **Decompose into phases** — identify natural breakpoints. Each phase MUST be:
   - Committable in isolation (code compiles, tests pass)
   - Reviewable in under 30 minutes (<500 LOC)
   - Bounded by clear inputs and outputs

   Typical phase order: domain model → boundaries → external adapters → persistence → use cases → controller → wiring → integration tests.

3. **Write artifacts** in `~/dev/ai-artifacts/<repo>/<feature>/plan/`:
   - `README.md` — feature summary, phase index, acceptance criteria
   - `phase-NN-<name>.md` per phase with: goal, inputs, outputs (exact file paths), implementation steps, tests, quality gates, out-of-scope

4. **Standards check** — verify dependency direction, no phase relies on later phases, file paths match project structure.

5. **Output** plan summary to user. Next step: `/implement <feature-slug>`.
