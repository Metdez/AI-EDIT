// build.mjs — generates one HyperFrames project per variant: node build.mjs [01 02 ...]
// Everything a variant shows comes from variants.mjs; this file only turns that data into HTML + GSAP.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const W = 1080, H = 1920, DUR = 46.6, FPS = 30;
const words = JSON.parse(fs.readFileSync(`${ROOT}/assets/words.json`, "utf8"));
const SFXLIB = JSON.parse(fs.readFileSync(`${ROOT}/assets/sfx/manifest.json`, "utf8"));
const DIM = { screen: [1920, 1080] }; // every camera clip is 1080x1920
const fr = (t) => Math.round(t * FPS) / FPS;
const n3 = (n) => +(+n).toFixed(3);
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
/** time of word index w, 2 frames early so cuts land just before the word */
const T = (w) => (w <= 0 ? 0 : w >= words.length ? DUR : fr(words[w].s - 0.06));
const FULL = { x: 0, y: 0, w: W, h: H };
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

// ---------- footage layers ----------
function layerHtml(l, id, s, e, z, js) {
  const [sw, sh] = DIM[l.src] || [1080, 1920];
  let box = l.box, r = l.region;
  if (!box) { // screen recordings sit just above the caption line when captions are mid-frame, else around the upper middle
    if (l.src === "screen" && r) { const m = l.inset || 0, w = W - 2 * m, h = Math.round((r.h * w) / r.w); box = { x: m, w, h, y: CTX.bottom ? Math.max(140, CTX.bottom - h) : Math.round(0.42 * H - h / 2) }; }
    else box = FULL;
  }
  if (!r) { const rh = Math.min(sh, (sw * box.h) / box.w), rw = (rh * box.w) / box.h; r = { x: (sw - rw) / 2, y: clamp((l.fy ?? 0.42) * sh - rh / 2, 0, sh - rh), w: rw, h: rh }; }
  const k = Math.max(box.w / r.w, box.h / r.h), vw = sw * k, vh = sh * k;
  const left = clamp(box.w / 2 - (r.x + r.w / 2) * k, Math.min(0, box.w - vw), 0), top = clamp(box.h / 2 - (r.y + r.h / 2) * k, Math.min(0, box.h - vh), 0);
  const deco = `${l.radius ? `border-radius:${l.radius}px;` : ""}${l.shadow ? `box-shadow:${l.shadow};` : ""}${l.border ? `border:${l.border};` : ""}${l.bg ? `background:${l.bg};` : ""}`;
  js.push(`tl.set("#b${id}",{opacity:1},${s});tl.set("#b${id}",{opacity:0},${e});`);
  const d = n3(e - s);
  if (l.to) { // pan/zoom from region to region `to` inside the screen recording
    const kk = r.w / l.to.w, tx = box.w / 2 - kk * (left + (l.to.x + l.to.w / 2) * k), ty = box.h / 2 - kk * (top + (l.to.y + l.to.h / 2) * k);
    js.push(`tl.fromTo("#p${id}",{x:0,y:0,scale:1},{x:${n3(tx)},y:${n3(ty)},scale:${n3(kk)},duration:${n3(d * 0.7)},ease:"power2.inOut"},${n3(s + d * 0.15)});`);
  } else {
    const [z0, z1] = l.zoom || [1, 1.05], o = l.origin || "50% 42%";
    if (l.tx === "punch") js.push(`tl.fromTo("#p${id}",{scale:${n3(z0 * 1.14)},transformOrigin:"${o}"},{scale:${z0},duration:0.2,ease:"power3.out"},${s});tl.to("#p${id}",{scale:${z1},duration:${n3(d - 0.2)},ease:"none"},${n3(s + 0.2)});`);
    else js.push(`tl.fromTo("#p${id}",{scale:${z0},transformOrigin:"${o}"},{scale:${z1},duration:${d},ease:"none"},${s});`);
  }
  return `<div class="box" id="b${id}" data-layout-ignore style="left:${box.x}px;top:${box.y}px;width:${box.w}px;height:${box.h}px;z-index:${z};${deco}"><div class="pan" id="p${id}">` +
    `<video id="v${id}" class="clip" src="assets/${l.src}.mp4" muted playsinline data-start="${s}" data-duration="${d}" data-media-start="${l.in}"${l.rate ? ` data-playback-rate="${l.rate}"` : ""} data-track-index="${z}" style="left:${n3(left)}px;top:${n3(top)}px;width:${n3(vw)}px;height:${n3(vh)}px"></video></div></div>`;
}

// ---------- mock UI scenes (for script beats with no footage) ----------
const AV = ["#e8795a", "#5a8de8", "#4fb38a", "#b07be0"];
// --- built LinkedIn-style browsing scenes (replace the real screen recording of LinkedIn) ---
const TY = (id, txt) => `<span class="ty"><span class="ty-g">${txt}</span><span class="ty-v" id="${id}">${txt}</span></span>`;
const typeJs = (id, txt, at, d) => `tl.fromTo("#${id}",{width:0},{width:"100%",duration:${n3(d)},ease:"steps(${txt.length})"},${n3(at)});`;
const CUR = (id) => `<i class="rip" id="${id}rip"></i><svg class="cur" id="${id}cur" viewBox="0 0 24 24"><path d="M4 2l15 11h-8l-3 8z" fill="#111" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg>`;
/** cursor path: [[time, x, y, click?], ...] in the scene's 1000x1000 space */
function curJs(id, pts, sfx) {
  let js = `tl.set("#${id}cur",{x:${pts[0][1]},y:${pts[0][2]}},${n3(pts[0][0])});`;
  pts.forEach(([t, x, y, click], i) => {
    if (i) js += `tl.to("#${id}cur",{x:${x},y:${y},duration:${n3(Math.max(0.1, t - pts[i - 1][0] - 0.02))},ease:"power2.inOut"},${n3(pts[i - 1][0])});`;
    if (click) { js += `tl.set("#${id}rip",{x:${x - 26},y:${y - 26}},${n3(t)});tl.fromTo("#${id}rip",{scale:0.2,opacity:0.7},{scale:1.7,opacity:0,duration:0.32,ease:"power2.out"},${n3(t)});`; sfx.push({ name: "click", at: n3(t), vol: 0.3 }); }
  });
  return js;
}
const LI = (id, url, search, body) => `<div class="li"><div class="li-bar"><i></i><i></i><i></i><div class="li-url">${url}</div><span class="li-vm">● Cloud computer</span></div>` +
  `<div class="li-top"><b class="li-logo">in</b><div class="li-search">${search}</div><span class="li-nav"></span><span class="li-nav"></span><span class="li-nav"></span></div><div class="li-body">${body}</div>${CUR(id)}</div>`;
