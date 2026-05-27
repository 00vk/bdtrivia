<!-- feature: js-refactor | phase: design | date: 2026-05-28 | agent: design-lead -->

# Data Flow: JS Refactor

## Flow 1: Page Load / App Init

```
index.html loads
  → <link href="css/styles.css"> loaded (blocking render)
  → CDN scripts firebase-app-compat, firebase-database-compat, cloudinary widget loaded
  → HTML screens rendered (all .screen with display:none, .active on host-nickname)
  → <script type="module" src="js/main.js"> loaded and executed
      → main.js imports config.js → gets firebaseConfig, ROOM_CODE_LENGTH, CHARSET
      → main.js imports firebase.js → firebase.initializeApp(), db = firebase.database()
      → main.js imports state.js → shared state object
      → main.js imports ui.js → showScreen, showError, hideError, escapeHtml
      → main.js imports storage.js → loadDraft, saveDraft, getGameItems
      → main.js imports lobby.js → createUniqueRoomCode, listenPlayers, showQRCode, listenGameState, tryReconnect
      → main.js imports editor.js → initEditor, renderEditorItems, openUploadWidget
      → main.js imports game.js → renderCurrentItem, advanceNext, showReveal, showFinished, startTimer, computeScores, selectAnswer, listenAnswerCount
      → main.js wires static event listeners (DOM element IDs)
      → main.js parses URL params → tryReconnect() or roomFromUrl flow
```

## Flow 2: Host Creates Room

```
User clicks "Создать комнату"
  → event listener in main.js → lobby.createRoom(hostNickname)
      → lobby.js: generateRoomCode() → check Firebase for collision
      → lobby.js: write room to Firebase (hostKey, hostNickname, createdAt, state:'lobby')
      → lobby.js: save hostKey, roomCode to sessionStorage
      → lobby.js: showQRCode(roomCode) → fetch from goqr.me
      → lobby.js: listenPlayers(roomCode) → Firebase on child_added/changed/removed
      → ui.showScreen('screen-lobby-host')
```

## Flow 3: Player Joins Room

```
Player enters code → main.js event → lobby.joinRoom(code, nickname)
  → lobby.js: validate room exists + state === 'lobby'
  → lobby.js: firebase push to rooms/{code}/players → get playerId
  → lobby.js: set player data (nickname, score:0, connected:true)
  → lobby.js: onDisconnect set connected:false
  → lobby.js: save room, playerId to sessionStorage
  → lobby.js: listenGameState(roomCode, false) → Firebase on state/currentItem
  → ui.showScreen('screen-lobby-player')
```

## Flow 4: Game Play (Question → Answer → Reveal → Next)

```
Host clicks "Начать игру"
  → main.js event → lobby.startGame(roomCode)
      → lobby.js: verify hostKey matches Firebase
      → lobby.js: getGameItems() from localStorage or sample
      → lobby.js: write items, currentItem:0, timerEndsAt to Firebase
      → lobby.js: set state:'playing'

Firebase state 'playing' triggers listenGameState callback
  → game.renderCurrentItem(roomCode, isHost, itemIndex, timerEndsAt)
      → game.js: render question/slide UI (host and player)
      → game.js: renderMedia() for YouTube/image/audio/video
      → game.js: startTimer() countdown
      → game.js: listenAnswerCount() for host

Player selects answer
  → event → game.selectAnswer(roomCode, itemIndex, answer)
      → game.js: write answer to Firebase (only if not already answered)
      → game.js: showAnswerWaiting()

Timer expires → game.computeScores(roomCode, itemIndex)
  → game.js: read all answers, compute points (ratio-based, max 85% decay)
  → game.js: write correct, points to each answer, update player scores
  → game.js: set state:'reveal'

Firebase state 'reveal' triggers listenGameState callback
  → game.showReveal(roomCode, isHost)
      → game.js: read room data → renderHostReveal or renderPlayerReveal
      → host: shows answer distribution, top-3, "Далее →" button

Host clicks "Далее →" → game.advanceNext(roomCode)
  → game.js: increment currentItem
  → if more items: set state:'playing' with timer
  → if last item: set state:'finished'
```

## Flow 5: Editor Draft Persistence

```
Host clicks "Редактировать вопросы"
  → main.js event → editor.initEditor()
      → editor.js: storage.loadDraft() → parse localStorage or fallback
      → editor.js: renderEditorItems() → build card list
      → ui.showScreen('screen-editor')

Host edits and saves
  → editor.saveEditorItem(index)
      → read form fields → validate → update state.draftItems[index]
      → storage.saveDraft() → localStorage.setItem('bdtrivia_draft', JSON.stringify)

Host adds/deletes/reorders
  → editor.js mutation functions → storage.saveDraft() → renderEditorItems()
```
