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
- The only exception is creating/updating pipeline config files themselves (`.claude/`, `.opencode/`, `AGENTS.md`, `opencode.json`)

## Artifacts

All pipeline outputs MUST be written to `.artifacts/<feature-slug>/` and committed. No exceptions.
