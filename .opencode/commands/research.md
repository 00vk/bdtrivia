---
description: "Phase 1: Codebase research — produce fact-only snapshot with file paths and line numbers"
---

# /research — Codebase Research Phase

**Purpose:** Phase 1 of the four-phase pipeline (research → design → plan → implement).
Produce a fact-only snapshot of where relevant code lives, with file paths and line numbers.

## Usage

```
/research <task description>
/research <task description> <repo path>
```

## What To Do

1. **Resolve paths** — determine repo root, derive repo-slug and feature-slug, create artifact directory `~/dev/ai-artifacts/<repo>/<feature>/`.

2. **Decompose research into directions** — split the task into 3–6 research directions (architecture, domain models, API surface, persistence, integrations, tests).

3. **Spawn parallel research workers** — for each direction, invoke `@pipeline-research-worker` subagent in parallel. Each worker gets: repo path, task description, direction, and strict instruction: facts only with file paths and line numbers.

4. **Compile the research document** — once all workers return, compile a single `research.md` with sections: title, scope, existing functionality, one section per direction, cross-references, open questions.

5. **Rules for research.md:**
   - Facts only, no opinions
   - No "we should refactor X"
   - No code generation — only references to existing code
   - Every claim must reference a file path with line numbers

6. **Output** artifact path and summary to user. Next step: `/design <feature-slug>`.
