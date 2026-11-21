# REVIEW — 02 Blueprint to Life

## What was built
93.4 s, 1920x1080, 30 fps. One WebGL canvas (three.js, local) draws 11 scene modules in `scenes/`, picked by time in
`index.html`; seams between 3D scenes are a pink scanner-bar wipe done with WebGL scissor rects (L->R, R->L, bottom->top),
plus two browser-window zoom-throughs (23.2, 39.15) and one white-flash cut (particles collapse -> sun, 43.4).
The concept runs literally: every example starts as ink wireframe, a pink scan plane sweeps through it and the shaded solid
fills in behind it, then it moves (blocks, globe, ball, Boston grid, storm, solar system, particles, gravity disc, cube, sphere, tower).
Overlays live in 6 chapter sub-compositions + a persistent HUD + one captions composition (46 kinetic callouts of 1–4 words,
timed from words.json). The speaker is one persistent `<video>` in a circular bubble that moves 14 times and docks inside the
browser frame during the sims.

Sound: voice (unchanged) + a music bed (HeyGen catalog track via `/media-use`, free retrieval with the existing credential;
the catalog track is only 30 s, so it is looped with 2 s crossfades and normalised to about -29 LUFS) + 27 bundled Pixabay SFX
(whooshes on wipes, impacts on both logo hits and the flash, pops on the checklist, typing under code, a riser into the AI section).

## What was checked
- `hyperframes check`: 0 errors (see warnings below).
- Snapshots: 34 frames of raw 3D, then 42 frames (one or more per shot), then 15 frames at fixes and seams; all read.
- Final MP4: ffprobe + a contact sheet pulled from the MP4 itself (see the end of this file).
- Audio was measured, not heard.

## Warnings kept on purpose
- `text_below_floor`: HUD chrome (24 px), URL bar text (20–22 px), the bubble's "HOST · LIVE" tag and equation kickers. They are
  decoration, not reading text; every spoken idea is also a 60–116 px callout.
- `line_unread` on the S4 URL bar: it is on screen 3.8 s; the checker measures it as 0.1 s (likely because of the frame's mask shadow).

## Weak spots / honest flaws
- The tangle of knots (63–69.7 s) is drawn with 1 px lines and reads thin at phone size.
- Shots 7–8 (weather 1.8 s, solar 1.6 s) are very short because the speaker lists them fast; the blueprint stage there is only ~0.3 s.
- The "real world" ball floor is a flat grey plane with a visible horizon; it reads as a studio, not a photo-real place.
- Glass cards, corner brackets and HUD readouts are on the default BANNED list; they are kept because the concept and the
  reference (nate-vid camera-HUD) ask for them.
- Music is a looped 30 s catalog track; the loop seams are crossfaded but I could not listen to them.
- Callout text slides in word by word while the speaker says it, so on a paused frame some slabs are half filled.

## Final render (out/final.mp4)
- ffprobe: 1920x1080, 30 fps, 93.418 s, H.264 + AAC audio track.
- Mix measured: -15.2 LUFS integrated, -1.0 dBFS true peak (voice alone was -16.2 LUFS).
- Two contact sheets pulled from the MP4 (1 frame every 4 s, offsets 0 and 1 s) in `.work/mp4-sheet*.jpg`. They match the
  snapshots: no black frames, the face is never covered, and no callout sits under the bubble. The wipe bars and the flash cut render as designed.
- Not done: no Studio preview was opened (non-interactive run). Nobody has listened to the audio.
