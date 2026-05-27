<!-- feature: ai-validation | date: 2026-05-28 | agent: design -->

# Data Flow — AI Answer Validation

## End-to-End Flow

```mermaid
sequenceDiagram
    participant P as Player Browser
    participant FB as Firebase RTDB
    participant H as Host Browser (game.js)
    participant AV as answer-validation.js
    participant HF as HuggingFace CDN
    participant IDB as IndexedDB Cache

    P->>FB: Write { answer: "Paris, France" } to /rooms/{id}/answers/{q}
    FB-->>H: onValue triggers snapshot
    H->>H: computeScores() starts
    H->>AV: validateAnswer(question, "Paris, France", ["Paris", "paris france"])
    Note over AV: Type = "text" → AI path

    alt Model not loaded
        AV->>IDB: Check cache
        IDB-->>AV: Cache miss
        AV->>HF: Fetch pipeline (ONNX + tokenizer ~30MB)
        HF-->>AV: Model weights loaded
        AV->>IDB: Store in cache
    else Model cached
        AV->>IDB: Load from cache
        IDB-->>AV: Pipeline ready
    end

    AV->>AV: getEmbedding("Paris, France") → Float32Array(384)
    AV->>AV: getEmbedding("Paris") → Float32Array(384)
    AV->>AV: getEmbedding("paris france") → Float32Array(384)
    AV->>AV: cosineSimilarity(userEmb, each correctEmb)
    Note over AV: max sim = 0.89 >= 0.7
    AV-->>H: { correct: true, score: 100, confidence: 0.89 }

    H->>FB: Write { score: 100, confidence: 0.89 } to /rooms/{id}/scores/{player}
    FB-->>P: onValue triggers score update
    P->>P: Render scoreboard
```

## Data Transformations

| Step | Input | Transformation | Output |
|---|---|---|---|
| Player submit | raw text | None (stored as-is) | `string` in Firebase |
| `validateAnswer()` | userAnswer, correctAnswers[] | `.trim().toLowerCase()` | Normalized strings |
| `getEmbedding()` | normalized string | `pipeline("feature-extraction")` with mean pooling + L2 norm | `Float32Array` (384) |
| `cosineSimilarity()` | 2 Float32Arrays | `sum(a[i] * b[i])` [dot product since normalized] | `number` [0..1] |
| Threshold check | similarity score | `sim >= 0.7` | `boolean` |
| Score result | correct flag, points, confidence | Composite | `{ correct, score, confidence }` |

## Firebase Data Shape (unchanged)

```js
/rooms/{roomId}/answers/{playerId}/{questionIndex}: string
/rooms/{roomId}/scores/{playerId}/{questionIndex}: {
  score: number,
  confidence: number    // NEW field
}
```

The only change is the addition of a `confidence` field alongside `score` in the scores node, enabling the host UI to show a confidence indicator for AI-validated answers.
