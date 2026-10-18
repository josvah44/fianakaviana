// Synthétise la musique de fond (style salegy : marimba, basse, percussions)
// et les bruitages de la vidéo, sans aucun fichier externe.
// La longueur de la musique suit src/Madagascar/timing.json : lancez d'abord
// scripts/generate-audio.mjs si la narration a changé.
//
// Prérequis : ffmpeg
// Usage : node scripts/generate-music-sfx.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SR = 44100;
const root = new URL("..", import.meta.url).pathname;
const timing = JSON.parse(readFileSync(join(root, "src/Madagascar/timing.json"), "utf8"));
const sfxDir = join(root, "public/sfx");
const tmp = join(root, ".audio-tmp");
mkdirSync(sfxDir, { recursive: true });
mkdirSync(tmp, { recursive: true });

let seed = 7;
const rand = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rand() * 2 - 1;
const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
const TAU = Math.PI * 2;

const track = (sec) => {
  const n = Math.ceil(sec * SR);
  return [new Float32Array(n), new Float32Array(n)];
};

// Filtre biquad (formules RBJ), réglable à chaque échantillon.
const biquad = (type) => {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 1, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  return {
    set(freq, q = 0.707) {
      const w = (TAU * Math.min(freq, SR * 0.45)) / SR;
      const c = Math.cos(w), al = Math.sin(w) / (2 * q), a0 = 1 + al;
      if (type === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
      else if (type === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
      else [b0, b1, b2] = [al, 0, -al];
      [b0, b1, b2, a1, a2] = [b0 / a0, b1 / a0, b2 / a0, (-2 * c) / a0, (1 - al) / a0];
      return this;
    },
    run(x) {
      const y = b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
      [x2, x1, y2, y1] = [x1, x, y1, y];
      return y;
    },
  };
};

// Ajoute un son mono fn(t) à la piste, avec panoramique (-1 gauche, 1 droite).
const add = (tr, start, dur, fn, gain = 1, pan = 0) => {
  const gl = Math.cos(((pan + 1) * Math.PI) / 4) * gain;
  const gr = Math.sin(((pan + 1) * Math.PI) / 4) * gain;
  const s0 = Math.floor(start * SR);
  const n = Math.min(Math.ceil(dur * SR), tr[0].length - s0);
  for (let i = 0; i < n; i++) {
    const v = fn(i / SR, i);
    tr[0][s0 + i] += v * gl;
    tr[1][s0 + i] += v * gr;
  }
};

const rms = (tr) => {
  let s = 0;
  for (const ch of tr) for (const v of ch) s += v * v;
  return Math.sqrt(s / (tr[0].length * 2));
};
const peak = (tr) => Math.max(...tr.map((ch) => ch.reduce((m, v) => Math.max(m, Math.abs(v)), 0)));
const scale = (tr, k, soft = false) => {
  for (const ch of tr) for (let i = 0; i < ch.length; i++) ch[i] = soft ? Math.tanh(ch[i] * k) : ch[i] * k;
};

const save = (tr, file, bitrate = "160k") => {
  const n = tr[0].length;
  const data = Buffer.alloc(44 + n * 4);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + n * 4, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(2, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 4, 28);
  data.writeUInt16LE(4, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 2; c++) {
      const v = Math.max(-1, Math.min(1, tr[c][i]));
      data.writeInt16LE(Math.round(v * 32767), 44 + i * 4 + c * 2);
    }
  }
  const wav = join(tmp, "out.wav");
  writeFileSync(wav, data);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", wav, "-b:a", bitrate, file]);
  console.log(`${file.replace(root, "")}  ${(n / SR).toFixed(1)} s`);
};
const normalizePeak = (tr, db = -3) => scale(tr, 10 ** (db / 20) / peak(tr));
const normalizeRms = (tr, db) => scale(tr, 10 ** (db / 20) / rms(tr), true);

// --- Instruments -----------------------------------------------------------

const marimba = (f) => (t) =>
  (Math.sin(TAU * f * t) + 0.3 * Math.sin(TAU * f * 3.93 * t) * Math.exp(-t * 35)) *
  Math.exp(-t * 6) * Math.min(1, t / 0.003);

const bell = (f, decay = 1) => (t) =>
  (Math.sin(TAU * f * t) * Math.exp(-t * 2.5 * decay) +
    0.5 * Math.sin(TAU * f * 2 * t) * Math.exp(-t * 3.5 * decay) +
    0.25 * Math.sin(TAU * f * 3.01 * t) * Math.exp(-t * 5 * decay) +
    0.15 * Math.sin(TAU * f * 4.2 * t) * Math.exp(-t * 7 * decay)) *
  Math.min(1, t / 0.002);

const kick = (t) =>
  Math.sin(TAU * (48 * t + (70 * (1 - Math.exp(-35 * t))) / 35)) * Math.exp(-t * 8);

const bass = (f) => (t) =>
  (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * 2 * f * t) * Math.exp(-t * 6)) *
  Math.exp(-t * 2.8) * Math.min(1, t / 0.008);

