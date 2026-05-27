<!-- feature: ai-validation | date: 2026-05-28 | agent: research-worker -->

# Research: AI Validation for Text Answers

## Current Answer Validation

- **File:** `js/game.js:219-250` — `computeScores()` function
- **Current logic (line 237):** `correctAnswers.indexOf((a.answer || '').toLowerCase()) !== -1` — exact match, case-insensitive
- **Synonym list (lines 224-226):** `Array.isArray(item.correctAnswer) ? item.correctAnswer.map(...) : [item.correctAnswer.toLowerCase()]`
- **Returns Promise** (Firebase chain), no async/await in codebase

## Text Question Structure

- `correctAnswer` for text: **array of strings** (synonyms)
- Sample: `correctAnswer: ['Канберра', 'Canberra']` (`js/storage.js:32`)
- Editor syncs input (`f-correct-text`) as comma-separated → array split on `,` (`js/editor.js:206-209`)
- Reveal shows `correctAnswer[0]` as correct label (`js/game.js:260`)

## CDN & Build

- **No build tools, no npm, no bundler** — `index.html` loads 3 global scripts (Firebase 10.14.1 compat × 2, Cloudinary) + 1 ES module (`<script type="module" src="js/main.js">`)
- All app code uses native `import`/`export` with `.js` extensions

## state.js

```
export const state = {
  currentRoomCode: null, currentPlayerId: null,
  gameItems: null, gameItemCount: 0, gameStateCurrentItem: 0,
  timerInterval: null, answerCountRef: null,
  draftItems: [], editorExpandedIdx: -1
};
```
New fields added by appending to the object literal.

## Async Pattern

- No `async/await` anywhere — all Firebase calls use `.then()` chaining
- `computeScores` returns Promise — caller at `js/game.js:76-78` awaits via `.then()`
