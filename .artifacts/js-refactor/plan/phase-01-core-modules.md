<!-- feature: js-refactor | phase: plan | date: 2026-05-28 | agent: plan-lead -->

# Phase 01: Core Modules

## Goal

Review and finalize the 5 core modules that have no dependencies on each other or on feature modules: `config.js`, `state.js`, `firebase.js`, `ui.js`, `storage.js`. Ensure they correctly export all values and functions used by the inline code.

## Inputs

- `js/config.js` — exists, untracked
- `js/state.js` — exists, untracked
- `js/firebase.js` — exists, untracked
- `js/ui.js` — exists, untracked
- `js/storage.js` — exists, untracked
- `index.html` inline source of truth (lines 235-246, 249-254, 257-273, 465-484, 954-975)

## Outputs (modified files)

- `js/config.js`
- `js/state.js`
- `js/firebase.js`
- `js/ui.js`
- `js/storage.js`

## Steps

1. **`config.js`** — Verify `firebaseConfig` matches inline (`index.html:235-243`), `ROOM_CODE_LENGTH` (249), `CHARSET` (250). Ensure all are exported.
2. **`state.js`** — Compare against inline global vars (`index.html:253-254`, 487-491, 961-962). Ensure all fields match.
3. **`firebase.js`** — Verify `initializeApp(config)` and `database()` call. Inline code uses `firebase-app-compat` + `firebase-database-compat` CDN globals — the module also uses the same globals, so it matches. Ensure `db` is exported.
4. **`ui.js`** — Compare `showScreen`, `showError`, `hideError`, `escapeHtml` against inline (`index.html:257-273`, 954-958). Ensure all exported.
5. **`storage.js`** — Compare `loadDraft`, `saveDraft`, `getGameItems` against inline (`index.html:465-484`, 964-975). Ensure all exported.

## Quality Gates

- All modules use `export` keyword
- No console.log or debug code
- Exported names match inline function names

## Out of Scope

- No feature modules (lobby, game, editor)
- No `main.js` creation
- No `index.html` changes

## Test

- Open `index.html` in browser (still has inline code) — no change expected
- Verify `js/*.js` files parse without syntax errors via browser/Node
