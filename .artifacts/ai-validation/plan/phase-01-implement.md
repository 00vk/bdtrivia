# Plan: ai-validation — Phase 01

<!-- feature: ai-validation | date: 2026-05-28 | agent: planner -->

## Summary
Add Transformers.js CDN to index.html, create `js/answer-validation.js` with embedding-based validation, modify `computeScores()` in game.js to use it for text questions.

## Files to modify
- `index.html` — add Transformers.js CDN script
- `js/state.js` — add `aiModel`, `aiReady` fields
- `js/game.js` — modify `computeScores()` to call `validateAnswer()` for text questions
- New: `js/answer-validation.js` — full module

## Changes

### 1. index.html (line 9, after Cloudinary)
Add before `</head>`:
```html
<script src="https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.0.1"></script>
```

### 2. js/state.js
Add to state object:
```js
aiModel: null,
aiReady: false
```

### 3. js/answer-validation.js (NEW)
```js
import { state } from './state.js';

var EXTRACTOR = null;
var THRESHOLD = 0.7;

function cosineSimilarity(a, b) {
  var dot = 0, na = 0, nb = 0;
  for (var i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function validateAnswer(question, userAnswer, correctAnswers) {
  // Lazy load model on first call
  if (!EXTRACTOR) {
    try {
      EXTRACTOR = await transformers.pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
      state.aiReady = true;
    } catch(e) {
      // Fallback to exact match
      state.aiReady = false;
      return exactMatch(userAnswer, correctAnswers);
    }
  }

  try {
    var answerEmb = await EXTRACTOR(userAnswer, { pooling: 'mean', normalize: true });
    var answerData = answerEmb.data;

    for (var i = 0; i < correctAnswers.length; i++) {
      var caEmb = await EXTRACTOR(correctAnswers[i], { pooling: 'mean', normalize: true });
      var sim = cosineSimilarity(answerData, caEmb.data);
      if (sim >= THRESHOLD) return true;
    }
    return false;
  } catch(e) {
    return exactMatch(userAnswer, correctAnswers);
  }
}

function exactMatch(userAnswer, correctAnswers) {
  var ua = (userAnswer || '').toLowerCase();
  for (var i = 0; i < correctAnswers.length; i++) {
    if (correctAnswers[i].toLowerCase() === ua) return true;
  }
  return false;
}
```

### 4. js/game.js — modify computeScores()
**Import** at top (after existing imports):
```js
import { validateAnswer } from './answer-validation.js';
```

**Replace lines 224-237** (correctAnswers building + isCorrect check) with:
```js
var isCorrect = false;
if (item.questionType === 'text') {
  try {
    isCorrect = await validateAnswer(item.question, a.answer || '', item.correctAnswer);
  } catch(e) {
    // fallback
  }
}
```

Then fall through to the existing `isCorrect`-based scoring.

**Note:** Since computeScores uses `.then()` chains, we need to handle the async validation carefully. The cleanest approach: make computeScores async (add `async` keyword to function declaration at line 219) and `await` the validation inside the `.then()` callback. Since the caller already expects a Promise, this is safe.

## Testing
- No test framework — manual verification:
  1. Open host browser, create room
  2. Add text question with correctAnswer "Канберра, Canberra"
  3. Join as player, answer "Canberra" → should be correct (exact match fallback before model loads)
  4. Answer "Канберра" → correct
  5. Answer "Столица Австралии" → should be correct (semantic match after model loads) or at least not crash
  6. Answer "Москва" → wrong
