<!-- feature: js-refactor | phase: design | date: 2026-05-28 | agent: design-lead -->

# Sequence Diagrams: JS Refactor

## Page Load and Reconnect

```mermaid
sequenceDiagram
  participant Browser
  participant index.html
  participant main.js
  participant firebase.js
  participant ui.js
  participant lobby.js
  participant Firebase
  participant sessionStorage

  Browser->>index.html: GET /
  index.html->>Browser: HTML + <link href="css/styles.css">
  index.html->>Browser: CDN scripts (Firebase, Cloudinary)
  Note over Browser: HTML parsed, DOM ready
  index.html->>Browser: <script type="module" src="js/main.js">
  Browser->>main.js: execute
  main.js->>firebase.js: import db
  main.js->>ui.js: import showScreen, showError
  main.js->>lobby.js: import tryReconnect, listenGameState, etc.
  main.js->>lobby.js: tryReconnect()
  lobby.js->>sessionStorage: getItem('bdtrivia_room', 'bdtrivia_playerId', 'bdtrivia_hostKey')
  alt savedHostKey matches Firebase hostKey
    lobby.js->>Firebase: rooms/{code} once('value')
    Firebase-->>lobby.js: room data
    lobby.js->>ui.js: showScreen('screen-lobby-host' or 'screen-game-host')
    lobby.js->>Firebase: listenPlayers(code)
    lobby.js->>Firebase: listenGameState(code, true)
  else savedPlayerId exists in Firebase
    lobby.js->>Firebase: rooms/{code}/players/{playerId} once('value')
    Firebase-->>lobby.js: player data
    lobby.js->>ui.js: showScreen('screen-lobby-player' or 'screen-game-player')
    lobby.js->>Firebase: listenGameState(code, false)
  else no saved data
    lobby.js->>ui.js: showScreen('screen-host-nickname') [default]
  end
```

## Host Creates Room & Starts Game

```mermaid
sequenceDiagram
  participant Host
  participant main.js
  participant lobby.js
  participant storage.js
  participant game.js
  participant Firebase
  participant sessionStorage

  Host->>main.js: click "Создать комнату"
  main.js->>lobby.js: createRoom(nickname)
  lobby.js->>lobby.js: generateRoomCode() (check Firebase collision)
  lobby.js->>Firebase: rooms/{code}.set({hostKey, hostNickname, createdAt, state:'lobby'})
  lobby.js->>sessionStorage: setItem('bdtrivia_hostKey', 'bdtrivia_room')
  lobby.js->>Firebase: listenPlayers(code)
  lobby.js->>main.js: showScreen('screen-lobby-host')

  Host->>main.js: click "Начать игру"
  main.js->>lobby.js: startGame(code)
  lobby.js->>Firebase: rooms/{code}/hostKey once('value')
  lobby.js->>storage.js: getGameItems()
  storage.js->>localStorage: getItem('bdtrivia_draft')
  lobby.js->>Firebase: rooms/{code}.update({items, currentItem:0, timerEndsAt, state:'playing'})
  Note over Firebase: triggers listenGameState callback

  main.js->>game.js: renderCurrentItem(code, true, 0, timerEndsAt)
  game.js->>Firebase: render question UI, startTimer, listenAnswerCount
```

## Player Answers Question

```mermaid
sequenceDiagram
  participant Player
  participant main.js
  participant game.js
  participant Firebase
  participant ui.js

  Player->>main.js: click option button
  main.js->>game.js: selectAnswer(code, itemIndex, answer)
  game.js->>Firebase: rooms/{code}/answers/{itemIndex}/{playerId} once('value')
  alt not yet answered
    game.js->>Firebase: .set({answer, answeredAt: ServerValue.TIMESTAMP})
    game.js->>ui.js: showAnswerWaiting() — "ответ принят"
  else already answered
    game.js->>Player: silently ignore (do nothing)
  end
```

## Timer Expiry → Scoring → Reveal → Next

```mermaid
sequenceDiagram
  participant Host
  participant main.js
  participant game.js
  participant Firebase
  participant ui.js

  Note over game.js: Timer reaches 0
  game.js->>game.js: computeScores(code, itemIndex)
  game.js->>Firebase: rooms/{code} once('value')
  Firebase-->>game.js: all players, answers, items
  game.js->>game.js: calculate points (ratio-based, 85% max decay)
  game.js->>Firebase: update each answer {correct, points}
  game.js->>Firebase: update each player {score}
  game.js->>Firebase: rooms/{code}.update({state:'reveal'})
  Note over Firebase: triggers listenGameState callback

  main.js->>game.js: showReveal(code, isHost)
  game.js->>Firebase: rooms/{code} once('value')
  game.js->>game.js: renderHostReveal() — distribution, top-3
  game.js->>ui.js: "Далее →" button

  Host->>main.js: click "Далее →"
  main.js->>game.js: advanceNext(code)
  alt more items
    game.js->>Firebase: update({currentItem, state:'playing', timerEndsAt})
  else last item
    game.js->>Firebase: update({state:'finished'})
  end
```

## Question Editor — Save Item

```mermaid
sequenceDiagram
  participant Host
  participant main.js
  participant editor.js
  participant storage.js
  participant Cloudinary
  participant localStorage

  Host->>main.js: click "Редактировать вопросы"
  main.js->>editor.js: initEditor()
  editor.js->>storage.js: loadDraft()
  storage.js->>localStorage: getItem('bdtrivia_draft')
  storage.js-->>editor.js: draftItems
  editor.js->>main.js: renderEditorItems()
  main.js->>ui.js: showScreen('screen-editor')

  Host->>editor.js: edit card, click "Загрузить медиа"
  editor.js->>Cloudinary: cloudinary.createUploadWidget().open()
  Cloudinary-->>editor.js: result event 'success' → secure_url, resource_type
  editor.js->>editor.js: fill media type + URL in form
  Host->>editor.js: click "Сохранить"
  editor.js->>editor.js: validate fields, update state.draftItems[index]
  editor.js->>storage.js: saveDraft()
  storage.js->>localStorage: setItem('bdtrivia_draft', JSON.stringify)
  editor.js->>main.js: renderEditorItems() — card collapsed
```
