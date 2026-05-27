# /feature — End-to-End Pipeline Orchestrator

**Purpose:** Run the four-phase pipeline (research → design → plan → implement) as a single
conveyor, **stopping after each phase** for human review. State is tracked in `state.json`,
so the next invocation continues from where the previous one stopped.

This command is a thin orchestrator. It does not duplicate logic — it reads the relevant
phase command file (`research.md`, `design.md`, `plan.md`, `implement.md`) and follows its
instructions in the current context.

## Usage

```
/feature <task description>            # first invocation — kicks off research
/feature <feature-slug>                # subsequent — advances one phase
/feature <feature-slug> --auto         # auto-advance through remaining phases (no stops)
/feature <feature-slug> --restart <phase>   # redo a phase from scratch
/feature <feature-slug> --stop-at <phase>   # advance until <phase> completes, then stop
```

Phase names for flags: `research`, `design`, `plan`, `implement`.

## Behaviour

### Default mode — auto-advance through phases

1. Determine feature slug:
   - If the argument is a task description (multi-word, contains spaces or punctuation suggesting prose), this is a first invocation:
     - Derive feature slug from the description (kebab-case, 2–4 words). Confirm with user before writing.
     - Determine repo slug from current working directory's git root.
     - Create `.artifacts/<repo>/<feature>/state.json` with initial state.
   - If the argument is a kebab-case slug that already has an artifact directory: this is a continuation. Load `state.json`.

2. Read `state.json`. Identify the next pending phase:
   - `phases_completed` empty → next is `research`
   - `phases_completed` has `research` → next is `design`
   - `phases_completed` has `research, design` → next is `plan`
   - `phases_completed` has `research, design, plan` → next is `implement`
   - All four done → feature is complete; print summary and exit.

3. Execute the next phase:
   - Read `~/.claude/commands/<phase>.md` and follow its instructions in the current context.
   - Use the feature slug already resolved (do not re-prompt for it).
   - Pass through any flags relevant to the phase command.

4. **Auto-advance** — after phase completes, immediately proceed to next phase. Implement auto-advances through its sub-phases as well.

5. **Commit after each phase** — each sub-command handles its own commit.

### `--stop-at <phase>` mode

Advance phase by phase until the named phase completes, then stop.
Example: `/feature user-avatar --stop-at design` runs research and design, stops after design is written.

### `--restart <phase>` mode

Wipe artifacts from `<phase>` onwards, set `state.json` back to the prior phase being the last completed, and run `<phase>` again from scratch.
Use when a phase produced something you want fully regenerated rather than hand-edited.

## State Transitions

```
none → research → design → plan → implement → done
```

`state.json` keeps:
- `feature`, `repo`, `repo_path`, `task_description`
- `phases_completed` (ordered array)
- `phase` (current or last)
- `created_at`, `updated_at`, `<phase>_completed_at` per phase

## Soft Failure Limits

When a phase command reports a failure (e.g., design self-conformance check fails, or `/implement` reports blocked phase), the orchestrator does **not** silently retry across phases. It stops, surfaces the structured failure to the user, and waits for direction.

Within a phase, the existing limits apply (set in each phase's command file):
- `/research` — subagents can fail individually; orchestrator reports and asks how to proceed.
- `/design` — may regenerate once if its own standards-conformance section flags a hard miss (max 2 attempts).
- `/plan` — may regenerate once if its standards check fails (max 2 attempts).
- `/implement` — already has writer-review loop with max 3 iterations per sub-phase.

If any per-phase limit is hit, `/feature` stops regardless of mode (including `--auto`).

## What `/feature` does NOT do

- **Does not wait for human review.** All validation is AI-driven between phases.
- **Does not push or open PRs.**
- **Does not delete artifacts.** `--restart <phase>` overwrites artifacts of that phase onwards, but does not touch earlier phases.
- **Does not delete artifacts.** `--restart <phase>` overwrites artifacts of that phase onwards, but does not touch earlier phases.

## AI-driven validation

All phases validate internally via AI agents:
- Design runs a standards conformance self-check
- Plan validates dependency direction and file path accuracy
- Implement runs 4 parallel reviewers (architecture, security, plan-conformance, code quality)
- Max 3 iterations per phase before escalation

No human gates — AI agents handle review loops. Results are committed to `.artifacts/<feature>/reviews/`.

## Output to user (per phase completion)

After running a phase, print:

```
Phase <name> complete for feature: <slug>
Repo: <repo>
Artifact: <path or directory written>

Phases completed: [<list>]
Next phase: <next> (or "all phases complete")

Review:
- <file 1>
- <file 2>
- ...

Continue: /feature <slug>
Regenerate this phase: /feature <slug> --restart <phase>
```

On failure within a phase:

```
Phase <name> failed for feature: <slug>

Reason: <structured failure from phase command>
Files touched: <list, if any>

Suggested next steps:
- Inspect <artifact>
- Edit manually or run /feature <slug> --restart <phase>
```

## Implementation Notes (for the assistant executing this command)

1. **Argument parsing.**
   - If argument matches kebab-case `[a-z0-9-]+` and a directory exists at `.artifacts/*/{arg}/` — treat as feature slug, continuation.
   - Otherwise treat as task description, derive slug, ask user to confirm slug before creating directory.

2. **Feature slug ambiguity across repos.**
   If the same feature slug exists under multiple repo directories, ask the user which one (default to the one matching the current working directory's git root).

3. **State file is the source of truth.** Do not infer phase position from artifact existence alone — always check `state.json`.

4. **Reading phase command files.**
   When delegating to a phase, read `~/.claude/commands/<phase>.md` and follow its instructions, substituting the feature slug. Do not re-prompt for the feature slug.

5. **Auto-advance scope.**
   `--auto` from `/feature` advances between `/feature`'s phases. It does NOT automatically propagate into `/implement`'s sub-phase loop unless explicitly indicated.

6. **No silent retries across phases.**
   If a phase command reports failure, stop and surface to user. Do not try a different approach or rerun the phase without user input.
