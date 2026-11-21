# Footage catalogue (Solid short, 45 s, 9:16)

Source: /Users/zackhanna/Desktop/AI video/drive-download-20261121T004318Z-1-001/

## 0. CRITICAL FINDING: the clips are already vertical

Every .MOV is stored as 1920x1080 with a **rotation=-90 display matrix**. Players, ffmpeg autorotate and the extracted frames (640x1138) show them as native **1080x1920 portrait**. No 608 px crop window is needed. Use the full frame, scaled to 1080x1920 (or slight zoom for reframing).
- ffmpeg autorotates by default, so no flag is needed. Do not pass `-noautorotate`.
- In HyperFrames, check that the rendered `<video>` respects rotation. If it shows sideways, pre-bake with `ffmpeg -i in.MOV -c:v libx264 -crf 14 -c:a aac out.mp4`, which applies the rotation.
- "x-centre" below is therefore the subject position in the portrait frame (% of 1080 width). It matters for punch-in zooms and for placing captions and the logo, not for cropping.
- A punch-in to 125% leaves a 80% window, so the subject x-centre must be within about 10-90% to stay framed.
- Clips carry an AAC audio track. Frames show whether lips move, but I could not hear the audio. Check it before muting.
- The person is the same in all clips (curly auburn hair, black "PokerRank" tee with green chip logo, gold Casio watch).
- Frame timing: hook/afterhook/last were sampled at 2 fps, laptop/run/thinking at 1 fps. Times below are frame times.

## 1. Hook.MOV (4.8 s, 30 fps) for "AI is honestly starting to scare me a little."

Setting: bright, warm-white bedroom or dorm. White pillar, ceiling smoke detector and vent behind him, cream bedding at lower right. Medium shot, camera at about chest height, slightly low, handheld and fairly steady.

| t (s) | Description |
|---|---|
| 0.0 | Hand over mouth, eyes wide, "shocked" look to the left of camera. x-centre of face about 55%. |
| 0.5 | Same, hand slips down to the lip, still wide-eyed. Face about 50%. |
| 1.0 | Hand sweeps to the back of the head and the camera jerks slightly. Face drifts left to about 35%. Smirk. |
| 1.5-3.0 | Hand behind head, looking down and away, then lips pursed with a "hmm, awkward" face. Face about 33-38%. Frames at 2.0-3.0 are the hand-behind-head pose, quiet, not talking. |
| 3.5 | Drops the arm, leans toward the lens, starts speaking. Face about 50%. |
| 4.0-4.5 | Talking to camera, close and centred, face about 55-60%. Hand enters at the bottom right at 4.5 (soft motion blur). |

- Lip movement: only from about 3.3 s. Before that it is a silent reaction (hand over mouth, thinking). The script line "AI is honestly starting to scare me a little" fits the 3.3-4.8 talking segment, or the reaction faces over a voiceover.
- Usable: 0.0-4.7 whole. Best "scare" beat is 0.0-0.8 (wide eyes, hand over mouth). Best talking beat is 3.4-4.7.
- Unusable or weak: 1.0-1.2 (arm swipe, small camera jerk). The last frames show a hand entering the lens (4.5+), so cut at about 4.6.
- Vertical: native portrait. Face stays between 33% and 60%, so a 115% zoom centred at x about 46% is safe. No dead space.
- Mood: startled then sheepish, medium-high energy, comedic. Lighting is warm, bright and flattering.
- Slot: the hook. Use 0.0-0.8 as a visual "scared" beat, then 3.4-4.7 as the line, or lay the VO over 0-4.8.

## 2. Right after hook.MOV (3.2 s, 30 fps), for the "run a six-figure business through agents" setup

Setting: low-angle, very close selfie (camera below chin). Ceiling, a grey door frame at upper left and a mirrored wardrobe behind. Face fills the top 2/3. Hand over mouth in every frame.

| t (s) | Description |
|---|---|
| 0.0 | Wide eyes, hand over mouth (same pose as the start of the hook). Face about 45%. |
| 0.5 | Eyes dart to the right, smiling behind his hand. Face about 50%. |
| 1.0 | Grinning, teeth visible, looking down-left. Face about 45%. |
| 1.5-2.0 | Laughing or stifling a laugh, glancing right. Face 40-50%. |
| 2.5 | Eyes shut, laughing, hand flicks across. Face about 55%. |

