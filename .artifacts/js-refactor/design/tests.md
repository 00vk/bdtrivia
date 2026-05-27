<!-- feature: js-refactor | phase: design | date: 2026-05-28 | agent: design-lead -->

# Test Strategy: JS Refactor

## Test Approach

No test framework exists (per AGENTS.md: "No test framework (vanilla JS)"). All testing is manual via browser.

## Test Cases

### T1: Page loads without errors
- Open DevTools Console
- Load `http://localhost:8080` (or GitHub Pages)
- **Expected:** No console errors. Firebase initialized. Cloudinary widget loaded.
- **Verify:** `firebase` is defined, `cloudinary` is defined, initial screen visible.

### T2: CSS loads correctly
- Inspect any element
- **Expected:** All styles applied (gradient background, rounded buttons, flex layout).
- **Verify:** No FOUC (flash of unstyled content). Visual appearance identical to before.

### T3: Host creates room
- Enter nickname, click "Создать комнату"
- **Expected:** Room code displayed, QR code visible, player list empty
- **Verify:** No errors in console. `sessionStorage` has `bdtrivia_room` and `bdtrivia_hostKey`.

### T4: Player joins room
- Open second browser tab, enter room code
- **Expected:** Player appears in host's player list. Player sees waiting screen.
- **Verify:** Player chip visible on host. Player sees "Ожидание..." message.

### T5: Host starts game
- Click "Начать игру"
- **Expected:** Both host and player see first question/slide.
- **Verify:** Timer counting down. Host sees answer count. No console errors.

### T6: Player answers question
- Player clicks option or types text answer
- **Expected:** Player sees "Ответ принят". Host sees answer count increment.
- **Verify:** No console errors. Answer written to Firebase.

### T7: Reveal shows after timer
- Wait for timer to expire
- **Expected:** Both see reveal screen. Host sees distribution + top-3. Player sees correct/wrong + points.
- **Verify:** No console errors. Scores computed correctly.

### T8: Game finishes
- Advance through all items
- **Expected:** Final standings with podium + full rank table. Host sees "Новая игра" button.
- **Verify:** Podium shows top 3. Rank table shows all players.

### T9: Host starts new game
- Click "Новая игра"
- **Expected:** Page reloads to host nickname screen. Room removed from Firebase.
- **Verify:** `sessionStorage` cleared. Firebase room deleted.

### T10: Question editor opens
- Click "Редактировать вопросы"
- **Expected:** Editor screen with existing items. Can add, edit, delete, reorder questions.
- **Verify:** localStorage draft saved on each action.

### T11: Reconnect after refresh
- Host: refresh page while in lobby/game
- **Expected:** Reconnects to same room (host lobby or game screen).
- **Verify:** `sessionStorage` data matched to Firebase hostKey.

### T12: Player discard after game ends
- Player refreshes after game finished
- **Expected:** Shows host-nickname screen (no reconnect to finished game).
- **Verify:** No unexpected errors.

### T13: Cloudinary upload
- In editor, click upload button
- **Expected:** Cloudinary widget opens, file can be selected and uploaded.
- **Verify:** URL filled in media field. Format matches `/^https:\/\/res\.cloudinary\.com\//`.

### T14: Video rendering
- Set media type to "video", provide a video URL
- **Expected:** Native `<video>` element rendered in game.
- **Verify:** Video controls visible, video plays.
