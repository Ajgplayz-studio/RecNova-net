# RecNet

Photos from RecNova, rec.net style. Fan-made, not affiliated with Rec Room Inc.

## Adding a photo

Add an entry to `photos.json` (newest first):

```json
{
  "image": "https://files.catbox.moe/xxxxxx.png",
  "user": "Ajgplayz",
  "time": "Oct 18, 5:30 PM",
  "room": "^DormRoom",
  "caption": "optional caption"
}
```

- `image` — the Catbox URL from "Save to RecNet" in the game
- `user` — the name entered in the game
- `time` — when it was taken
- `room` — where it was taken, with a `^` prefix like rec.net (default `^RecNova`)
- `caption` — optional