- Silent reaction b-roll: he is laughing or "can you believe it", not delivering a line. The hand covers his mouth, so lips cannot be seen.
- Usable: 0.0-3.0 all of it. The best segment is 0.4-2.4, where the smile builds. Cut around 3.0, because the 2.5 frame has motion blur and the clip ends mid-laugh.
- Framing drifts slightly (low-angle handheld) but the face stays 40-55%. A vertical zoom is fine, centre about 48%.
- Mood: delighted, incredulous, "this is wild". Energy is medium and it is funny.
- Slot: pairs with "You can now run every part of a six-figure business entirely through agents." as a reaction cutaway. It is not a talking take. The lighting and angle differ from the hook (a new take), so it reads as a deliberate reaction cut.

## 3. Working at laptop.MOV (15.2 s, 30 fps) for middle b-roll

Setting: desk with a wood top, a silver MacBook at the lower left, a black deck of cards at the lower right. Behind him is a glass partition with a round ceiling light and a white pillar. Medium shot, camera at table height looking up, tripod-steady. Looks like a genuine work-session shot.

| t (s) | Description |
|---|---|
| 0.0 | Setup or start-of-take: a blurred hand swipes in front of the lens and the laptop trackpad. Face is partly in frame and high, at about 55%. |
| 1.0-8.0 | Steady shot. He types with his right hand, eyes down at the screen. Face about 55-65%, chest and logo near the right edge ("PokerRa" is cut off). A watch is visible. A partial figure (another person) is at the far left edge, 0-8%. |
| 9.0 | Typing. |
| 10.0 | Leans or moves his head, motion blur. |
| 11.0 | Head tilts, eyes closed, a sleepy or exasperated look. Face about 65%. |
| 12.0-13.0 | Typing again. **Other people (crew or friends) are visible behind him at right (about 70-85%).** |
| 14.0 | Looks up at the camera and reaches towards it, which is end-of-take. |

- Silent b-roll: no lip movement.
- Usable: 1.0-10.0 (9 s) is clean and ideal for b-roll. For a shorter slice use 2.0-6.0. 11.0-11.8 gives a funny head-tilt beat if wanted.
- Unusable: 0.0-0.8 (the hand blocks the lens), 12.0-15.2 (bystanders visible in the background, and the end-of-take reach).
- Vertical: native portrait. The face drifts 55-65% and the screen is out of frame, so the viewer sees only him and his hands. The subject is right of centre, so zooming in should centre at x about 62%, not 50%. A zoom above about 120% starts to clip the right edge. Do not centre-zoom.
- Mood: focused and calm, "head down grinding". Energy is low, which suits steady working under VO.
- Slot: "testing products", "managing communications" or "a cloud computer working like a human" as a human-at-keyboard stand-in. It cannot show the product.

## 4. Entire run, an entire six-figure.MOV (31.0 s, 60 fps)

Despite the name this is not a "run" or a business demo. It is a full-length **PokerRank t-shirt show-and-tell, followed by a Solid laptop reveal**, shot full-length (head to feet) in a dorm room with a bed, backpack and window behind him. Bright, warm light.

| t (s) | Description |
|---|---|
| 0-2 | Full body, centred (about 50%). Holds up two white tees on hangers (left blank with a small logo, right with a large "PokerRank PR" logo). Smiling, talking. |
| 3-4 | Same, camera moves slightly, he shifts right (about 55-60%). |
| 5 | Tees swing, motion blur. He is at 85% at the edge. |
| 6 | Re-centres, about 50-60%. |
| 7-8 | Talking, tees up, about 50%. |
| 9 | Walks left (about 70%), tee covering the frame. |
| 10-11 | He turns away and walks to the bed. At 11 his back is turned, and he fiddles with a tee on the bed (about 45-50%). |
| 12-13 | Back turned or half-turned at the bed, picks up the laptop. |
| 14 | Facing the camera, the laptop in hand, walking towards the lens. About 50%. |
| 15-17 | Medium-full shot, centred. Holds the open laptop at chest height, talks to camera, points at the screen with his left hand. About 50%. |
| 18-19 | Same, pointing at the laptop. About 50%. |
| 20-21 | Pushes in: camera at chest height, the laptop fills the frame. Screen: a Solid-style page reading "What can Solid help with?", with a left sidebar. |
| 22-24 | Close-up of the laptop, shirt logo above it, about 50-65%. |
| 25 | Close-up, hand moves aside. |
| 26 | Camera swings away, lens crossing his arm and torso (blur). **Unusable.** |
| 27 | Whip pan: back to him from behind at the desk. |
| 28 | Whole-body, turned, at the desk and chair. |
| 29-30 | He turns, walks towards the camera, face fuzzy, with a big grin. |