const PEOPLE = [["JL", "Jordan Lee", "Senior Product Designer · New York"], ["SO", "Sam Ortiz", "Product Designer · Brooklyn"], ["RC", "Riley Chen", "Design Lead · Remote"], ["AM", "Avery Moss", "UX Designer · Jersey City"], ["DK", "Dana Kim", "Product Designer · Queens"]];
const person = (p, i, id, btn = "View") => `<div class="li-card" id="${id}"><b class="av" style="background:${AV[i % 4]}">${p[0]}</b><div><strong>${p[1]}</strong><span>${p[2]}</span></div><em class="li-btn">${btn}</em></div>`;
const post = (id, i) => `<div class="li-card col" id="${id}"><div class="li-row"><b class="av" style="background:${AV[i % 4]}"></b><div class="grow"><div class="sk" style="width:46%"></div><div class="sk" style="width:30%"></div></div></div><div class="sk" style="width:94%"></div><div class="sk" style="width:80%"></div><div class="sk tall"></div></div>`;
const MOCK = {
  li_open(id, s, e) { // type the address, the feed loads, the cursor heads for the first post
    const d = e - s, url = "linkedin.com/feed", t1 = s + 0.08, td = Math.max(0.35, d * 0.36), tl2 = n3(t1 + td + 0.08), sfx = [{ name: "typing", at: n3(t1), vol: 0.28, dur: Math.min(1.4, td) }, { name: "pop", at: tl2, vol: 0.24 }];
    const js = [typeJs(`${id}u`, url, t1, td), `tl.fromTo("#${id}t",{opacity:0},{opacity:1,duration:0.12},${tl2});tl.fromTo("[id^='${id}f']",{y:60,opacity:0},{y:0,opacity:1,duration:0.26,ease:"power3.out",stagger:0.08},${tl2});`,
      curJs(id, [[s, 780, 840], [n3(t1 + td * 0.5), 520, 52, true], [n3(Math.min(e - 0.05, tl2 + 0.5)), 330, 470]], sfx)];
    return { js, sfx, html: LI(id, TY(`${id}u`, url), `<span id="${id}t">Search</span>`, [0, 1].map((i) => post(`${id}f${i}`, i)).join("")) };
  },
  li_signin(id, s, e) { // type the login, click Sign in, land on the feed
    const d = e - s, mail = "recruiter@yourcompany.com", t1 = s + 0.08, td = Math.max(0.3, d * 0.3), tc = n3(s + d * 0.56), tw = n3(tc + 0.14), sfx = [{ name: "typing", at: n3(t1), vol: 0.28, dur: Math.min(1.4, td) }, { name: "chime", at: tw, vol: 0.16, dur: 1.2 }];
    const js = [typeJs(`${id}m`, mail, t1, td), `tl.fromTo("#${id}b",{scale:1},{scale:0.93,duration:0.08,yoyo:true,repeat:1},${tc});tl.to("#${id}c",{opacity:0,y:-40,duration:0.14,ease:"power2.in"},${n3(tc + 0.08)});` +
      `tl.fromTo("#${id}w",{opacity:0,scale:0.9},{opacity:1,scale:1,duration:0.22,ease:"back.out(1.8)"},${tw});tl.fromTo("[id^='${id}f']",{y:60,opacity:0},{y:0,opacity:1,duration:0.24,ease:"power3.out",stagger:0.07},${n3(tw + 0.06)});`,
      curJs(id, [[s, 760, 880], [tc, 500, 668, true], [n3(Math.min(e - 0.05, tc + 0.6)), 640, 520]], sfx)];
    return { js, sfx, html: LI(id, "linkedin.com/login", "Search", `<div class="li-sign" id="${id}c"><h4>Sign in</h4><div class="li-field">${TY(`${id}m`, mail)}</div><div class="li-field">••••••••••</div><div class="li-btn solid wide" id="${id}b">Sign in</div></div>` +
      `<div class="li-after"><div class="li-welcome" id="${id}w"><i>✓</i>Signed in</div>${post(`${id}f0`, 2)}</div>`) };
  },
  li_search(id, s, e) { // type a search, results arrive, open one, scroll the list
    const d = e - s, q = "senior product designer", t1 = s + 0.08, td = Math.max(0.4, d * 0.26), tr = n3(t1 + td + 0.1), tc = n3(s + d * 0.62), sfx = [{ name: "typing", at: n3(t1), vol: 0.28, dur: Math.min(1.4, td) }, { name: "pop", at: tr, vol: 0.24 }];
    const js = [typeJs(`${id}q`, q, t1, td), `tl.fromTo("[id^='${id}r']",{x:-70,opacity:0},{x:0,opacity:1,duration:0.24,ease:"power3.out",stagger:0.09},${tr});tl.to("#${id}r0",{borderColor:"#0a66c2",duration:0.1},${tc});` +
      `tl.to("#${id}l",{y:-190,duration:${n3(Math.max(0.3, e - tc - 0.25))},ease:"power2.inOut"},${n3(tc + 0.15)});`,
      curJs(id, [[s, 560, 152], [n3(t1 + 0.05), 420, 152, true], [tc, 830, 330, true], [n3(e - 0.05), 780, 600]], sfx)];
    return { js, sfx, html: LI(id, "linkedin.com/search/people", TY(`${id}q`, q), `<div class="li-h">People · 1,204 results</div><div id="${id}l">${PEOPLE.map((p, i) => person(p, i, `${id}r${i}`)).join("")}</div>`) };
  },
  li_profile(id, s, e) { // open a profile, click Connect, scroll down the page
    const d = e - s, tc = n3(s + d * 0.4), sfx = [{ name: "pop", at: n3(s + 0.1), vol: 0.22 }];
    const js = [`tl.fromTo("#${id}p",{y:50,opacity:0},{y:0,opacity:1,duration:0.26,ease:"power3.out"},${n3(s + 0.06)});tl.set("#${id}a",{opacity:0},${tc});tl.fromTo("#${id}z",{opacity:0,scale:0.8},{opacity:1,scale:1,duration:0.16,ease:"back.out(2)"},${tc});` +
      `tl.to("#${id}l",{y:-260,duration:${n3(Math.max(0.4, d * 0.4))},ease:"power2.inOut"},${n3(tc + 0.35)});`,
      curJs(id, [[s, 760, 860], [tc, 180, 648, true], [n3(e - 0.05), 620, 700]], sfx)];
    return { js, sfx, html: LI(id, "linkedin.com/in/jordan-lee", "Search", `<div id="${id}l"><div class="li-prof" id="${id}p"><div class="li-banner"></div><b class="av big" style="background:${AV[0]}">JL</b><strong>Jordan Lee</strong><span>Senior Product Designer · New York</span>` +
      `<div class="li-acts"><div class="li-btnw"><em class="li-btn solid" id="${id}a">Connect</em><em class="li-btn done" id="${id}z">Pending ✓</em></div><em class="li-btn">Message</em></div></div>` +
      `<div class="li-card col"><strong>Experience</strong><div class="sk" style="width:70%"></div><div class="sk" style="width:52%"></div><div class="sk" style="width:84%"></div></div><div class="li-card col"><strong>Skills</strong><div class="sk" style="width:60%"></div><div class="sk" style="width:76%"></div></div></div>`) };
  },
  connect(id, s, e) {
    const rows = [["JL", "Jordan Lee", "Senior Product Designer · NYC"], ["SO", "Sam Ortiz", "Product Designer · Brooklyn"], ["RC", "Riley Chen", "Design Lead · Remote"]];
    const step = Math.min(0.3, (e - s - 0.25) / 3), js = [], sfx = [];
    rows.forEach((_, i) => { const t = n3(s + 0.18 + i * step); js.push(`tl.set("#${id}c${i}",{opacity:0},${t});tl.fromTo("#${id}p${i}",{opacity:0,scale:0.7},{opacity:1,scale:1,duration:0.14,ease:"back.out(2)"},${t});`); sfx.push({ name: "click", at: t, vol: 0.3 }); });
    return { js, sfx, html: `<div class="m-head"><i class="dot"></i>Recruiter bot <em>· sending requests</em></div><div class="m-search">Product designer — New York</div>` +
      rows.map((r, i) => `<div class="m-row"><b class="av" style="background:${AV[i]}">${r[0]}</b><div class="m-who"><strong>${r[1]}</strong><span>${r[2]}</span></div><div class="m-btnw"><span class="m-btn" id="${id}c${i}">Connect</span><span class="m-btn done" id="${id}p${i}">Pending ✓</span></div></div>`).join("") };
  },
  calendar(id, s, e) {
    const a = n3(s + 0.3), b = n3(s + Math.min(1.1, (e - s) * 0.55));
    return { js: [`tl.fromTo("#${id}ev",{scaleY:0,opacity:0,transformOrigin:"50% 0%"},{scaleY:1,opacity:1,duration:0.25,ease:"power3.out"},${a});tl.fromTo("#${id}to",{y:60,opacity:0},{y:0,opacity:1,duration:0.3,ease:"back.out(1.6)"},${b});`],
      sfx: [{ name: "pop", at: a, vol: 0.3 }, { name: "notification", at: b, vol: 0.28 }],
      html: `<div class="m-head"><i class="dot"></i>My calendar <em>· Thursday</em></div>` + ["1 PM", "2 PM", "3 PM", "4 PM"].map((h, i) => `<div class="m-slot"><span>${h}</span>${i === 1 ? `<div class="m-ev" id="${id}ev"><strong>Interview — Jordan Lee</strong><span>Senior Product Designer · 30 min</span></div>` : ""}</div>`).join("") +
        `<div class="m-toast" id="${id}to"><i class="dot"></i>Booked by Recruiter bot</div>` };
  },
  groupchat(id, s, e) {
    const msgs = [["R", "Recruiter bot", "3 qualified candidates booked this week.", 2], ["C", "CEO bot", "Good. Prioritize the senior designer — that unblocks the Q1 launch.", 3], ["R", "Recruiter bot", "On it. Moving Jordan to Thursday.", 2], ["C", "CEO bot", "Dashboard updated. Pipeline is on track.", 3]];
    const step = (e - s - 0.3) / msgs.length, js = [], sfx = [];
    msgs.forEach((_, i) => { const t = n3(s + 0.12 + i * step); js.push(`tl.fromTo("#${id}m${i}",{y:40,opacity:0},{y:0,opacity:1,duration:0.26,ease:"power3.out"},${t});`); sfx.push({ name: "pop", at: t, vol: 0.22 }); });
    return { js, sfx, html: `<div class="m-head"><i class="dot"></i># hiring <em>· Recruiter bot, CEO bot, you</em></div>` + msgs.map((m, i) => `<div class="m-msg" id="${id}m${i}"><b class="av" style="background:${AV[m[3]]}">${m[0]}</b><div><strong>${m[1]}</strong><p>${m[2]}</p></div></div>`).join("") };
  },
  brief(id, s, e) {
    const txt = "Find 5 senior product designers in NYC and book intro calls", d = n3(Math.max(0.6, e - s - 0.7));
    return { sfx: [{ name: "typing", at: n3(s + 0.15), vol: 0.3, dur: Math.min(1.45, d) }, { name: "click", at: n3(s + 0.2 + d), vol: 0.3 }],
      js: [`tl.fromTo("#${id}t",{width:0},{width:"100%",duration:${d},ease:"steps(${txt.length})"},${n3(s + 0.15)});tl.fromTo("#${id}b",{scale:1},{scale:1.25,duration:0.1,yoyo:true,repeat:1},${n3(s + 0.2 + d)});`],
      html: `<div class="m-head"><i class="dot"></i>Recruiter bot <em>· a.k.a. HR</em></div><div class="m-msg"><b class="av" style="background:${AV[2]}">R</b><div><strong>Recruiter bot</strong><p>Morning. Who are we hiring today?</p></div></div>` +
        `<div class="m-input"><div class="m-typed"><span id="${id}t">${txt}</span></div><b class="m-send" id="${id}b">↑</b></div>` };
  },
  stack(id, s, e, o) {
    const rows = [["Performance", "Weekly numbers reviewed", "#12D3E0"], ["Dashboards", "Every metric checked", "#f06a6a"], ["Slack", "4 threads answered", "#7a4fd6"]];
    const at = o.atW ? o.atW.map(T) : rows.map((_, i) => s + 0.15 + i * 0.5), js = [], sfx = [];
    rows.forEach((_, i) => { const t = n3(at[i]); js.push(`tl.fromTo("#${id}s${i}",{x:-80,opacity:0},{x:0,opacity:1,duration:0.26,ease:"power3.out"},${t});tl.fromTo("#${id}k${i}",{scale:0},{scale:1,duration:0.22,ease:"back.out(2.4)"},${n3(t + 0.14)});`); sfx.push({ name: "pop", at: t, vol: 0.25 }); });
    return { js, sfx, html: `<div class="m-head"><i class="dot"></i>CEO bot <em>· watching everything</em></div>` + rows.map((r, i) => `<div class="m-row tall" id="${id}s${i}"><b class="av sq" style="background:${r[2]}"></b><div class="m-who"><strong>${r[0]}</strong><span>${r[1]}</span></div><span class="m-ok" id="${id}k${i}">✓</span></div>`).join("") };
  },
};
function mockHtml(m, id, s, e, js, sfx) {
  const box = m.box || (CTX.bottom ? { x: 90, y: CTX.bottom - 900, w: 900, h: 900 } : { x: 60, y: 320, w: 960, h: 960 }), k = Math.min(box.w / 1000, box.h / 1000);
  const out = MOCK[m.name](id, s, e, m);
  js.push(`tl.set("#${id}",{opacity:1},${s});tl.set("#${id}",{opacity:0},${e});tl.fromTo("#${id}i",{scale:${n3(k * 0.94)}},{scale:${n3(k)},duration:0.22,ease:"power3.out"},${s});`, ...out.js);
  sfx.push(...out.sfx);
  return `<div class="mock" id="${id}" data-layout-ignore style="left:${box.x + (box.w - 1000 * k) / 2}px;top:${box.y + (box.h - 1000 * k) / 2}px;width:${1000 * k}px;height:${1000 * k}px"><div class="mock-i" id="${id}i">${out.html}</div></div>`;
}

