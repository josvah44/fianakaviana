import React from "react";
import { Html5Audio, Sequence, interpolate, staticFile } from "remotion";

type Cue = { file: string; at: number; volume?: number };

// Bruitages ponctuels, en images depuis le début de chaque scène. Les instants
// correspondent aux animations des scènes (cartes, épingles, baleine…).
const CUES: Record<string, Cue[]> = {
  intro: [
    { file: "rumble", at: 0, volume: 0.35 },
    { file: "sparkle", at: 22, volume: 0.45 },
    { file: "chime", at: 75, volume: 0.35 },
  ],
  geographie: [
    { file: "pop", at: 90 },
    { file: "pop", at: 110 },
    { file: "pop", at: 135 },
    { file: "pop", at: 200 },
    { file: "pop", at: 340 },
  ],
  nature: [
    { file: "pop", at: 105 },
    { file: "pop", at: 250 },
    { file: "sparkle", at: 300, volume: 0.3 },
    { file: "pop", at: 310 },
  ],
  baobabs: [
    { file: "thud", at: 10, volume: 0.3 },
    { file: "thud", at: 26, volume: 0.35 },
    { file: "thud", at: 42, volume: 0.45 },
    { file: "thud", at: 58, volume: 0.55 },
    { file: "pop", at: 120 },
    { file: "pop", at: 160 },
    { file: "pop", at: 230 },
  ],
  plages: [
    { file: "pop", at: 85 },
    { file: "pop", at: 180 },
    { file: "whoosh", at: 195, volume: 0.35 },
    { file: "pop", at: 270 },
    { file: "splash", at: 278, volume: 0.8 },
  ],
  aventure: [
    { file: "rumble", at: 0, volume: 0.6 },
    { file: "pop", at: 95 },
    { file: "pop", at: 185 },
  ],
  culture: [
    { file: "sparkle", at: 170, volume: 0.45 },
    { file: "pop", at: 300 },
    { file: "pop", at: 350 },
    { file: "pop", at: 430 },
  ],
  outro: [
    { file: "whoosh", at: 8, volume: 0.4 },
    { file: "chime", at: 180, volume: 0.6 },
    { file: "sparkle", at: 225, volume: 0.4 },
  ],
};

// Ambiance continue de chaque scène.
const AMBIENCE: Record<string, { file: string; volume: number }> = {
  geographie: { file: "ocean", volume: 0.25 },
  nature: { file: "forest", volume: 0.6 },
  baobabs: { file: "wind", volume: 0.25 },
  plages: { file: "ocean", volume: 0.55 },
  aventure: { file: "wind", volume: 0.4 },
};

const DEFAULT_VOLUME = 0.3;

export const SceneSound: React.FC<{ id: string; durationInFrames: number }> = ({
  id,
  durationInFrames,
}) => {
  const ambience = AMBIENCE[id];
  return (
    <>
      {id !== "intro" ? (
        <Html5Audio src={staticFile("sfx/whoosh.mp3")} volume={0.45} />
      ) : null}
      {ambience ? (
        <Html5Audio
          src={staticFile(`sfx/${ambience.file}.mp3`)}
          volume={(f) =>
            interpolate(
              f,
              [0, 20, durationInFrames - 20, durationInFrames],
              [0, ambience.volume, ambience.volume, 0],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            )
          }
        />
      ) : null}
      {(CUES[id] ?? []).map((cue, i) => (
        <Sequence key={i} from={cue.at} name={`Son ${cue.file}`}>
          <Html5Audio src={staticFile(`sfx/${cue.file}.mp3`)} volume={cue.volume ?? DEFAULT_VOLUME} />
        </Sequence>
      ))}
    </>
  );
};
