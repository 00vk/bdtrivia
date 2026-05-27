# Research: media-upload

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## Current media handling

### Editor form (`index.html:1047-1059`)
- `<select class="f-media-type">` with options: `""`, `youtube`, `image`, `audio`
- `<input class="f-media-url">` for manual URL entry
- No file upload, no file picker, no drag-and-drop

### Save handler (`index.html:1139-1142`)
```js
var mediaType = form.querySelector('.f-media-type').value;
var mediaUrl = form.querySelector('.f-media-url').value.trim();
item.media = mediaUrl ? { type: mediaType, url: mediaUrl } : null;
```

### Game display (`index.html:716-736`)
- `renderMedia(media, containerId)` — renders iframe/img/audio based on `media.type`
- Called for both host and player screens

### Data model
```js
media: { type: "youtube" | "image" | "audio" | "", url: "<string>" } | null
```

### Firebase
- Only `firebase-app-compat.js` + `firebase-database-compat.js` loaded
- `storageBucket: "bdtrivia-bec64.firebasestorage.app"` exists in config but unused
- **Firebase Storage blocked on Spark plan** — use Cloudinary instead

### Cloudinary config
- Cloud name: `dcdvpwr2v`
- Upload preset: `bdtrivia` (unsigned)
- CDN widget: `https://widget.cloudinary.com/v2.0/global/all.js`
- Unsigned upload — no API keys in client, works from static HTML

### Draft storage
- `localStorage` key `bdtrivia_draft` — serialized array of items
- `getGameItems()` reads same localStorage when starting a game
- Media URLs stored as strings in `item.media.url`

### No existing upload code
- Zero file handling, zero FileReader, zero fetch/XHR uploads

### Key constraints
- Static HTML/JS, no server, no bundler
- File size limit: 10MB (enforced via Cloudinary widget config)
- All state in localStorage (draft) or Firebase RTDB (game)
