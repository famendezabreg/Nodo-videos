import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, staticFile, useCurrentFrame, Audio } from "remotion";
import { AUDIO, CHAPTERS, COLORS, DISSOLVE_S, ENDCARD, FIXED, FPS, H, INTRO, SHOTS, Shot, TOTAL_S, W } from "./timeline";

export type ReelProps = { audioFile: string | null };

const f = (s: number) => Math.round(s * FPS);
const easeIO = Easing.inOut(Easing.cubic);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Foto a pantalla completa (cover) con Ken Burns: zoom 1.04->1.12 y pan lento hacia otro foco. */
const KenBurns: React.FC<{
  file: string; w: number; h: number; dur: number;
  from: { x: number; y: number }; to: { x: number; y: number }; zoom?: [number, number];
  extra?: React.CSSProperties;
}> = ({ file, w, h, dur, from, to, zoom = [1.04, 1.12], extra }) => {
  const frame = useCurrentFrame();
  const p = easeIO(clamp(frame / Math.max(1, f(dur)), 0, 1));
  const s = zoom[0] + (zoom[1] - zoom[0]) * p;
  const base = Math.max(W / w, H / h);
  const bw = w * base, bh = h * base;
  // el foco nunca deja ver fuera de la imagen
  const hx = W / 2 / (s * bw), hy = H / 2 / (s * bh);
  const fx = clamp(from.x + (to.x - from.x) * p, hx, 1 - hx);
  const fy = clamp(from.y + (to.y - from.y) * p, hy, 1 - hy);
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`photos/${file}`)}
        style={{
          position: "absolute", width: bw, height: bh,
          left: W / 2 - fx * bw, top: H / 2 - fy * bh,
          transformOrigin: `${fx * bw}px ${fy * bh}px`, transform: `scale(${s})`, ...extra,
        }}
      />
    </AbsoluteFill>
  );
};

const ShotView: React.FC<{ shot: Shot; first: boolean }> = ({ shot, first }) => {
  const frame = useCurrentFrame();
  const dur = shot.end - shot.start;
  const opacity = interpolate(frame, [0, f(DISSOLVE_S)], [0, 1], { easing: easeIO, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ opacity }}>
      <KenBurns file={shot.file} w={shot.w} h={shot.h} dur={dur} from={shot.from} to={shot.to} zoom={shot.zoom} />
    </AbsoluteFill>
  );
};

/** Gradiente oscuro inferior (0 -> 0.9), leve gradiente superior para el logo y vineta suave. */
const Grade: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1000,
      background: `linear-gradient(to top, rgba(27,24,21,0.9) 0%, rgba(27,24,21,0.7) 38%, rgba(27,24,21,0) 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 520,
      background: `linear-gradient(to bottom, rgba(27,24,21,0.5) 0%, rgba(27,24,21,0) 100%)` }} />
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(27,24,21,0.38) 100%)" }} />
  </AbsoluteFill>
);

/** Capa de HyperFrames: secuencia PNG RGBA (30 fps), un fotograma por frame del reel. */
const Layer: React.FC<{ file: string; frames: number }> = ({ file, frames }) => {
  const frame = Math.min(useCurrentFrame(), frames - 1) + 1;
  return <Img src={staticFile(`layers/${file}/frame_${String(frame).padStart(6, "0")}.png`)} style={{ position: "absolute", inset: 0, width: W, height: H }} />;
};

const FixedLayer: React.FC = () => {
  const frame = useCurrentFrame();
  const a = f(FIXED.start), b = f(FIXED.end), d = f(FIXED.fade);
  const opacity = interpolate(frame, [a, a + d, b - d, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Img src={staticFile(`layers/${FIXED.file}`)} style={{ position: "absolute", inset: 0, width: W, height: H, opacity }} />;
};

export const Reel: React.FC<ReelProps> = ({ audioFile }) => {
  const frame = useCurrentFrame();
  const end = ENDCARD;
  const endOpacity = interpolate(frame, [f(end.start), f(end.start + DISSOLVE_S)], [0, 1], { easing: easeIO, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const total = f(TOTAL_S);
  const vol = (fr: number) =>
    AUDIO.volume * interpolate(fr, [0, f(AUDIO.fadeIn), total - f(AUDIO.fadeOut), total], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {SHOTS.map((s, i) => (
        <Sequence key={s.id} from={f(s.start)} durationInFrames={f(s.end - s.start)} layout="none">
          <ShotView shot={s} first={i === 0} />
        </Sequence>
      ))}

      <Grade />

      {/* End card: fachada desenfocada y oscurecida, entra en dissolve sobre el patio */}
      <Sequence from={f(end.start)} durationInFrames={total - f(end.start)} layout="none">
        <AbsoluteFill style={{ opacity: endOpacity }}>
          <AbsoluteFill style={{ backgroundColor: COLORS.bg }} />
          <KenBurns file={end.bg.file} w={end.bg.w} h={end.bg.h} dur={end.dur} from={{ x: 0.62, y: 0.5 }} to={{ x: 0.55, y: 0.5 }} zoom={[1.1, 1.18]}
            extra={{ filter: "blur(16px) brightness(0.62) saturate(0.9)" }} />
          <AbsoluteFill style={{ background: "rgba(27,24,21,0.30)" }} />
        </AbsoluteFill>
      </Sequence>

      {/* Intro sobre fondo solido; la primera foto entra en dissolve 1.5-1.9 s */}
      <Sequence from={0} durationInFrames={f(INTRO.solidUntil)} layout="none">
        <AbsoluteFill style={{ backgroundColor: COLORS.bg, opacity: interpolate(useCurrentFrame(), [f(1.5), f(INTRO.solidUntil)], [1, 0], { easing: easeIO, extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      </Sequence>

      <FixedLayer />

      <Sequence from={f(INTRO.start)} durationInFrames={f(INTRO.dur)} layout="none"><Layer file={INTRO.file} frames={f(INTRO.dur)} /></Sequence>
      {CHAPTERS.map((c) => (
        <Sequence key={c.file} from={f(c.start)} durationInFrames={f(c.dur)} layout="none"><Layer file={c.file} frames={f(c.dur)} /></Sequence>
      ))}
      <Sequence from={f(ENDCARD.start)} durationInFrames={total - f(ENDCARD.start)} layout="none"><Layer file={ENDCARD.file} frames={f(ENDCARD.dur)} /></Sequence>

      {audioFile ? <Audio src={staticFile(`audio/${audioFile}`)} volume={vol} /> : null}
    </AbsoluteFill>
  );
};
