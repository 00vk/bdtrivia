# bdtrivia — AI Agent Pipeline Scaffold

This repo defines AI agent configs for OpenCode (`.opencode/`) and Claude Code (`.claude/`), plus the application source for a browser multiplayer trivia game.

## Pipeline

Four-phase feature workflow, all state in `.artifacts/<feature>/state.json`:

| Phase | Command | Produces |
|---|---|---|
| 1. Research | `/research <task>` | `research.md` — facts with file:line, no opinions |
| 2. Design | `/design <slug>` | `design/*.md` — C4 (Mermaid), data-flow, sequences, tests, risks, contracts |
| 3. Plan | `/plan <slug>` | `plan/phase-NN-*.md` — ordered phases, each <500 LOC, committable alone |
| 4. Implement | `/implement <slug> [N]` | Writer + 4 parallel reviewers (arch, security, conformance, quality). Max 3 iterations/phase. |
| Orchestrator | `/feature <task-or-slug>` | Auto-advance through phases. All validation by AI agents, no human gates. |

**Reviewers** (subagents, invoke via `@pipeline-*`):
- `architecture-reviewer` — layer boundaries, dependency direction, design conformance
- `security-reviewer` — secrets, injection, auth, PII, crypto
- `plan-conformance-reviewer` — scope creep, missing files, test coverage vs plan
- `code-quality-reviewer` — formatting, naming, complexity, dead code, error handling
- `research-worker` — facts-only codebase trawl (used by phase 1)

## Dual Tooling

Both `.opencode/` and `.claude/` define the same pipeline. `.claude/` files are the authoritative originals (more detailed). Keep both in sync when updating.

## Artifacts

All pipeline outputs (research, design docs, plans, reviews) live in `.artifacts/<feature>/` and are committed to git. Each file includes a header noting the feature slug, date, and which agent produced it.

## Build / Test / Lint

- This project is a static HTML/JS app — no build step
- Served via GitHub Pages from root
- No test framework (vanilla JS)

## HARD RULE: Pipeline Only

**You MUST NOT make any direct code changes. ALL work MUST go through the four-phase pipeline:**

1. `/research <task>` — facts-only codebase analysis
2. `/design <slug>` — C4 architecture, data-flow, sequences
3. `/plan <slug>` — ordered implementation phases
4. `/implement <slug> [N]` — writer + 4 parallel reviewers

Use `/feature <task>` to auto-advance through all phases. ⚠️ This rule is also enforced by `.opencode/rules/pipeline-mandatory.md` — any direct edit without pipeline artifacts is a violation.

## Conventions

- Feature slugs are kebab-case, derived from task description
- Diagrams must be Mermaid in Markdown
- All phase outputs committed to git after each phase
- Short comments in GitHub issues per completed feature
