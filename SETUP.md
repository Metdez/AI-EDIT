# SETUP.md

Run this when someone says **"set up"**, or when it's their first time in this workspace.
Claude: work through the steps in order. Every step starts with a **check**. If the check passes,
skip the step. When all steps are done, run the smoke test at the end and report what you installed
and what you skipped.

Everything installs to the user's home folder (`~/.local`). No Homebrew, no `sudo`.

## 0. Requirements

- A Mac with Apple Silicon (`uname -m` prints `arm64`). The local transcription model runs on MLX,
  which only works on Apple Silicon.
- About 5 GB of free disk space (the Whisper model is 1.6 GB, plus Chrome and Node).
- Claude Code, logged in.

## 1. PATH

**Check:** `grep -q '.local/bin' ~/.zshrc && grep -q '.local/node/bin' ~/.zshrc`

**Install:** add these lines to `~/.zshrc`, then `source ~/.zshrc`:

```bash
export PATH="$HOME/.local/node/bin:$PATH"
export PATH="$HOME/.local/bin:$PATH"
mkdir -p ~/.local/bin
```

## 2. Node.js 22

**Check:** `node -v` prints `v22.x` or later.

**Install:** download the latest 22.x `darwin-arm64` tarball from https://nodejs.org/dist/latest-v22.x/
and extract it to `~/.local/node`:

```bash
cd /tmp && curl -LO https://nodejs.org/dist/latest-v22.x/<node-v22.x.y-darwin-arm64.tar.gz>
mkdir -p ~/.local/node && tar -xzf node-v22.*-darwin-arm64.tar.gz -C ~/.local/node --strip-components=1
```

## 3. ffmpeg and ffprobe

**Check:** `ffmpeg -version && ffprobe -version`

**Install:** use the static builds from npm and link them into `~/.local/bin`:

```bash
npm install -g ffmpeg-static ffprobe-static
ln -sf "$(npm root -g)/ffmpeg-static/ffmpeg" ~/.local/bin/ffmpeg
ln -sf "$(npm root -g)/ffprobe-static/bin/darwin/arm64/ffprobe" ~/.local/bin/ffprobe
```

## 4. Python 3.12

**Check:** `~/.local/bin/python3.12 --version`

**Install:** with uv:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
uv python install 3.12
ln -sf "$(uv python find 3.12)" ~/.local/bin/python3.12
```

## 5. The local model (Whisper, for transcription)

All transcription in this workspace uses `mlx_whisper` with the **large-v3-turbo** model, run
locally. One Python venv holds it, plus numpy and Pillow, which the workspace's Python tools need
(`solid-video/tools/music.py`, `sundai-3dworlds/scripts/fx.py`).

**Check:**

```bash
~/.local/share/whisper/venv/bin/python -c "import mlx_whisper, numpy, PIL" \
  && ls ~/.cache/huggingface/hub/models--mlx-community--whisper-large-v3-turbo
```

**Install:**

```bash
~/.local/bin/python3.12 -m venv ~/.local/share/whisper/venv
~/.local/share/whisper/venv/bin/pip install -U pip mlx-whisper numpy Pillow
ln -sf ~/.local/share/whisper/venv/bin/mlx_whisper ~/.local/bin/mlx_whisper
# Download the model now so the first transcription doesn't stall (about 1.6 GB)
~/.local/share/whisper/venv/bin/hf download mlx-community/whisper-large-v3-turbo
```

**How to transcribe** (this is the convention; use it every time):

```bash
ffmpeg -i input.mov -ar 16000 -ac 1 /tmp/input.wav
mlx_whisper /tmp/input.wav --model mlx-community/whisper-large-v3-turbo \
  --word-timestamps True --output-format json --output-dir research/transcripts
```

Run any Python script that needs numpy or Pillow with `~/.local/share/whisper/venv/bin/python`.

## 6. HyperFrames (renders HTML into video)

The CLI runs through `npx` and is pinned to **0.9.72** everywhere. Always call it as
`npx --yes hyperframes@0.9.72 …`, never an unpinned `hyperframes`.

**Check:** `ls ~/.claude/skills/hyperframes/SKILL.md && npx --yes hyperframes@0.9.72 browser path`

**Install:**

```bash
npx --yes hyperframes@0.9.72 skills          # installs the hyperframes, hyperframes-cli, -registry, media-use, reverse-any-video, style-sampling skills
npx --yes hyperframes@0.9.72 browser ensure  # downloads the headless Chrome it renders with
npx --yes hyperframes@0.9.72 doctor
```

In `doctor`, ignore these failures. They are optional and this workspace doesn't use them:
whisper-cpp (we use mlx_whisper), Kokoro TTS, MusicGen, Docker. Everything else should pass.

Restart Claude Code after installing skills so that `/hyperframes` appears.

## 7. Project dependencies

**Check:** `ls "hackathon-video/vendor/node_modules/three"`

**Install:** `cd hackathon-video/vendor && npm install`. This is the source three.js and Spark files
are copied from. The video folders have no dependencies of their own; their scripts call `npx`.

## 8. GitHub (only needed to push the deck)

`sundai-3dworlds/` is the only git repo here (remote: `hunterh37/sundai-3dworlds`).

**Check:** `gh auth status`

**Install:** `gh auth login`. Pushing to that repo needs write access from its owner.

## 9. Smoke test

```bash
cd hackathon-video/template
npm run check
npx --yes hyperframes@0.9.72 snapshot --at 1
```

Open the PNG it writes and look at it. Then transcribe two seconds of real audio to prove the model
loads:

```bash
ffmpeg -y -i ../assets/voice.m4a -t 2 -ar 16000 -ac 1 /tmp/smoke.wav
mlx_whisper /tmp/smoke.wav --model mlx-community/whisper-large-v3-turbo --output-format txt --output-dir /tmp
```

If both work, setup is done.

---

## Conventions: read these before editing

Setup gets the tools working. The rules for *how* to edit live in these files. Don't copy them here;
read the originals.

| What | Where |
|---|---|
| Workspace map and commands | `CLAUDE.md` |
| Any HyperFrames work | invoke `/hyperframes` first |
| New short-form or vertical video | invoke `/short-form-video` (`.claude/skills/short-form-video/SKILL.md`) |
| Zack's standing edit preferences (hook SFX and zoom, dense early SFX, music bed, full-frame demos, end card) | `solid-video/docs/PREFERENCES.md` |
| How the Solid ads were made, step by step | `solid-video/docs/PROCESS.md` |
| Rules for the 93.4 s hackathon video | `hackathon-video/BRIEF.md`, then `PLANS.md` |
| Generated video folders | `solid-video/videos/*` is rebuilt by `node build.mjs`; never edit it by hand |

The rules that apply everywhere:

- Leave raw input folders untouched (`My vid/`, `Nate vid/`, `Moption Vid/`, `Phoebe/`,
  `drive-download-*`). Start each new edit in a folder of its own.
- Transcribe with the command in step 5. Treat word timings as the truth for every cut.
- three.js `render(t)` must be a pure function of `t`: seeded PRNG only, no `Math.random()` or timers.
- After every render, check the MP4 itself (`ffprobe` for size, length and audio, then a contact
  sheet), not just snapshots.
