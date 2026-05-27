<!-- feature: js-refactor | phase: plan | date: 2026-05-28 | agent: plan-lead -->

# Phase 03: main.js — Entry Point

## Goal

Create `js/main.js` — the ES module entry point that imports all modules, wires up static event listeners (linking DOM elements to exported functions), and handles initial page routing (URL params + reconnect).

## Inputs

- `index.html` inline source of truth — specifically the event listener section (lines 307-344, 401-416, 428-462, 1230-1264, 1304-1438)
- Phase 01 + 02 outputs (all module files)
- Design documents: architecture.md, data-flow.md, api-contracts.md

## Outputs (created file)

- `js/main.js`

## Steps

1. **Import all modules:**
   ```js
   import { firebaseConfig, ROOM_CODE_LENGTH, CHARSET } from './config.js'
   import { state } from './state.js'
   import { db } from './firebase.js'
   import { showScreen, showError, hideError, escapeHtml } from './ui.js'
   import { loadDraft, saveDraft, getGameItems } from './storage.js'
   import { createUniqueRoomCode, listenPlayers, showQRCode, updateStartButton, listenGameState, tryReconnect } from './lobby.js'
   import { renderCurrentItem, advanceNext, showReveal, showFinished, renderMedia, startTimer, computeScores, selectAnswer, listenAnswerCount } from './game.js'
   import { initEditor, renderEditorItems, buildEditorForm, openUploadWidget, saveEditorItem, deleteItem, moveItem } from './editor.js'
   ```

2. **Cache DOM references** — same as inline (lines 307-309, 428-429, 1304-1306, 1338-1340):
   ```js
   // Host create
   const hostNicknameInput = document.getElementById('host-nickname-input')
   const hostCreateBtn = document.getElementById('host-create-btn')
   const hostCreateError = document.getElementById('host-create-error')
   // Host game start
   const hostStartBtn = document.getElementById('host-start-btn')
   const hostStartError = document.getElementById('host-start-error')
   // Player join
   const playerCodeInput = document.getElementById('player-code-input')
   const playerJoinCodeBtn = document.getElementById('player-join-code-btn')
   const playerCodeError = document.getElementById('player-code-error')
   const playerNicknameInput = document.getElementById('player-nickname-input')
   const playerJoinBtn = document.getElementById('player-join-btn')
   const playerJoinError = document.getElementById('player-join-error')
   ```

3. **Wire event listeners** — match inline exactly:
   - `hostCreateBtn.click` → create room logic (inline 311-344)
   - `copyCodeBtn.click` → clipboard copy (inline 401-409)
   - `hostEditBtn.click` → `initEditor()` (inline 412-416)
   - `hostStartBtn.click` → start game logic (inline 431-462)
   - `editorList.click` → delegation: delete/move actions (inline 1230-1238)
   - `editorAddChoice.click` → add choice (inline 1240-1245)
   - `editorAddText.click` → add text (inline 1247-1252)
   - `editorAddSlide.click` → add slide (inline 1254-1259)
   - `editorBackBtn.click` → back to lobby (inline 1261-1264)
   - `playerCodeInput.input` → sanitize input (inline 1308-1310)
   - `playerJoinCodeBtn.click` → validate + show nickname (inline 1312-1335)
   - `playerJoinBtn.click` → create player in Firebase (inline 1342-1371)

4. **Initial routing** — match inline exactly (lines 1374-1438):
   - Parse `?room=` URL param
   - If roomFromUrl: validate room, show appropriate screen
   - Else: call `tryReconnect()`

## Quality Gates

- Every inline event listener is re-registered in `main.js`
- All cached DOM element IDs match `index.html`
- Same variable names used as inline code (for consistency)
- No import is unused — every imported function is called somewhere in `main.js`
- Initial routing logic matches inline exactly

## Out of Scope

- No changes to `index.html` (will happen in Phase 04)
- No changes to module files (already finalized in Phase 01-02)

## Test

- Can't fully test until Phase 04 (index.html needs to load this module)
- Syntax check: browser DevTools (open `index.html` with inline code still active, load `main.js` separately)
