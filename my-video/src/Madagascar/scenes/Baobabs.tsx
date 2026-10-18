import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, colors } from "../theme";
import { AnimatedTitle, Kicker, SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const HORIZON = 760;

// Silhouette de baobab de Grandidier : tronc lisse et couronne de branches
// courtes. Origine au pied de l'arbre.
const Baobab: React.FC<{ h: number }> = ({ h }) => {
  const w = h * 0.24;
  const top = -h * 0.86;
  const branch = (dx: number, dy: number, ex: number, ey: number) =>
    `M ${dx * w} ${top} Q ${dx * w * 1.6} ${top - h * dy}, ${ex * w} ${top - h * ey}`;
  return (
    <g fill="#1C0A14" stroke="#1C0A14" strokeLinecap="round">
      <path
        d={`M ${-w * 0.55} 0 C ${-w * 0.5} ${-h * 0.5}, ${-w * 0.4} ${-h * 0.78}, ${-w * 0.42} ${top}
           L ${w * 0.42} ${top} C ${w * 0.4} ${-h * 0.78}, ${w * 0.5} ${-h * 0.5}, ${w * 0.55} 0 Z`}
        stroke="none"
      />
      <g fill="none" strokeWidth={w * 0.16}>
        <path d={branch(-0.3, 0.06, -1.3, 0.14)} />
        <path d={branch(-0.15, 0.1, -0.7, 0.22)} />
        <path d={branch(0, 0.12, 0.05, 0.25)} />
        <path d={branch(0.15, 0.1, 0.8, 0.2)} />
        <path d={branch(0.3, 0.05, 1.35, 0.11)} />
      </g>
      <g fill="none" strokeWidth={w * 0.07}>
        <path d={`M ${-1.3 * w} ${top - h * 0.14} l ${-w * 0.35} ${-h * 0.05}`} />
        <path d={`M ${1.35 * w} ${top - h * 0.11} l ${w * 0.35} ${-h * 0.06}`} />
        <path d={`M ${-0.7 * w} ${top - h * 0.22} l ${-w * 0.15} ${-h * 0.07}`} />
        <path d={`M ${0.8 * w} ${top - h * 0.2} l ${w * 0.2} ${-h * 0.06}`} />
      </g>
    </g>
  );
};

const TREES = [
  { x: 800, base: 772, h: 170 },
  { x: 1120, base: 772, h: 185 },
  { x: 640, base: 795, h: 290 },
  { x: 1290, base: 795, h: 310 },
  { x: 420, base: 840, h: 460 },
  { x: 1520, base: 840, h: 480 },
  { x: 150, base: 920, h: 680 },
  { x: 1790, base: 920, h: 700 },
];

const Badge: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        padding: "14px 30px",
        borderRadius: 999,
        background: "rgba(30,8,20,0.55)",
        border: "1px solid rgba(255,214,140,0.6)",
        color: "#FFE2A8",
        fontFamily: BODY_FONT,
        fontWeight: 600,
        fontSize: 30,
        opacity: p,
        transform: `translateY(${(1 - p) * 30}px)`,
      }}
    >
      {text}
    </div>
  );
};

export const Baobabs: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sunY = interpolate(frame, [0, durationInFrames], [560, 700]);
  const glow = interpolate(frame, [0, durationInFrames], [1, 0.75]);

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="linear-gradient(180deg, #2A0F4A 0%, #7B2A63 32%, #E0533A 60%, #F7B44A 72%)"
    >
      <div
        style={{
          position: "absolute",
          left: 960 - 190,
          top: sunY - 190,
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "radial-gradient(circle, #FFF1B8 0%, #FFC861 55%, rgba(255,170,80,0) 72%)",
          opacity: glow,
          boxShadow: "0 0 160px 60px rgba(255,170,80,0.45)",
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="ground" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#3A1420" />
            <stop offset="1" stopColor="#14060C" />
          </linearGradient>
        </defs>
        <rect x={0} y={HORIZON} width={1920} height={1080 - HORIZON} fill="url(#ground)" />
        <path d={`M 940 ${HORIZON} L 980 ${HORIZON} L 1400 1080 L 520 1080 Z`} fill="#5A2A24" opacity={0.75} />
        {new Array(6).fill(0).map((_, i) => {
          const t = ((frame * 1.6 + i * 320) % 2200) - 140;
          const flap = Math.sin(frame / 4 + i) * 10;
          const y = 260 + i * 38 + Math.sin(frame / 30 + i) * 12;
          return (
            <path
              key={i}
              d={`M ${t - 18} ${y + flap} Q ${t - 8} ${y - 4}, ${t} ${y} Q ${t + 8} ${y - 4}, ${t + 18} ${y + flap}`}
              fill="none"
              stroke="#2A0E1E"
              strokeWidth={4}
              strokeLinecap="round"
            />
          );
        })}
        {TREES.map((tree, i) => {
          const grow = spring({ frame: frame - 10 - i * 8, fps, config: { damping: 15, mass: 1.4 } });
          return (
            <g key={i} transform={`translate(${tree.x} ${tree.base}) scale(${0.9 + 0.1 * grow} ${grow})`}>
              <Baobab h={tree.h} />
            </g>
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 90,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Kicker text="Morondava" delay={15} color="#FFE2A8" />
        <AnimatedTitle text="L'Allée des Baobabs" delay={22} size={104} color={colors.cream} />
        <div style={{ display: "flex", gap: 24, marginTop: 30 }}>
          <Badge text="Jusqu'à 30 m de haut" delay={120} />
          <Badge text="Plusieurs siècles d'histoire" delay={160} />
          <Badge text="Coucher de soleil magique" delay={230} />
        </div>
      </div>
    </SceneFrame>
  );
};