- Talking to camera: 0-9 and 14-19, but this is show-and-tell, not a business pitch. Audio may hold a different, unrelated line. Check the audio before using it.
- Usable (visual b-roll): 15-19 (confident "look at this" presenting shot), and 20-25 (laptop screen close-up).
- The screen is washed out and warm-toned (overexposed, low contrast), with unreadable body text. The only readable text is "What can Solid help with?" at the screen centre. Hence it works as a brief proof-of-product flash, not a screen demo.
- Unusable: 0-13 (t-shirt show, off-topic for the script, "PokerRank" branded merch), 26-31 (swing, turning away, walk-in).
- Vertical: native portrait, a full-length person centred at about 50%. At 15-19 the laptop screen sits at about 40-60% and works well. The 20-25 close-up is centred at about 45-55%. The laptop bottom is at 60-70% height, so captions at the bottom third are fine.
- Mood: playful and enthusiastic. Energy is high in 0-9, medium at 15-19.
- Slot: the "six-figure business" or product-reveal line. Use 15-19 (hold the laptop, point at screen) as the "here it is" beat, and 20-24 as a punch-in on the screen.
- A 60 fps source means slow-motion is possible (2x slow in an edit looks smooth).

## 5. Just sitting and thinking.MOV (11.4 s, 30 fps), for middle b-roll

Setting: bright warm bedroom. White pillar and ceiling smoke detector behind, cream bedding at right. Medium-close selfie angle, slightly low, handheld with a light float.

| t (s) | Description |
|---|---|
| 0 | Finger on his lip, looking at the lens, pensive. Face about 35%, shifted left. |
| 1 | Same, eyes drift. Face about 45%. |
| 2 | Turns his head to look right, hand on chin. Face about 60%, blur on the movement. |
| 3 | Head tilted, chin on hand, looking down, face about 40% (blurred slightly). |
| 4-5 | Hand over mouth, eyes up (thinking). Face about 55%. |
| 6 | Looking right, hand at mouth. Face about 40%. |
| 7 | Eyes up, chin on hand, face about 35-45%. |
| 8 | Hand to cheek, looks right then down. Face about 55%. |
| 9 | Hand on cheek, looks away right. Face about 40%. |
| 10 | Hand at chin, looks down, soft. Face about 55%. |

- Silent b-roll, no lip movement, and he never speaks.
- Usable: 0.0-10.8 all of it. The cleanest: 4-8 s (stable, eyes up, "thinking" posture). The brief head-turn blur at 2-3 s is acceptable in a fast cut, because it is motion, not defocus.
- Face drifts 35-60%, a range of about 25%. A 110% zoom at centre 47% is safe.
- Mood: worried, reflective, "wow what do I do about this". Low energy.
- Slot: alternative for the hook ("AI is honestly starting to scare me a little", with the worried look under VO), or any contemplative middle moment (the "managing communications" or "CEO bot" lines). Both are plausible.

## 6. Last clip.MOV (5.1 s, 24 fps), for "Comment solid, and I'll send you the link."

Setting: **dark, warm orange-lit room** (a different, evening session). He wears **red-tinted glasses** (blue-light), unlike every other clip. The same tee. The pillar and the bed are behind him at right. Handheld, medium shot with the camera at table height, a dark tabletop edge at the bottom.

| t (s) | Description |
|---|---|
| 0.0 | Mid-speech, arm reaching forward in the foreground (soft, a blurred arm across the lower frame). Face about 33%. |
| 0.5 | Camera repositions, the arm still in the foreground. Face about 42%. |
| 1.0 | Mid-sentence, face about 50%, arm across the frame (blur). |
| 1.5 | Face about 28%, talking, leaning left, arm out. |
| 2.0 | Smiling, hands on table, face about 55%. |
| 2.5 | Smiling, hand on table, face about 50%. |
| 3.0 | Talking, hand down at the table, face about 20-30%, leaning left. |
| 3.5 | Talking, face about 50%, hands flat at the table (slightly soft). |
| 4.0 | Leans toward the camera, face about 60-70%, blurred. |
| 4.5 | **Face at the very top-right, close and tilted: reaching to stop recording.** The lens is partly blocked by a hand. |

