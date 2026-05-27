---
description: "End-to-end pipeline orchestrator — runs research → design → plan → implement, stopping after each phase for human review"
---

# /feature — End-to-End Pipeline Orchestrator

**Purpose:** Run the four-phase pipeline (research → design → plan → implement) as a single conveyor, stopping after each phase for human review.

## Usage

```
/feature <task description>          # first invocation — kicks off research
/feature <feature-slug>              # subsequent — advances one phase
/feature <feature-slug> --auto       # auto-advance through remaining phases
/feature <feature-slug> --restart <phase>  # redo a phase from scratch
```

## Behaviour

### Default mode — stop after each phase

1. **First invocation:** Derive feature slug from task description (kebab-case, 2–4 words). Confirm with user. Create `~/dev/ai-artifacts/<repo>/<feature>/state.json`.

2. **Continuation:** Read `state.json`. Identify next pending phase:
   - `phases_completed` empty → research
   - has `research` → design
   - has `research, design` → plan
   - has `research, design, plan` → implement
   - all four → feature complete

3. **Execute phase** — read and follow `.opencode/commands/<phase>.md` instructions.

4. **Stop after phase completes** — show what was produced, what to review, command to continue (`/feature <slug>`).

### `--auto` mode

After completing one phase, immediately proceed to the next without stopping.

### `--restart <phase>` mode

Wipe artifacts from `<phase>` onwards and rerun from scratch.

## State transitions

```
none → research → design → plan → implement → done
```

## What /feature does NOT do
- Does NOT skip review (stops after every phase by default)
- Does NOT commit code (manual via `/commit`)
- Does NOT push or open PRs
