import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS, H, T, W, bf, scene } from "./config";
import { prog } from "./util";

/** Gradiente oscuro inferior (0 -> 0.86) para el texto y uno superior suave para el logo; solo en escenas 1-6. */
export const BottomGradient: React.FC = () => {
  const frame = useCurrentFrame();
  const a = bf(T.scenes.s1[0]), z = bf(T.scenes.s6[1]);
  const o = interpolate(frame, [a, a + 6, z - 6, z], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity: o, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1100,
        background: "linear-gradient(to top, rgba(27,24,21,0.86) 0%, rgba(27,24,21,0.66) 32%, rgba(27,24,21,0.22) 70%, rgba(27,24,21,0) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560,
        background: "linear-gradient(to bottom, rgba(27,24,21,0.55) 0%, rgba(27,24,21,0.22) 55%, rgba(27,24,21,0) 100%)" }} />
    </AbsoluteFill>
  );
};

/** Grado de color: negros calidos, highlights suaves, saturacion contenida, vineta ligera. */
export const GradeOverlays: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <AbsoluteFill style={{ background: "rgb(30,26,22)", mixBlendMode: "lighten" }} />
    <AbsoluteFill style={{ background: "rgb(252,247,240)", mixBlendMode: "multiply" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 58%, rgba(27,24,21,0.42) 100%)" }} />
  </AbsoluteFill>
);
export const GRADE_FILTER = "contrast(1.05) saturate(0.9)";

/** Light leak: gradiente calido, blend screen, nunca saturado. */
export const Leak: React.FC<{ at: number; dur: number }> = ({ at, dur }) => {
  const frame = useCurrentFrame();
  const t = prog(frame, bf(at), bf(dur));
  const o = Math.sin(Math.PI * t) ** 2 * 0.72;
  if (t <= 0 || t >= 1) return null;
  const x = -20 + 140 * t;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 70% 38% at ${x}% 18%, rgba(244,178,120,0.85) 0%, rgba(235,181,147,0.35) 42%, rgba(235,181,147,0) 72%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(115deg, rgba(235,181,147,0) ${x - 30}%, rgba(247,214,176,0.45) ${x}%, rgba(235,181,147,0) ${x + 30}%)` }} />
    </AbsoluteFill>
  );
};

/** Grano de pelicula: feTurbulence animada (semilla = frame), 5 %. Se genera a media resolucion para un grano mas organico y barato. */
export const Grain: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W / 2} ${H / 2}`} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.055, pointerEvents: "none" }}>
      <filter id={`gr-${frame}`} x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed={frame} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 0 1" />
      </filter>
      <rect width={W / 2} height={H / 2} filter={`url(#gr-${frame})`} />
    </svg>
  );
};

/** Capa fija: logo, NODO624.COM e "Imagenes con fines ilustrativos." (escenas 1-6). */
export const FixedLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const a = bf(T.scenes.s1[0]), z = bf(T.scenes.s6[1]);
  const o = interpolate(frame, [a, a + 6, z - 6, z], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Img src={staticFile("layers/fixed.png")} style={{ position: "absolute", inset: 0, width: W, height: H, opacity: o }} />;
};

/** Capa de texto de HyperFrames (secuencia PNG RGBA, 30 fps). */
export const TextLayer: React.FC<{ name: string; frames: number }> = ({ name, frames }) => {
  const frame = Math.min(useCurrentFrame(), frames - 1) + 1;
  return <Img src={staticFile(`layers/${name}/frame_${String(frame).padStart(6, "0")}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H }} />;
};
export { COLORS, scene };