// ---------- stage: backdrop + Solid header + animated activity log around each product beat ----------
function stage(v, sh, i, s, e, js, sfx) {
  const B = v.stageBox, split = !!B, capY = v.caption.y, mid = capY < 1150, st = sh.stage;
  const headY = split ? B.y + 105 : v.headY ?? 340, top = headY + 60;
  const aEnd = split ? B.y + B.h - 250 : capY - (mid ? 75 : 90), bTop = split ? aEnd + 22 : capY + (mid ? 85 : 90), bEnd = split ? B.y + B.h - 16 : 1600;
  const A = { x: 36, y: top, w: 1008, h: aEnd - top };
  let noLog = false;
  if (sh.mock) { // mid-frame captions overlay the dark mock, as the reference does; lower captions get the mock above them
    if (mid && !split) { sh.mock.box = { x: 60, y: top, w: 960, h: 960 }; noLog = true; } else sh.mock.box = A;
  } else {
    const l = sh.layers[0], r = l.region, k = Math.min(A.w / r.w, A.h / r.h), w = Math.round(r.w * k), h = Math.round(r.h * k);
    Object.assign(l, { box: { x: Math.round(540 - w / 2), y: Math.round(A.y + (A.h - h) / 2), w, h }, radius: l.radius ?? 28, shadow: l.shadow ?? "0 24px 70px rgba(0,0,0,.45)", zoom: l.zoom || [1.02, 1.1] });
  }
  const rows = noLog ? [] : st.log.slice(0, Math.max(1, Math.floor((bEnd - bTop + 14) / 110)));
  const lx = v.logX ?? 540, lw = v.logW ?? 780, id = `st${i}`;
  js.push(`tl.set("#${id}",{opacity:1},${s});tl.set("#${id}",{opacity:0},${e});` + (v.noHead ? "" : `tl.fromTo("#${id}h",{xPercent:-50,yPercent:-50,y:-24,opacity:0},{xPercent:-50,yPercent:-50,y:0,opacity:1,duration:0.22,ease:"power3.out"},${s});`));
  if (!split) js.push(`tl.fromTo("#${id}m",{rotation:-8,scale:0.94},{rotation:8,scale:1.06,duration:${n3(e - s)},ease:"none"},${s});`);
  const html = rows.map((t, j) => {
    const at = n3(st.atW?.[j] != null ? T(st.atW[j]) : s + 0.12 + j * Math.min(0.32, (e - s) / 4));
    js.push(`tl.fromTo("#${id}r${j}",{xPercent:-50,x:-70,opacity:0},{xPercent:-50,x:0,opacity:1,duration:0.24,ease:"power3.out"},${at});tl.fromTo("#${id}k${j}",{scale:0},{scale:1,duration:0.2,ease:"back.out(2.6)"},${n3(at + 0.12)});`);
    sfx.push({ name: "pop", at, vol: 0.2 });
    return `<div class="st-row" id="${id}r${j}" style="left:${lx}px;top:${bTop + j * 110}px;width:${lw}px"><i id="${id}k${j}">✓</i>${esc(t)}</div>`;
  }).join("");
  return `<div class="stage${v.stageTheme === "light" ? " light" : ""}" id="${id}" style="${split ? `left:${B.x}px;top:${B.y}px;width:${B.w}px;height:${B.h}px;` : "inset:0;"}background:${v.stageBg || "radial-gradient(circle at 50% 28%, #1d2026 0%, #0a0a0c 62%)"}">${split ? "" : `<img class="st-mark" id="${id}m" src="assets/solid-mark${v.stageTheme === "light" ? "" : "-white"}.png" alt="">`}</div>` +
    `<div class="stage-fg${v.stageTheme === "light" ? " light" : ""}" id="${id}f"><div class="st-head" id="${id}h"${v.noHead ? ' hidden' : ""} style="left:540px;top:${headY}px"><img src="assets/solid-mark${v.stageTheme === "light" ? "" : "-white"}.png" alt="">${esc(st.title)}</div>${html}</div>`;
}

