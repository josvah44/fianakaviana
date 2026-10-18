import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { AnimatedTitle, FactCard, Kicker, Particles, SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const Leaf: React.FC<{ x: number; y: number; size: number; angle: number; color: string; i: number }> = ({
  x,
  y,
  size,
  angle,
  color,
  i,
}) => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 30 + i) * 6;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle + sway}) scale(${size})`}>
      <path d="M 0 0 C 40 -30, 120 -30, 170 0 C 120 30, 40 30, 0 0 Z" fill={color} />
      <path d="M 0 0 L 165 0" stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
    </g>
  );
};

// Maki catta (lémurien à queue annelée) assis sur une branche.
const Lemur: React.FC = () => {
  const frame = useCurrentFrame();
  const sway = Math.sin(frame / 18) * 40;
  const blink = frame % 95 < 4 ? 0.1 : 1;
  const look = Math.sin(frame / 40) * 4;
  const tail = `M 235 400 C ${300 + sway} 520, ${150 - sway} 640, ${250 + sway * 1.4} 780`;
  return (
    <g>
      <path d={tail} fill="none" stroke="#F4F2EE" strokeWidth={36} strokeLinecap="round" />
      <path d={tail} fill="none" stroke="#1D1D1D" strokeWidth={36} strokeDasharray="28 28" strokeDashoffset={10} />
      <ellipse cx={150} cy={420} rx={45} ry={30} fill="#7D7874" />
      <ellipse cx={250} cy={420} rx={45} ry={30} fill="#7D7874" />
      <ellipse cx={200} cy={310} rx={95} ry={125} fill="#8E8A86" />
      <ellipse cx={195} cy={330} rx={58} ry={88} fill="#ECEAE5" />
      <path d="M 120 260 C 90 330, 120 390, 175 395" fill="none" stroke="#7D7874" strokeWidth={30} strokeLinecap="round" />
      <path d="M 280 260 C 310 330, 280 390, 225 395" fill="none" stroke="#7D7874" strokeWidth={30} strokeLinecap="round" />
      <g transform={`rotate(${look} 200 160)`}>
        <path d="M 140 115 L 125 55 L 175 95 Z" fill="#6F6B68" />
        <path d="M 260 115 L 275 55 L 225 95 Z" fill="#6F6B68" />
        <path d="M 145 105 L 137 70 L 165 95 Z" fill="#F2F0EC" />
        <path d="M 255 105 L 263 70 L 235 95 Z" fill="#F2F0EC" />
        <circle cx={200} cy={155} r={72} fill="#6F6B68" />
        <ellipse cx={200} cy={180} rx={52} ry={58} fill="#F2F0EC" />
        <ellipse cx={173} cy={152} rx={24} ry={21} fill="#1B1B1B" transform="rotate(-20 173 152)" />
        <ellipse cx={227} cy={152} rx={24} ry={21} fill="#1B1B1B" transform="rotate(20 227 152)" />
        <g transform={`translate(0 ${152 * (1 - blink)}) scale(1 ${blink})`}>
          <circle cx={174} cy={152} r={11} fill="#F2A71B" />
          <circle cx={226} cy={152} r={11} fill="#F2A71B" />
          <circle cx={174 + look / 2} cy={152} r={5} fill="#111" />
          <circle cx={226 + look / 2} cy={152} r={5} fill="#111" />
        </g>
        <path d="M 182 200 Q 200 230 218 200 Q 200 212 182 200 Z" fill="#1B1B1B" />
      </g>
    </g>
  );
};

// Caméléon dont la couleur change lentement.
const Chameleon: React.FC = () => {
  const frame = useCurrentFrame();
  const hue = interpolate(frame, [0, 120, 240, 360], [95, 160, 30, 300], {
    extrapolateRight: "extend",
  }) % 360;
  const body = `hsl(${hue}, 70%, 45%)`;
  const dark = `hsl(${hue}, 70%, 28%)`;
  const eye = Math.sin(frame / 15) * 4;
  return (
    <g>
      <path d="M 50 125 C 0 140, -20 185, 15 200 C 45 212, 55 175, 28 172" fill="none" stroke={body} strokeWidth={16} strokeLinecap="round" />
      <path d="M 80 140 L 70 185 M 190 145 L 205 185" stroke={dark} strokeWidth={14} strokeLinecap="round" />
      <path d="M 40 120 C 60 55, 180 35, 230 88 C 250 110, 240 140, 210 150 C 160 165, 80 165, 40 120 Z" fill={body} />
      <path d="M 70 92 C 110 60, 170 55, 210 80" fill="none" stroke={dark} strokeWidth={6} strokeDasharray="4 14" strokeLinecap="round" />
      <path d="M 205 75 L 295 108 L 215 152 Z" fill={body} />
      <circle cx={240} cy={102} r={18} fill={dark} />
      <circle cx={240 + eye} cy={102} r={6} fill="#111" />
    </g>
  );
};

export const Nature: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const lemur = useEnter(40, 12);
  const chameleon = useEnter(300, 14);
  const leaves: { x: number; y: number; size: number; angle: number }[] = [
    { x: 1950, y: 40, size: 2.2, angle: 160 },
    { x: 1900, y: 220, size: 1.6, angle: 200 },
    { x: 1500, y: -40, size: 1.8, angle: 110 },
    { x: 1150, y: -30, size: 1.4, angle: 70 },
    { x: -40, y: 980, size: 2.4, angle: -30 },
    { x: 900, y: -40, size: 1.2, angle: 95 },
    { x: 1960, y: 900, size: 2, angle: 210 },
  ];

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="linear-gradient(180deg, #0A2B1A 0%, #15502E 55%, #20703C 100%)"
    >
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {leaves.map((l, i) => (
          <Leaf key={i} {...l} i={i} color={i % 2 ? "#2E8B4A" : "#1E6B37"} />
        ))}
        <path d="M 1920 640 C 1700 610, 1450 650, 1180 700" fill="none" stroke="#4A2E1C" strokeWidth={46} strokeLinecap="round" />
        <path d="M 1920 830 C 1700 820, 1400 845, 1050 870" fill="none" stroke="#4A2E1C" strokeWidth={30} strokeLinecap="round" />
        <g transform={`translate(1360 ${220 + (1 - lemur) * 500}) scale(${0.95 * lemur})`}>
          <Lemur />
        </g>
        <g
          transform={`translate(${1110 + (1 - chameleon) * 300} 690) scale(0.9)`}
          opacity={chameleon}
        >
          <Chameleon />
        </g>
        {leaves.slice(0, 2).map((l, i) => (
          <Leaf key={`f${i}`} x={l.x - 120} y={l.y + 380} size={1.3} angle={l.angle + 20} i={i + 10} color="#2E8B4A" />
        ))}
      </svg>
      <Particles color="rgba(220,255,180,0.5)" count={30} seed={3} />
      <div style={{ position: "absolute", left: 120, top: 110, transform: `translateY(${interpolate(frame, [0, durationInFrames], [0, -10])}px)` }}>
        <Kicker text="Biodiversité" delay={10} color="#BFE8A1" />
        <AnimatedTitle text="Une nature unique au monde" delay={18} size={88} style={{ maxWidth: 900 }} />
        <div style={{ marginTop: 34 }}>
          <FactCard value={90} suffix=" %" label="d'espèces endémiques" delay={105} accent="#BFE8A1" />
          <FactCard value="100+" label="espèces de lémuriens" delay={250} accent="#BFE8A1" />
          <FactCard value="La moitié" label="des espèces de caméléons du monde" delay={310} accent="#BFE8A1" />
        </div>
      </div>
    </SceneFrame>
  );
};
