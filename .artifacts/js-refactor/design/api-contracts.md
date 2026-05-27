<!-- feature: js-refactor | phase: design | date: 2026-05-28 | agent: design-lead -->

# API Contracts: JS Refactor

## Module Exports

### `js/config.js`
```js
export const firebaseConfig = { /* Firebase project config */ }
export const ROOM_CODE_LENGTH = 4
export const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
```

### `js/state.js`
```js
export const state = {
  currentRoomCode: null,
  currentPlayerId: null,
  gameItems: null,
  gameItemCount: 0,
  gameStateCurrentItem: 0,
  timerInterval: null,
  answerCountRef: null,
  draftItems: [],
  editorExpandedIdx: -1
}
```

### `js/firebase.js`
```js
import { firebaseConfig } from './config.js'
firebase.initializeApp(firebaseConfig)
export const db = firebase.database()
```

### `js/ui.js`
```js
export function showScreen(id) {}       // Toggle screen visibility
export function showError(el, msg) {}   // Show error message
export function hideError(el) {}        // Hide error message
export function escapeHtml(str) {}      // HTML entity escape
```

### `js/storage.js`
```js
export function loadDraft() {}          // Load from localStorage, return array
export function saveDraft() {}          // Save to localStorage
export function getGameItems() {}       // Load or fallback to sample
```

### `js/lobby.js`
```js
import { db } from './firebase.js'
import { state } from './state.js'
import { showScreen, showError, escapeHtml } from './ui.js'
import { getGameItems } from './storage.js'

export function createUniqueRoomCode() {}           // Generate unique 4-char code
export function listenPlayers(code) {}               // Firebase player list listeners
export function showQRCode(code) {}                  // QR code via goqr.me
export function updateStartButton() {}               // Enable/disable start
export function listenGameState(code, isHost) {}      // Game state machine listener
export function tryReconnect() {}                     // Session restore
```

### `js/editor.js`
```js
import { state } from './state.js'
import { showScreen, showError, hideError, escapeHtml } from './ui.js'
import { loadDraft, saveDraft } from './storage.js'
import { db } from './firebase.js'

export function initEditor() {}                      // Load draft & render
export function renderEditorItems() {}                // Render card list
export function buildEditorForm(form, item, index) {} // Build form HTML
export function openUploadWidget(index) {}            // Cloudinary upload
export function saveEditorItem(index) {}              // Save card data
export function deleteItem(index) {}                   // Delete card
export function moveItem(index, direction) {}          // Reorder cards
```

### `js/game.js`
```js
import { db } from './firebase.js'
import { state } from './state.js'
import { showScreen, showError, escapeHtml } from './ui.js'
import { getGameItems } from './storage.js'

export function renderCurrentItem(code, isHost, itemIndex, timerEndsAt) {}
export function advanceNext(code) {}
export function showFinished(code, isHost) {}
export function renderMedia(media, containerId) {}
export function startTimer(endsAt, displayEl, onExpire) {}
export function computeScores(code, itemIndex) {}
export function showReveal(code, isHost) {}
export function selectAnswer(code, itemIndex, answer) {}
export function listenAnswerCount(code, itemIndex) {}
```

### `js/main.js`
```js
// Entry point — no exports
// Imports all modules, wires event listeners, handles initial routing
```
