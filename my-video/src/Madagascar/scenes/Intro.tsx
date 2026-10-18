import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { MadagascarMap } from "../MadagascarMap";
import { BODY_FONT, TITLE_FONT, colors } from "../theme";
import { Kicker, Particles, SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const WORD = "MADAGASCAR";

export const Intro: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sun = useEnter(0, 30);
  const subtitle = useEnter(70);
  const tagline = useEnter(110);
  const zoom = interpolate(frame, [0, durationInFrames], [1, 1.08]);

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="radial-gradient(circle at 72% 38%, #F39A55 0%, #C9502E 38%, #5E170E 100%)"
    >
      <div
        style={{
          position: "absolute",
          right: 250,
          top: 120,
          width: 620,
          height: 620,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFE3A3 0%, #FFB45E 45%, rgba(255,140,60,0) 70%)",
          opacity: sun,
          transform: `translateY(${(1 - sun) * 220}px) scale(${zoom})`,
        }}
      />
      <Particles color="rgba(255,214,170,0.65)" count={50} />
      <div
        style={{
          position: "absolute",
          right: 210,
          top: 70,
          transform: `scale(${zoom}) rotate(${interpolate(frame, [0, durationInFrames], [-3, 2])}deg)`,
        }}
      >
        <MadagascarMap
          height={820}
          drawStart={10}
          drawDuration={80}
          stroke={colors.cream}
          fill="rgba(110,30,18,0.55)"
        />
      </div>
      <div style={{ position: "absolute", left: 130, top: 290 }}>
        <Kicker text="Océan Indien" delay={20} />
        <div style={{ display: "flex" }}>
          {WORD.split("").map((letter, i) => {
            const p = spring({ frame: frame - 25 - i * 3, fps, config: { damping: 11 } });
            return (
              <span
                key={i}
                style={{
                  fontFamily: TITLE_FONT,
                  fontWeight: 900,
                  fontSize: 150,
                  color: colors.cream,
                  display: "inline-block",
                  opacity: Math.min(1, p),
                  transform: `translateY(${(1 - p) * 120}px) scale(${0.6 + 0.4 * p})`,
                  textShadow: "0 10px 40px rgba(60,10,0,0.55)",
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
            fontSize: 76,
            color: colors.sand,
            opacity: subtitle,
            transform: `translateX(${(1 - subtitle) * -60}px)`,
            marginTop: 6,
          }}
        >
          L'île rouge
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 34,
            color: colors.cream,
            opacity: tagline,
            marginTop: 26,
            letterSpacing: 2,
          }}
        >
          Un monde à part, une destination inoubliable
        </div>
      </div>
    </SceneFrame>
  );
};
