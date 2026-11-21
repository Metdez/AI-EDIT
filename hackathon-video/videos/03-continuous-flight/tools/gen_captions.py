# Writes compositions/captions.html from the callout list below (times from assets/words.json).
# Run: python3 tools/gen_captions.py
import html, pathlib

# (in, out, text, accent word index or None, extra)
CAPS = [
    (2.86, 5.05, "WELCOME TO THE HACKATHON", 3, None),
    (10.78, 12.15, "BUILD SOMETHING COOL", 2, None),
    (12.24, 14.0, "EXPERIMENT", None, None),
    (14.74, 16.0, "HAVE FUN", 1, None),
    (18.1, 19.55, "3D SIMULATIONS", 0, None),
    (19.6, 20.98, "ON THE WEB", 2, None),
    (21.08, 22.95, "THREE.JS + AI", 2, None),
    (26.3, 27.12, "REAL WORLD", None, None),
    (27.18, 28.7, "HOW IT WORKS", None, None),
    (28.78, 30.45, "IN YOUR BROWSER", 2, None),
    (31.56, 33.3, "BOSTON TRAFFIC", 0, None),
    (33.72, 35.12, "CRAZY WEATHER", None, None),
    (35.44, 36.82, "SOLAR SYSTEM", None, None),
    (36.9, 39.1, "1,000 PARTICLES", 0, "count"),
    (40.6, 41.8, "BE CREATIVE", 1, None),
    (42.24, 43.25, "THE COOL PART", 1, None),
    (43.64, 45.6, "AI CODING TOOLS", 0, None),
    (47.06, 48.95, "PHYSICS & MATH", None, "strike"),
    (49.2, 50.72, "FOCUS ON IDEAS", 2, None),
    (50.76, 52.1, "MAKE THEM HAPPEN", None, None),
    (53.56, 55.25, "NEVER DONE 3D?", 2, None),
    (55.34, 56.9, "TOTALLY FINE", 1, None),
    (57.42, 58.6, "LEARN", None, None),
    (58.64, 59.75, "TRY NEW THINGS", None, None),
    (59.78, 61.0, "MEET PEOPLE", 1, None),
    (61.1, 62.9, "BUILD BIGGER", 1, None),
    (64.56, 66.7, "DON'T OVERTHINK IT", 1, None),
    (67.4, 69.5, "KEEP IT SMALL", 2, None),
    (69.76, 71.2, "START SIMPLE", 1, None),
    (71.26, 72.95, "MAKE IT INTERACTIVE", 2, None),
    (73.48, 74.92, "TALK TO PEOPLE", None, None),
    (74.98, 75.92, "SHARE IDEAS", 1, None),
    (75.96, 77.2, "ASK QUESTIONS", None, None),
    (77.6, 78.9, "EXPERIMENT", None, None),
    (81.58, 82.88, "SOMETHING BUILT", 1, None),
    (82.92, 84.32, "SOMETHING LEARNED", 1, None),
    (84.38, 85.62, "NEW FRIENDS", 1, None),
    (87.46, 90.3, "THANK YOU", None, None),
    (90.66, 93.4, "WHAT WILL YOU BUILD?", 3, None),
]

groups = []
for i, (t_in, t_out, text, acc, extra) in enumerate(CAPS):
    words = []
    for j, w in enumerate(text.split(" ")):
        cls = "w acc" if j == acc else "w"
        inner = html.escape(w)
        if extra == "count" and j == 0:
            inner = '<span class="num" id="cap-num">0</span>'
        words.append(f'<span class="m"><span class="{cls}">{inner}</span></span>')
    strike = '<span class="strike"></span>' if extra == "strike" else ""
    sattr = ' data-strike="48.3"' if extra == "strike" else ""
    groups.append(
        f'    <div id="cap-{i}" class="cap" data-in="{t_in}" data-out="{t_out}"'
        f'{sattr}><span class="line">{" ".join(words)}{strike}</span></div>'
    )

out = f"""<template>
  <style>
    #root {{ position: absolute; inset: 0; pointer-events: none; }}
    .cap {{ position: absolute; left: 0; right: 0; top: 818px; text-align: center; visibility: hidden; overflow: visible; }}
    .line {{ position: relative; display: inline-block; font: 400 76px/1.12 "Archivo Black", sans-serif; letter-spacing: 0.01em;
      color: #fff; text-shadow: 0 4px 26px rgba(0,0,0,.65); white-space: nowrap; }}
    .m {{ display: inline-block; overflow: hidden; vertical-align: top; padding: 0 0.04em; }}
    .w {{ display: inline-block; }}
    .acc {{ color: #EC8796; }}
    .num {{ display: inline-block; min-width: 3.3em; text-align: right; }}
    .strike {{ position: absolute; left: -2%; width: 104%; top: 47%; height: 10px; background: #F6B04A; border-radius: 5px; transform-origin: left center; }}
  </style>
  <div id="root" data-composition-id="captions" data-width="1920" data-height="1080">
{chr(10).join(groups)}
  </div>
  <script>
    const tl = gsap.timeline({{ paused: true }});
    document.querySelectorAll("#root .cap").forEach((cap) => {{
      const tin = +cap.dataset.in, tout = +cap.dataset.out, words = cap.querySelectorAll(".w");
      tl.set(cap, {{ visibility: "visible" }}, tin);
      tl.fromTo(cap, {{ opacity: 1, filter: "blur(0px)" }}, {{ opacity: 1, filter: "blur(0px)", duration: 0.01 }}, tin);
      tl.fromTo(words, {{ yPercent: 112 }}, {{ yPercent: 0, duration: 0.32, ease: "expo.out", stagger: 0.08 }}, tin);
      if (tout < 93.39) {{
        tl.to(cap, {{ opacity: 0, filter: "blur(6px)", duration: 0.16, ease: "power2.in" }}, tout - 0.16);
        tl.set(cap, {{ visibility: "hidden" }}, tout);
      }}
      const st = cap.querySelector(".strike");
      if (st) tl.fromTo(st, {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.3, ease: "power3.out" }}, +cap.dataset.strike);
    }});
    const num = document.getElementById("cap-num"), c = {{ v: 0 }};
    tl.fromTo(c, {{ v: 0 }}, {{ v: 1000, duration: 0.9, ease: "power2.out", onUpdate: () => (num.textContent = Math.round(c.v).toLocaleString("en-US")) }}, 36.9);
    window.__timelines["captions"] = tl;
  </script>
</template>
"""
pathlib.Path(__file__).resolve().parent.parent.joinpath("compositions/captions.html").write_text(out)
print("wrote", len(CAPS), "caption groups")
