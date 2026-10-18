import React from "react";
import {
  AbsoluteFill,
  Html5Audio,
  Sequence,
  Series,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import narration from "./narration.json";
import { Aventure } from "./scenes/Aventure";
import { Baobabs } from "./scenes/Baobabs";
import { Culture } from "./scenes/Culture";
import { Geographie } from "./scenes/Geographie";
import { Intro } from "./scenes/Intro";
import { Nature } from "./scenes/Nature";
import { Outro } from "./scenes/Outro";
import { Plages } from "./scenes/Plages";
import type { SceneProps } from "./scenes/types";
import { colors } from "./theme";
import timing from "./timing.json";
import { Subtitles } from "./ui";

export const MADAGASCAR_DURATION = timing.durationInFrames;
export const MADAGASCAR_FPS = timing.fps;

const SCENES: Record<string, React.FC<SceneProps>> = {
  intro: Intro,
  geographie: Geographie,
  nature: Nature,
  baobabs: Baobabs,
  plages: Plages,
  aventure: Aventure,
  culture: Culture,
  outro: Outro,
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, MADAGASCAR_DURATION], [0, 100]);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, height: 6, width: `${progress}%`, display: "flex" }}>
      <div style={{ flex: 1, background: "#FFFFFF" }} />
      <div style={{ flex: 1, background: colors.flagRed }} />
      <div style={{ flex: 1, background: colors.flagGreen }} />
    </div>
  );
};

export const Madagascar: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "black" }}>
      <Html5Audio src={staticFile("music.mp3")} volume={0.8} />
      <Series>
        {timing.scenes.map((scene) => {
          const Scene = SCENES[scene.id];
          const text = narration.find((n) => n.id === scene.id)?.text ?? "";
          return (
            <Series.Sequence key={scene.id} durationInFrames={scene.durationInFrames} name={scene.id}>
              <Scene durationInFrames={scene.durationInFrames} />
              <Sequence from={scene.voiceDelay} name="Voix off">
                <Html5Audio src={staticFile(`voice/${scene.id}.mp3`)} />
              </Sequence>
              <Subtitles text={text} voiceDelay={scene.voiceDelay} voiceSeconds={scene.voiceSeconds} />
            </Series.Sequence>
          );
        })}
      </Series>
      <ProgressBar />
    </AbsoluteFill>
  );
};
