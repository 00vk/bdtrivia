<!-- feature: ai-validation | date: 2026-05-28 | agent: design -->

# C4 Context Diagram — AI Answer Validation

## Scope

The AI Validation feature adds Transformers.js-based semantic answer matching to the bdtrivia trivia game system. It operates entirely within the host browser with no server-side component.

## Diagram

```mermaid
C4Context
  title System Context — bdtrivia with AI Validation

  Person(host, "Host Player", "Creates room, validates answers")
  Person(player, "Player", "Joins room, submits answers")

  System_Boundary(bdtrivia, "bdtrivia (Browser App)") {
    System(game, "Game Engine", "ES modules, DOM UI, Firebase SDK")
    System(aiVal, "AI Validator", "Transformers.js in host browser")
  }

  System_Ext(firebase, "Firebase RTDB", "Real-time state sync")
  System_Ext(cloudinary, "Cloudinary", "Image/media question assets")
  System_Ext(hfcdn, "HuggingFace CDN", "Model weight files (~30MB)")
  System_Ext(browserCache, "Browser IndexedDB", "Cached model weights (CacheAPI)")

  Rel(host, game, "Creates room, triggers scoring")
  Rel(player, game, "Submits answers via DOM")
  Rel(game, firebase, "Reads/writes rooms, answers, scores")
  Rel(game, cloudinary, "Fetches question images")
  Rel(host, aiVal, "Calls validateAnswer() during computeScores()")
  Rel(aiVal, hfcdn, "Downloads model on first text question (lazy)")
  Rel(aiVal, browserCache, "Reads/writes cached model via IndexedDB")

  UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## External Systems

| System | Purpose | Interaction |
|---|---|---|
| Firebase RTDB | Room state, questions, answers, scores | Read/write via Firebase JS SDK v9+ |
| Cloudinary | Hosted images for image-round questions | Fetch via URL (unchanged) |
| HuggingFace CDN | Model ONNX weights + tokenizer files | HTTP fetch, cached in IndexedDB |
| Browser IndexedDB | CacheAPI-backed model storage | Reduces repeat downloads |

## Key Decision

The model is loaded **lazily** — only when the host's `computeScores()` encounters a text-type question for the first time, and only on the host's browser (not on non-host players). This avoids unnecessary downloads for image-only games.
