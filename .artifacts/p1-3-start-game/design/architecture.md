<!-- feature: p1-3-start-game | phase: design | date: 2026-05-27 | agent: design-lead -->

# P1.3 — Start Game: Design

## Overview

Add the "Start Game" button to host lobby and state transition listeners for both host and player.

## Changes

### Host Lobby Screen
- Add "Начать игру" button below player list
- Disabled until at least 1 player connected
- On click: set `room.state = "playing"`, `room.currentItem = 0`

### State Listener
- Both modes subscribe to `/rooms/<code>/state` and `/rooms/<code>/currentItem`
- On state change to "playing": host shows `screen-game-host`, player shows `screen-game-player`
- These screens are placeholders for now (P1.4+ build them out)

### Screens Added
- `screen-game-host` — placeholder: "Game in progress" + currentItem info
- `screen-game-player` — placeholder: "Game started, waiting for question"

### Data Flow
```
Host clicks "Start"
→ Firebase: state = "playing", currentItem = 0
→ Host listener fires → shows screen-game-host
→ Player listener fires → shows screen-game-player
```