const shaker = () => {
  const hp = biquad("hp").set(7000);
  return (t) => hp.run(noise()) * Math.exp(-t * 55) * Math.min(1, t / 0.004);
};

// --- Musique ---------------------------------------------------------------

const music = () => {
  const total = timing.durationInFrames / timing.fps;
  const tr = track(total);
  const STEP = 0.2; // croche de triolet, 100 pulsations par minute
  const BAR = 12 * STEP;
  const chords = [
    { arp: [62, 66, 69, 74, 78], pad: [50, 54, 57], bass: 38 }, // Ré
    { arp: [59, 62, 66, 71, 74], pad: [47, 50, 54], bass: 35 }, // Si mineur
    { arp: [55, 59, 62, 67, 71], pad: [43, 47, 50], bass: 43 }, // Sol
    { arp: [57, 61, 64, 69, 73], pad: [45, 49, 52], bass: 45 }, // La
  ];
  const pattern = [0, 2, 1, 3, 2, 4, 3, 2, 4, 3, 1, 2];
  const bars = Math.ceil(total / BAR);
  for (let b = 0; b < bars; b++) {
    const chord = chords[b % 4];
    const t0 = b * BAR;
    const full = b >= 2 && b < bars - 1;
    for (const m of chord.pad) {
      add(tr, t0, BAR + 0.6, (t) =>
        (Math.sin(TAU * mtof(m) * t) + 0.4 * Math.sin(TAU * mtof(m) * 1.004 * t)) *
        Math.min(1, t / 0.5, (BAR + 0.6 - t) / 0.6), 0.035);
    }
    pattern.forEach((idx, s) => {
      const accent = s % 3 === 0 ? 1 : 0.7;
      add(tr, t0 + s * STEP, 0.9, marimba(mtof(chord.arp[idx])), 0.16 * accent, s % 2 ? 0.35 : -0.35);
      if (full) add(tr, t0 + s * STEP, 0.1, shaker(), (s % 3 === 0 ? 0.09 : 0.05), 0.2);
    });
    if (full) {
      for (const s of [0, 3, 6, 9]) add(tr, t0 + s * STEP, 0.4, kick, 0.55);
      add(tr, t0, 0.7, bass(mtof(chord.bass)), 0.4);
      add(tr, t0 + 7 * STEP, 0.6, bass(mtof(chord.bass + 7)), 0.3);
      add(tr, t0 + 9 * STEP, 0.6, bass(mtof(chord.bass + 12)), 0.25);
    }
  }
  normalizeRms(tr, -19);
  const fade = 3 * SR;
  for (const ch of tr) {
    for (let i = 0; i < SR * 1.5; i++) ch[i] *= i / (SR * 1.5);
    for (let i = 0; i < fade; i++) ch[ch.length - 1 - i] *= i / fade;
  }
  save(tr, join(root, "public/music.mp3"), "192k");
};

// --- Bruitages ponctuels ---------------------------------------------------

const whoosh = () => {
  const d = 0.9;
  const tr = track(d);
  const bp = biquad("bp");
  const L = biquad("bp"), R = biquad("bp");
  for (let i = 0; i < tr[0].length; i++) {
    const t = i / SR, env = Math.sin((Math.PI * t) / d) ** 2;
    const f = 300 + 3200 * env;
    const v = bp.set(f, 1.3).run(noise()) * env;
    const pan = -0.8 + (1.6 * t) / d;
    tr[0][i] = L.set(f, 2).run(v) * Math.cos(((pan + 1) * Math.PI) / 4) + v * 0.3;
    tr[1][i] = R.set(f, 2).run(v) * Math.sin(((pan + 1) * Math.PI) / 4) + v * 0.3;
  }
  normalizePeak(tr);
  save(tr, join(sfxDir, "whoosh.mp3"));
};

const pop = () => {
  const tr = track(0.25);
  add(tr, 0, 0.25, (t) => {
    const ph = TAU * (480 * t + (700 * (1 - Math.exp(-50 * t))) / 50);
    return (Math.sin(ph) + 0.2 * Math.sin(2 * ph)) * Math.exp(-t * 26) * Math.min(1, t / 0.002);
  });
  normalizePeak(tr);
  save(tr, join(sfxDir, "pop.mp3"));
};

const chime = () => {
  const tr = track(3.2);
  [74, 78, 81, 86].forEach((m, i) => add(tr, i * 0.09, 3, bell(mtof(m)), 0.5, -0.4 + i * 0.27));
  normalizePeak(tr);
  save(tr, join(sfxDir, "chime.mp3"));
};

const sparkle = () => {
  const tr = track(1.6);
  const scale5 = [86, 88, 90, 93, 95, 98, 100];
  for (let i = 0; i < 16; i++) {
    const m = scale5[Math.floor(rand() * scale5.length)];
    add(tr, rand() * 0.9, 0.7, bell(mtof(m), 2.5), 0.25, rand() * 1.6 - 0.8);
  }
  normalizePeak(tr);
  save(tr, join(sfxDir, "sparkle.mp3"));
};

