# Design: editor-layout-scroll

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## Layout (C4 container diagram)

```
┌─────────────────────────────────────┐
│          #app (480px max)           │
│  ┌───────────────────────────────┐  │
│  │  .screen-editor               │  │
│  │  flex-direction: column       │  │
│  │  justify-content: flex-start  │  │
│  │  height: 100%                 │  │
│  │                               │  │
│  │  ┌─ editor-header ──────────┐ │  │
│  │  │  h2 "Редактор вопросов"  │ │  │
│  │  │  [+выбор] [+текст] [+слайд]│ │ │
│  │  └──────────────────────────┘ │  │
│  │  ┌─ editor-list (flex:1) ───┐ │  │
│  │  │  scrollable, no max-h    │ │  │
│  │  │  ┌─ editor-card ────┐   │ │  │
│  │  │  │ 📝 Question...   │   │ │  │
│  │  │  └─────────────────┘   │ │  │
│  │  │  ┌─ editor-card ────┐  │ │  │
│  │  │  │ ✏️ Question...   │  │ │  │
│  │  │  └─────────────────┘  │ │  │
│  │  └───────────────────────┘  │  │
│  │  ┌─ editor-footer ────────┐ │  │
│  │  │  ← Назад в лобби      │ │  │
│  │  └────────────────────────┘ │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Data flow

- Editor reads from `localStorage` (`bdtrivia_draft`), renders via `renderEditorItems()`
- Add buttons append to `draftItems[]` array, re-render
- Save writes to `localStorage`, cancel discards changes
- Back button returns to lobby screen (`screen-lobby-host`)
- All state is local (no Firebase writes during editing)

## Key design decisions

1. **`.screen-editor` gets its own layout class** — overrides `.screen` defaults for this screen only
2. **Remove `max-height: 55vh`** from `#editor-list` — list fills remaining space via `flex: 1`
3. **Sticky header and footer** — title+add buttons at top, back button at bottom; neither scrolls
4. **Global `.screen` unchanged** — other screens still use `justify-content: center`

## Sizing

All editor-specific elements scaled to ×1.2 of current values (see research.md for full table).
