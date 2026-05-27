# bdtrivia — AI Agent Pipeline Scaffold

This repo defines AI agent configs for OpenCode (`.opencode/`) and Claude Code (`.claude/`). It has no application source code yet.

## Pipeline

Four-phase feature workflow, all state in `~/dev/ai-artifacts/<repo>/<feature>/state.json`:

| Phase | Command | Produces |
|---|---|---|
| 1. Research | `/research <task>` | `research.md` — facts with file:line, no opinions |
| 2. Design | `/design <slug>` | `design/*.md` — C4 (Mermaid), data-flow, sequences, tests, risks, contracts |
| 3. Plan | `/plan <slug>` | `plan/phase-NN-*.md` — ordered phases, each <500 LOC, committable alone |
| 4. Implement | `/implement <slug> [N]` | Writer + 4 parallel reviewers (arch, security, conformance, quality). Max 3 iterations/phase. |
| Orchestrator | `/feature <task-or-slug>` | Auto-advance phases, stop between each for review. |

**Reviewers** (subagents, invoke via `@pipeline-*`):
- `architecture-reviewer` — layer boundaries, dependency direction, design conformance
- `security-reviewer` — secrets, injection, auth, PII, crypto
- `plan-conformance-reviewer` — scope creep, missing files, test coverage vs plan
- `code-quality-reviewer` — formatting, naming, complexity, dead code, error handling
- `research-worker` — facts-only codebase trawl (used by phase 1)

## Dual Tooling

Both `.opencode/` and `.claude/` define the same pipeline. `.claude/` files are the authoritative originals (more detailed). Keep both in sync when updating.

## Repo State

- Zero commits on `master`, no remotes, no `.gitignore`, no README
- No build/test/lint system — will be added with actual project code
- When code arrives, document its commands below and remove this section

## Conventions

- Artifacts live **outside** the repo under `~/dev/ai-artifacts/` — never commit them
- Feature slugs are kebab-case, derived from task description and confirmed with user
- No auto-commits — user runs git manually
- Diagrams must be Mermaid in Markdown
