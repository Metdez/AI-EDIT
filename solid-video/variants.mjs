// variants.mjs — the ten cuts. Shots start on a word index `w` of assets/words.json (each video's SPEC.md lists them).
// Regions are pixel rectangles inside the 1920x1080 Solid screen recording; they are cropped to keep
// third-party names, emails and browser tabs out of frame (see research/screen-catalogue.md).
const R = {
  side: { x: 0, y: 180, w: 640, h: 500 }, // agent list, cursor clicking an agent (18.3–19.9 s)
  type: { x: 560, y: 640, w: 900, h: 400 }, // a message being typed to an agent (7–9 s)
  agents: { x: 300, y: 90, w: 1260, h: 900 }, // agent-to-agent message cards (137.2–140.3 s)
  dash: { x: 150, y: 80, w: 1400, h: 760 }, // dashboard stat cards, zero result rows on screen (173.6–176 s)
  dashTop: { x: 150, y: 80, w: 1400, h: 560 }, // dashboard stat cards, cropped above the result rows (158.3–160.5 s)
};
const TOP = { x: 0, y: 0, w: 1080, h: 960 }, BOT = { x: 0, y: 960, w: 1080, h: 960 };
const cam = (src, inn, o = {}) => ({ src, in: inn, ...o });
const scr = (inn, region, o = {}) => ({ src: "screen", in: inn, region: R[region], ...o });

/** the reference's cut skeleton: 21 shots, person and screen alternating */
function base({ camFx = (l) => l, scrFx = (l) => l, mockBox, tx, scrSfx = "click-soft" } = {}) {
  const C = (w, src, inn, o) => ({ w, tx, layers: [camFx(cam(src, inn, o))] });
  const S = (w, inn, region, stage) => ({ w, layers: [scrFx(scr(inn, region))], sfx: scrSfx, vol: 0.2, stage });
  const M = (w, name, stage, o) => ({ w, mock: { name, ...o }, stage });
  return [
    C(0, "hook", 0, { zoom: [1, 1.14], origin: "46% 30%" }), // AI is honestly starting to scare me a little
    C(9, "afterhook", 0.4, { zoom: [1.22, 1.3], origin: "50% 32%" }), // you can now run every part of a
    C(17, "run", 15.6), // six-figure business entirely through agents
    C(22, "run", 20.6, { zoom: [1, 1.1] }), // because it has access to its own
    M(29, "li_open", { title: "Cloud computer", log: ["Virtual computer booted", "Browser ready"] }), // computer that runs on the cloud
    C(35, "thinking", 4.0), // it can use any website or app exactly like a human would
    C(47, "laptop", 1.2, { zoom: [1.05, 1.12], origin: "62% 30%" }), // meaning it does exceptionally well at
    M(53, "li_signin", { title: "Testing end-to-end", log: ["Typed the login", "Clicked Sign in"] }), // testing products end-to-end
    C(56, "laptop", 3.2), // managing communications on all platforms and more
    S(63, 18.3, "side", { title: "Recruiter bot", log: ["Recruiter bot online", "Role: HR department"] }), // this is our recruiter bot
    M(68, "brief", { title: "Recruiter bot", log: ["Brief received", "Starting the search"] }), // aka our official HR department
    M(73, "li_search", { title: "Scouting talent", log: ["Searched LinkedIn", "Scanning profiles"] }), // every day its job is to scout talent on LinkedIn
    M(84, "connect", { title: "Recruiter bot", log: ["Connection requests sent"] }), // send connection requests
    M(87, "calendar", { title: "Recruiter bot", log: ["Interview booked", "Invite sent"] }), // and book qualified candidates on my calendar
    S(94, 137.2, "agents", { title: "Recruiter ⇄ CEO bot", log: ["Recruiter messaged CEO bot", "Pipeline shared"] }), // I also have my recruiter interact with our CEO bot
    M(104, "groupchat", { title: "Group chat", log: ["CEO bot replied", "Priorities set"] }), // in a group chat who not only understands the vision of our company
    S(117, 173.6, "dash", { title: "CEO bot", log: ["Dashboard reviewed", "Asana updated", "Slack answered"], atW: [118, 121, 122] }), // but overlooks the performance dashboard, Asana, Slack
    C(124, "thinking", 8.6, { zoom: [1.1, 1.18] }), // and everything that normally gives me a headache
    C(132, "laptop", 6.4), // it's crazy to me that I set up my whole team in a single night
    C(147, "run", 22.6), // and now you can too
    C(152, "last", 1.6, { zoom: [1, 1.03] }), // comment "Solid" and I'll send you the link
  ];
}
/** replace the shot that starts on word `w`, or insert a new one */
const put = (shots, ...news) => { for (const n of news) { const i = shots.findIndex((s) => s.w === n.w); if (i >= 0) shots[i] = n; else shots.push(n); } return shots.sort((a, b) => a.w - b.w); };
const tools = (y, o = {}) => [
  { type: "chip", w: 122, toW: 127, text: "Asana", x: 330, y, dot: "#f06a6a", ...o },
  { type: "chip", w: 123, toW: 127, text: "Slack", x: 750, y, dot: "#7a4fd6", ...o },
];
const recruiter = (y, o = {}) => ({ type: "chip", w: 66, toW: 73, text: "Recruiter bot", y, dot: "#12D3E0", ...o });
const card = (inset, radius = 32, extra = {}) => (l) => ({ ...l, inset, radius, shadow: "0 30px 80px rgba(0,0,0,.5)", ...extra });
const SH = "0 30px 80px rgba(0,0,0,.45)";

