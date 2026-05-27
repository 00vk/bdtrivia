<!-- feature: js-refactor | phase: plan | date: 2026-05-28 | agent: plan-lead -->

# Phase 02: Feature Modules

## Goal

Review and finalize the 3 feature modules: `lobby.js`, `game.js`, `editor.js`. Compare each exported function against the inline code source. Ensure all function signatures, Firebase paths, DOM references, and logic match exactly.

## Inputs

- `js/lobby.js` — exists, untracked
- `js/game.js` — exists, untracked
- `js/editor.js` — exists, untracked
- `index.html` inline source of truth (lines 276-409, 412-462, 494-642, 645-952, 960-1264, 1267-1438)
- Phase 01 output (core modules)

## Outputs (modified files)

- `js/lobby.js`
- `js/game.js`
- `js/editor.js`

## Steps

### lobby.js review
Compare each exported function against inline:

1. `generateRoomCode(length)` — inline `index.html:276-282`. Must use same `CHARSET`, `Math.random()`.
2. `createUniqueRoomCode()` — inline `index.html:284-304`. Firebase collision check loop.
3. `listenPlayers(code)` — inline `index.html:347-389`. Firebase child listeners, `updatePlayerChip`, `updateStartButton`.
4. `showQRCode(code)` — inline `index.html:393-399`. goqr.me URL, `file://` protocol guard.
5. `updateStartButton()` — inline `index.html:419-425`. Query `#player-list .player-chip`.
6. `listenGameState(code, isHost)` — inline `index.html:494-526`. Firebase state + currentItem listeners, routes to game.js functions.
7. `tryReconnect()` — inline `index.html:1377-1413`. sessionStorage + Firebase verification.

### game.js review
Compare each exported function against inline:

1. `renderCurrentItem(code, isHost, itemIndex, timerEndsAt)` — inline `index.html:529-624`. Full question/slide render.
2. `advanceNext(code)` — inline `index.html:627-642`. Firebase update currentItem.
3. `showFinished(code, isHost)` — inline `index.html:645-716`. Podium + rank table.
4. `renderMedia(media, containerId)` — inline `index.html:719-745`. iframe/img/audio/video.
5. `startTimer(endsAt, displayEl, onExpire)` — inline `index.html:748-763`. setInterval countdown.
6. `computeScores(code, itemIndex)` — inline `index.html:766-800`. Ratio-based scoring.
7. `showReveal(code, isHost)` — inline `index.html:803-828`. Read room data, render reveal.
8. `selectAnswer(code, itemIndex, answer)` — inline `index.html:1267-1282`. Write to Firebase.
9. `listenAnswerCount(code, itemIndex)` — inline `index.html:1294-1301`. Firebase value listener.

### editor.js review
Compare each exported function against inline:

1. `initEditor()` — inline `editor-init` section. Calls `loadDraft()`, `renderEditorItems()`, `showScreen('screen-editor')`.
2. `renderEditorItems()` — inline `index.html:977-1019`. Card list from `state.draftItems`.
3. `buildEditorForm(form, item, index)` — inline `index.html:1021-1114`. Form HTML per item type.
4. `openUploadWidget(index)` — inline `index.html:1121-1161`. Cloudinary widget.
5. `saveEditorItem(index)` — inline `index.html:1163-1206`. Form validation + localStorage.
6. `deleteItem(index)` — inline `index.html:1208-1215`. Confirm + splice.
7. `moveItem(index, direction)` — inline `index.html:1217-1227`. Swap + re-render.

## Quality Gates

- Every function from inline code has a matching export
- All Firebase paths exactly match inline (strings, variable interpolation)
- All DOM element IDs match inline HTML
- All sessionStorage/localStorage keys match
- All event handlers use `addEventListener` (no inline onclick)
- `< 500 LOC` per module

## Out of Scope

- No `main.js` creation
- No `index.html` changes
- No new functionality

## Test

- Manual code review: every inline function has a matching exported function in the module
- Syntax check: browser DevTools console on module load (Phase 4 will test full integration)
