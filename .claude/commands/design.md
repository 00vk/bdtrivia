# /design — Design Phase

**Purpose:** Phase 2 of the four-phase pipeline. Take the `research.md` and produce a
complete design pack: C4 diagrams, data flow, sequence, test strategy, risks, API contracts.
Reviewer-friendly artifacts that can be read and corrected by humans before any code is written.

## Usage

```
/design <feature-slug>
/design <feature-slug> --no-adr     # skip ADR generation for small features
```

Example:
```
/design user-avatar
```

## Inputs

- **feature-slug** — kebab-case slug used by `/research`. Required.

## Preconditions

- `.artifacts/<repo>/<feature>/research.md` must exist.
- `state.json` should show `phases_completed` includes `research`.
- If preconditions are not met, ask the user whether to:
  1. Run `/research` first,
  2. Proceed without research (only if the user explicitly confirms — research is strongly recommended).

## Artifact Layout

This command writes:
```
.artifacts/<repo-slug>/<feature-slug>/
└── design/
    ├── architecture.md       # C4: context, containers, components (Mermaid)
    ├── data-flow.md          # Data flow diagrams
    ├── sequence.md           # Sequence diagrams per main flow
    ├── tests.md              # Test strategy + test cases
    ├── risks.md              # Risks and trade-offs
    ├── api-contracts.md      # REST/gRPC/Kafka contract changes
    └── adr.md                # Architecture Decision Record (only for large features)
```

## What This Command Does

1. **Validate state**
   - Read `state.json`.
   - Read `research.md`.
   - If missing — stop and tell the user.

2. **Read project standards**
   Check for project-local prompts/standards in the repo:
   - `<repo>/.claude/prompts/` — project-specific architecture/design prompts
   - `<repo>/.claude/CLAUDE.md` — project rules
   - `<repo>/CLAUDE.md` — root project rules

   Apply global standards as well:
   - `~/.claude/rules/code-quality.md`
   - `~/.claude/rules/klarna/gradle-java.md` (if Java/Gradle project)
   - `~/.claude/rules/klarna/postgresql.md` (if PostgreSQL changes expected)
   - `~/.claude/rules/projects/settlement/architecture.md` (if `/settlement/` in repo path)

3. **Generate design artifacts**
   Produce each design document in order. Each must follow these rules:
   - Use **Mermaid** for diagrams (`mermaid` code blocks in Markdown).
   - Reference research findings by file path when describing existing components.
   - Be explicit about **what is new** vs **what already exists**.
   - Avoid implementation details (no method signatures, no SQL). That belongs to the plan phase.

   ### architecture.md (C4)
   - **Context diagram** — system + external actors + adjacent systems
   - **Container diagram** — services/databases/message brokers participating
   - **Component diagram** — internal components within the changed container, with clean-architecture layers labeled (Controllers / Use Cases / Domain / Adapters)
   - **Dependencies** — explicit list of inbound/outbound dependencies, environment variables required
   - **Naming** — verify component names against research-found patterns. Do not invent new naming conventions silently.

   ### data-flow.md
   - One DFD per major flow (create/read/update/delete) showing how data moves through components.
   - Include external systems (S3, Kafka, DB).

   ### sequence.md
   - One sequence diagram per main API operation or event flow.
   - Include error paths and timeouts.
   - Annotate which existing components are reused vs which are new.

   ### tests.md
   - Test layers: unit / integration / contract / e2e
   - List of explicit test cases per layer (happy path + edge cases + failure modes)
   - Reference existing test fixtures from `research.md` where possible.

   ### risks.md
   - List of risks with severity (low/medium/high)
   - For each: mitigation, fallback, what we will monitor
   - Include performance, security, data integrity, backward compatibility, migration safety

   ### api-contracts.md
   - REST endpoints: method, path, request schema, response schema, status codes
   - Kafka topics: schema additions/changes (Avro version implications)
   - Breaking change indicator on each contract

   ### adr.md (only when `--no-adr` is NOT set AND feature is non-trivial)
   - Title, status, context, decision, consequences, alternatives considered

4. **Standards conformance self-check**
   Before finalizing, the design must pass an inline conformance check against project standards:
   - Clean architecture boundaries respected (no controller calling repository directly)
   - Domain model style (Rich vs Anemic) matches project convention
   - Naming matches existing codebase patterns
   - All external dependencies (S3, CDN, queues) have an explicit adapter layer
   - Any synchronous-but-slow operation (image resize, external API call) is flagged for async consideration

   Append a `## Standards Conformance` section at the bottom of `architecture.md` listing each check and its result.

5. **Update state**
   - Set `phase: "design"`, `status: "complete"`.
   - Add `design` to `phases_completed`.
   - Set `design_completed_at`.

6. **Report**
   Print the list of generated files and remind the user to review the design before running `/plan`.

## AI Validation

Design runs an inline standards conformance self-check before finalizing. Results appended to `architecture.md`.

## Output to User

```
Design complete: .artifacts/<repo>/<feature>/design/

Files generated:
- architecture.md (C4 + standards conformance)
- data-flow.md
- sequence.md
- tests.md
- risks.md
- api-contracts.md
- adr.md (if applicable)

Review the design pack and edit files directly if needed.
Next: `/plan <feature-slug>` to break the design into implementation phases.
```

## Important Notes

- **Design is the most important gate.** A bad design produces 100s of bad code lines via the plan. Spend time here.
- **No code in the design.** Method signatures, SQL, exact JSON payloads belong to the plan.
- **Diagrams must be in Mermaid** so they render in any Markdown viewer / IDE.
- **Names matter.** Do not invent component names that contradict research findings.
- **One C4 level at a time.** Don't mix containers and components in the same diagram.

## Failure Modes

- **research.md missing** → ask user to run `/research` or confirm proceeding without it.
- **Architecture style unclear from research** → ask user which style the project follows.
- **Stack unknown** → ask user (Go, Java/Spring, Node, TypeScript/React, etc.).