// ---------- graphic overlays ----------
const pop = (sel, at, dur) => `tl.fromTo("${sel}",{xPercent:-50,yPercent:-50,scale:0.4,opacity:0},{xPercent:-50,yPercent:-50,scale:1,opacity:1,duration:0.26,ease:"back.out(2)"},${n3(at)});tl.to("${sel}",{scale:0.85,opacity:0,duration:0.14,ease:"power2.in"},${n3(at + dur - 0.14)});`;
const GFX = {
  chip: (o, id) => ({ html: `<div class="g chip${o.dark ? " dark" : ""}" id="${id}" style="left:${o.x ?? 540}px;top:${o.y}px">${o.dot ? `<i class="dot" style="background:${o.dot}"></i>` : ""}${esc(o.text)}</div>`, js: [pop(`#${id}`, o.at, o.dur)], sfx: o.sfx === false ? [] : [{ name: o.sfx || "pop", at: o.at, vol: 0.26 }] }),
  watermark: (o, id) => ({ html: `<div class="g wm" id="${id}" style="left:540px;top:${o.y ?? 330}px"><img src="assets/solid-logo.png" alt="Solid"></div>`, js: [`tl.fromTo("#${id}",{xPercent:-50,yPercent:-50,opacity:0,y:-30},{xPercent:-50,yPercent:-50,opacity:1,y:0,duration:0.3,ease:"power3.out"},${o.at ?? 0.4});tl.to("#${id}",{opacity:0,duration:0.15},${n3((o.end ?? T(146)) - 0.15)});` + (o.hide || []).map(([a, b]) => `tl.set("#${id}",{opacity:0},${a});${b < T(146) ? `tl.set("#${id}",{opacity:1},${b});` : ""}`).join("")], sfx: [] }),
  cta: (o, id) => ({ html: `<div class="g cta" id="${id}" style="left:540px;top:${o.y}px"><div class="cta-logo"><img src="assets/solid-logo.png" alt="Solid"><span>.tech</span></div><div class="cta-pill">Comment <b>“SOLID”</b></div></div>`,
    js: [`tl.fromTo("#${id}",{xPercent:-50,yPercent:-50,scale:0.6,opacity:0},{xPercent:-50,yPercent:-50,scale:1,opacity:1,duration:0.32,ease:"back.out(1.8)"},${o.at});tl.fromTo("#${id} .cta-pill",{y:40,opacity:0},{y:0,opacity:1,duration:0.28,ease:"power3.out"},${n3(o.at + 0.22)});`], sfx: [{ name: o.sfx || "impact-bass-1", at: o.at, vol: 0.3 }, { name: "pop", at: n3(o.at + 0.22), vol: 0.22 }] }),
  title: (o, id) => ({ html: `<div class="g title" id="${id}" style="left:540px;top:${o.y ?? 400}px">${o.html}</div>`, js: [pop(`#${id}`, o.at, o.dur)], sfx: o.sfx ? [{ name: o.sfx, at: o.at, vol: 0.28 }] : [] }),
  flash: (o, id) => ({ html: `<div class="g flash" id="${id}"></div>`, js: [`tl.set("#${id}",{opacity:${o.a ?? 0.75}},${o.at});tl.to("#${id}",{opacity:0,duration:0.16,ease:"power2.out"},${o.at});`], sfx: [] }),
  progress: (o, id) => ({ html: `<div class="g prog" id="${id}"></div>`, js: [`tl.fromTo("#${id}",{scaleX:0,transformOrigin:"0% 50%"},{scaleX:1,duration:${DUR},ease:"none"},0);`], sfx: [] }),
  tracker: (o, id) => { // step pill that renames itself per chapter
    const js = [`tl.fromTo("#${id}",{xPercent:-50,yPercent:-50,opacity:0},{xPercent:-50,yPercent:-50,opacity:1,duration:0.3},0.3);`], sfx = [];
    o.steps.forEach((st, i) => { const a = T(st[0]), b = i + 1 < o.steps.length ? T(o.steps[i + 1][0]) : DUR; js.push(`tl.set("#${id}t${i}",{opacity:1},${a});tl.set("#${id}t${i}",{opacity:0},${b});`); if (i) { js.push(`tl.fromTo("#${id}",{scale:1.12},{scale:1,duration:0.2,ease:"power3.out"},${a});`); sfx.push({ name: "click-soft", at: a, vol: 0.3 }); } });
    return { js, sfx, html: `<div class="g tracker" id="${id}" style="left:540px;top:${o.y ?? 330}px">${o.steps.map((st, i) => `<span id="${id}t${i}"><b>${i + 1}/${o.steps.length}</b>${esc(st[1])}</span>`).join("")}</div>` };
  },
};

