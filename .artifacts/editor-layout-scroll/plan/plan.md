# Plan: editor-layout-scroll

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## Phase 1 — CSS changes (`index.html` `<style>` block)

| # | Change | Location |
|---|---|---|
| 1 | Add `.screen-editor-layout` class | After `.screen.active` |
| 2 | Replace `#editor-list` CSS (remove max-height, add flex:1) | Line 102 |
| 3 | Scale up editor sizes ×1.2 | Lines 103-124 |

### New CSS to add:
```css
.screen-editor-layout { justify-content: flex-start; overflow: hidden; }
.screen-editor-layout > .editor-header { flex-shrink: 0; width: 100%; }
.screen-editor-layout > .editor-footer { flex-shrink: 0; width: 100%; }
```

### Updated `#editor-list`:
```css
#editor-list { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 8px; margin: 4px 0; flex: 1; overflow-y: auto; min-height: 0; }
```

## Phase 2 — HTML changes (`index.html` `.screen-editor`)

Restructure to three sections:
```html
<div id="screen-editor" class="screen screen-editor-layout">
  <div class="editor-header">
    <h2>Редактор вопросов</h2>
    <div class="editor-add-row">
      <button class="editor-btn-sm" id="editor-add-choice">+ Вопрос (выбор)</button>
      <button class="editor-btn-sm" id="editor-add-text">+ Вопрос (текст)</button>
      <button class="editor-btn-sm" id="editor-add-slide">+ Слайд</button>
    </div>
  </div>
  <div id="editor-list"></div>
  <div class="editor-footer">
    <div id="editor-error" class="error hidden"></div>
    <button class="btn btn-secondary" id="editor-back-btn">← Назад в лобби</button>
  </div>
</div>
```

## Phase 3 — Verify

- Open editor with 10+ questions — no squishing, page scrolls
- Add/remove questions — list reflows correctly
- Back button works
- Edit/save/cancel cards works
- Host can start game from lobby after editing
