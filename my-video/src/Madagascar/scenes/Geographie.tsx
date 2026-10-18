import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { MadagascarMap } from "../MadagascarMap";
import { BODY_FONT } from "../theme";
import { AnimatedTitle, FactCard, Kicker, SceneFrame, useEnter } from "../ui";
import type { SceneProps } from "./types";

const Waves: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {new Array(14).fill(0).map((_, row) => {
        const y = 60 + row * 75;
        let d = `M -20 ${y}`;
        for (let x = -20; x <= 1940; x += 40) {
          d += ` L ${x} ${(y + Math.sin(x / 120 + frame / 25 + row) * 8).toFixed(1)}`;
        }
        return <path key={row} d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={2} />;
      })}
    </svg>
  );
};

const Label: React.FC<{ text: string; x: number; y: number; delay: number; rotate?: number }> = ({
  text,
  x,
  y,
  delay,
  rotate = 0,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        fontFamily: BODY_FONT,
        fontWeight: 600,
        fontSize: 24,
        letterSpacing: 6,
        textTransform: "uppercase",
        color: "rgba(255,255,255,0.7)",
        opacity: p,
        transform: `rotate(${rotate}deg)`,
        transformOrigin: "left top",
      }}
    >
      {text}
    </div>
  );
};

export const Geographie: React.FC<SceneProps> = ({ durationInFrames }) => {
  const frame = useCurrentFrame();
  const africa = useEnter(10, 20);
  const drift = interpolate(frame, [0, durationInFrames], [0, -25]);

  return (
    <SceneFrame
      durationInFrames={durationInFrames}
      background="linear-gradient(160deg, #082A45 0%, #0F5477 60%, #1C7E99 100%)"
    >
      <Waves />
      {/* Côte africaine */}
      <svg
        width={260}
        height={1080}
        style={{ position: "absolute", left: 0, top: 0, transform: `translateX(${(1 - africa) * -260}px)` }}
      >
        <path
          d="M 0 0 L 150 0 C 190 140, 120 260, 170 380 C 220 500, 140 600, 190 720 C 230 820, 160 940, 200 1080 L 0 1080 Z"
          fill="#C9A26B"
          stroke="#E8CF9E"
          strokeWidth={4}
        />
      </svg>
      <Label text="Afrique" x={60} y={700} delay={30} rotate={-90} />
      <Label text="Canal du Mozambique" x={262} y={840} delay={45} rotate={-90} />
      <div style={{ position: "absolute", left: 360, top: 70, transform: `translateY(${drift}px)` }}>
        <MadagascarMap
          height={880}
          drawStart={15}
          drawDuration={70}
          fill="rgba(201,80,46,0.85)"
          pins={[
            { lon: 47.52, lat: -18.91, label: "Antananarivo", delay: 90 },
            { lon: 48.26, lat: -13.32, label: "Nosy Be", delay: 115, side: "left", color: "#1FB6C9" },
            { lon: 44.27, lat: -20.3, label: "Morondava", delay: 135, color: "#F7B44A" },
          ]}
        />
      </div>
      <Label text="Océan Indien" x={820} y={560} delay={60} />
      <div style={{ position: "absolute", left: 1150, top: 120 }}>
        <Kicker text="Géographie" delay={10} />
        <AnimatedTitle text="Une île-continent" delay={18} size={80} style={{ whiteSpace: "nowrap" }} />
        <div style={{ marginTop: 40 }}>
          <FactCard value={4} suffix="e" label="plus grande île du monde" delay={110} width={620} />
          <FactCard value={587041} suffix=" km²" label="plus vaste que la France" delay={200} width={620} />
          <FactCard value={5000} suffix=" km" label="de côtes à explorer" delay={340} width={620} />
        </div>
      </div>
    </SceneFrame>
  );
};