// ---------- captions ----------
const PROPER = /^(AI|I|I'll|LinkedIn|HR|CEO|Asana|Slack|"Solid"|a\.k\.a\.)$/;
const clean = (w) => w.replace(/[.,]+$/g, "");
function capGroups(max) {
  const g = []; let cur = [];
  words.forEach((w, i) => {
    cur.push(i);
    const next = words[i + 1], chars = cur.reduce((n, j) => n + words[j].w.length, 0);
    if (cur.length >= max || /[.,]$/.test(w.w) || !next || next.s - w.e > 0.3 || chars + (next ? next.w.length : 0) > 17) { g.push(cur); cur = []; }
  });
  return g.map((ix, k) => ({ ix, s: k ? words[ix[0]].s : 0, e: g[k + 1] ? words[g[k + 1][0]].s : DUR - 0.1 }));
}
const CAPS = {
  // reference: one small white word, no box, centred a little below the middle
  ref: { max: 1, css: `font:500 66px Inter,sans-serif;color:#fff;text-shadow:0 0 22px rgba(0,0,0,.95),0 2px 5px rgba(0,0,0,.9)`, case: "ref" },
  bold: { max: 3, css: `font:900 68px Montserrat,sans-serif;color:#fff;text-transform:uppercase;-webkit-text-stroke:12px #000;paint-order:stroke fill;line-height:1.08`, hi: "#FFE14D", pop: 1 },
  slam: { max: 1, css: `font:400 128px "Archivo Black",sans-serif;color:#fff;text-transform:uppercase;-webkit-text-stroke:14px #000;paint-order:stroke fill`, key: "#12D3E0", pop: 2, fit: 1 },
  pill: { max: 3, css: `font:700 58px Inter,sans-serif;color:#fff;background:rgba(10,10,12,.86);padding:18px 34px;border-radius:26px;line-height:1.15`, hi: "#12D3E0", pop: 1 },
  pillLight: { max: 3, css: `font:700 58px Inter,sans-serif;color:#111;background:#fff;padding:18px 34px;border-radius:26px;line-height:1.15;box-shadow:0 10px 30px rgba(0,0,0,.18)`, hi: "#0aa3ad", pop: 1 },
  clean: { max: 2, css: `font:700 76px Outfit,sans-serif;color:#fff;-webkit-text-stroke:8px #000;paint-order:stroke fill;line-height:1.1`, hi: "#7cc4ff", rise: 1 },
  mono: { max: 3, css: `font:700 50px "JetBrains Mono",monospace;color:#d7fbe8;background:rgba(6,8,10,.88);padding:16px 28px;border-radius:10px;border:2px solid rgba(215,251,232,.22)`, hi: "#5cf2a5", prefix: "› " },
  lower: { max: 4, css: `font:600 62px Outfit,sans-serif;color:#fff;-webkit-text-stroke:9px #000;paint-order:stroke fill;line-height:1.15`, dim: 1 },
};
const KEYW = /agents|six-figure|cloud|human|recruiter|LinkedIn|calendar|CEO|headache|night|Solid|scare|testing/i;
function captionsComp(v) {
  const st = CAPS[v.caption.style], y = v.caption.y, groups = capGroups(st.max), js = [];
  const html = groups.map((g, k) => {
    const spans = g.ix.map((i) => {
      let t = clean(words[i].w); if (st.case === "ref" && !PROPER.test(t)) t = t.toLowerCase();
      const fit = st.fit && t.length > 7 ? ` style="font-size:${Math.floor((128 * 7.4) / t.length)}px"` : "";
      const key = st.key && KEYW.test(t) ? ` style="color:${st.key}${fit ? ";" + fit.slice(8, -1) : ""}"` : fit;
      if (st.hi) js.push(`tl.set("#w${i}",{color:"${st.hi}"},${words[i].s});${i !== g.ix[g.ix.length - 1] ? `tl.set("#w${i}",{color:"inherit"},${words[i + 1].s});` : ""}`);
      if (st.dim) js.push(`tl.fromTo("#w${i}",{opacity:0.55},{opacity:1,duration:0.1},${words[i].s});`);
      return `<span class="w" id="w${i}"${key}>${esc(t)}</span>`;
    }).join(" ");
    js.push(`tl.set("#c${k}",{visibility:"visible"},${n3(g.s)});tl.set("#c${k}",{visibility:"hidden"},${n3(g.e)});`);
    if (st.pop) js.push(`tl.fromTo("#c${k} .ln",{scale:${st.pop === 2 ? 1.35 : 0.86}},{scale:1,duration:${st.pop === 2 ? 0.12 : 0.14},ease:"power3.out"},${n3(g.s)});`);
    if (st.rise) js.push(`tl.fromTo("#c${k} .ln",{y:26,opacity:0},{y:0,opacity:1,duration:0.16,ease:"power3.out"},${n3(g.s)});`);
    return `<div class="cap" id="c${k}"><span class="ln">${st.prefix || ""}${spans}</span></div>`;
  }).join("\n    ");
  return `<template>
  <style>
    #root { position: absolute; inset: 0; }
    .cap { position: absolute; left: 190px; width: 700px; top: ${y - 150}px; height: 300px; display: flex; align-items: center; justify-content: center; text-align: center; visibility: hidden; }
    .cap .ln { display: inline-block; ${st.css}; }
    .cap .w { display: inline-block; }
  </style>
  <div id="root" data-composition-id="captions" data-width="${W}" data-height="${H}">
    ${html}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${js.join("\n    ")}
    window.__timelines["captions"] = tl;
  </script>
</template>
`;
}

// ---------- styles shared by overlays and mock UI ----------
const gfxCss = (v) => `
    #root { position: absolute; inset: 0; --acc: ${v.accent || "#12D3E0"}; }
    .g { position: absolute; opacity: 0; font-family: Inter, sans-serif; }
    .dot { display: inline-block; width: 18px; height: 18px; border-radius: 50%; background: var(--acc); margin-right: 14px; vertical-align: middle; }
    .chip { background: #fff; color: #111; font-weight: 700; font-size: 44px; padding: 16px 30px; border-radius: 22px; white-space: nowrap; box-shadow: 0 12px 34px rgba(0,0,0,.35); }
    .chip.dark { background: #111; color: #fff; }
    .wm { background: #fff; padding: 14px 26px; border-radius: 40px; box-shadow: 0 8px 24px rgba(0,0,0,.28); }
    .wm img { height: 38px; display: block; }
    .cta { text-align: center; }
    .cta-logo span { font: 800 69px/60px Inter, sans-serif; color: #161616; letter-spacing: -2.5px; margin-left: 1px; position: relative; top: -3px; }
    .cta-logo { display: inline-flex; align-items: center; background: #fff; padding: 20px 36px; border-radius: 26px; box-shadow: 0 16px 44px rgba(0,0,0,.4); }
    .cta-logo img { height: 60px; display: block; }
    .cta-pill { margin-top: 14px; background: #111; color: #fff; font-size: 40px; font-weight: 600; padding: 12px 28px; border-radius: 40px; display: inline-block; white-space: nowrap; }
    .cta-pill b { color: var(--acc); font-weight: 800; }
    .title { width: 760px; text-align: center; font: 900 74px/1.05 Montserrat, sans-serif; color: #fff; text-transform: uppercase; -webkit-text-stroke: 10px #000; paint-order: stroke fill; }
    .title b { color: var(--acc); }
    .flash { inset: 0; background: #fff; }
    .prog { left: 0; top: 0; width: ${W}px; height: 10px; background: var(--acc); opacity: 1; }
    .tracker { background: rgba(12,12,14,.9); color: #fff; height: 68px; width: 520px; border-radius: 34px; font-size: 32px; font-weight: 700; border: 2px solid rgba(255,255,255,.16); }
    .tracker span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; opacity: 0; white-space: nowrap; }
    .tracker b { color: var(--acc); margin-right: 14px; }
    .mock { position: absolute; opacity: 0; }
    .mock-i { width: 1000px; height: 1000px; transform-origin: 0 0; border-radius: 44px; padding: 54px 50px; font-family: Inter, sans-serif; overflow: hidden;
      background: ${v.mock === "light" ? "#fafafa" : "#17171c"}; color: ${v.mock === "light" ? "#111" : "#fff"}; --line: ${v.mock === "light" ? "#e4e4e7" : "#3a3a44"}; --sub: ${v.mock === "light" ? "#71717a" : "#9a9aa6"}; --card: ${v.mock === "light" ? "#fff" : "#1b1b20"};
      border: 2px solid var(--line); box-shadow: 0 30px 80px rgba(0,0,0,.45); }
    .m-head { font-size: 44px; font-weight: 700; padding-bottom: 34px; border-bottom: 2px solid var(--line); margin-bottom: 30px; white-space: nowrap; }
    .m-head em { font-style: normal; font-weight: 400; color: var(--sub); }
    .m-search { font-size: 38px; color: var(--sub); border: 2px solid var(--line); border-radius: 18px; padding: 20px 28px; margin-bottom: 26px; background: var(--card); }
    .m-row { display: flex; align-items: center; gap: 26px; padding: 30px 28px; border: 2px solid var(--line); border-radius: 24px; margin-bottom: 22px; background: var(--card); }
    .m-row.tall { padding: 44px 32px; margin-bottom: 30px; }
    .av { flex: none; width: 92px; height: 92px; border-radius: 50%; color: #fff; font-size: 36px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .av.sq { border-radius: 22px; }
    .m-who { flex: 1; min-width: 0; } .m-who strong { display: block; font-size: 42px; } .m-who span { display: block; font-size: 30px; color: var(--sub); margin-top: 6px; white-space: nowrap; }
    .m-btnw { position: relative; flex: none; width: 240px; height: 76px; }
    .m-btn { position: absolute; inset: 0; border: 3px solid #2f6fe4; color: #2f6fe4; border-radius: 40px; font-size: 32px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
    .m-btn.done { border-color: var(--acc); background: var(--acc); color: #06262a; opacity: 0; }
    .m-ok { flex: none; width: 76px; height: 76px; border-radius: 50%; background: var(--acc); color: #06262a; font-size: 44px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .m-slot { position: relative; height: 150px; border-top: 2px solid var(--line); padding-top: 14px; } .m-slot > span { font-size: 30px; color: var(--sub); }
    .m-ev { position: absolute; left: 150px; right: 0; top: 14px; height: 124px; border-radius: 20px; background: var(--acc); color: #06262a; padding: 20px 28px; }
    .m-ev strong { display: block; font-size: 38px; } .m-ev span { font-size: 28px; }
    .m-toast { position: absolute; left: 50px; right: 50px; bottom: 50px; background: var(--card); border: 2px solid var(--line); border-radius: 24px; padding: 30px 32px; font-size: 38px; font-weight: 600; box-shadow: 0 16px 40px rgba(0,0,0,.3); }
    .m-input { position: absolute; left: 50px; right: 50px; bottom: 60px; min-height: 300px; border: 3px solid var(--acc); border-radius: 30px; background: var(--card); padding: 36px 130px 36px 36px; }
    .m-typed { font-size: 52px; line-height: 1.25; font-weight: 600; width: 720px; } .m-typed span { display: inline-block; overflow: hidden; white-space: nowrap; vertical-align: top; max-width: none; }
    .m-send { position: absolute; right: 30px; bottom: 30px; width: 84px; height: 84px; border-radius: 50%; background: var(--acc); color: #06262a; font-size: 50px; display: flex; align-items: center; justify-content: center; }
    .li { position: absolute; inset: 0; background: #f4f2ee; color: #1d2226; overflow: hidden; }
    .li-bar { height: 104px; background: #e9eaee; display: flex; align-items: center; gap: 14px; padding: 0 30px; border-bottom: 2px solid #d6d8dd; }
    .li-bar > i { width: 24px; height: 24px; border-radius: 50%; background: #c9ccd3; flex: none; }
    .li-url { flex: 1; margin-left: 14px; height: 62px; border-radius: 31px; background: #fff; font-size: 32px; line-height: 62px; padding: 0 28px; color: #333; white-space: nowrap; overflow: hidden; }
    .li-vm { font-size: 26px; font-weight: 700; color: #0a7a44; white-space: nowrap; }
    .li-top { height: 100px; background: #fff; display: flex; align-items: center; gap: 20px; padding: 0 30px; border-bottom: 2px solid #e3e3e3; }
    .li-logo { flex: none; width: 64px; height: 64px; border-radius: 12px; background: #0a66c2; color: #fff; font-size: 42px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .li-search { flex: 1; height: 62px; border-radius: 10px; background: #edf3f8; font-size: 32px; line-height: 62px; padding: 0 24px; white-space: nowrap; overflow: hidden; color: #333; }
    .li-nav { flex: none; width: 54px; height: 54px; border-radius: 50%; background: #e3e6ea; }
    .li-body { position: absolute; left: 0; right: 0; top: 206px; bottom: 0; padding: 26px 30px; overflow: hidden; }
    .li-h { font-size: 30px; color: #666; margin-bottom: 18px; }
    .li-card { background: #fff; border: 3px solid #e0dfdc; border-radius: 20px; padding: 26px; margin-bottom: 20px; display: flex; gap: 24px; align-items: center; }
    .li-card.col { display: block; } .li-row { display: flex; gap: 24px; align-items: center; } .grow { flex: 1; }
    .li-card strong, .li-prof strong { font-size: 38px; display: block; } .li-card span, .li-prof span { font-size: 28px; color: #666; display: block; margin-top: 4px; white-space: nowrap; }
    .li-btn { margin-left: auto; font-style: normal; border: 3px solid #0a66c2; color: #0a66c2; border-radius: 36px; font-size: 30px; font-weight: 700; padding: 12px 30px; white-space: nowrap; display: inline-block; }
    .li-btn.solid { background: #0a66c2; color: #fff; } .li-btn.done { background: #e7f3ec; border-color: #0a7a44; color: #0a7a44; opacity: 0; } .li-btn.wide { display: block; text-align: center; margin: 30px 0 0; padding: 20px; font-size: 36px; }
    .sk { height: 22px; border-radius: 11px; background: #e6e6e6; margin-top: 16px; } .sk.tall { height: 200px; border-radius: 16px; }
    .li-sign { position: absolute; left: 140px; right: 140px; top: 90px; background: #fff; border: 3px solid #e0dfdc; border-radius: 26px; padding: 44px; box-shadow: 0 20px 50px rgba(0,0,0,.12); }
    .li-sign h4 { font-size: 54px; margin-bottom: 26px; } .li-field { border: 3px solid #b9bcc2; border-radius: 12px; height: 86px; line-height: 80px; font-size: 34px; padding: 0 24px; margin-bottom: 20px; white-space: nowrap; overflow: hidden; }
    .li-welcome { opacity: 0; background: #e7f3ec; color: #0a7a44; font-size: 44px; font-weight: 700; border-radius: 20px; padding: 28px 30px; margin-bottom: 22px; } .li-welcome i { font-style: normal; margin-right: 16px; }
    .li-prof { background: #fff; border: 3px solid #e0dfdc; border-radius: 20px; padding: 0 30px 30px; margin-bottom: 20px; overflow: hidden; }
    .li-banner { height: 170px; margin: 0 -30px; background: linear-gradient(120deg, #a0b4b7, #dfe7ea); } .av.big { width: 170px; height: 170px; font-size: 62px; margin-top: -86px; border: 8px solid #fff; margin-bottom: 14px; }
    .li-acts { display: flex; gap: 20px; margin-top: 26px; align-items: center; } .li-acts .li-btn { margin-left: 0; } .li-btnw { position: relative; } .li-btnw .done { position: absolute; left: 0; top: 0; }
    .cur { position: absolute; left: 0; top: 0; width: 56px; height: 56px; z-index: 5; } .rip { position: absolute; left: 0; top: 0; width: 60px; height: 60px; border-radius: 50%; background: #e0468f; opacity: 0; z-index: 4; }
    .ty { position: relative; display: inline-block; white-space: nowrap; vertical-align: top; } .ty-g { visibility: hidden; } .ty-v { position: absolute; left: 0; top: 0; overflow: hidden; width: 0; }
    .m-msg { display: flex; gap: 24px; margin-bottom: 30px; align-items: flex-start; }
    .m-msg strong { font-size: 34px; } .m-msg p { font-size: 38px; line-height: 1.25; margin-top: 8px; background: var(--card); border: 2px solid var(--line); border-radius: 6px 26px 26px 26px; padding: 20px 26px; }`;

// ---------- three.js background (variant option) ----------
const threeScript = (v) => `
    <script type="module">
      import * as THREE from "three";
      const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
      const rand = rng(11);
      const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById("gl"), antialias: true, preserveDrawingBuffer: true });
      renderer.setPixelRatio(1); renderer.setSize(${W}, ${H}, false);
      const scene = new THREE.Scene(); scene.background = new THREE.Color("${v.three.bg}"); scene.fog = new THREE.Fog("${v.three.bg}", 14, 46);
      const cam = new THREE.PerspectiveCamera(48, ${W} / ${H}, 0.1, 100);
      scene.add(new THREE.HemisphereLight(0xffffff, 0x10363a, 1.5)); const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(4, 8, 6); scene.add(sun);
      const hex = new THREE.CylinderGeometry(1, 1, 0.5, 6), mat = new THREE.MeshStandardMaterial({ color: "${v.three.color}", roughness: 0.35, metalness: 0.2 });
      const N = 70, items = [];
      for (let i = 0; i < N; i++) { const m = new THREE.Mesh(hex, mat); const s = 0.35 + rand() * 1.3; m.scale.setScalar(s); items.push({ m, x: (rand() - 0.5) * 22, y: (rand() - 0.5) * 44, z: -4 - rand() * 30, sp: 0.25 + rand() * 0.6, ph: rand() * 6.28 }); scene.add(m); }
      const hero = new THREE.Mesh(hex, new THREE.MeshStandardMaterial({ color: "#0b0b0c", roughness: 0.25, metalness: 0.5 })); hero.scale.setScalar(1.3); scene.add(hero);
      function renderAt(t) { // pure function of t
        for (const o of items) { const y = ((o.y + t * o.sp + 22) % 44 + 44) % 44 - 22; o.m.position.set(o.x, y, o.z); o.m.rotation.set(1.2 + t * o.sp * 0.5 + o.ph, o.ph + t * 0.3, 0); }
        hero.position.set(0, -4.9 + Math.sin(t * 0.8) * 0.2, -3); hero.rotation.set(1.57 + Math.sin(t * 0.5) * 0.35, t * 0.7, 0);
        cam.position.set(Math.sin(t * 0.15) * 1.2, 0, 12); cam.lookAt(0, 0, 0); renderer.render(scene, cam);
      }
      window.addEventListener("hf-seek", (e) => renderAt(e.detail.time)); renderAt(0);
    </script>`;

// accents on stressed words through the first 19 s, densest in the first 5 s; [word index, sound, volume]
const DENSE = [ // first 5 s (words 0-21): an accent on nearly every stressed word
  [2, "pop", 0.22], [3, "whoosh-short", 0.16], [5, "impact-bass-2", 0.18], [5, "glitch-3", 0.12], [8, "click", 0.26], [9, "pop", 0.2], [10, "whoosh-short", 0.2], [13, "click-soft", 0.26],
  [14, "pop", 0.22], [15, "key-press", 0.24], [18, "whoosh", 0.18], [18, "ping", 0.14], [19, "pop", 0.2], [20, "sparkle", 0.14], [21, "click", 0.24], [23, "impact-bass-1", 0.2], [24, "whoosh-short", 0.2],
  [27, "click", 0.26], [31, "whoosh", 0.18], [36, "sparkle", 0.14], [37, "whoosh-short", 0.2], [41, "click", 0.24], [43, "click-soft", 0.26], [47, "pop", 0.22], [49, "whoosh", 0.16],
  [52, "ping", 0.12], [55, "key-press", 0.26], [60, "whoosh-short", 0.2], [61, "notification", 0.14], [64, "pop", 0.22], [67, "impact-bass-1", 0.18]];

// ---------- one variant ----------
const CTX = { bottom: null };
function build(v) {
  CTX.bottom = v.caption.y < 1150 ? v.caption.y - 70 : null;
  const dir = `${ROOT}/videos/${v.id}`;
  fs.mkdirSync(`${dir}/compositions`, { recursive: true });
  const js = [], gjs = [], sfx = (v.hook || ["impact-bass-1", "whoosh"]).map((name, i) => ({ name, at: 0.02, vol: i ? 0.2 : 0.32, dur: 2.2 })).concat(v.sfx?.extra || [], DENSE.map(([w, name, vol]) => ({ name, at: n3(Math.max(0, T(w) - (name.startsWith("whoosh") ? 0.04 : 0))), vol, dur: 1.2 }))), body = [], ghtml = [], used = new Set([`music-${v.music || "bright"}.m4a`, "voice.m4a", "solid-logo.png", "words.json"]), spec = [];
  const shots = v.shots.map((s) => ({ ...s, s: s.t ?? T(s.w) }));
  shots.forEach((sh, i) => {
    const e = shots[i + 1] ? shots[i + 1].s : DUR;
    if (sh.stage) { body.push(stage(v, sh, i, sh.s, e, js, sfx)); js.push(`tl.set("#st${i}f",{opacity:1},${sh.s});tl.set("#st${i}f",{opacity:0},${e});`); used.add("solid-mark.png"); used.add("solid-mark-white.png"); }
    (sh.layers || []).forEach((l, j) => { used.add(`${l.src}.mp4`); body.push(layerHtml({ tx: sh.tx, ...l, ...(l.src === "main" ? { in: sh.s } : {}) }, `${i}_${j}`, sh.s, e, 2 + j, js)); });
    if (sh.mock) ghtml.push(mockHtml(sh.mock, `mk${i}`, sh.s, e, gjs, sfx));
    if (i && sh.s > T(64) && v.sfx?.cut && (i % (v.sfx.every || 1) === 0)) sfx.push({ name: Array.isArray(v.sfx.cut) ? v.sfx.cut[i % v.sfx.cut.length] : v.sfx.cut, at: n3(Math.max(0, sh.s - (v.sfx.lead ?? 0.04))), vol: v.sfx.vol ?? 0.16, dur: 1 });
    if (sh.sfx) sfx.push({ name: sh.sfx, at: sh.s, vol: sh.vol ?? 0.24 });
    if (sh.tx === "flash") { const g = GFX.flash({ at: sh.s }, `fl${i}`); ghtml.push(g.html); gjs.push(...g.js); }
    spec.push(`| ${i + 1} | ${sh.s.toFixed(2)}–${e.toFixed(2)} | ${words.filter((w) => w.s >= sh.s - 0.07 && w.s < e - 0.07).map((w) => w.w).join(" ")} | ${(sh.layers || []).map((l) => `${l.src}@${l.in ?? "sync"}s`).join(" + ")}${sh.mock ? ` mock:${sh.mock.name}` : ""} | ${sh.tx || "cut"} |`);
  });
  (v.persist || []).forEach((p, i) => { used.add(`${p.src}.mp4`); body.push(layerHtml(p.src === "main" ? { ...p, in: T(p.w[0]) } : p, `P${i}`, T(p.w[0]), T(p.w[1]), 8, js)); });
  const stageSpans = shots.map((sh, i) => [sh.s, shots[i + 1]?.s ?? DUR, !!sh.stage]).filter((x) => x[2] && x[0] > 1);
  (v.gfx || []).forEach((o, i) => { if (o.type === "watermark") o.hide = stageSpans; if (o.w != null) o.at = n3(T(o.w) + (o.off || 0)); if (o.toW != null) o.dur = n3(T(o.toW) - o.at); const g = GFX[o.type](o, `g${i}`); ghtml.push(g.html); gjs.push(...g.js); sfx.push(...g.sfx); });
  sfx.forEach((x) => used.add(`sfx/${SFXLIB[x.name].file}`));

  const hosts = [["gfx", "graphics", 20], ["captions", "captions", 30]].map(([id, kind, z]) =>
    `<div id="${id}" data-composition-id="${id}" data-composition-src="compositions/${id}.html" data-start="0" data-duration="${DUR}" data-track-index="${z}" data-track-kind="${kind}" data-width="${W}" data-height="${H}" style="z-index:${z}"></div>`).join("\n      ");
  fs.writeFileSync(`${dir}/index.html`, `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>${v.three ? `
    <script type="importmap">{ "imports": { "three": "./lib/three/three.module.min.js" } }</script>` : ""}
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: #000; }
      #root { position: relative; width: ${W}px; height: ${H}px; overflow: hidden; background: ${v.bg || "#000"}; }
      #gl { position: absolute; inset: 0; z-index: 1; }
      .box { position: absolute; overflow: hidden; opacity: 0; }
      .pan { position: absolute; inset: 0; }
      .box video { position: absolute; max-width: none; }
      #gfx, #captions, #sfx { position: absolute; inset: 0; }
      .stage, .stage-fg { position: absolute; opacity: 0; z-index: 1; } .stage-fg { inset: 0; z-index: 3; font-family: Inter, sans-serif; color: #fff; }
      .st-mark { position: absolute; left: 240px; top: 1380px; width: 600px; opacity: 0.16; }
      .st-head { position: absolute; white-space: nowrap; font-size: 40px; font-weight: 700; padding: 14px 30px 14px 22px; border-radius: 40px; background: rgba(255,255,255,.1); border: 2px solid rgba(255,255,255,.2); }
      .st-head img { height: 40px; vertical-align: -9px; margin-right: 14px; }
      .st-row { position: absolute; height: 96px; border-radius: 22px; background: rgba(255,255,255,.08); border: 2px solid rgba(255,255,255,.14); font-size: 40px; font-weight: 600; line-height: 92px; padding: 0 26px; white-space: nowrap; overflow: hidden; }
      .st-row i { display: inline-block; width: 52px; height: 52px; line-height: 52px; border-radius: 50%; background: ${v.accent || "#12D3E0"}; color: #06262a; font-style: normal; font-weight: 800; font-size: 32px; text-align: center; margin-right: 20px; vertical-align: 3px; }
      .light .st-head, .light.stage-fg .st-row { background: #fff; border-color: rgba(0,0,0,.1); color: #111; box-shadow: 0 10px 30px rgba(0,0,0,.12); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}" data-width="${W}" data-height="${H}">${v.three ? `
      <canvas id="gl" width="${W}" height="${H}" data-layout-ignore></canvas>` : ""}
      ${body.join("\n      ")}
      ${hosts}
      <div id="sfx" data-composition-id="sfx" data-composition-src="compositions/sfx.html" data-start="0" data-duration="${DUR}" data-track-index="40" data-width="${W}" data-height="${H}"></div>
      <audio id="voice" class="clip" src="assets/voice.m4a" data-start="0" data-duration="${DUR}" data-volume="1" data-track-index="41"></audio>
      <audio id="music" class="clip" src="assets/music-${v.music || "bright"}.m4a" data-start="0" data-duration="${DUR}" data-volume="0.45" data-track-index="42"></audio>
    </div>${v.three ? threeScript(v) : ""}
    <script>
      window.__timelines = window.__timelines || {};
      const tl = gsap.timeline({ paused: true });
      ${js.join("\n      ")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`);
  fs.writeFileSync(`${dir}/compositions/gfx.html`, `<template>
  <style>${gfxCss(v)}
  </style>
  <div id="root" data-composition-id="gfx" data-width="${W}" data-height="${H}">
    ${ghtml.join("\n    ")}
  </div>
  <script>
    const tl = gsap.timeline({ paused: true });
    ${gjs.join("\n    ")}
    window.__timelines["gfx"] = tl;
  </script>
</template>
`);
  fs.writeFileSync(`${dir}/compositions/captions.html`, captionsComp(v));
  fs.writeFileSync(`${dir}/compositions/sfx.html`, `<template>
  <style>#root { position: absolute; inset: 0; }</style>
  <div id="root" data-composition-id="sfx" data-width="${W}" data-height="${H}" data-no-timeline>
    ${sfx.sort((a, b) => a.at - b.at).map((x, i) => `<audio id="sfx-${i}" class="clip" src="assets/sfx/${SFXLIB[x.name].file}" data-start="${n3(x.at)}" data-duration="${n3(Math.min(SFXLIB[x.name].duration - 0.02, x.dur ?? 9, DUR - x.at))}"${(x.dur || SFXLIB[x.name].duration) > 0.9 ? ` data-fade-out="0.4"` : ""} data-volume="${x.vol}" data-track-index="${i % 4}"></audio>`).join("\n    ")}
  </div>
</template>
`);
  // assets are hardlinked, so ten projects cost the disk space of one
  for (const f of used) { const to = `${dir}/assets/${f}`; fs.mkdirSync(path.dirname(to), { recursive: true }); fs.rmSync(to, { force: true }); fs.linkSync(`${ROOT}/assets/${f}`, to); }
  if (v.three) for (const f of ["three.module.min.js", "three.core.min.js"]) { fs.mkdirSync(`${dir}/lib/three`, { recursive: true }); fs.copyFileSync(`${ROOT}/../hackathon-video/template/lib/three/${f}`, `${dir}/lib/three/${f}`); }
  const pk = "npx --yes hyperframes@0.9.72";
  fs.writeFileSync(`${dir}/package.json`, JSON.stringify({ name: `solid-${v.id}`, private: true, type: "module", scripts: { dev: `${pk} preview`, check: `${pk} check`, render: `${pk} render` } }, null, 2) + "\n");
  fs.copyFileSync(`${ROOT}/../hackathon-video/template/hyperframes.json`, `${dir}/hyperframes.json`);
  fs.writeFileSync(`${dir}/meta.json`, JSON.stringify({ id: `phoebe-${v.id}`, name: `phoebe-${v.id}`, createdAt: "2026-11-21T00:00:00.000Z" }, null, 2) + "\n");
  fs.writeFileSync(`${dir}/SPEC.md`, `# ${v.id} — ${v.title}\n\n${v.concept}\n\n- Captions: \`${v.caption.style}\` at y=${v.caption.y}\n- Generated by \`../../build.mjs\` from \`../../variants.mjs\`; edit there and rebuild, not here.\n\n| # | time (s) | words | picture | in |\n|---|---|---|---|---|\n${spec.join("\n")}\n`);
  // self-check: every trim must stay inside its source clip
  const LEN = { main: 46.66, app: 8.23, carry: 22.33, react: 25.13, wide: 33.96, open: 32.86, phone: 20.16, stress: 37.23, call: 16.13, hero: 41.4, routine: 52.83, screen: 223.7 };
  shots.forEach((sh, i) => (sh.layers || []).forEach((l) => { const d = ((shots[i + 1]?.s ?? DUR) - sh.s) * (l.rate || 1); console.assert((l.in ?? sh.s) + d <= LEN[l.src] + 0.02, `${v.id} shot ${i + 1}: ${l.src} runs past its end (${(l.in + d).toFixed(2)} > ${LEN[l.src]})`); }));
  console.log(`built ${v.id}: ${shots.length} shots, ${sfx.length} sfx`);
}

const { variants } = await import("./variants.mjs");
const pick = process.argv.slice(2);
variants.filter((v) => !pick.length || pick.some((p) => v.id.startsWith(p))).forEach(build);
