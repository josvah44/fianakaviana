// Génère la voix off (espeak-ng + voix d'homme MBROLA "fr1") et une musique
// d'ambiance douce, puis écrit la durée de chaque scène dans timing.json.
//
// Prérequis (Debian/Ubuntu) :
//   sudo apt-get install espeak-ng mbrola mbrola-fr1 ffmpeg
//
// Usage : node scripts/generate-audio.mjs

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const FPS = 30;
const VOICE_DELAY = 15; // images de silence avant la voix
const TAIL = 30; // images après la fin de la voix
const VOICE = process.env.VOICE ?? "mb-fr1";
const SPEED = process.env.SPEED ?? "142";
const PITCH = process.env.PITCH ?? "36";

const root = new URL("..", import.meta.url).pathname;
const narration = JSON.parse(
  readFileSync(join(root, "src/Madagascar/narration.json"), "utf8"),
);
const voiceDir = join(root, "public/voice");
const tmp = join(root, ".audio-tmp");
mkdirSync(voiceDir, { recursive: true });
mkdirSync(tmp, { recursive: true });

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "pipe" });
const duration = (file) =>
  Number(
    execFileSync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "csv=p=0",
      file,
    ]).toString(),
  );

const scenes = [];
let from = 0;
for (const { id, text, speak } of narration) {
  const raw = join(tmp, `${id}.wav`);
  const out = join(voiceDir, `${id}.mp3`);
  run("espeak-ng", ["-v", VOICE, "-s", SPEED, "-p", PITCH, "-g", "3", "-w", raw, speak ?? text]);
  // Réchauffe la voix : coupe le grave parasite, renforce le médium-grave,
  // légère réverbération et normalisation du volume.
  run("ffmpeg", [
    "-y", "-loglevel", "error", "-i", raw,
    "-af",
    "highpass=f=70,lowpass=f=7000,equalizer=f=160:t=q:w=1.2:g=4," +
      "equalizer=f=3000:t=q:w=1:g=2,aecho=0.85:0.5:35|60:0.10|0.06," +
      "loudnorm=I=-16:TP=-1.5:LRA=11",
    "-ar", "48000", "-ac", "2", "-b:a", "160k", out,
  ]);
  const seconds = duration(out);
  const durationInFrames = VOICE_DELAY + Math.ceil(seconds * FPS) + TAIL;
  scenes.push({ id, from, durationInFrames, voiceDelay: VOICE_DELAY, voiceSeconds: seconds });
  from += durationInFrames;
  console.log(`${id.padEnd(12)} ${seconds.toFixed(2)} s`);
}

// Musique d'ambiance : nappe D - Bm - G - A, en boucle sur toute la vidéo.
const chords = [
  [146.83, 185.0, 220.0, 293.66],
  [123.47, 146.83, 185.0, 246.94],
  [98.0, 123.47, 146.83, 196.0],
  [110.0, 138.59, 164.81, 220.0],
];
const CHORD = 6;
const XF = 2;
chords.forEach((freqs, i) => {
  const expr = freqs
    .map((f) => `sin(2*PI*${f}*t)+0.5*sin(2*PI*${(f * 1.004).toFixed(3)}*t)+0.15*sin(2*PI*${f * 2}*t)`)
    .join("+");
  run("ffmpeg", [
    "-y", "-loglevel", "error",
    "-f", "lavfi", "-i", `aevalsrc=0.05*(${expr})*(0.85+0.15*sin(2*PI*0.2*t)):s=48000:d=${CHORD + XF}`,
    "-af", `afade=t=in:d=${XF},afade=t=out:st=${CHORD - XF / 2}:d=${XF}`,
    join(tmp, `chord${i}.wav`),
  ]);
});
const loop = join(tmp, "loop.wav");
run("ffmpeg", [
  "-y", "-loglevel", "error",
  ...chords.flatMap((_, i) => ["-i", join(tmp, `chord${i}.wav`)]),
  "-filter_complex",
  `[0][1]acrossfade=d=${XF}[a];[a][2]acrossfade=d=${XF}[b];[b][3]acrossfade=d=${XF}[c]`,
  "-map", "[c]", loop,
]);
const totalSeconds = from / FPS;
run("ffmpeg", [
  "-y", "-loglevel", "error",
  "-stream_loop", "-1", "-i", loop,
  "-t", totalSeconds.toFixed(3),
  "-af",
  `lowpass=f=2500,aecho=0.8:0.7:120|240:0.25|0.15,volume=1.1,` +
    `afade=t=in:d=2,afade=t=out:st=${(totalSeconds - 3).toFixed(3)}:d=3`,
  "-ar", "48000", "-ac", "2", "-b:a", "128k",
  join(root, "public/music.mp3"),
]);

writeFileSync(
  join(root, "src/Madagascar/timing.json"),
  JSON.stringify({ fps: FPS, durationInFrames: from, scenes }, null, 2) + "\n",
);
rmSync(tmp, { recursive: true, force: true });
console.log(`Total : ${totalSeconds.toFixed(1)} s (${from} images)`);
