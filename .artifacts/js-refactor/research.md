<!-- feature: js-refactor | date: 2026-05-28 | agent: research-lead -->

# Research: JS Refactor — Extract Inline CSS/JS into Modules

## Scope

Refactor `index.html` (1441 lines) — extract all inline CSS (`<style>`, lines 10–140) into `css/styles.css` and all inline JS (`<script>`, lines 231–1439) into ES modules (`js/config.js, state.js, firebase.js, ui.js, storage.js, editor.js, game.js, lobby.js, main.js`).

## Existing Functionality (index.html, live version)

**Structure:** Single-page app with 8 screens (`screen-host-nickname`, `screen-lobby-host`, `screen-editor`, `screen-game-host`, `screen-game-player`, `screen-player-roomcode`, `screen-player-nickname`, `screen-lobby-player`). Screen visibility controlled by `showScreen(id)` which toggles `.active` class on `.screen` elements. (`index.html:257-264`)

**CSS:** 105 rules (104 selector blocks + 1 `@keyframes pulse`) in inline `<style>` at lines 10–140. No media queries, no custom properties. All sizing in `px`/`em`. Layout: flexbox. Background: purple-blue gradient. `css/styles.css` exists as exact duplicate but is NOT linked from HTML. (`index.html:10-140`)

**JS:** ~1208 lines in single inline `<script>` at lines 231–1439 (end of `<body>`). All variables declared with `var` (ES5). No modules, no imports. Three external CDN scripts loaded in `<head>`: Firebase compat SDK v10.14.1 (app + database) and Cloudinary widget v2. (`index.html:7-9, 231-1439`)

## Architecture

All HTML, CSS, and JS are in a single file. The orphaned `js/*.js` module files (8 files, ~1050 lines) use ES module `export`/`import` syntax but are never loaded — `index.html` has zero `<script type="module">` tags. These modules are dead code. A `js/main.js` entry point does NOT exist yet.

### Screen Transition Flow

```
host-nickname → lobby-host → editor (host)
                             → game-host → (reveal loop) → finished
player-roomcode → player-nickname → lobby-player → game-player → (reveal loop) → finished
```

### Game State Machine (Firebase RTDB `rooms/{code}/state`)

```
lobby → playing → reveal → playing (loop per item) → finished
```

## JavaScript Functions (complete catalog)

| Function | Lines | Purpose |
|---|---|---|
| `showScreen(id)` | 257–264 | Toggle screen visibility |
| `showError(el, msg)` | 266–269 | Show error message |
| `hideError(el)` | 271–273 | Hide error message |
| `generateRoomCode(length)` | 276–282 | Random code from CHARSET |
| `createUniqueRoomCode()` | 284–304 | Unique 4-char room code (Firebase collision check) |
| `listenPlayers(code)` | 347–389 | Firebase player list listeners |
| `showQRCode(code)` | 393–399 | QR code via goqr.me |
| `updateStartButton()` | 419–425 | Enable/disable start button |
| `getGameItems()` | 465–474 | Load items from localStorage or sample |
| `getSampleItems()` | 476–484 | Hardcoded 5 sample items |
| `listenGameState(code, isHost)` | 494–526 | Firebase state + currentItem listeners |
| `renderCurrentItem(code, isHost, itemIndex, timerEndsAt)` | 529–624 | Render question/slide UI |
| `advanceNext(code)` | 627–642 | Go to next game item |
| `showFinished(code, isHost)` | 645–716 | Podium + rank table |
| `renderMedia(media, containerId)` | 719–745 | Render YouTube/img/audio/video |
| `startTimer(endsAt, displayEl, onExpire)` | 748–763 | Countdown timer interval |
| `computeScores(code, itemIndex)` | 766–800 | Speed-based scoring (85% decay) |
| `showReveal(code, isHost)` | 803–828 | Show answer reveal |
| `renderHostReveal(...)` | 830–900 | Host reveal UI |
| `renderPlayerReveal(...)` | 902–931 | Player reveal UI |
| `renderTop3(container, players)` | 933–952 | Top-3 score display |
| `escapeHtml(str)` | 954–958 | HTML escape utility |
| `loadDraft()` | 964–971 | Load editor draft from localStorage |
| `saveDraft()` | 973–975 | Save editor draft to localStorage |
| `renderEditorItems()` | 977–1019 | Render editor card list |
| `buildEditorForm(form, item, index)` | 1021–1114 | Build editor form HTML |
| `setExpanded(idx)` | 1116–1118 | Set expanded editor card |
| `openUploadWidget(index)` | 1121–1161 | Cloudinary upload widget |
| `saveEditorItem(index)` | 1163–1206 | Save editor card data |
| `deleteItem(index)` | 1208–1215 | Delete editor item |
| `moveItem(index, direction)` | 1217–1227 | Reorder editor item |
| `selectAnswer(code, itemIndex, answer)` | 1267–1282 | Submit answer to Firebase |
| `showAnswerWaiting(code, itemIndex)` | 1285–1291 | Post-answer waiting UI |
| `listenAnswerCount(code, itemIndex)` | 1294–1301 | Answer count listener |
| `tryReconnect()` | 1377–1413 | Session restore on page reload |

