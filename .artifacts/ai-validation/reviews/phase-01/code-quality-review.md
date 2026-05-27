VERDICT: PASS after fixes

Issues found (all fixed):
- Blocker: computeScores had no try/catch for Firebase calls — wrapped entire body
- Blocker: no .catch() at caller site — added
- Major: unused import showScreen in game.js — removed
- Minor: inconsistent quotes in answer-validation.js (double vs single) — fixed
- Minor: unused `question` param in validateAnswer — removed
- Minor: missing aiModel: null in state.js — added
