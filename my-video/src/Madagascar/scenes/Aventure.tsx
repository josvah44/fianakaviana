import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { AnimatedTitle, FactCard, Kicker, SceneFrame } from "../ui";
import type { SceneProps } from "./types";

const rand = (i: number, seed: number) => {
  const x = Math.sin(i * 91.17 + seed * 13.7) * 10000;
  return x - Math.floor(x);
};

// Rangée d'aiguilles calcaires (tsingy), plus hautes vers la droite pour
// laisser le texte lisible à gauche.
const spikes = (seed: number, base: number, maxH: number, step: number) => {
  let d = `M -40 1100 L -40 ${base}`;
  for (let x = -40, i = 0; x < 2000; x += step, i++) {
    const h = maxH * (0.35 + 0.65 * (x / 1920)) * (0.55 + rand(i, seed) * 0.45);
    d += ` L ${x + step * 0.25} ${base - h * 0.4} L ${x + step * 0.5} ${base - h} L ${x + step * 0.75} ${base - h * 0.35}`;
  }
  return d + " L 2000 1100 Z";
};

const LAYERS = [
  { seed: 1, base: 760, maxH: 360, step: 70, color: "#7F93A3", delay: 0, drift: 15 },
  { seed: 2, base: 900, maxH: 420, step: 95, color: "#56697A", delay: 10, drift: 30 },
  { seed: 3, base: 1080, maxH: 480, step: 130, color: "#2E3B47", delay: 20, drift: 55 },
];

export const Aventure: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const mist = 0.25 + Math.sin(frame / 40) * 0.1;
  const walk = interpolate(frame, [60, durationInFrames - 20], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const bridge = { x1: 1180, y1: 640, x2: 1700, y2: 600 };
  const sag = 70;
  const hikerX = bridge.x1 + (bridge.x2 - bridge.x1) * walk;
  const hikerY =
    bridge.y1 + (bridge.y2 - bridge.y1) * walk + sag * 4 * walk * (1 - walk) - 8;
  const step = Math.sin(frame / 4) * 10;

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="linear-gradient(180deg, #1D2B3A 0%, #3E5468 45%, #9BB0BD 78%)"
    >
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {LAYERS.map((layer, i) => {
          const rise = spring({ frame: frame - layer.delay, fps, config: { damping: 16, mass: 1.3 } });
          const drift = interpolate(frame, [0, durationInFrames], [0, -layer.drift]);
          return (
            <g key={i} transform={`translate(${drift} ${(1 - rise) * 500})`}>
              <path d={spikes(layer.seed, layer.base, layer.maxH, layer.step)} fill={layer.color} />
              {i === 1
                ? new Array(9).fill(0).map((_, k) => (
                    <ellipse
                      key={k}
                      cx={200 + k * 200 + rand(k, 9) * 80}
                      cy={layer.base - 30 - rand(k, 4) * 40}
                      rx={50 + rand(k, 5) * 40}
                      ry={22}
                      fill="#3F7A4A"
                    />
                  ))
                : null}
            </g>
          );
        })}
        <rect x={0} y={560} width={1920} height={260} fill="white" opacity={mist} style={{ filter: "blur(40px)" }} />
        <g opacity={interpolate(frame, [40, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}>
          <path
            d={`M ${bridge.x1} ${bridge.y1} Q ${(bridge.x1 + bridge.x2) / 2} ${(bridge.y1 + bridge.y2) / 2 + sag * 2} ${bridge.x2} ${bridge.y2}`}
            fill="none"
            stroke="#C8A06A"
            strokeWidth={6}
          />
          <path
            d={`M ${bridge.x1} ${bridge.y1 - 40} Q ${(bridge.x1 + bridge.x2) / 2} ${(bridge.y1 + bridge.y2) / 2 + sag * 2 - 40} ${bridge.x2} ${bridge.y2 - 40}`}
            fill="none"
            stroke="#C8A06A"
            strokeWidth={3}
          />
          <rect x={bridge.x1 - 8} y={bridge.y1 - 50} width={10} height={60} fill="#6B4A2A" />
          <rect x={bridge.x2 - 2} y={bridge.y2 - 50} width={10} height={60} fill="#6B4A2A" />
          <g transform={`translate(${hikerX} ${hikerY})`} stroke="#14202A" strokeWidth={7} strokeLinecap="round" fill="none">
            <circle cx={0} cy={-62} r={11} fill="#14202A" stroke="none" />
            <path d="M 0 -50 L -2 -22" />
            <path d={`M -2 -22 L ${-8 + step} 0 M -2 -22 L ${6 - step} 0`} />
            <path d={`M 0 -44 L ${10 - step / 2} -30`} />
            <rect x={-18} y={-52} width={14} height={24} rx={4} fill="#E2683C" stroke="none" />
          </g>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 120, top: 110 }}>
        <Kicker text="Aventure" delay={10} color="#F7C873" />
        <AnimatedTitle text="Terre d'aventure" delay={18} size={96} />
        <div style={{ marginTop: 36 }}>
          <FactCard value="Rando & trek" label="dans les parcs nationaux" delay={95} accent="#F7C873" glass="rgba(20,32,44,0.55)" />
          <FactCard value="UNESCO" label="Tsingy de Bemaraha, depuis 1990" delay={185} accent="#F7C873" glass="rgba(20,32,44,0.55)" />
        </div>
      </div>
    </SceneFrame>
  );
};
