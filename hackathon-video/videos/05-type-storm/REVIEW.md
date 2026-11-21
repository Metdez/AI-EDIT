# 05 — Type Storm · REVIEW

## What was built
- `out/final.mp4`: 1920×1080, 30 fps, 93.418 s, H.264 + AAC (voice at 1.0, 13 bundled Pixabay-licence SFX at 0.2–0.35). Mean −18.2 dB, peak −1.6 dB.
- One three.js canvas, one swarm of 22,000 points (`scenes/storm.js`). Each of 69 shots is a target shape; every cut is the swarm morphing into the next shape (0.4 s + up to 0.22 s stagger, curved 3D flight). Words are sampled from Archivo Black drawn on a 2D canvas. Average shot length is 1.35 s.
- Spoken examples in 3D: TRAFFIC streams down into 5,500 light-trail cars on a street grid while 192 buildings rise and the camera tilts overhead (Boston); WEATHER dissolves into rain, with a lightning bolt and two flashes; a solar system with 6 orbiting planets; exactly 1,000 points spawn in step with an HTML counter. Also the globe, then gears, then a browser holding the globe (real world → how it works → browser), and a code block (`ai.write("physics")`) → clock → PHYSICS → F = ma.
- The bubble is one muted `<video>` that snaps to a new spot on each sentence. It is the O in YO, COOL and GOES (a white ring fades in so it reads as a letter). It goes big only for 0–4.2 s and 85.6–93.4 s.
- The Sundai logo appears at 7.2 s (then zooms away) and at 88.6 s (held to the end, with a particle orbit).
- 33 callouts, 1–5 words each, are timed from `words.json` (`compositions/captions.html`, a single captions track).

## What was checked
- `hyperframes check`: 0 errors. There are 13 warnings, all `nested_media_start_basis_ambiguous` on the SFX `<audio>` tags. Their host starts at 0, so local time and global time are the same and the warnings are harmless. Layout shows 4 info items: caption words caught mid slide-in.
- Snapshot of every shot (69 frames, `snaps/all/contact-sheet-1..8.jpg`), plus re-snapshots after fixes (`snaps/fix1`, `snaps/fix2`). Fixed so far: missing caption word spacing, text crowding the big bubble, the burst losing its lower half (a correlated hash), the city ground slab and buildings too tall and grey, tower and network too small, globe land pattern, bloom too hazy.
- Contact sheet pulled from the rendered MP4 (`out/contact.jpg`, 1 frame / 4 s). It matches the snapshots: no black frames, nothing covers the face, and no key text sits under the bubble.

## Weak or unfinished
- No music bed. The free catalog needs a HeyGen sign-in, so the film is voice plus SFX only. I have not listened to the mix; it was checked by levels only.
- Transition variety is low. Nearly every seam is the same particle morph; the only others are the logo zoom-through and the lightning flash. The brief asks for 3–5 kinds.
- Pink appears on about 10 words across the film, not strictly one accent.
- Particle words have grainy edges by design. "3D" and "3D?" use extra depth and read speckled.
- The city is a generic grid. Nothing in it says Boston except the callout: no river and no Mass Ave.
- The crowd shot (5.0 s) reads as an abstract grid of heads more than as people.
- Small bubbles are 230 px, so the face is small for most of the film.
- I skipped the Studio preview the skill asks for before the delivery render, because this was an autonomous run.
- The file is large (230 MB) because of the encoder's high bitrate.
