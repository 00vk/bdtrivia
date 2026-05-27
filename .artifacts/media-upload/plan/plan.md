# Plan: media-upload

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## Phase 1 — Add Cloudinary Widget CDN

**File:** `index.html`

Add script tag after Firebase scripts (line 8).

## Phase 2 — CSS for upload button + status

Add after `.editor-card-actions button` block.

## Phase 3 — Modify `buildEditorForm()` media section

Add upload button 📁 next to URL input, plus status `<div>` below.

## Phase 4 — Add `openUploadWidget(index)` function

Cloudinary widget init with `cloudName: dcdvpwr2v`, `uploadPreset: bdtrivia`, auto-fills form on success.

## Phase 5 — Verification

- Upload image → URL auto-filled, type = "Картинка"
- Upload audio → URL auto-filled, type = "Аудио"
- File >10MB → rejected
- Manual URL entry still works
- Save → localStorage → start game → media renders
