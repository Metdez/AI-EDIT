# Writes assets/music/chip-bed.wav: a soft 8-bit loop (triangle arp + bass + hats), 93.4 s, seeded. No deps.
import math, random, struct, wave, sys

SR, DUR, BPM = 22050, 93.4, 112
beat = 60 / BPM
N = int(SR * DUR)
out = [0.0] * N
rnd = random.Random(7)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
tri = lambda ph: 4 * abs((ph % 1) - 0.5) - 1
# I–vi–IV–V in C, one chord per bar
chords = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]

def note(t0, dur, f, amp, kind):
    a, b = int(t0 * SR), min(N, int((t0 + dur) * SR))
    for i in range(a, b):
        t = (i - a) / SR
        env = min(1, t / 0.005) * math.exp(-t * (6 if kind == "arp" else 2.5))
        ph = f * t
        v = tri(ph) if kind != "sq" else (1 if (ph % 1) < 0.25 else -1) * 0.5
        out[i] += v * amp * env

bars = int(DUR / (4 * beat)) + 1
for bar in range(bars):
    ch = chords[bar % 4]
    t_bar = bar * 4 * beat
    for s in range(16):  # 16th-note arpeggio
        m = ch[[0, 1, 2, 3, 2, 1, 0, 1][s % 8]] + 12
        note(t_bar + s * beat / 4, beat / 4, midi(m), 0.16, "arp")
    for q in range(4):  # bass on quarters, octave bounce
        note(t_bar + q * beat, beat * 0.9, midi(ch[0] - 24 + (12 if q % 2 else 0)), 0.22, "bass")
        note(t_bar + q * beat, beat * 0.25, midi(ch[0] - 12), 0.05, "sq")
    for q in range(4):  # soft off-beat hats
        a = int((t_bar + (q + 0.5) * beat) * SR)
        for i in range(a, min(N, a + int(0.03 * SR))):
            out[i] += (rnd.random() * 2 - 1) * 0.05 * math.exp(-(i - a) / SR * 120)

peak = max(abs(v) for v in out) or 1
with wave.open(sys.argv[1], "w") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    fr = bytearray()
    for i, v in enumerate(out):
        t = i / SR
        g = min(1, t / 1.5) * min(1, (DUR - t) / 3)  # fade in / out
        fr += struct.pack("<h", int(max(-1, min(1, v / peak * 0.9 * g)) * 32767))
    w.writeframes(bytes(fr))
