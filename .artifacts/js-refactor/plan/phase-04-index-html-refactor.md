<!-- feature: js-refactor | phase: plan | date: 2026-05-28 | agent: plan-lead -->

# Phase 04: Refactor index.html

## Goal

Modify `index.html` to:
1. Remove the inline `<style>` block (lines 10-140) — CSS is now in `css/styles.css`
2. Remove the inline `<script>` block (lines 231-1439) — JS is now in modules
3. Add `<link rel="stylesheet" href="css/styles.css">` in `<head>`
4. Add `<script type="module" src="js/main.js">` at end of `<body>`

## Inputs

- `index.html` — current file with inline CSS/JS (1441 lines)
- `css/styles.css` — already exists, exact copy of inline CSS
- Phase 03 output (`js/main.js`)

## Outputs (modified file)

- `index.html` — reduced to ~100 lines (HTML only + CDN scripts + link + module script)

## Steps

1. **In `<head>`:**
   - Remove `<style>...</style>` block (lines 10-140)
   - Add `<link rel="stylesheet" href="css/styles.css">` after CDN scripts

2. **In `<body>`:**
   - Remove entire inline `<script>...</script>` block (lines 231-1439)
   - Add `<script type="module" src="js/main.js"></script>` at end of `<body>`
   - Keep `<div id="app">...</div>` with all 8 screens unchanged

3. **Verify CDN scripts remain** (lines 7-9):
   - `firebase-app-compat.js` ✓
   - `firebase-database-compat.js` ✓
   - `cloudinary widget all.js` ✓

## Quality Gates

- `index.html` has zero inline `<style>` or `<script>` (except CDN scripts)
- `css/styles.css` `<link>` is the only CSS source
- `js/main.js` `<script type="module">` is the only JS source
- All 3 CDN scripts remain in `<head>` (Firebase compat, Firebase database compat, Cloudinary)
- All 8 screen divs remain unchanged
- No HTML elements or attributes changed — only CSS/JS extraction

## Out of Scope

- No CSS changes (already in `css/styles.css`)
- No JS logic changes (already in modules)
- No new features

## Test

Full manual test suite (see `design/tests.md`):

1. Open `index.html` via `http://localhost:8080`
2. No console errors on page load
3. Test host creates room
4. Test player joins room
5. Test game flow (question → answer → reveal → next → finished)
6. Test reconnect after refresh
7. Test question editor (add/edit/delete/reorder/save)
8. Test Cloudinary upload
9. Test QR code display
10. Test copy room code button
11. Test all 8 screens render correctly
