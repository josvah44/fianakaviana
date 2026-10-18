import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MadagascarMap, mapWidth } from "../MadagascarMap";
import { BODY_FONT, TITLE_FONT, colors } from "../theme";
import { SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const WORDS = ["L'aventure", "La nature", "L'émotion"];
const GREETING = "Tonga soa !";

export const Outro: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const white = useEnter(0, 18);
  const red = useEnter(8, 18);
  const green = useEnter(16, 18);
  const words = useEnter(25);
  const welcome = useEnter(225);
  const mapH = 640;

  return (
    <SceneFrame durationInFrames={durationInFrames} background={colors.ink}>
      {/* Drapeau de Madagascar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 640,
          height: 1080,
          background: "#FFFFFF",
          transform: `translateY(${(1 - white) * -1080}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 0,
          width: 1280,
          height: 540,
          background: colors.flagRed,
          transform: `translateX(${(1 - red) * 1280}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 640,
          top: 540,
          width: 1280,
          height: 540,
          background: colors.flagGreen,
          transform: `translateX(${(1 - green) * 1280}px)`,
        }}
      />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0) 33%, rgba(0,0,0,0.35) 100%)" }} />
      <div style={{ position: "absolute", left: (640 - mapWidth(mapH)) / 2, top: 150 }}>
        <MadagascarMap
          height={mapH}
          drawStart={20}
          drawDuration={60}
          stroke={colors.flagRed}
          fill="rgba(252,61,50,0.15)"
          pins={[{ lon: 47.52, lat: -18.91, label: "", delay: 90, color: colors.flagGreen }]}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 640,
          right: 0,
          top: 150,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          color: "white",
        }}
      >
        <div style={{ display: "flex", gap: 30, opacity: words }}>
          {WORDS.map((w, i) => {
            const p = spring({ frame: frame - 25 - i * 22, fps, config: { damping: 12 } });
            return (
              <span
                key={w}
                style={{
                  fontFamily: BODY_FONT,
                  fontWeight: 800,
                  fontSize: 38,
                  letterSpacing: 3,
                  textTransform: "uppercase",
                  opacity: p,
                  transform: `translateY(${(1 - p) * 30}px)`,
                }}
              >
                {w}
              </span>
            );
          })}
        </div>
        <div style={{ display: "flex", marginTop: 70 }}>
          {GREETING.split("").map((letter, i) => {
            const p = spring({ frame: frame - 180 - i * 3, fps, config: { damping: 9 } });
            return (
              <span
                key={i}
                style={{
                  fontFamily: TITLE_FONT,
                  fontWeight: 900,
                  fontSize: 180,
                  display: "inline-block",
                  whiteSpace: "pre",
                  opacity: Math.min(1, p),
                  transform: `scale(${p})`,
                  textShadow: "0 12px 50px rgba(0,0,0,0.45)",
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 700,
            fontSize: 72,
            marginTop: 10,
            opacity: welcome,
            transform: `translateY(${(1 - welcome) * 40}px)`,
            textShadow: "0 8px 30px rgba(0,0,0,0.45)",
          }}
        >
          Bienvenue à Madagascar
        </div>
      </div>
    </SceneFrame>
  );
};
