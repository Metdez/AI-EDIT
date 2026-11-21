# Solid — 10 variants of the 44.5 s vertical ad

Ten cuts of one script (voice: "Take two"), each copying the pacing of `REFERENCE VIDEO.mp4`.
Docs: [docs/README.md](docs/README.md) (file map, process, preferences).
Finished files: `out/NN-name.mp4`, also copied to `../Solid final videos/` (1080×1920, 30 fps, with voice, music and sound effects).

## How it is built

- `variants.mjs` — the ten cuts as data: shot list (each shot starts on a word of `assets/words.json`),
  caption style, graphics, sounds, music bed.
- `build.mjs` — turns that data into one HyperFrames project per variant under `videos/NN-name/`.
  `node build.mjs` rebuilds all, `node build.mjs 03` rebuilds one. Do not edit `videos/*` by hand; it is overwritten.
- `tools/music.py` — synthesises the music beds (all variants use the "bright" one) (needs numpy).
- `assets/` — transcoded footage, trimmed voice, logo, sound effects, music. Video folders hard-link to it.
- `research/` — transcripts, frame sheets and the four research reports (reference breakdown,
  footage catalogue, screen-recording catalogue, Nate/Motion systems digest).

Render one: `cd videos/03-split-screen && npx hyperframes@0.9.72 check && npx hyperframes@0.9.72 render -o out/final.mp4`.

## The variants

| # | Name | What is different |
|---|---|---|
| 01 | reference-cut | Closest copy: hard cuts, one small white word at a time, logo only on the end card |
| 02 | punch-karaoke | Punch-in on every camera cut, heavy yellow karaoke captions, logo pill on top |
| 03 | split-screen | Founder on the top half, product on the bottom half through the middle section |
| 04 | face-bubble | Product full-frame with a round face bubble (Nate's vertical style) |
| 05 | clean-mock | More designed UI scenes, bold rounded captions, navy backdrop |
| 06 | hyper-cut | 30 shots instead of 21, jump-zooms, one huge word at a time, flashes on chapters |
| 07 | dark-terminal | Monospace terminal captions, green accent, slower moves |
| 08 | teal-brand | Everything as cards on Solid teal with the logo fixed on top |
| 09 | hex-3d | three.js field of 3D Solid hexagons behind floating cards |
| 10 | title-hook | Title stamped on the hook, progress bar, word-by-word lower captions |

## Known weak points

- Nobody has listened to these. Levels were measured (about −13 LUFS, peaks −1 dBTP), not heard.
- The music is synthesised to match the reference's measured tempo (~89 BPM) and shape (quiet pad, bass drop
  near "send connection requests"). It is a stand-in; a licensed track would sound better.
- The LinkedIn shots are built look-alike scenes with fictional people, not the real site. They use LinkedIn's name, blue and "in" badge; decide whether you are comfortable with that in an ad.
- No footage existed for the recruiter, calendar, group chat, CEO bot, Asana or Slack beats. Those are built
  UI scenes with invented sample content (Jordan Lee, Sam Ortiz, Riley Chen are fictional).
- The on-screen activity log ("Interview booked", "Asana updated", ...) illustrates the script; it is not
  taken from the real product.
- The CTA shot (`Last clip.MOV`) is dim and orange and does not match the other clips.
- The t-shirt in every camera shot says PokerRank, not Solid.
- Screen-recording crops avoid the third-party names and emails in the dashboard, but check before posting.
- In 01 and 05 the mid-frame captions sit over the mock UI, as in the reference; they can clutter.
- In lower-caption variants the activity-log rows sit below the TikTok safe line and may be covered by app UI.
