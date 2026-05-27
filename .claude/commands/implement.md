# /implement — Implementation Phase

**Purpose:** Phase 4 of the four-phase pipeline. Execute the plan one phase at a time.
For each phase, run a team of subagents: writer + parallel reviewers (architecture, security,
plan-conformance, code quality). Block phase completion until all reviewers approve.

## Usage

```
/implement <feature-slug>                # start from current pending phase
/implement <feature-slug> <phase-number> # start (or restart) from specific phase
/implement <feature-slug> --phase 3      # alternative phase syntax
```

Examples:
```
/implement user-avatar         # start at first pending phase
/implement user-avatar 3       # start from phase 3
```

## Inputs

- **feature-slug** — kebab-case slug. Required.
- **phase number** *(optional)* — start at this phase, overriding `state.json`.

## Preconditions

- `plan/README.md` and `plan/phase-NN-*.md` files exist.
- `state.json` has `implementation_phases` array.
- Working directory is the repo identified in `state.json` (or user confirms when not).
- Working branch is not `main`/`master` — apply branch-protection rule from `~/.claude/rules/git-and-commits.md`. If on `main`/`master`, stop and ask user to choose a feature branch name.

## What This Command Does

For each phase in order, do the following:

1. **Load phase context**
   Open a clean context with:
   - The specific phase file (`plan/phase-NN-*.md`)
   - `design/architecture.md`, `design/sequence.md` (relevant ones)
   - `research.md` references to existing files
   - Project standards (same set as `/plan`)
   - Outputs of previous phases (file paths from earlier `state.json` entries)

2. **Spawn the writer agent**
   Single `general-purpose` subagent that produces the code for this phase.
   The writer:
   - Reads phase file
   - Reads/inspects files it will modify
   - Writes/edits production code
   - Writes/edits tests
   - Runs build + tests at the end of its turn
   - Reports back: list of files changed, build status, test status, any blockers

3. **Spawn reviewer agents in parallel**
   After the writer completes, launch **four reviewers in a single message with four Task calls** (so they run in parallel):
   - `pipeline-architecture-reviewer` — checks against project architecture standards
   - `pipeline-security-reviewer` — security gate (secrets, injection, authn/authz)
   - `pipeline-plan-conformance-reviewer` — checks implementation matches the phase file (no scope creep, no scope gap)
   - `pipeline-code-quality-reviewer` — linters, complexity, naming, dead code

   Each reviewer gets:
   - The phase file
   - The list of files the writer changed (with paths)
   - Relevant project standards
   - Strict instruction: produce a verdict (`pass` / `fail`) plus a list of issues with file:line references for fails

4. **Save reviewer reports** in `.artifacts/<feature>/reviews/phase-NN/`:
   - `architecture-review.md`
   - `security-review.md`
   - `plan-conformance-review.md`
   - `code-quality-review.md`
   - Each file includes header: `<!-- feature: <slug> | phase: implement-NN | date: <date> | reviewer: <name> -->`

5. **Collect reviewer verdicts**
   - All four reviewers pass → phase is complete.
   - Any reviewer fails → collect all failures, send the writer back to fix them. Loop.
   - **Hard limits** to prevent runaway:
     - Max 3 writer-review iterations per phase. After that, stop and report failure.
     - Max 25 tool calls per writer turn within a phase.
     - If iteration limit hit, report structured failure (not silently continue).

