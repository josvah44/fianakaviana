import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { BODY_FONT, TITLE_FONT, colors } from "./theme";

const FADE = 12;

// Fondu d'entrée et de sortie commun à toutes les scènes.
export const SceneFrame: React.FC<{
  durationInFrames: number;
  background: string;
  children: React.ReactNode;
}> = ({ durationInFrames, background, children }) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, FADE, durationInFrames - FADE, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return (
    <AbsoluteFill style={{ background, opacity, overflow: "hidden" }}>
      {children}
    </AbsoluteFill>
  );
};

export const useEnter = (delay = 0, damping = 14) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping } });
};

// Titre dont les mots apparaissent un par un.
export const AnimatedTitle: React.FC<{
  text: string;
  delay?: number;
  size?: number;
  color?: string;
  stagger?: number;
  style?: React.CSSProperties;
}> = ({ text, delay = 0, size = 96, color = colors.cream, stagger = 5, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        fontFamily: TITLE_FONT,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.05,
        color,
        textShadow: "0 6px 30px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {text.split(" ").map((word, i) => {
        const p = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 13 },
        });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginRight: size * 0.25,
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.6}px) rotate(${(1 - p) * 6}deg)`,
              filter: `blur(${(1 - p) * 8}px)`,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};

export const Kicker: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = colors.sand,
}) => {
  const p = useEnter(delay);
  return (
    <div
      style={{
        fontFamily: BODY_FONT,
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: 8,
        textTransform: "uppercase",
        color,
        opacity: p,
        display: "flex",
        alignItems: "center",
        gap: 18,
        marginBottom: 18,
      }}
    >
      <span
        style={{
          display: "inline-block",
          height: 4,
          width: 70 * p,
          background: color,
          borderRadius: 2,
        }}
      />
      {text}
    </div>
  );
};

export const formatNumber = (n: number) =>
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

// Carte « chiffre clé » qui glisse depuis la gauche ; la valeur numérique
// défile de 0 jusqu'à sa cible.
export const FactCard: React.FC<{
  value: string | number;
  suffix?: string;
  label: string;
  delay: number;
  accent?: string;
  width?: number;
  glass?: string;
}> = ({
  value,
  suffix = "",
  label,
  delay,
  accent = colors.sand,
  width = 640,
  glass = "rgba(255,255,255,0.12)",
}) => {
  const frame = useCurrentFrame();
  const p = useEnter(delay, 15);
  const shown =
    typeof value === "number"
      ? formatNumber(
          interpolate(frame, [delay, delay + 40], [0, value], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.out(Easing.cubic),
          }),
        )
      : value;
  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        gap: 28,
        padding: "22px 30px",
        marginBottom: 22,
        borderRadius: 22,
        background: glass,
        border: "1px solid rgba(255,255,255,0.25)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.25)",
        backdropFilter: "blur(6px)",
        opacity: p,
        transform: `translateX(${(1 - p) * -120}px)`,
      }}
    >
      <div
        style={{
          width: 8,
          alignSelf: "stretch",
          borderRadius: 4,
          background: accent,
        }}
      />
      <div>
        <div
          style={{
            fontFamily: TITLE_FONT,
            fontWeight: 900,
            fontSize: 58,
            color: accent,
            lineHeight: 1.05,
            fontVariantNumeric: "lining-nums",
          }}
        >
          {shown}
          <span style={{ fontSize: "0.6em" }}>{suffix}</span>
        </div>
        <div
          style={{
            fontFamily: BODY_FONT,
            fontWeight: 600,
            fontSize: 28,
            color: colors.cream,
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
};

// Sous-titres synchronisés sur la voix : chaque phrase reçoit une part du
// temps proportionnelle à sa longueur, et les mots s'allument au fil de la
// lecture.
export const Subtitles: React.FC<{
  text: string;
  voiceDelay: number;
  voiceSeconds: number;
}> = ({ text, voiceDelay, voiceSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame - voiceDelay) / fps;
  if (t < 0) return null;

  const sentences = text.split(/(?<=[.!?])\s+/);
  const total = sentences.reduce((sum, s) => sum + s.length, 0);
  let index = 0;
  let sentenceStart = 0;
  for (; index < sentences.length - 1; index++) {
    const dur = (sentences[index].length / total) * voiceSeconds;
    if (t < sentenceStart + dur) break;
    sentenceStart += dur;
  }
  const sentence = sentences[index];
  const sentenceDur = (sentence.length / total) * voiceSeconds;
  const local = (t - sentenceStart) / sentenceDur;
  const appear = interpolate(t - sentenceStart, [0, 0.25], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const words = sentence.split(" ");
  let chars = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 56,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          padding: "18px 36px",
          borderRadius: 18,
          background: "rgba(10,10,10,0.55)",
          fontFamily: BODY_FONT,
          fontWeight: 600,
          fontSize: 38,
          lineHeight: 1.35,
          textAlign: "center",
          opacity: appear,
          transform: `translateY(${(1 - appear) * 20}px)`,
        }}
      >
        {words.map((w, i) => {
          const at = chars / sentence.length;
          chars += w.length + 1;
          const lit = local >= at;
          return (
            <span
              key={i}
              style={{
                color: lit ? "#FFFFFF" : "rgba(255,255,255,0.45)",
                textShadow: lit ? "0 0 18px rgba(255,220,150,0.45)" : "none",
              }}
            >
              {w}{" "}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// Particules flottantes (poussière, pollen, embruns…).
export const Particles: React.FC<{
  count?: number;
  color?: string;
  seed?: number;
}> = ({ count = 40, color = "rgba(255,255,255,0.5)", seed = 1 }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const rand = (i: number) => {
    const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {new Array(count).fill(0).map((_, i) => {
        const size = 3 + rand(i) * 7;
        const speed = 0.3 + rand(i + 100) * 0.8;
        const x = rand(i + 200) * width + Math.sin(frame / 40 + i) * 30;
        const y = (rand(i + 300) * height - frame * speed + height * 2) % height;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: color,
              opacity: 0.3 + rand(i + 400) * 0.6,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
