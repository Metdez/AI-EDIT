"""music.py — synthesises the three music beds (numpy only). Modelled on the reference's track:
~89 BPM, quiet pad + sub drone for the first half, bass-heavy half-time beat from DROP on.
Run: <python with numpy> tools/music.py   -> assets/music-{dark,bright,minimal}.wav
"""
import sys, wave
import numpy as np

SR, DUR, DROP = 44100, 46.6, 25.533  # DROP = start of "send connection requests" (word 84)
N = int(SR * DUR)
t = np.arange(N) / SR

def place(buf, sig, at, gain=1.0, pan=0.0):
    i = int(at * SR)
    if i >= N or i < 0: return
    sig = sig[: N - i] * gain
    buf[0, i:i + len(sig)] += sig * (1 - max(pan, 0)); buf[1, i:i + len(sig)] += sig * (1 + min(pan, 0))

def tone(freq, dur, decay, harm=(1.0,), glide=0.0):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = freq * (1 + glide * np.exp(-tt * 30)); ph = 2 * np.pi * np.cumsum(f) / SR
    return sum(a * np.sin(ph * (k + 1)) for k, a in enumerate(harm)) * np.exp(-tt / decay)

def noise(rng, dur, decay, lo, hi):
    n = int(dur * SR); x = rng.standard_normal(n); X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    X *= 1 / (1 + (lo / np.maximum(f, 1)) ** 6) / (1 + (f / hi) ** 6)
    return np.fft.irfft(X, n) * np.exp(-np.arange(n) / SR / decay)

def bed(name, bpm, root, chord, motif, seed, clap=True, drive=2.2):
    rng = np.random.default_rng(seed); beat = 60 / bpm; bar = 4 * beat; buf = np.zeros((2, N))
    # pad: chord tones with a few soft harmonics, slightly detuned left/right, slow swell
    pad = np.zeros((2, N))
    for k, f in enumerate(chord):
        for ch, det in ((0, 0.997), (1, 1.003)):
            pad[ch] += sum(np.sin(2 * np.pi * f * det * h * t + k) / h ** 2 for h in (1, 2, 3)) * (0.75 + 0.25 * np.sin(2 * np.pi * t / (5 + k) + ch))
    buf += pad / len(chord) * 0.16 * np.minimum(t / 2.0, 1)
    # sub drone before the drop, entering at 2 s like the reference
    buf += 0.10 * np.sin(2 * np.pi * root * 2 * t) * np.clip((t - 2) / 3, 0, 1) * (t < DROP)
    # pulse before the drop: soft ticks on the beat from bar -6, building
    k = -1
    while DROP + k * beat > 6:
        at = DROP + k * beat; place(buf, noise(rng, 0.08, 0.018, 6000, 14000), at, 0.05 + 0.05 * (1 + k / 28), pan=0.3 * (-1) ** k); k -= 1
    # riser into the drop
    r = noise(rng, 2.6, 9.0, 1500, 12000); place(buf, r * np.linspace(0, 1, len(r)) ** 2.5, DROP - 2.6, 0.16)
    # beat from the drop: kick + 808 on steps 0/3/6, clap on beat 3, eighth-note hats with end-of-bar rolls
    b = 0
    while DROP + b * bar < DUR - 0.6:
        t0 = DROP + b * bar
        for step, mul in ((0, 1.0), (3, 1.0), (6, 1.5 if b % 2 else 1.0)):
            at = t0 + step * beat / 2
            place(buf, tone(48, 0.4, 0.12, glide=1.6), at, 0.5)
            place(buf, np.tanh(drive * tone(root * mul, 1.0, 0.45 if step else 0.6, harm=(1, 0.25), glide=0.25)) / np.tanh(drive), at, 0.34)
        if clap: place(buf, noise(rng, 0.3, 0.07, 900, 5000), t0 + 2 * beat, 0.22)
        else: place(buf, tone(1800, 0.08, 0.012), t0 + 2 * beat, 0.2)
        for s in range(8):
            place(buf, noise(rng, 0.07, 0.014, 7000, 15000), t0 + s * beat / 2, 0.07 + 0.04 * (s % 2), pan=0.25 * (-1) ** s)
        if b % 2: [place(buf, noise(rng, 0.05, 0.01, 7000, 15000), t0 + 3.5 * beat + j * beat / 8, 0.06 + 0.015 * j) for j in range(4)]
        # sparse bell motif with one echo
        f = motif[b % len(motif)]
        for at, g in ((t0 + 1.5 * beat, 0.11), (t0 + 1.5 * beat + 0.75 * beat, 0.045)): place(buf, tone(f, 1.4, 0.35, harm=(1, 0.3, 0.1)), at, g, pan=-0.3 if g > 0.1 else 0.4)
        b += 1
    place(buf, tone(48, 0.5, 0.2, glide=1.6), DROP, 0.3)  # extra weight on the drop itself
    buf *= np.minimum(1, (DUR - t) / 0.8)  # fade the tail
    buf = np.tanh(buf * 1.4) / 1.4
    buf /= np.abs(buf).max() / 0.85
    with wave.open(f"assets/music-{name}.wav", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((buf.T * 32767).astype(np.int16).tobytes())
    sub = np.abs(np.fft.rfft(buf[0])); f = np.fft.rfftfreq(N, 1 / SR)
    assert np.isfinite(buf).all() and sub[(f > 30) & (f < 120)].sum() > 0, "bed is empty or broken"
    print("wrote", name)

E1, A1, Fs1 = 41.2, 55.0, 46.25
bed("dark", 89, E1, [164.8, 329.6, 493.9, 698.5], [659.3, 698.5, 493.9, 392.0], 1)            # E phrygian, like the reference's 330/700 Hz tones
bed("bright", 89, A1, [220.0, 261.6, 329.6, 392.0], [880.0, 659.3, 784.0, 587.3], 2, drive=1.4)  # A minor 7, softer bass
bed("minimal", 89, Fs1, [185.0, 277.2, 370.0], [554.4, 740.0, 659.3, 554.4], 3, clap=False)     # F# minor, rim instead of clap
