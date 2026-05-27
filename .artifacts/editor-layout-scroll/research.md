# Research: editor-layout-scroll

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## Current layout (problematic)

### HTML structure (`index.html:159-169`)
```html
<div id="screen-editor" class="screen">
  <h2>Редактор вопросов</h2>
  <div id="editor-list"></div>
  <div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:center;width:100%;max-width:360px;">
    <button class="editor-btn-sm" id="editor-add-choice">+ Вопрос (выбор)</button>
    <button class="editor-btn-sm" id="editor-add-text">+ Вопрос (текст)</button>
    <button class="editor-btn-sm" id="editor-add-slide">+ Слайд</button>
  </div>
  <div id="editor-error" class="error hidden"></div>
  <button class="btn btn-secondary" id="editor-back-btn" style="margin-top:8px;">← Назад в лобби</button>
</div>
```

### Root causes of squishing

1. **`.screen` CSS** (`index.html:19`):
   ```css
   .screen { display: none; flex-direction: column; align-items: center; justify-content: center; height: 100%; text-align: center; gap: 16px; }
   ```
   `justify-content: center` + `height: 100%` forces all children into a centered column that cannot overflow.

2. **`#editor-list` CSS** (`index.html:102`):
   ```css
   #editor-list { width: 100%; max-width: 360px; display: flex; flex-direction: column; gap: 6px; margin: 4px 0; max-height: 55vh; overflow-y: auto; }
   ```
   `max-height: 55vh` artificially limits the list height to 55% of viewport. When many cards exist, the entire `.screen` flex container compresses cards to fit within the centered layout.

3. **`#app` container** (`index.html:18`):
   ```css
   #app { width: 100%; max-width: 480px; height: 100vh; max-height: 800px; padding: 24px; }
   ```
   Fixed height container prevents natural page scroll.

### Current editor sizing values (all need +20%)

| Selector | Current value | ×1.2 target |
|---|---|---|
| `.editor-card-summary` padding | 10px 12px | 12px 14px |
| `.editor-card-icon` font-size | 1.2em | 1.4em |
| `.editor-card-icon` width | 28px | 32px |
| `.editor-card-preview` font-size | 0.9em | 1.05em |
| `.editor-card-actions button` font-size | 0.8em | 0.95em |
| `.editor-card-actions button` padding | 2px 6px | 4px 8px |
| `.editor-btn-sm` font-size | 0.85em | 1em |
| `.editor-btn-sm` padding | 6px 14px | 8px 16px |
| `.editor-btn-save` font-size | 0.95em | 1.1em |
| `.editor-btn-save` padding | 8px 20px | 10px 24px |
| `.editor-btn-cancel` font-size | 0.95em | 1.1em |
| `.editor-btn-cancel` padding | 8px 20px | 10px 24px |
| `.editor-card-form input` font-size | 0.95em | 1.1em |
| `.editor-card-form input` padding | 10px 12px | 12px 14px |
| `.editor-card-form` gap | 8px | 10px |
| `.editor-card-form` padding | 8px 12px 12px | 10px 14px 14px |
| `.editor-card-form label` font-size | 0.85em | 1em |
| `#editor-list` gap | 6px | 8px |
