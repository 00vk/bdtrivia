<!-- feature: js-refactor | phase: design | date: 2026-05-28 | agent: design-lead -->

# Risk Assessment: JS Refactor

## R1: Module files differ from inline code
- **Risk:** The existing `js/*.js` files were written independently from the inline code. They may have subtle differences in behavior, missing functions, or different variable names.
- **Severity:** HIGH
- **Mitigation:** In implement phase, compare each module against the corresponding inline code block. Use the inline code as the source of truth. Rewrite modules if needed.
- **Fallback:** Restore `index.html` from git and discard module files.

## R2: Missing exports in modules
- **Risk:** Some inline functions reference global variables from other modules. If a function is missing from an export, the import will fail at runtime.
- **Severity:** HIGH
- **Mitigation:** Define all exports explicitly in each module. `main.js` imports all public functions. Verify every function call in the inline code has a corresponding export.
- **Fallback:** Check console errors; add missing exports.

## R3: Global state not shared correctly
- **Risk:** The inline code uses global `var` variables accessible everywhere. With ES modules, each module has its own scope. Shared state must be imported.
- **Severity:** HIGH
- **Mitigation:** `state.js` exports a mutable object. All modules import the same `state` reference. Verify every global variable in inline code is represented in `state.js`.
- **Fallback:** If a variable is missed, add it to `state.js` and import in the dependent module.

## R4: Event listeners lost after refactor
- **Risk:** Event listeners currently registered inside the inline `<script>` may not be re-registered after refactoring if they reference DOM elements that don't exist at module parse time.
- **Severity:** MEDIUM
- **Mitigation:** All event listeners must be registered after DOM is ready. ES modules with `type="module"` already defer execution. Use `DOMContentLoaded` in `main.js` if needed.
- **Fallback:** Manually verify each button works.

## R5: CSS not loading (FOUC / broken layout)
- **Risk:** If `<link href="css/styles.css">` fails to load, the app appears with no styles (white background, unstyled text).
- **Severity:** MEDIUM
- **Mitigation:** Verify the CSS path is correct relative to the GitHub Pages root. The app currently serves from root (`/`), so `css/styles.css` resolves to `/css/styles.css`.
- **Fallback:** Check network tab for 404 on CSS file.

## R6: CDN scripts not available before module execution
- **Risk:** The inline code relies on `firebase` and `cloudinary` as globals. Regular `<script>` tags load synchronously before modules. If CDNs fail to load, modules that reference globals will crash.
- **Severity:** LOW
- **Mitigation:** CDN `<script>` tags remain in `<head>` (not inside modules). They block rendering and load before `main.js` (type="module" is deferred).
- **Fallback:** Add retry logic or error message if `typeof firebase === 'undefined'`.
