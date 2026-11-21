# Reference video breakdown (720x1280, 30 fps, 40.2 s video stream, audio to ~40.28 s)

Method: 161 frames at 4 fps viewed as contact sheets, ffmpeg scene detection (thresholds 0.25 and 0.08), full-res stills at 10 s / 39.5 s, extra stills around ambiguous cuts, word timings from the transcript JSON. Cut times are from scene detection (accurate to about +-0.05 s). Cuts inside the screen recordings (dark UI to dark UI) cannot be reliably detected, so those are listed as "UI changes", not hard cuts.

## 1. Shot list

Legend: TH = talking head (the creator, white sleeveless top, long dark hair, shot on a phone, different room/lighting almost every shot). SR = screen recording (landscape app UI placed full-width in the 9:16 frame, black bars above and below). All shots are full-frame, no split screen, no PiP, no graphics other than captions (see 2) and the end disclosure.

| # | Start | End | Dur | Words | On screen / framing | Transition in |
|---|---|---|---|---|---|---|
| 1 | 0.00 | 2.37 | 2.37 | "Grokbot is honestly starting to scare me a little." | TH medium shot (waist-up), teal/dim room, hand over mouth, looks away from lens, then hand on shoulder. Caption already on at 0.00. | Starts on frame 0 (no fade/intro) |
| 2 | 2.37 | 3.57 | 1.20 | "You can now run every part of a six-figure" | TH extreme close-up of face, wide-eyed, both hands over mouth (surprise), different (bright) room. Tight punch-in framing vs shot 1. | Hard cut, size change (medium to close-up) |
| 3 | 3.57 | 5.83 | 2.26 | "business entirely on your phone." | TH full-body, standing in a living room, holds phone low, then raises it to camera and points at it at about 4.6 s (no cut, motion only). | Hard cut, wide shot after close-up |
| 4 | 5.83 | 7.03 | 1.20 | "Because it has access to its own" | B-roll: close-up of a laptop screen (dark chat UI, "Open computer / Checking the screen" text, app dock) with keyboard at bottom; screen tilted. | Hard cut |
| 5 | 7.03 | 8.23 | 1.20 | "computer that runs on the cloud," | B-roll: large desktop monitor (white UI with text) in a dim room, her hand gesturing in foreground bottom right. | Hard cut (mid-word "computer") |
| 6 | 8.23 | 11.03 | 2.80 | "it can use any website or app exactly like a human would," | TH seated at laptop, warm golden-hour light, chin on hand, looking down at screen, medium shot. Longest "talking" hold in the first half. | Hard cut in the pause after "cloud," |
| 7 | 11.03 | 13.07 | 2.04 | "meaning it does exceptionally well at" | TH side-profile, chin on hand, looks up and away, slightly low angle, blue-gray room. | Hard cut on the breath after "would," |
| 8 | 13.07 | 15.33 | 2.26 | "testing products end-to-end, managing communications" | SR: dark chat app, small white UI cards/boxes appear (a test-UI card pops in around 13.5 s). Letterboxed, black above/below. | Hard cut (just before "products") |
| 9 | 15.33 | 16.73 | 1.40 | "on all platforms, and more." | TH side-profile again (same setup as 7, looking up). | Hard cut, mid "on" |
| 10 | 16.73 | 18.07 | 1.34 | "This is our recruiter bot," | B-roll: laptop screen close-up, tilted, dark chat UI text, keyboard bottom, sunny background top. | Hard cut in the pause after "more." |
| 11 | 18.07 | 19.10 | 1.03 | "or official HR department," | SR: dark app, "Recruiter" chat list + thread, small cursor. | Hard cut |
| 12 | 19.10 | 19.93 | 0.83 | (end of "department,") | SR: a small white browser window (LinkedIn-style) scales/pops open over the dark chat. | Cut/screen-recording transition (window opens) |
| 13 | 19.93 | 24.93 | 5.00 | "and every day its job is to scout talent on LinkedIn, send connection requests, and book qualified candidates on my calendar." | SR: full-width white LinkedIn-style page ("Product designer - NYC"), "Searching people..." then results (Jordan Lee, Sam Ortiz, Riley Chen) with Connect buttons turning Pending, cursor moves, toast "Invitation sent to Jordan Lee". Black bars above/below, white caption on light page (low contrast). | Hard cut |
| 14 | 24.93 | 25.60 | 0.67 | "I also" | Same LinkedIn recording, zoomed out, a small calendar popup ("Intro call, 2:30 PM") bottom-right. Shortest shot. | Cut/zoom-out within SR |
| 15 | 25.60 | 31.17 | 5.57 | "have my recruiter interact with our CEO bot in a group chat who not only understands the vision of our company, but overlooks the performance" | SR: dark "Recruiter" chat (calendar event card visible), then "New Group" dialog (Name, Members: Recruiter, Bot) at roughly 26.7 s, then "Hiring" group chat with messages at roughly 29.7 s ("Jordan Lee intro is Tuesday 2:30..."). Fades/zooms between UI states, no hard cut found. Longest shot. | Hard cut |
| 16 | 31.17 | 35.33 | 4.16 | "dashboard, Asana, Slack, and everything that normally gives me a headache. It's crazy" | TH close, she holds a phone showing a text-heavy chat UI toward the lens (phone fills lower-left), talks and gestures, taps screen with finger. Handheld, face partially cropped at right. White barn-door background. | Hard cut (just before "dashboard") |
| 17 | 35.33 | 37.60 | 2.27 | "to me that I set up my whole team in a single night," | Handheld selfie swing: turns with phone, camera whips/blurs across to a desk with a large monitor, glowing keyboard, pink cup, her hand sweeps toward the setup. Motion blur at the start. | Hard cut with motion blur (on "me") |
| 18 | 37.60 | 40.20 | 2.60 | "and now you can too. Comment Grokbot and I'll send you the link." | TH seated, arms crossed then chin on hand, gray wall, dim blue light right. Static, medium. Disclosure text "This video is sponsored by SpaceXAI." appears at top (about 9% from top) from roughly 39.1 s to end. | Hard cut (during "now") |

