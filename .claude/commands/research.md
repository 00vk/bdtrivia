# /research — Codebase Research Phase

**Purpose:** Phase 1 of the four-phase pipeline (research → design → plan → implement).
Produce a fact-only snapshot of where relevant code lives, with file paths and line numbers,
so subsequent phases can work on a narrowed context.

## Usage

```
/research <task description>
/research <task description> <repo path>
/research feature=<feature-slug> <task description>
```

Examples:
- `/research Add user avatar upload to user service`
- `/research feature=user-avatar Add upload + S3 storage + crop on FE`
- `/research Add Stripe disputes /Users/viktor.kondratev/dev/caso/settlement/processor`

## Inputs

- **task description** — what we are trying to build / fix. Free-form text.
- **repo path** *(optional)* — absolute path to the repository root. Defaults to current working directory.
- **feature slug** *(optional)* — kebab-case slug. If absent, derive from task description and confirm with user before writing files.

## Artifact Layout

All artifacts live **outside** the repository under:
```
.artifacts/<feature-slug>/
```
- `repo-slug` = basename of `git rev-parse --show-toplevel` (or basename of repo path)
- `feature-slug` = kebab-case derived from task description (confirm with user if ambiguous)

This command writes:
```
.artifacts/<feature-slug>/
├── state.json
└── research.md
```

## What This Command Does

1. **Resolve paths**
   - Determine repo root (current dir or argument).
   - Determine feature-slug.
   - Create `.artifacts/<feature>/` if missing.
   - Write/update `state.json` with `phase: "research"`, `status: "in_progress"`.

2. **Decompose research into directions**
   Split the task into 3–6 research directions. Typical directions for a Klarna service:
   - **Architecture** — module layout, layering, clean-architecture boundaries
   - **Domain models** — entities, value objects, mapping (Rich vs Anemic models)
   - **API surface** — controllers, request/response models, OpenAPI specs
   - **Persistence** — storage models, repositories, migrations
   - **Integrations** — external HTTP/Kafka producers and consumers
   - **Tests** — existing test patterns, fixtures, integration test setup

   Pick only directions relevant to the task. Do not invent directions just to have more agents.

3. **Spawn parallel research workers**
   For each direction, spawn a `pipeline-research-worker` subagent in parallel.
   Each worker gets:
   - Repo root path
   - Task description
   - Its assigned direction
   - Strict instruction: facts only, with file paths and line numbers. No opinions. No refactor suggestions.

   Workers run with `run_in_background: false` (sequential collection) but launched in a **single message with multiple Task calls** so they execute in parallel.

4. **Compile the research document**
   Once all workers return, the lead agent (this command) compiles a single `research.md`:
   - **Title** — task summary
   - **Scope** — repo, feature slug, date
   - **Existing functionality** — what is already there that is relevant
   - **One section per research direction** — facts + file paths + line numbers
   - **Cross-references** — explicit pointers between layers (e.g., "controller → use case → repository chain")
   - **Open questions** — only factual gaps (e.g., "no existing endpoint for X", not "we should add Y")

   **Rules for `research.md`:**
   - Facts only, no opinions
   - No "we should refactor X" / "this could be better"
   - No code generation — only references to existing code
   - Every claim about the codebase must reference a file path and ideally line numbers

5. **Update state**
   - Mark `state.json`: `phase: "research"`, `status: "complete"`, set `research_completed_at`.
   - Print a short summary to the user with the artifact path.

## State File Schema

`state.json`:
```json
{
  "feature": "user-avatar",
  "repo": "user-service",
  "repo_path": "/Users/.../user-service",
  "task_description": "Add user avatar upload to user service",
  "phase": "research",
  "status": "complete",
  "phases_completed": ["research"],
  "created_at": "2026-05-27T10:00:00Z",
  "updated_at": "2026-05-27T10:15:00Z",
  "research_completed_at": "2026-05-27T10:15:00Z"
}
```

## Parameters for Subagent Task Calls

For each research direction, launch:
```
subagent_type: "general-purpose"
description: "Research <direction> for <feature>"
prompt: "Read ~/.claude/agents/pipeline-research-worker.md and follow its instructions.

Repo path: <repo_path>
Task: <task_description>
Direction: <direction_name>

<direction-specific guidance, e.g., for 'Architecture': 'Map the module layout, identify the architectural style (clean architecture, hexagonal, layered), list main packages and their responsibilities. Reference exact file paths.'>

Output ONLY facts with file paths and line numbers. No opinions, no suggestions.
Return the result as a Markdown section ready to paste into the final research.md."
```

## Output to User

After research completes, print:
```
Research complete: .artifacts/<repo>/<feature>/research.md

Summary:
- <N> directions explored
- <M> files referenced
- <K> open questions

Next: review research.md, then run `/design <feature-slug>` to proceed.
```

## Important Notes

- **Clean context per fresh invocation.** Each `/research` run starts a new context. Subagents also get clean contexts.
- **No code modification.** This command never writes to the repo. Only to `.artifacts/`.
- **Facts only.** If you find yourself writing "we should" or "it would be better", stop and reword as fact.
- **Feature slug stability.** Once chosen, the feature slug is reused for all subsequent phases. Confirm with user before writing.
- **Idempotent.** Running `/research` again with the same feature slug overwrites the previous `research.md` after confirming with the user.
- **Repo detection.** If not in a git repo and no path is given, ask the user to provide one. Do not guess.

## Failure Modes

- **Working directory is not a git repo and no path given** → ask user for repo path.
- **Feature slug collision** (artifact dir already exists with different task description) → show existing state, ask user whether to overwrite, resume, or choose a different slug.
- **All subagents failed** → report which directions failed, ask user whether to retry, skip, or abort.
