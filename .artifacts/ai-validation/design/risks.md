<!-- feature: ai-validation | date: 2026-05-28 | agent: design -->

# Risks — AI Answer Validation

## Risk Matrix

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Model download ~30MB on first text question | High | Medium | Lazy load only on host; show loading indicator; leverage IndexedDB caching via `Transformers.js` built-in CacheAPI so subsequent games load instantly |
| R2 | WASM/ONNX runtime incompatibility in older browsers | Low | High | Detect `WebAssembly` support at pipeline init; fall back to exact-match if unavailable; Transformers.js uses ONNX Runtime Web which falls back to WASM CPU path |
| R3 | Cosine threshold 0.7 may be too strict or too lenient | Medium | Medium | Make threshold configurable (default 0.7); add `confidence` to score output so host can manually adjudicate borderline answers; consider per-language tuning |
| R4 | Memory usage — model stays in heap all game | Medium | Low | Pipeline is ~50-80MB in memory; acceptable for host-only; non-host browsers never load it; if needed, call `pipeline.dispose()` after game ends |
| R5 | IndexedDB cache eviction by browser | Medium | Low | Tolerable — triggers a fresh download on next game; model URL is static so cache is reusable across sessions; set `Cache-Control` headers via CDN are honored by CacheAPI |
| R6 | Transformers.js CDN outage | Low | High | Pin version in URL (`@xenova/transformers@2.x`); fallback to CDN mirror (unpkg, jsdelivr both have the package); exact-match fallback still functions |
| R7 | Multilingual model accuracy varies by language | Medium | Medium | Model supports 50+ languages; test with Bengali (given app name "bdtrivia"); if accuracy poor, swap to `Xenova/paraphrase-multilingual-mpnet-base-v2` (larger, more accurate) |
| R8 | Promise rejected during pipeline creation | Low | Medium | Wrap `pipeline()` in try/catch; set `modelPipeline = null` on failure; subsequent calls attempt re-initialization with exponential backoff |

## Fallback Chain

```
validateAnswer() called
    → Exact match (indexOf)?
        YES → return { correct: true, confidence: 1.0 }
        NO  → modelPipeline === null?
            YES → try loading (with loading indicator)
                → Success? → proceed with AI
                → Failure? → return exact-match result (correct: false)
            NO  → proceed with AI validation
```

## Threshold Sensitivity

The 0.7 cosine similarity threshold was chosen based on the `paraphrase-multilingual-MiniLM-L12-v2` model's typical performance on semantic textual similarity tasks:

| Similarity Range | Interpretation | Scoring |
|---|---|---|
| 0.0 – 0.4 | Unrelated | Incorrect (score = 0) |
| 0.4 – 0.7 | Partially related (different city, same country) | Incorrect (score = 0) |
| 0.7 – 0.85 | Semantically similar (synonyms, minor phrasing) | Correct (full points) |
| 0.85 – 1.0 | Near-identical or paraphrase | Correct (full points) |

## Rollback Plan

If the AI validation introduces issues in production, the host player can be toggled to exact-match only by removing `answer-validation.js` import from `game.js` and restoring the original `indexOf` logic. All other game functionality remains unaffected.
