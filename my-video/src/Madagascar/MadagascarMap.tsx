import { evolvePath } from "@remotion/paths";
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BODY_FONT, colors } from "./theme";

// Contour simplifié de l'île (longitude, latitude), dans le sens horaire
// depuis le cap d'Ambre.
const COAST: [number, number][] = [
  [49.27, -11.95], [49.6, -12.6], [49.95, -13.3], [50.17, -14.27],
  [50.28, -14.9], [50.48, -15.35], [50.2, -15.9], [49.75, -15.45],
  [49.62, -15.95], [49.85, -16.6], [49.7, -17.3], [49.4, -18.15],
  [49.05, -19.2], [48.75, -20.2], [48.35, -21.2], [48.05, -22.15],
  [47.83, -22.8], [47.55, -23.6], [47.2, -24.5], [47.0, -25.03],
  [46.3, -25.2], [45.15, -25.6], [44.3, -25.2], [43.85, -24.4],
  [43.67, -23.35], [43.6, -22.4], [43.9, -21.4], [44.27, -20.3],
  [44.45, -19.5], [44.2, -18.7], [44.0, -18.06], [44.1, -17.2],
  [44.45, -16.2], [45.3, -15.95], [46.3, -15.7], [47.1, -15.0],
  [47.6, -14.4], [47.9, -13.6], [48.3, -13.4], [48.75, -12.5],
];

const LON0 = 42.9;
const LAT0 = -11.6;
const SPAN = 14.4;

export const project = (lon: number, lat: number, height: number) => {
  const k = height / SPAN;
  return [(lon - LON0) * 0.95 * k, (-lat + LAT0) * k] as const;
};

export const mapWidth = (height: number) => (7.9 * 0.95 * height) / SPAN;

const smoothClosedPath = (pts: (readonly [number, number])[]) => {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + " Z";
};

export type Pin = {
  lon: number;
  lat: number;
  label: string;
  delay: number;
  side?: "left" | "right";
  color?: string;
};

export const MadagascarMap: React.FC<{
  height: number;
  drawStart?: number;
  drawDuration?: number;
  stroke?: string;
  fill?: string;
  pins?: Pin[];
}> = ({
  height,
  drawStart = 0,
  drawDuration = 60,
  stroke = colors.cream,
  fill = "rgba(255,246,229,0.18)",
  pins = [],
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const width = mapWidth(height);
  const path = smoothClosedPath(COAST.map(([lon, lat]) => project(lon, lat, height)));
  const progress = interpolate(frame, [drawStart, drawStart + drawDuration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fillOpacity = interpolate(
    frame,
    [drawStart + drawDuration * 0.7, drawStart + drawDuration + 15],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  const evolved = evolvePath(progress, path);

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <path d={path} fill={fill} opacity={fillOpacity} />
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={height / 160}
        strokeLinejoin="round"
        strokeLinecap="round"
        strokeDasharray={evolved.strokeDasharray}
        strokeDashoffset={evolved.strokeDashoffset}
      />
      {pins.map((pin) => {
        const [x, y] = project(pin.lon, pin.lat, height);
        const p = spring({ frame: frame - pin.delay, fps, config: { damping: 10 } });
        const pulse = ((frame - pin.delay) % 45) / 45;
        const color = pin.color ?? colors.flagRed;
        const right = pin.side !== "left";
        return (
          <g key={pin.label} transform={`translate(${x} ${y})`} opacity={Math.min(1, p)}>
            {frame > pin.delay ? (
              <circle r={10 + pulse * 26} fill="none" stroke={color} strokeWidth={3} opacity={1 - pulse} />
            ) : null}
            <circle r={10 * p} fill={color} stroke="white" strokeWidth={3} />
            <text
              x={right ? 22 : -22}
              y={9}
              textAnchor={right ? "start" : "end"}
              fontFamily={BODY_FONT}
              fontWeight={800}
              fontSize={26}
              fill="white"
              stroke="rgba(0,0,0,0.55)"
              strokeWidth={5}
              paintOrder="stroke"
              style={{ transform: `translateX(${(1 - p) * (right ? -20 : 20)}px)` }}
            >
              {pin.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
