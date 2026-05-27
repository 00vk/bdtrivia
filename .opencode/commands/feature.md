---
description: "End-to-end pipeline orchestrator — runs research → design → plan → implement with AI-only validation"
---

# /feature — End-to-End Pipeline Orchestrator

**Purpose:** Run the four-phase pipeline (research → design → plan → implement) as a single conveyor without human gates.

## Usage

```
/feature <task description>          # first invocation — kicks off research
/feature <feature-slug>              # continues from last completed phase
/feature <feature-slug> --restart <phase>  # redo a phase from scratch
```

## Behaviour

1. **First invocation:** Derive feature slug from task description (kebab-case, 2–4 words). Confirm with user. Create `.artifacts/<feature>/state.json`.

2. **Continuation:** Read `state.json`. Identify next pending phase:
   - `phases_completed` empty → research
   - has `research` → design
   - has `research, design` → plan
   - has `research, design, plan` → implement
   - all four → feature complete

3. **Execute phase** — read and follow `.opencode/commands/<phase>.md` instructions.

4. **Auto-advance** — after each phase completes, immediately proceed to the next without stopping. Implement auto-advances through its sub-phases as well.

5. **Commit after each phase** — each phase command handles its own commit.

## State transitions

```
none → research → design → plan → implement → done
```

## What /feature does NOT do
- Does NOT wait for human review between phases
- Does NOT push or open PRs
