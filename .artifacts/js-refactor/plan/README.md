<!-- feature: js-refactor | phase: plan | date: 2026-05-28 | agent: plan-lead -->

# Plan: JS Refactor

## Summary

Extract all inline CSS (`<style>`, `index.html:10-140`) into `css/styles.css` and inline JS (`<script>`, `index.html:231-1439`) into ES modules under `js/*.js`. The existing orphaned module files already exist — this plan covers reviewing/fixing them, creating `main.js` entry point, and refactoring `index.html`.

## Phase Index

| # | Phase | LOC | Risk | Dependencies |
|---|---|---|---|---|
| 1 | Core modules (config, state, firebase, ui, storage) | ~150 | LOW | None |
| 2 | Feature modules (lobby, game, editor) | ~350 | MEDIUM | Phase 1 |
| 3 | main.js — entry point + event wiring | ~200 | HIGH | Phase 1, 2 |
| 4 | index.html — remove inline, add links/scripts | ~30 | MEDIUM | Phase 3 |

## Acceptance Criteria

- [ ] `index.html` has no inline `<style>` or `<script>` blocks (except CDN scripts)
- [ ] `css/styles.css` is loaded via `<link>`
- [ ] `js/main.js` is loaded via `<script type="module">`
- [ ] All 8 screens work identically to before (host, player, editor, game flows)
- [ ] No console errors on page load
- [ ] All exports from each module are used in `main.js`
- [ ] Game state machine works (lobby → playing → reveal → finished)
- [ ] Reconnect after refresh works
- [ ] Editor draft save/load works
