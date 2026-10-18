import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedTitle, FactCard, Kicker, SceneFrame } from "../ui";
import type { SceneProps } from "./types";

const SEA = 560;
const WHALE_AT = 200;

const wavePath = (y: number, amp: number, len: number, phase: number) => {
  let d = `M -20 ${y}`;
  for (let x = -20; x <= 1960; x += 30) {
    d += ` L ${x} ${(y + Math.sin(x / len + phase) * amp).toFixed(1)}`;
  }
  return d + " L 1960 1100 L -20 1100 Z";
};

const Palm: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 25) * 5;
  const fronds = [-150, -110, -70, -30, 10, 40];
  return (
    <g>
      <path d="M 0 0 C 30 -150, 10 -300, 80 -430" fill="none" stroke="#7A5230" strokeWidth={30} strokeLinecap="round" />
      {new Array(9).fill(0).map((_, i) => (
        <path
          key={i}
          d={`M ${-12 + i * 2} ${-40 - i * 44} q 14 -6 28 0`}
          stroke="#5E3D22"
          strokeWidth={4}
          fill="none"
          transform={`translate(${i * i * 0.8} 0)`}
        />
      ))}
      <g transform={`translate(80 -430) rotate(${sway})`}>
        {fronds.map((a, i) => (
          <g key={i} transform={`rotate(${a + Math.sin(frame / 20 + i) * 4})`}>
            <path d="M 0 0 C 80 -40, 170 -10, 230 60 C 160 20, 80 10, 0 0 Z" fill={i % 2 ? "#2F9E4F" : "#23843F"} />
          </g>
        ))}
        <circle cx={6} cy={10} r={14} fill="#6B4423" />
        <circle cx={-12} cy={16} r={13} fill="#5A381C" />
      </g>
    </g>
  );
};

const WhaleTail: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const up = spring({ frame: frame - WHALE_AT, fps, config: { damping: 12, mass: 1.5 } });
  const down = spring({ frame: frame - WHALE_AT - 80, fps, config: { damping: 14, mass: 1.5 } });
  const rise = up - down;
  const splash = interpolate(frame - WHALE_AT - 80, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <g>
      <g transform={`translate(0 ${(1 - rise) * 240}) rotate(${(1 - rise) * -12})`}>
        <path d="M -26 40 C -20 -20, -12 -60, 0 -90 C 12 -60, 20 -20, 26 40 Z" fill="#2C3E50" />
        <path
          d="M 0 -80 C -20 -130, -60 -175, -150 -190 C -100 -205, -40 -200, 0 -150 C 40 -200, 100 -205, 150 -190 C 60 -175, 20 -130, 0 -80 Z"
          fill="#34495E"
        />
        <path d="M -140 -192 C -90 -196, -40 -190, -10 -158" fill="none" stroke="#E8EEF2" strokeWidth={5} opacity={0.6} />
      </g>
      {splash > 0 && splash < 1
        ? new Array(10).fill(0).map((_, i) => {
            const a = (i / 10) * Math.PI - Math.PI;
            const dist = 40 + splash * 140;
            return (
              <circle
                key={i}
                cx={Math.cos(a) * dist}
                cy={Math.sin(a) * dist * 0.9 + splash * splash * 140 - 20}
                r={10 * (1 - splash) + 3}
                fill="white"
                opacity={1 - splash}
              />
            );
          })
        : null}
    </g>
  );
};

export const Plages: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const boatX = interpolate(frame, [0, durationInFrames], [700, 470]);
  const glass = "rgba(4,52,72,0.6)";

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="linear-gradient(180deg, #5EC4EE 0%, #B6E8FA 52%)"
    >
      <div
        style={{
          position: "absolute",
          left: 1000 - 120,
          top: 150 - 120,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFFBE6 0%, #FFE58A 50%, rgba(255,230,140,0) 72%)",
          boxShadow: "0 0 120px 40px rgba(255,240,180,0.6)",
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#1FC2D1" />
            <stop offset="1" stopColor="#086A8C" />
          </linearGradient>
        </defs>
        <path d={wavePath(SEA, 6, 140, frame / 20)} fill="url(#sea)" />
        {/* Pirogue à balancier au loin */}
        <g transform={`translate(${boatX} ${SEA + 4})`}>
          <path d="M -40 0 L 40 0 L 30 10 L -30 10 Z" fill="#4A2E1C" />
          <path d="M 0 -2 L 0 -70 L 34 -6 Z" fill="#FFF6E5" />
          <path d="M -30 16 L 30 16" stroke="#4A2E1C" strokeWidth={3} />
        </g>
        <g transform={`translate(900 ${SEA + 170})`}>
          <WhaleTail />
        </g>
        <path d={wavePath(SEA + 150, 10, 110, frame / 14 + 1)} fill="#15A7C1" />
        <path d={wavePath(SEA + 260, 12, 90, -frame / 12 + 2)} fill="#0F8FAD" />
        <path d="M -20 1100 L -20 820 C 200 780, 420 860, 620 960 C 700 1000, 760 1060, 780 1100 Z" fill="#F3DDAA" />
        <path d="M -20 840 C 200 800, 420 880, 620 980" fill="none" stroke="white" strokeWidth={8} opacity={0.5 + Math.sin(frame / 10) * 0.3} />
        <g transform="translate(150 980) scale(0.8)">
          <Palm />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 100 }}>
        <Kicker text="Océan Indien" delay={10} color="#0B3954" />
        <AnimatedTitle
          text="Le paradis des plages"
          delay={18}
          size={84}
          color="#0B3954"
          style={{ textShadow: "0 4px 24px rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}
        />
      </div>
      <div style={{ position: "absolute", left: 1220, top: 150 }}>
        <FactCard value="Nosy Be" label="l'île aux parfums" delay={85} accent="#FFE58A" width={580} glass={glass} />
        <FactCard value="Sainte-Marie" label="lagons et baleines à bosse" delay={180} accent="#FFE58A" width={580} glass={glass} />
        <FactCard value="Juil. à sept." label="la saison des baleines" delay={270} accent="#FFE58A" width={580} glass={glass} />
      </div>
    </SceneFrame>
  );
};
