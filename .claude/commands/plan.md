# /plan — Implementation Plan Phase

**Purpose:** Phase 3 of the four-phase pipeline. Take the approved design and break it into
sequential implementation phases. Each phase must be self-contained: testable, reviewable,
committable in isolation.

## Usage

```
/plan <feature-slug>
```

Example:
```
/plan user-avatar
```

## Inputs

- **feature-slug** — kebab-case slug. Required.

## Preconditions

- `.artifacts/<repo>/<feature>/research.md` exists.
- `.artifacts/<repo>/<feature>/design/architecture.md` exists.
- `state.json` shows `design` in `phases_completed`.

If preconditions are not met, stop and tell the user what's missing.

## Artifact Layout

This command writes:
```
.artifacts/<repo-slug>/<feature-slug>/
└── plan/
    ├── README.md                # Plan summary + phase index
    ├── phase-01-<short-name>.md
    ├── phase-02-<short-name>.md
    └── phase-NN-<short-name>.md
```

## What This Command Does

1. **Load context**
   - Read `research.md`
   - Read all `design/*.md` files
   - Read project standards (same set as `/design`):
     - `<repo>/.claude/prompts/`, `<repo>/CLAUDE.md`
     - `~/.claude/rules/code-quality.md`
     - `~/.claude/rules/klarna/gradle-java.md` (if Java)
     - `~/.claude/rules/klarna/postgresql.md` (if DB changes)
     - `~/.claude/rules/projects/settlement/architecture.md` (if settlement repo)

2. **Decompose into phases**
   - Identify natural breakpoints in the design.
   - Typical phase order for a backend feature:
     1. Domain model (entities, value objects)
     2. Boundaries (interfaces, ports)
     3. External adapters (S3 client, image processor, etc.)
     4. Persistence (repositories, mappers, migrations)
     5. Use cases / application services
     6. Controller layer (REST/GraphQL endpoints)
     7. Wiring / dependency injection
     8. Integration tests
   - Adapt to project style. Skip phases that don't apply. Add phases for non-trivial concerns (e.g., feature flag wiring).
   - Each phase MUST be:
     - **Committable in isolation** — code compiles, tests pass for what's done so far.
     - **Reviewable in under 30 minutes** — typically <500 LOC of net change.
     - **Bounded by clear inputs and outputs** — listed file paths.

3. **Write `plan/README.md`** with:
   - Feature summary
   - Reference to design files
   - Phase index: list of phases with one-line summary each
   - Global acceptance criteria (what the whole feature must do when all phases ship)
   - Rollout strategy (single PR vs PR-per-phase vs feature flag)

4. **Write one file per phase** (`plan/phase-NN-<short-name>.md`):
   Each phase file must contain:
   - **Goal** — what this phase delivers (1–2 sentences)
   - **Inputs** — files this phase reads (existing) or depends on (from prior phases)
   - **Outputs — files to create or modify** — exact paths
   - **Implementation steps** — ordered list, granular enough for the implementer to follow
   - **Tests to add** — explicit test cases referenced from `design/tests.md`
   - **Quality gates** — what must pass before moving to next phase:
     - Build succeeds
     - All tests pass (unit + integration for this phase's surface)
     - Linters / formatters clean
     - Standards conformance (architecture, security)
   - **Out of scope** — explicit list of what this phase does NOT do

5. **Standards check on the plan itself**
   Verify:
   - Phases respect clean-architecture dependency direction (domain → use cases → adapters, not reverse)
   - No phase creates files in layers that don't exist in the project
   - No phase relies on something from a later phase
   - Test phase comes after the production code phase it tests, OR test scaffolding is folded into each phase (project-dependent — match research findings)
   - File paths match the project's actual structure as found in `research.md`

6. **Update state**
   - Set `phase: "plan"`, `status: "complete"`.
   - Add `plan` to `phases_completed`.
   - Set `plan_completed_at`.
   - Record the list of phase files in `state.json` for `/implement` to consume.

7. **Report**
   Print:
   - Path to `plan/README.md`
   - Number of phases
   - Estimated total LOC change (sum of design hints)
   - Next step: `/implement <feature-slug>` to start phase 1, or `/implement <feature-slug> 3` to start at phase 3.

## State Update Example

```json
{
  ...
  "phase": "plan",
  "status": "complete",
  "phases_completed": ["research", "design", "plan"],
  "plan_completed_at": "...",
  "implementation_phases": [
    { "number": 1, "file": "plan/phase-01-domain-model.md", "name": "domain-model", "status": "pending" },
    { "number": 2, "file": "plan/phase-02-boundaries.md", "name": "boundaries", "status": "pending" },
    ...
  ]
}
```

## Important Notes

- **The plan is the second-most important gate after design.** A bad plan creates 100s of bad LOC.
- **Phases must be linearly orderable.** No diamond dependencies.
- **Each phase is its own context window in `/implement`.** Keep phase files self-contained so the implementer can work from the phase file + design + research without needing to re-read previous phase files.
- **Don't include code.** Plan describes WHAT and WHERE. Implementation writes the code.
- **File paths must be real.** Cross-check every path against research findings or the actual repo layout.

## AI Validation

Plan runs an inline standards check before finalizing: dependency direction, no later-phase dependencies, file paths match project structure.

## Failure Modes

- **Design missing** → ask user to run `/design`.
- **Project layer style unclear** → ask user.
- **Feature is too small for phasing** → produce a single phase file `phase-01-<name>.md` (still useful for `/implement`).