- Lip movement: yes, speaking for most of it (0-1.5, 3.0-4.0). It is a conversational delivery, but I could not hear the audio.
- Usable: 1.5-4.0 (talking with smiles, the best are 2.0-3.0 where the glance is relaxed). If you need a "sign-off" look, 2.0-3.0 is the cleanest.
- Unusable: 0.0-1.2 (the arm blocks the lower frame and the camera moves), 4.0-5.1 (leans in, lens covered, end-of-take).
- Vertical: native portrait. The face drifts 20-60%, with noticeable swings, so a zoom above 105% risks clipping the face. Keep it full-frame, or zoom with an animated pan. The best static window is 2.0-3.0 (face 50-55%).
- Lighting: dim, orange, noisy, grainy and visibly different from the daylight-bright clips. **The glasses and the orange light are a continuity break.** It will look like a different day. Options: put it last (CTA) under a warm grade, or colour-correct the other clips to match.
- Mood: relaxed, conspiratorial, "hit me up". Energy is low-medium.
- Slot: "Comment solid, and I'll send you the link." Lay the CTA graphic and the Solid logo over the lower half (his hands and the table are in the bottom 35%).

## 7. Solid logo.png (512x122)

- RGBA PNG. The corner pixel is 0,0,0,0, so **the background is fully transparent**.
- Black hexagon mark at left (flat-top rounded hexagon, solid fill) followed by "Solid" in a bold black geometric sans (near-black, roughly #111).
- It is a **dark logo**: it works on light or bright backgrounds (the daylight clips with a white or cream wall). On the dark last clip, on dark video or on any dark background it vanishes, so it needs a **white-inverted version** (CSS `filter: invert(1)` / `brightness(0) invert(1)`) or a light plate behind it.
- Aspect about 4.2:1, so at 9:16 (1080 wide) it sits at about 600-760 px wide. At 512 px native it is slightly soft above about 600 px, so avoid upscaling past that.

## 8. Summary table

| Clip | Usable range | Best crop x-centre % (portrait, native) | Best script slot |
|---|---|---|---|
| Hook | 0.0-0.8 (scared reaction), 3.4-4.6 (talking) | 46% (face 33-60%) | "AI is honestly starting to scare me a little" (hook) |
| Right after hook | 0.4-2.8 | 48% | Reaction cutaway on "run every part of a six-figure business through agents" |
| Working at laptop | 1.0-10.0 (best 2-6) | 62% (face 55-65%, subject right of centre) | Testing products, managing communications, "cloud computer works like a human" (b-roll) |
| Entire run | 15-19 (laptop held and pointed at), 20-25 (screen close-up showing "What can Solid help with?"); 0-13, 26-31 not usable | 50% | Product reveal / six-figure line; a quick screen flash |
| Just sitting and thinking | 0.0-10.8 (best 4-8) | 47% (face 35-60%) | Worry or reflection beat; alternate hook; "CEO bot" or "managing communications" b-roll |
| Last clip | 1.5-4.0 (best 2.0-3.0) | 50% (face 20-60%, no zoom) | "Comment solid, and I'll send you the link" (CTA). Orange light and red glasses are a continuity break. |

## 9. Script moments with NO footage

None of the clips show a screen (apart from the washed-out Solid page in the Entire run clip, 20-25). They are all the person, all in the real world. Needs motion graphics, screen recordings or generated UI:
- A cloud computer using websites and apps like a human (cursor, browser). Only the faint "What can Solid help with?" page in 20-25 relates.
- Testing products.
- Managing communications (inbox, replies).
- A recruiter bot scouting LinkedIn, sending connection requests and booking calendar slots.
- A CEO bot in a group chat.
- A performance dashboard, Asana or Slack.
- Any agent, "AI at work" or automation visual.
- A Solid logo end card (the file exists, but there is no footage with a clean light background for it).

Best use of the footage: person-led bookends (hook, reaction, CTA) and mid-video human beats, with the product moments on motion graphics layered over or cutting between them.

## 10. Extra files

Contact sheets (3x3, numbered frames, in frame order) are in /Users/zackhanna/Desktop/AI video/solid-video/research/frames/cam_extra/. Full-res spot checks: run_23_full.png (the laptop screen is washed out and low-contrast) and last_2.5_full.png.