Totals: 18 shots, 17 cuts. TH shots: 1,2,3,6,7,9,16,17,18 (9). B-roll of screens: 4,5,10 (3). Screen recordings: 8,11,12,13,14,15 (6, = 17.3 s of the 40.2 s).

Not determined from frames: any sound effects/music (frames only; no audio analysed), exact in-shot zoom keyframes in screen recordings, and the exact times of the two UI changes inside shot 15.

## 2. Captions

- Present continuously from frame 0 (t=0.0) to the end; never absent, including over screen recordings.
- Position: horizontally centred; vertical centre about 54.5% from the top (y of about 698 px of 1280; measured on stills at 10 s and 39.5 s: 693-700 px). That is just below the face/chin in TH shots, i.e. mid-frame, not the lower third. Constant across all shots and shots with different framing (does not avoid the face/phone).
- One word at a time (single word on screen, never 2+). Each word swaps when the next word starts, following the transcript word timings; long words (e.g. "exactly" 9.54-10.02, "entirely") persist their full duration, so you see about 2-3 caption changes per second (about 2.7 words/s).
- Font: clean neo-grotesque sans (Helvetica Neue / Inter-like), regular-to-medium weight (not bold, not heavy), white (#FFFFFF), size about 44-48 px cap height about 30 px on 720-wide frame (word "exactly" about 140 px wide), tight letter-spacing, no outline stroke, no background box. A faint soft drop shadow is possible but not visible at this resolution (text is hard to read on bright/white backgrounds, e.g. over the LinkedIn page it looks pale grey, so there is no strong shadow).
- Case: lowercase as spoken, proper nouns kept capitalised (Grok Bot written as two words with capitals, Asana, Slack, Recruiter, CEO, HR, LinkedIn); numeral for "6 figure" (from "six-figure", hyphen word split); quoted: "Grok Bot" with quotation marks in the CTA; sentence punctuation mostly dropped (trailing periods not shown).
- Highlight: none. Single colour, no active-word colour, no emoji.
- Animation: could not be determined at 4 fps (no visible scale/pop in sampled frames; some frames of the same word look fractionally larger/greyer, so a very quick fade/pop is possible but not confirmed). Treat as a plain hard swap, optionally 2-3-frame fade.
- Caption timing leads the audio slightly: caption of "you can" appears in the first frame of the close-up cut (about 2.25-2.3 s).

## 3. Pacing

- Shots: 18; cuts: 17 in 40.2 s (about 0.42 cuts/s; one cut every 2.4 s).
- Shot lengths: average 2.23 s, median about 2.05 s, min 0.67 s (#14), max 5.57 s (#15). Seven shots are 1.4 s or shorter (#2, 4, 5, 9, 10, 11, 12, 14 counting 0.67 and 0.83), only 3 are over 4 s (#13, 15, 16) and all of those are screen recordings or the phone-demo shot.
- Rhythm: first 18 s is fast (11 cuts, alternating person / device b-roll, 1.2-2.8 s). Middle (19.9-31.2 s) slows to two long screen recordings (5.0 s, 5.6 s) with only UI motion. Last 9 s: phone shot 4.2 s, swing 2.3 s, final static hold 2.6 s.
- Pattern: person shot alternates with screen/b-roll shot: TH(1,2,3) - B-roll(4,5) - TH(6,7) - SR(8) - TH(9) - B-roll(10) - SR(11-15) - TH(16,17,18).
- Cut vs words (approx): 2.37 on "can" start; 3.57 during "six"; 5.83 on "it" (right after "Because"); 7.03 mid "computer"; 8.23 in the pause after "cloud,"; 11.03 end of "would,"; 13.07 just before "products"; 15.33 on "on"; 16.73 in the pause after "more."; 18.07 on "or"; 19.10 mid "department"; 19.93 on "day"; 24.93 in the pause after "calendar."; 25.60 mid "recruiter"; 31.17 just before "dashboard"; 35.33 on "me"; 37.60 on "now". Only about 5 of 17 land in a clause pause; the rest land on or within about 0.1 s before a word start, i.e. cuts are tied to key words / clause starts, not strictly to breaths. Almost every cut is within +-0.1 s of a word boundary.
- Subject-matter sync: device/screen shots start exactly where the words mention them ("computer that runs on the cloud" = monitor; "testing products" = test UI; "recruiter bot" = laptop; "LinkedIn" = LinkedIn recording; "dashboard" = phone showing chat; "set up my whole team" = desk).

## 4. Recurring devices, grade, hook, end

- Transitions: 100% hard cuts. No crossfades, flashes, whip-pans or speed ramps were detected. One camera-motion whip exists inside shot 17 (handheld swing with motion blur) and acts as a natural whip transition.
- Punch-ins: shot 2 is an extreme close-up (face fills frame) after a medium shot, creating a "reaction" punch-in via cut, not a digital zoom. Screen recordings use app-native zoom/pop (window opens in #12, zoom-out in #14).
- Overlays/graphics: none besides captions and the end disclosure. No logos, icons, emoji, arrows, progress bar, or stickers. The app UI is the only "graphic".
- Shakes: handheld jitter only (phone footage), no added shake.
- Sound effects: cannot be determined from frames; no visual cue suggests whooshes (no whip graphics), so assume none or very subtle.
- Colour grade: ungraded/natural phone look; each location differs (teal-grey room, warm golden-hour light, blue-grey side-light, dark desk with blue/pink RGB). Skin natural, moderate contrast, white top is the constant. Screen recordings are dark-mode UI on black (#000 bars) plus one bright white LinkedIn-style page.
- Hook: no title card or text hook. The hook is the spoken first line with the caption on at 0.0 s; she is mid-reaction (hand over mouth) in frame 1.
- Screen-recording framing: landscape recording, scaled to 720 wide, vertically centred (roughly 18-80% of height), black bars above/below; caption sits on it unchanged.
- End/CTA: no end card, logo, or button graphic. CTA is spoken ("Comment Grokbot and I'll send you the link.") and captioned as ("Grok Bot") in quotes. Final shot is a static seated talking head (chin on hand), held 2.6 s, hard stop about 0.2 s after the last word (40.02 s; video ends 40.2). The italic disclosure "This video is sponsored by SpaceXAI." (white, small, about 28 px, italic sans, centred, about 9% from top) appears for the last about 1.1 s (first seen 39.25 s).

## 5. Rules to copy

1. Fixed 9:16 720x1280 / 30 fps; total about 40 s; one voiceover/talk track with no gaps.
2. 18 shots, 17 hard cuts; average shot 2.2 s; no shot under 0.6 s; only 3 shots over 4 s (and those must have on-screen motion).
3. No transitions of any kind (no dissolves, flashes, glitches); only hard cuts. A handheld whip/blur move inside a clip is allowed.
4. Open on frame 0 with the speaker already mid-reaction and the first word already captioned; no title card, no logo sting.
5. Alternate speaker shots with device/screen shots; each screen shot starts on the word that names it (computer, products, recruiter, LinkedIn, dashboard).
6. Vary framing every cut: medium, extreme close-up, full body, profile, over-the-shoulder, so no two consecutive TH shots look alike (change room/light/outfit angle).
7. Make the second shot an extreme close-up (surprise) after the opening medium; reaction faces at 2.4-3.6 s.
8. Front-load the pace: about 11 cuts in the first 18 s, then 5-6 s screen-recording holds in the middle, then 3 shots in the last 9 s.
9. Captions: one word at a time, white, medium-weight Helvetica/Inter-style, no stroke, no box, no highlight colour, centred at about 54-55% of frame height, about 44-48 px, lowercase but keep proper nouns/acronyms capitalised and quote the CTA keyword; on for 100% of the video, word swap exactly at word start.
10. Cut on or up to 0.1 s before a word start (never in the middle of a silence longer than 0.3 s); prefer cutting on the first word of a clause.
11. Screen recordings: letterboxed full-width, show real action (search, results, buttons changing, toast, pop-up window, new dialog) with visible cursor; put a small zoom-out/pop within the recording rather than cutting.
12. Keep the colour natural and ungraded; do not add filters, LUTs, vignettes or overlays.
13. No emoji, icons, arrows, progress bars, or sound-effect graphics; the only on-screen text besides captions is the sponsor disclosure.
14. Final shot: static seated talking head, about 2.6 s, CTA spoken once with the keyword in quotes in the caption; add the small italic top-centre sponsor disclosure in the last 1 s; end 0.2 s after the last word, no end card.
15. Between the main talking beats, use one shot of about 4 s of her showing a phone to the camera (shot 16) to carry a long run of words ("dashboard, Asana, Slack... headache. It's crazy") without cutting.
