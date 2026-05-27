<!-- feature: ai-validation | date: 2026-05-28 | agent: design -->

# C4 Container Diagram — AI Answer Validation

## Scope

The bdtrivia browser application decomposed into ES modules. The new `answer-validation.js` module is the sole addition.

## Diagram

```mermaid
C4Container
  title Container Diagram — bdtrivia Browser App

  System_Boundary(browser, "Browser (Host)") {
    Container(dom, "DOM UI", "HTML + CSS", "Renders game screens, question UI, scoreboard")
    Container(firebase_mod, "firebase.js", "ES Module", "Firebase init, RTDB helpers (ref, push, onValue)")
    Container(game_mod, "game.js", "ES Module", "Core game logic: room creation, computeScores(), round logic")
    Container(question_mod, "questions.js", "ES Module", "Question bank, type detection (text/image), fetch from Firebase")
    Container(ai_mod, "answer-validation.js", "ES Module", "NEW: AI-powered answer validation with Transformers.js")
  }

  System_Ext(firebase, "Firebase RTDB", "Cloud database")
  System_Ext(hfcdn, "HuggingFace CDN", "Model ONNX weights")

  Rel(game_mod, firebase_mod, "Imports — reads/writes data")
  Rel(game_mod, question_mod, "Imports — fetches questions")
  Rel(game_mod, dom, "Calls — updates UI via DOM API")
  Rel(game_mod, ai_mod, "Imports — calls validateAnswer()")
  Rel(ai_mod, hfcdn, "Fetch — downloads pipeline model on demand")
  Rel_D(firebase_mod, firebase, "HTTPS/WSS — Firebase SDK")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Module Dependency

```
firebase.js  (Firebase init + helpers)
     ^
     |
 questions.js  (question bank, type detection)
     ^
     |
 game.js  (core game logic, computeScores())
     ^
     |
 answer-validation.js  (NEW — imported only by game.js)
```

## Existing Module Responsibilities

| Module | Responsibility |
|---|---|
| `firebase.js` | Firebase app init, RTDB ref generation, `push()`, `onValue()` listeners |
| `game.js` | Room lifecycle, `computeScores()`, round transitions, host detection |
| `questions.js` | Question pool, category filters, detect `type: "text"` vs `"image"` |

## New Module Interface

```js
// answer-validation.js — exported API
export async function validateAnswer(question, userAnswer, correctAnswers)
// Returns: { correct: boolean, score: number, confidence: number }
```
