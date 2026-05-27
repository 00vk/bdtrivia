<!-- feature: p1-1-room-firebase | phase: plan | date: 2026-05-27 | agent: plan-lead -->

# P1.1 — Room + Firebase: Implementation Plan

## Goal

Create the foundational `index.html` with Firebase RTDB integration, room code generation, and room creation flow for both host and player modes.

## Inputs

- `.artifacts/p1-1-room-firebase/design/architecture.md`
- Firebase Realtime Database (Spark tier) knowledge
- qrcode.js CDN (for future, not in this phase)

## Outputs

| File | Action |
|---|---|
| `index.html` | Create |

## Implementation Steps

1. Create `index.html` with HTML5 doctype, viewport meta
2. Add Firebase compat SDK scripts (app + database) via CDN
3. Add CSS: gradient background, screen system, inputs, buttons, room code display, player list
4. Add Firebase config placeholder + initialization
5. Implement `showScreen(id)` for SPA-like screen switching
6. Implement `generateRoomCode()` using charset excluding ambiguous chars (0/O/1/I/L)
7. Implement `createUniqueRoomCode()` with Firebase uniqueness check
8. Host flow: nickname input → create room → Firebase write → lobby with code display
9. Player flow: room from URL or manual entry → validate room exists → nickname → join → lobby
10. Lobby: realtime player list via `child_added` listener
11. Firebase `onDisconnect` for player disconnect detection
12. Error handling: room not found, game started, Firebase errors

## Quality Gates

- Page loads without console errors
- Room code generated and written to Firebase
- Player can join from ?room=CODE param
- Player list updates in realtime for host
- Rejoining with ?room=CODE after creation shows correct screen
