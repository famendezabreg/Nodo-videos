import React from "react";
import { AbsoluteFill, Audio, Sequence, interpolate, staticFile } from "remotion";
import { Hook } from "./Hook";
import { EndBg, HookPhoto, S1Photo, S2, S3, S4, S5, S6 } from "./Scenes";
import { BottomGradient, FixedLayer, GRADE_FILTER, GradeOverlays, Grain, Leak, TextLayer } from "./Finish";
import { COLORS, FPS, T, TOTAL_FRAMES, bf, scene } from "./config";

export type ReelProps = { music: string | null; sfx: { file: string; at: number; volume?: number }[] };

const SceneSeq: React.FC<{ id: keyof typeof T.scenes; children: React.ReactNode }> = ({ id, children }) => {
  const s = scene(id);
  return <Sequence from={s.from} durationInFrames={s.frames} layout="none">{children}</Sequence>;
};

export const Reel: React.FC<ReelProps> = ({ music, sfx }) => {
  const s1 = scene("s1"), end = scene("end");
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* ---- imagen (con grado de color) ---- */}
      <AbsoluteFill style={{ filter: GRADE_FILTER }}>
        {/* plano 2.5D de la fachada: bajo el gancho retrocede y entrega el encuadre a la escena 1 */}
        <Sequence from={0} durationInFrames={s1.from} layout="none"><HookPhoto /></Sequence>
        <SceneSeq id="s1"><S1Photo /></SceneSeq>
        <Sequence from={0} durationInFrames={bf(T.scenes.hook[1])} layout="none"><Hook /></Sequence>
        <SceneSeq id="s2"><S2 /></SceneSeq>
        <SceneSeq id="s3"><S3 /></SceneSeq>
        <SceneSeq id="s4"><S4 /></SceneSeq>
        <SceneSeq id="s5"><S5 /></SceneSeq>
        <SceneSeq id="s6"><S6 /></SceneSeq>
        <SceneSeq id="end"><EndBg /></SceneSeq>
      </AbsoluteFill>
      <BottomGradient />
      <GradeOverlays />
      {T.leaks.map((l) => <Leak key={l.at} at={l.at} dur={l.dur} />)}

      {/* ---- tipografia (HyperFrames + GSAP, PNG con alfa) ---- */}
      <FixedLayer />
      {(["s1", "s2", "s3", "s4", "s5", "s6", "end"] as const).map((id) => {
        const s = scene(id);
        return <Sequence key={id} from={s.from} durationInFrames={s.frames} layout="none"><TextLayer name={id} frames={s.frames} /></Sequence>;
      })}

      <Grain />

      {/* ---- sonido: solo si hay archivos en /assets ---- */}
      {music ? <Audio src={staticFile(`audio/${music}`)} volume={(f) => 0.9 * interpolate(f, [0, 9, TOTAL_FRAMES - FPS, TOTAL_FRAMES], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /> : null}
      {sfx.map((x, i) => <Sequence key={i} from={bf(x.at)} layout="none"><Audio src={staticFile(`sfx/${x.file}`)} volume={x.volume ?? 0.5} /></Sequence>)}
    </AbsoluteFill>
  );
};