### Global Variables

| Variable | Line | Purpose |
|---|---|---|
| `firebaseConfig` | 235–243 | Firebase project config |
| `db` | 246 | Firebase Database reference |
| `ROOM_CODE_LENGTH` | 249 | 4 |
| `CHARSET` | 250 | Room code alphabet (excludes 0/O/1/I/L) |
| `currentRoomCode` | 253 | Active room code |
| `currentPlayerId` | 254 | Current player Firebase key |
| `gameItems` | 487 | Loaded game items |
| `gameItemCount` | 488 | Items array length |
| `gameStateCurrentItem` | 489 | Current item index |
| `timerInterval` | 490 | setInterval handle |
| `answerCountRef` | 491 | Firebase answer count ref |
| `draftItems` | 961 | Editor draft items |
| `editorExpandedIdx` | 962 | Expanded editor card index |

### Cached DOM references (global variables)

`hostNicknameInput`, `hostCreateBtn`, `hostCreateError` (lines 307-309), `hostStartBtn`, `hostStartError` (lines 428-429), `playerCodeInput`, `playerJoinCodeBtn`, `playerCodeError` (lines 1304-1306), `playerNicknameInput`, `playerJoinBtn`, `playerJoinError` (lines 1338-1340).

## Firebase Integration

**Config:** Project `bdtrivia-bec64`, region `europe-west1`, database URL `https://bdtrivia-bec64-default-rtdb.europe-west1.firebasedatabase.app`.

**Paths used:**
- `rooms/{code}` — full room data (set/update/once/remove)
- `rooms/{code}/hostKey` — host verification
- `rooms/{code}/state` — game state machine
- `rooms/{code}/players/{playerId}` — player data
- `rooms/{code}/items` — question/slide array
- `rooms/{code}/currentItem` — current position
- `rooms/{code}/timerEndsAt` — countdown timestamp
- `rooms/{code}/answers/{itemIndex}/{playerId}` — player answers

**Methods:** `firebase.initializeApp()`, `database()`, `ref()`, `.set()`, `.update()`, `.once('value')`, `.on('value')`, `.on('child_added')`, `.on('child_changed')`, `.on('child_removed')`, `.off()`, `.push()`, `.remove()`, `.onDisconnect().update()`, `ServerValue.TIMESTAMP`.

**No Firebase Auth used** — database accessed without authentication.

## Cloudinary Integration

- Script: `widget.cloudinary.com/v2.0/global/all.js`
- Widget: `cloudinary.createUploadWidget({cloudName: 'dcdvpwr2v', uploadPreset: 'bdtrivia', maxFileSize: 10485760, clientAllowedFormats: [...]})`
- Success: validates URL matches `/^https:\/\/res\.cloudinary\.com\//`, maps `resource_type` to media type
- Used in editor for media uploads

## localStorage Persistence

- Only key: `bdtrivia_draft` (JSON array of item objects)
- `loadDraft()` — parse or fallback to sample items
- `saveDraft()` — `JSON.stringify()` on every mutation
- Item schemas: slide (`{type, title, description}`), choice (`{type, questionType, options, correctAnswer, ...}`), text (`{type, questionType, correctAnswer: [string], ...}`)
- No version/migration field

## Session Storage

- Keys: `bdtrivia_hostKey`, `bdtrivia_room`, `bdtrivia_playerId`
- Set on host room creation / player join
- Read for reconnect
- Cleared on "New Game"

## Orphaned Module Files

Eight ES module files exist under `js/` but are NEVER loaded:
- `js/config.js` — exports `firebaseConfig`
- `js/state.js` — exports mutable `state` object
- `js/firebase.js` — exports `db`
- `js/ui.js` — exports `showScreen()`, `showError()`, `hideError()`, `escapeHtml()`
- `js/storage.js` — exports `loadDraft()`, `saveDraft()`, `getGameItems()`
- `js/editor.js` — exports editor functions
- `js/game.js` — exports game functions
- `js/lobby.js` — exports lobby functions
- No `main.js` entry point exists

## Cross-References

- `index.html:10-140` — inline CSS (105 rules, exact copy in `css/styles.css`)
- `index.html:231-1439` — inline JS (all app logic)
- `index.html:7-9` — CDN scripts (Firebase + Cloudinary)
- `js/*.js` (8 files) — orphaned ES modules, never wired
- `css/styles.css` — orphaned CSS, never linked
