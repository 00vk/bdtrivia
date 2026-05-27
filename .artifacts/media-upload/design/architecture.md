# Design: media-upload

**Date:** 2026-05-27
**Agent:** opencode (big-pickle)

## C4 Container Diagram

```
┌─────────────────────────────────────────────────────┐
│                  index.html (SPA)                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │         Editor Question Card                  │   │
│  │  ┌─ Media Section ─────────────────────────┐ │   │
│  │  │  [YouTube|Картинка|Аудио]  [URL...    ] │ │   │
│  │  │           [📁 Загрузить файл]            │ │   │
│  │  │          Upload status text              │ │   │
│  │  └────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌─────────────────────────┐  ┌─────────────────┐   │
│  │   localStorage          │  │ Cloudinary       │   │
│  │   (bdtrivia_draft)      │  │ Widget CDN API   │   │
│  │   stores media {type,url}│  │ (unsigned upload)│   │
│  └─────────────────────────┘  └─────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│   Firebase RTDB (game in progress)               │   │
│   room.items[].media = {type, url}               │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Data Flow (upload)

```
1. User clicks [📁 Загрузить файл]
   → cloudinary.createUploadWidget({ cloud_name, upload_preset }).open()

2. Cloudinary widget opens file picker (images, audio, video)
   → User selects file
   → Widget shows upload progress (native)

3. On success:
   → Widget callback returns { info: { secure_url, resource_type, format, bytes } }
   → Auto-set:
     - mediaType = 'image' | 'audio' | 'video' (from resource_type)
     - mediaUrl = info.secure_url
   → Fill select + URL input

4. User saves card:
   → saveDraft() → localStorage
   → item.media = { type, url }
```

## Key Design Decisions

1. **Cloudinary widget** — no Firebase Storage (Spark block), unsigned, no server
2. **Widget replaces file input** — no custom drag-and-drop or FileReader needed
3. **Progress native** — Cloudinary widget shows its own progress
4. **Auto-type** — `resource_type` from Cloudinary maps to type select
5. **No DB schema change** — existing `{ type, url }` model reused
6. **Fallback** — manual URL field remains if Cloudinary is down