const splash = () => {
  const tr = track(1.6);
  const lp = biquad("lp");
  add(tr, 0, 1.4, (t) => lp.set(500 + 7000 * Math.exp(-t * 3), 0.9).run(noise()) * Math.min(1, t / 0.01) * Math.exp(-t * 3.5));
  add(tr, 0, 0.5, (t) => Math.sin(TAU * (60 * t + (60 * (1 - Math.exp(-15 * t))) / 15)) * Math.exp(-t * 9), 0.8);
  for (let i = 0; i < 9; i++) {
    const f = 1200 + rand() * 2200;
    add(tr, 0.12 + rand() * 0.8, 0.12, (t) => Math.sin(TAU * f * (1 + t * 4) * t) * Math.exp(-t * 40), 0.25, rand() * 1.4 - 0.7);
  }
  normalizePeak(tr);
  save(tr, join(sfxDir, "splash.mp3"));
};

const thud = () => {
  const tr = track(0.6);
  const lp = biquad("lp").set(300);
  add(tr, 0, 0.6, (t) =>
    Math.sin(TAU * (42 * t + (40 * (1 - Math.exp(-20 * t))) / 20)) * Math.exp(-t * 9) +
    lp.run(noise()) * Math.exp(-t * 18) * 0.6);
  normalizePeak(tr);
  save(tr, join(sfxDir, "thud.mp3"));
};

const rumble = () => {
  const d = 2.2;
  const tr = track(d);
  const lp = biquad("lp").set(140);
  let b = 0;
  add(tr, 0, d, (t) => {
    b = 0.97 * b + 0.03 * noise();
    return lp.run(b) * Math.sin((Math.PI * t) / d) ** 1.5;
  });
  normalizePeak(tr);
  save(tr, join(sfxDir, "rumble.mp3"));
};

// --- Ambiances (20 s, plus longues que la plus longue scène) ---------------

const AMB = 20;

const ocean = () => {
  const tr = track(AMB);
  for (let c = 0; c < 2; c++) {
    const lp = biquad("lp");
    let b = 0;
    for (let i = 0; i < tr[c].length; i++) {
      const t = i / SR;
      const swell = 0.5 - 0.5 * Math.cos((TAU * t) / 6.5 + c * 0.8);
      b = 0.985 * b + 0.015 * noise();
      tr[c][i] = lp.set(300 + 1400 * swell, 0.6).run(b * 4 + noise() * 0.15) * (0.25 + 0.75 * swell ** 1.5);
    }
  }
  normalizeRms(tr, -22);
  save(tr, join(sfxDir, "ocean.mp3"));
};

const wind = () => {
  const tr = track(AMB);
  for (let c = 0; c < 2; c++) {
    const bp = biquad("bp");
    for (let i = 0; i < tr[c].length; i++) {
      const t = i / SR;
      const f = 450 + 250 * Math.sin((TAU * t) / 5 + c) + 120 * Math.sin((TAU * t) / 2.3);
      tr[c][i] = bp.set(f, 0.9).run(noise()) * (0.55 + 0.45 * Math.sin((TAU * t) / 6.5 + c * 0.5));
    }
  }
  normalizeRms(tr, -24);
  save(tr, join(sfxDir, "wind.mp3"));
};

const forest = () => {
  const tr = track(AMB);
  const lp = biquad("lp").set(1200);
  add(tr, 0, AMB, () => lp.run(noise()), 0.05);
  // Grillons
  add(tr, 0, AMB, (t) =>
    Math.sin(TAU * 4700 * t) * (Math.sin(TAU * 28 * t) > 0.3 ? 1 : 0) *
    (Math.sin(TAU * 0.9 * t) > 0 ? 1 : 0), 0.012, 0.5);
  // Oiseaux
  for (let t0 = 0.3; t0 < AMB - 1; t0 += 0.5 + rand() * 1.4) {
    const f0 = 2000 + rand() * 1800, up = 1.25 + rand() * 0.5, reps = 2 + Math.floor(rand() * 3);
    const pan = rand() * 1.6 - 0.8, gain = 0.15 + rand() * 0.2;
    for (let r = 0; r < reps; r++) {
      let ph = 0;
      add(tr, t0 + r * 0.11, 0.08, (t) => {
        ph += (TAU * (f0 + f0 * (up - 1) * (t / 0.08) + 120 * Math.sin(TAU * 40 * t))) / SR;
        return Math.sin(ph) * Math.sin((Math.PI * t) / 0.08);
      }, gain, pan);
    }
  }
  normalizeRms(tr, -26);
  save(tr, join(sfxDir, "forest.mp3"));
};

music();
whoosh();
pop();
chime();
sparkle();
splash();
thud();
rumble();
ocean();
wind();
forest();
rmSync(tmp, { recursive: true, force: true });
