import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, TITLE_FONT, colors } from "../theme";
import { AnimatedTitle, FactCard, Kicker, Particles, SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const WORD = "Fihavanana";

// Fleur de vanillier et gousses.
const Vanilla: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 30) * 3;
  return (
    <g transform={`rotate(${sway})`}>
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M ${i * 40} 0 C ${i * 40 + 30} 90, ${i * 40 - 20} 200, ${i * 40 + 40} 300`}
          fill="none"
          stroke={i === 1 ? "#3B2414" : "#2A190D"}
          strokeWidth={16}
          strokeLinecap="round"
        />
      ))}
      <g transform="translate(-90 -20)">
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse key={a} cx={0} cy={-38} rx={18} ry={40} fill="#F6EDB6" transform={`rotate(${a})`} />
        ))}
        <circle r={16} fill="#E8C95A" />
      </g>
      <path d="M -60 -10 C -20 -20, 0 -10, 20 0" stroke="#4E7A2E" strokeWidth={8} fill="none" />
    </g>
  );
};

export const Culture: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const meaning = useEnter(215);
  const vanilla = useEnter(350, 14);
  const glass = "rgba(60,14,10,0.45)";

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="radial-gradient(circle at 28% 32%, #D86F3E 0%, #8A2B1C 55%, #3D0F0B 100%)"
    >
      {/* Bande de tissu « lamba » */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 34,
          background:
            "repeating-linear-gradient(90deg, #F2D6A2 0 40px, #1C1C1C 40px 52px, #FC3D32 52px 92px, #007E3A 92px 104px)",
          backgroundPositionX: -frame * 2,
          opacity: 0.9,
        }}
      />
      <Particles color="rgba(255,220,160,0.45)" count={25} seed={7} />
      <div style={{ position: "absolute", left: 120, top: 120 }}>
        <Kicker text="Culture" delay={10} />
        <AnimatedTitle text="Le cœur malgache" delay={18} size={96} />
        <div style={{ display: "flex", marginTop: 60 }}>
          {WORD.split("").map((letter, i) => {
            const p = spring({ frame: frame - 170 - i * 3, fps, config: { damping: 10 } });
            return (
              <span
                key={i}
                style={{
                  fontFamily: TITLE_FONT,
                  fontWeight: 700,
                  fontSize: 120,
                  color: colors.sand,
                  display: "inline-block",
                  opacity: Math.min(1, p),
                  transform: `translateY(${(1 - p) * -80}px) rotate(${(1 - p) * -20}deg)`,
                }}
              >
                {letter}
              </span>
            );
          })}
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 36,
            color: colors.cream,
            opacity: meaning,
            transform: `translateX(${(1 - meaning) * -40}px)`,
            letterSpacing: 1,
          }}
        >
          l'esprit de fraternité et d'entraide
        </div>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(1010 ${520 + (1 - vanilla) * 80}) scale(0.9)`} opacity={vanilla}>
          <Vanilla />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 1180, top: 150 }}>
        <FactCard value="Romazava" label="le plat national" delay={300} width={620} glass={glass} />
        <FactCard value={80} suffix=" %" label="de la vanille mondiale" delay={350} width={620} glass={glass} />
        <FactCard value="Valiha & salegy" label="musique et danse" delay={430} width={620} glass={glass} />
      </div>
    </SceneFrame>
  );
};
