---
description: "Phase 2: Design — C4 diagrams, data flow, sequence, test strategy, risks, API contracts"
---

# /design — Design Phase

**Purpose:** Phase 2 of the four-phase pipeline. Take `research.md` and produce a complete design pack.

## Usage

```
/design <feature-slug>
```

## Preconditions

- `.artifacts/<feature>/research.md` must exist.

## What To Do

1. **Load context** — read `research.md` and project standards.

2. **Generate design artifacts** in `.artifacts/<feature>/design/`:

   - **architecture.md** — C4 context/container/component diagrams (Mermaid), dependencies, naming
   - **data-flow.md** — DFD per major flow (create/read/update/delete)
   - **sequence.md** — sequence diagrams per main API operation, include error paths
   - **tests.md** — test layers (unit/integration/contract/e2e), explicit test cases
   - **risks.md** — risks with severity, mitigation, fallback
   - **api-contracts.md** — API endpoints, data contracts, breaking changes
   - **adr.md** (for non-trivial features) — Architecture Decision Record

   Include header on each file: `<!-- feature: <slug> | phase: design | date: <date> | agent: design-lead -->`

3. **Rules:**
   - Mermaid for all diagrams
   - Reference research findings by file path
   - Explicit about what is new vs what exists
   - No implementation details (no method signatures, no SQL)

4. **Standards conformance self-check** — append results to `architecture.md`.

5. **Commit** — `git add .artifacts/<feature>/ && git commit -m "<feature>: design phase complete"`.

6. **Output** list of generated files. Next step: `/plan <feature-slug>`.