export const variants = [
  {
    id: "01-reference-cut", title: "Reference cut",
    concept: "The closest copy of the reference: hard cuts only, one small white word at a time just below centre, screen recordings letterboxed on black, dark mock UI for the beats with no footage. Sound is limited to soft clicks on screen shots and UI sounds inside the mock scenes. The Solid logo appears only on the final CTA.",
    bg: "#000", mock: "dark", caption: { style: "ref", y: 1046 },
    shots: base(),
    gfx: [{ type: "cta", w: 152, y: 1210 }],
  },
  {
    id: "02-punch-karaoke", title: "Punch-in karaoke",
    concept: "Same cut, louder delivery: every camera cut lands with a 14% punch-in, captions are heavy three-word groups with the spoken word in yellow, a short whoosh sits under every second cut and a bass hit opens the video. Screen recordings are rounded cards on near-black. Solid logo pill stays at the top throughout.",
    bg: "#0b0b0c", mock: "dark", caption: { style: "bold", y: 1180 },
    shots: base({ tx: "punch" }),
    sfx: { cut: "whoosh-short", every: 2, vol: 0.14 },
    gfx: [{ type: "watermark" }, { type: "cta", w: 152, y: 860 }],
  },
  {
    id: "03-split-screen", title: "Split screen",
    concept: "From 'computer that runs on the cloud' to 'headache' the frame is split: the founder stays on the top half the whole time while the product plays on the bottom half, so there is always a face on screen. Captions ride the seam in a dark pill. Light mock UI to match the Solid app.",
    bg: "#fafafa", mock: "light", caption: { style: "pill", y: 960 },
    shots: put(base(),
      { w: 35, mock: { name: "li_profile" }, stage: { title: "Any website", log: ["Opened a profile", "Clicked Connect"] } },
      { w: 47, layers: [scr(158.3, "dashTop")], sfx: "click-soft", vol: 0.2, stage: { title: "Testing products", log: ["Checked every number", "Report ready"] } },
      { w: 56, layers: [scr(18.3, "side", { rate: 0.55 })], sfx: "click-soft", vol: 0.2, stage: { title: "Communications", log: ["Email outreach running", "Campaigns scheduled"] } }),
    stageBox: BOT, stageTheme: "light", stageBg: "#f1f3f5",
    persist: [
      { w: [29, 56], src: "thinking", in: 0.3, box: TOP, fy: 0.3 },
      { w: [56, 94], src: "laptop", in: 1.0, rate: 0.75, box: TOP, fy: 0.24 },
      { w: [94, 124], src: "thinking", in: 2.6, box: TOP, fy: 0.3 },
    ],
    gfx: [{ type: "watermark", y: 330 }, { type: "cta", w: 152, y: 1200 }],
  },
  {
    id: "04-face-bubble", title: "Face bubble",
    concept: "Borrowed from Nate's vertical shorts: product b-roll fills the frame, and a round face bubble keeps the founder present over every screen shot. Captions are a dark pill with a cyan active word.",
    bg: "#101012", mock: "dark", caption: { style: "pill", y: 1210 },
    shots: base(), logX: 400, logW: 620,
    persist: [
      { w: [29, 35], src: "thinking", in: 0.3, box: { x: 760, y: 1330, w: 250, h: 250 }, fy: 0.27, radius: 125, border: "6px solid #fff", shadow: SH, zoom: [1, 1] },
      { w: [53, 56], src: "thinking", in: 3.0, box: { x: 760, y: 1330, w: 250, h: 250 }, fy: 0.27, radius: 125, border: "6px solid #fff", shadow: SH, zoom: [1, 1] },
      { w: [63, 124], src: "laptop", in: 1.0, rate: 0.5, box: { x: 760, y: 1330, w: 250, h: 250 }, fy: 0.2, radius: 125, border: "6px solid #fff", shadow: SH, zoom: [1, 1] },
    ],
    sfx: { cut: "whoosh-short", every: 3, vol: 0.12 },
    gfx: [{ type: "cta", w: 152, y: 880 }],
  },
  {
    id: "05-clean-mock", title: "Clean mock UI",
    concept: "Leans on built UI the way the reference leans on its clean dark chat mock-ups: the recruiter, calendar, group chat and CEO-bot beats are all designed scenes, with real Solid footage kept for the cloud computer and LinkedIn. Bold rounded sans captions with the spoken word in light blue, slow push-ins, navy backdrop, pops and a notification chime only.",
    bg: "radial-gradient(circle at 50% 30%, #1b2a4a 0%, #0a0f1e 70%)", mock: "dark", accent: "#7cc4ff", caption: { style: "clean", y: 1046 },
    shots: put(base().filter((s) => s.w !== 104),
      { w: 94, mock: { name: "groupchat" }, stage: { title: "Group chat", log: ["CEO bot replied"] } },
      { w: 117, mock: { name: "stack", atW: [118, 121, 122] }, stage: { title: "CEO bot", log: ["Everything checked"] } }),
    stageBg: "transparent", hook: ["sparkle", "whoosh"],
    gfx: [{ type: "title", w: 20, toW: 22, y: 420, html: "run by <b>agents</b>", sfx: "pop" }, { type: "cta", w: 152, y: 1210 }],
  },
  {
    id: "06-hyper-cut", title: "Hyper cut",
    concept: "The fastest version: 29 shots instead of 21. Long camera shots are split with a jump-zoom on a stressed word, a white flash marks each chapter change, one huge word slams in at a time with key words in cyan, and whooshes alternate with soft glitches on the cuts.",
    bg: "#000", mock: "dark", caption: { style: "slam", y: 1120 },
    shots: put(base({ tx: "punch" }),
      { w: 5, tx: "punch", layers: [cam("hook", 2.0, { zoom: [1.25, 1.3], origin: "50% 30%" })] },
      { w: 20, tx: "punch", layers: [cam("run", 17.2, { zoom: [1.3, 1.36], origin: "50% 28%" })] },
      { w: 26, tx: "punch", layers: [cam("laptop", 8.0, { zoom: [1, 1.06] })] },
      { w: 42, tx: "punch", layers: [cam("thinking", 5.7, { zoom: [1.3, 1.36], origin: "45% 30%" })] },
      { w: 59, tx: "punch", layers: [cam("laptop", 4.5, { zoom: [1.28, 1.34], origin: "62% 28%" })] },
      { w: 99, tx: "flash", layers: [scr(139.0, "agents", { zoom: [1.2, 1.3] })], sfx: "click-soft", stage: { title: "CEO bot", log: ["CEO bot is reading", "Reply incoming"] } },
      { w: 128, tx: "punch", layers: [cam("thinking", 9.5, { zoom: [1.35, 1.42], origin: "48% 30%" })] },
      { w: 139, tx: "punch", layers: [cam("laptop", 7.6, { zoom: [1.3, 1.36], origin: "62% 28%" })] },
      { w: 143, tx: "punch", layers: [cam("thinking", 0.4, { zoom: [1.05, 1.1] })] }),
    sfx: { cut: ["whoosh-short", "whoosh", "glitch-3"], vol: 0.12 }, hook: ["glitch-1", "impact-bass-2"],
    gfx: [{ type: "flash", w: 22 }, { type: "flash", w: 63 }, { type: "flash", w: 132 }, { type: "cta", w: 152, y: 860 }],
  },
  {
    id: "07-dark-terminal", title: "Dark terminal",
    concept: "A quieter, premium read: monospace captions in a terminal-style box with the spoken word in green, product shots as bordered cards on a charcoal gradient, slow push-ins instead of punches, key-press sounds on screen shots and one low impact at the start and at the logo.",
    bg: "linear-gradient(180deg, #16181c 0%, #07080a 100%)", mock: "dark", accent: "#5cf2a5", caption: { style: "mono", y: 1190 },
    shots: base({ scrFx: (l) => ({ ...l, border: "2px solid rgba(255,255,255,.18)" }), scrSfx: "key-press" }),
    stageBg: "transparent", hook: ["impact-bass-2", "glitch-3"],
    gfx: [{ type: "watermark" }, { type: "cta", w: 152, y: 860 }],
  },
  {
    id: "08-teal-brand", title: "Teal brand frame",
    concept: "Everything sits inside the teal the Solid screen recording already uses: camera shots and product shots are both rounded cards on a teal field with the Solid logo fixed above them, so the video reads as a branded series. White caption pills, light mock UI, chime and pop sounds.",
    bg: "#12D3E0", mock: "light", accent: "#0aa3ad", caption: { style: "pillLight", y: 1170 },
    shots: base({ camFx: (l) => ({ ...l, box: { x: 60, y: 420, w: 960, h: 1180 }, radius: 48, shadow: "0 30px 70px rgba(0,60,70,.35)", fy: 0.32 }), scrSfx: "pop" }),
    stageBg: "transparent", stageTheme: "light", hook: ["whoosh", "chime"],
    gfx: [{ type: "watermark", y: 330 }, { type: "cta", w: 152, y: 900 }],
  },
  {
    id: "09-hex-3d", title: "3D hex field",
    concept: "three.js version: the Solid hexagon becomes a field of teal 3D prisms drifting upward behind everything, with one large black hexagon turning at the bottom. Camera and product shots float over it as cards, so the 3D is always visible around them. Heavy karaoke captions.",
    bg: "transparent", mock: "light", caption: { style: "bold", y: 1170 },
    three: { bg: "#eafcfd", color: "#12D3E0" },
    shots: base({ camFx: (l) => ({ ...l, box: { x: 90, y: 330, w: 900, h: 1120 }, radius: 44, shadow: "0 30px 70px rgba(0,40,50,.4)", fy: 0.32 }), scrSfx: "pop" }),
    stageBg: "transparent", stageTheme: "light", hook: ["impact-bass-1", "sparkle"],
    sfx: { cut: "whoosh", every: 3, vol: 0.12 },
    gfx: [{ type: "cta", w: 152, y: 880 }],
  },
  {
    id: "10-title-hook", title: "Title hook + progress bar",
    concept: "Adds the two retention devices the reference does without: a three-word title stamped over the first shot ('AI runs my business') and a thin progress bar across the top. Captions are a two-line lower block where each word lights up as it is spoken. Flash on chapter changes, whoosh on the title.",
    bg: "#000", mock: "dark", accent: "#FFE14D", caption: { style: "lower", y: 1200 },
    shots: base(), hook: ["impact-bass-2", "whoosh"],
    sfx: { cut: "whoosh-short", every: 4, vol: 0.12 },
    gfx: [{ type: "progress" }, { type: "title", at: 0.1, dur: 2.7, y: 440, html: "AI runs my <b>business</b>" }, { type: "flash", w: 63 }, { type: "flash", w: 132 }, { type: "watermark", at: 3.0 }, { type: "cta", w: 152, y: 860 }],
  },
];
