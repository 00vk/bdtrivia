# Pipeline-Mandatory Rule

**Severity: HARD REQUIREMENT — cannot be overridden.**

## No Direct Edits

You MUST NOT make any code changes directly. Every single modification to any file in this repository MUST go through the `/feature` pipeline:

1. Research — codebase analysis
2. Design — architecture, data-flow, sequences
3. Plan — ordered implementation steps
4. Implement — writer + 4 parallel reviewers (architecture, security, plan-conformance, code-quality)

## Pipeline Before Everything

- When the user asks for ANY change, start with `/feature <task description>`
- Do not edit files, do not write code, do not suggest patches outside the pipeline
- The only exception is creating/updating pipeline config files themselves (`.opencode/`, `.claude/`, `AGENTS.md`, `opencode.json`)

## GitHub Issue Required

Before starting ANY feature, create a GitHub issue for it:
- `gh issue create --title "<feature slug>: <brief description>" --body "via pipeline"`
- The issue MUST be created in phase 1 (Research) before anything else
- The issue number MUST be referenced in the feature's `state.json`
- After implementation completes, add a comment to the issue: `gh issue comment <number> --body "Implemented in <commit hash>"`

## Artifacts

All pipeline outputs MUST be written to `.artifacts/<feature-slug>/` and committed. No exceptions.

## HARD RULE: Source File Freeze Outside Implement Phase

Only the implement phase (writer agent) may create or modify source files.

**Research, design, and plan agents are STRICTLY FORBIDDEN** from creating or modifying any file outside `.artifacts/<feature>/`. This includes but is not limited to:

- `index.html`
- `css/*.css`
- `js/*.js`
- Any other `.html`, `.css`, `.js`, `.json` (outside `.artifacts/`) files

**If source files already exist** (e.g., orphaned module files from a previous attempt), the research phase MUST:
1. Report their existence as a fact in `research.md`
2. **NOT modify or delete them**
3. Leave them for the implement phase to handle

Violation: any agent creating or modifying source files outside implement phase is a pipeline violation.

## Verification

After every pipeline run, verify that:
- All 4 phases completed
- Artifacts exist (research, design, plan, reviews)
- GitHub issue was created and referenced in state.json
- Code was committed