6. **Run project quality checks**
   After reviewers pass, run project-native checks (read from `<repo>/CLAUDE.md` or default):
   - Java/Gradle: `./gradlew spotlessApply && ./gradlew build && ./gradlew test integrationTest`
   - Go: `go build ./... && go test ./...`
   - Node/TS: `npm run lint && npm test && npm run build` (or the project's equivalent)

   If any of these fail, the writer is sent back to fix. Do NOT commit a phase with failing build/tests.

7. **Update state**
   - Mark `implementation_phases[N].status = "complete"`.
   - Add files changed to `implementation_phases[N].files_changed`.
   - Update `phase`, `updated_at`.

8. **Auto-advance** — after each phase completes, immediately proceed to the next pending phase. Reviewers handle validation. Still respect hard limits.

9. **Auto-commit** — after reviewers pass and quality checks pass, commit code + review reports: `git add -A && git commit -m "<feature>: phase NN — <phase-name>"`.

## Parameters for Subagent Task Calls

### Writer
```
subagent_type: "general-purpose"
description: "Implement phase <N>: <name>"
prompt: "You are the implementation writer for phase <N> of feature <feature-slug>.

Read these files first:
- .artifacts/<feature>/plan/phase-<NN>-<name>.md  (your task)
- .artifacts/<feature>/design/architecture.md  (architectural constraints)
- .artifacts/<feature>/research.md  (existing code references)

Then:
1. Implement the phase exactly as described. Do not exceed scope.
2. Add/modify only the files listed in the phase file. If you need to touch others, stop and explain why.
3. Write code only. Do NOT write tests for this project.
4. Output a short report:
   - Files created/modified (full paths)
   - Any blockers

Do NOT commit. Do NOT push. Do NOT create branches."
```

### Reviewers
```
subagent_type: "general-purpose"
description: "<reviewer-role> review of phase <N>"
prompt: "Read .opencode/agents/pipeline-<reviewer>-reviewer.md and follow its instructions.

Feature: <feature-slug>
Phase: <N>
Phase file: .artifacts/<feature>/plan/phase-<NN>-<name>.md
Files changed by writer: <list>

Produce a verdict (pass/fail) with concrete file:line issues if fail. Save report to .artifacts/<feature>/reviews/phase-<NN>/<reviewer>-review.md"
```

## Reviewer Verdict Format

Reviewers must return JSON-like structured output:
```
VERDICT: pass | fail

ISSUES (only if fail):
- severity: blocker | major | minor
  file: path/to/file.go
  line: 42
  message: <one-line description>
  suggestion: <one-line fix suggestion>
```

The orchestrator parses these and feeds blockers/major issues back to the writer.

## Hard Limits (Iteration Control)

These limits are enforced **in code**, not in prompts:
- **Max iterations per phase**: 3 (writer + review cycle). Hitting this limit stops the command.
- **Max writer tool calls per turn**: 25 (writer subagent should run a reasonable number of file edits + build).
- **Max total time per phase**: 30 minutes wall-clock (sanity check).

If a limit is hit, the orchestrator:
1. Stops the loop.
2. Saves the failure state in `state.json`.
3. Reports clearly to the user what failed, the last reviewer findings, and what files the writer touched.
4. Suggests next steps (manual fix, revise plan, restart).

## Output to User

After each phase:
```
Phase <N> complete: <name>

Files changed:
- path/a.js
- path/b.js

Build: ✅
Tests: ✅ 142 passed
Architecture review: ✅
Security review: ✅
Plan conformance: ✅
Code quality: ✅

Iterations used: 1/3

Reviews saved: .artifacts/<feature>/reviews/phase-NN/
Autocommitted: <commit-hash>
```

On failure:
```
Phase <N> blocked after <K> iterations.

Last issues:
- [security/blocker] src/auth.go:42 — hardcoded API key
- [architecture/major] src/controller.go:88 — controller calls repository directly, must go through use case

Suggested next steps:
1. Read the phase file and design.
2. Fix issues manually.
3. Re-run `/implement <feature-slug> <N>` to retry this phase.
```

## Important Notes

- **Clean context per phase.** Each phase runs in a new conversation context — handoff is via the phase file and `state.json`.
- **Auto-commit.** After reviewers pass, commit code + review reports to `.artifacts/`.
- **Branch protection.** If on `main`/`master`, stop and ask for a feature branch.
- **Failures are loud.** When a phase is blocked, report clearly with concrete issues — never silently retry.
- **Reviewers run in parallel.** A single message with four Task calls.
- **Quality checks are project-native.** Read project's own checks from its `CLAUDE.md` if present; fall back to stack defaults.

## Failure Modes

- **state.json missing or invalid** → tell user to run earlier phases.
- **On main/master branch** → stop and ask for feature branch.
- **Build/tests fail** → return to writer with verbatim failure output.
- **Reviewer iteration limit** → stop, save state, report.
- **Writer keeps touching unrelated files** → reviewer (plan-conformance) catches this, returns to writer with the scope violation.
