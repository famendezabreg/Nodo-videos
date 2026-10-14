import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { Crop, toScreen } from "./Crop";
import { Parallax, parallaxState } from "./Parallax";
import { COLORS, FPS, H, PhotoId, T, W, bf, scene } from "./config";
import { cubicIO, expoOut, lerp, prog, sineIO } from "./util";

const Dark: React.FC = () => <AbsoluteFill style={{ background: COLORS.bg }} />;
const MB: React.FC<{ children: React.ReactNode; samples?: number; angle?: number }> = ({ children, samples = 8, angle = 200 }) => (
  <CameraMotionBlur samples={samples} shutterAngle={angle}>{children}</CameraMotionBlur>
);
const Line: React.FC<{ x: number; opacity?: number }> = ({ x, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - 0.75, top: 0, width: 1.5, height: H, background: COLORS.accent, opacity }} />
);

/* ---------------- ESCENA 1: parallax hero (comparte plano con el gancho) ---------------- */
export const S1Photo: React.FC = () => {
  const c = T.s1.parallax;
  return <Parallax photoId="fachada" depthId="fachada" from={c.from} to={c.to} zoom={c.zoom as [number, number]} shift={c.shift} frames={scene("s1").frames} />;
};
/** Bajo el gancho: la fachada retrocede (zoom 1.55 -> 1.04) y termina exactamente en el encuadre inicial de la escena 1. */
export const HookPhoto: React.FC = () => {
  const c = T.hook.photo;
  return <Parallax photoId="fachada" depthId="fachada" from={c.from} to={c.to} zoom={c.zoom as [number, number]} shift={0} frames={bf(T.scenes.hook[1])} />;
};

/* ---------------- ESCENA 2: tres franjas editoriales -> expansion del panel central ---------------- */
const S2Panels: React.FC = () => {
  const frame = useCurrentFrame();
  const c = T.s2, order = c.strips as PhotoId[];
  const hero = c.hero;
  const hs = parallaxState({ photoId: hero.photo as PhotoId, from: hero.from, to: hero.to, zoom: hero.zoom as [number, number], shift: hero.shift }, 0);
  const expA = bf(c.expandAt), expD = bf(c.expandDur);
  const ex = prog(frame, expA, expD, expoOut);
  const slideY = (id: string) => {
    const s = (c.slide as Record<string, { dir: number; dur: number }>)[id];
    return (1 - expoOut(prog(frame, 0, bf(s.dur)))) * s.dir * H;
  };
  const cl = lerp(360, 0, ex), cr = lerp(360, 0, ex);
  return (
    <AbsoluteFill>
      <Dark />
      {/* izquierda y derecha */}
      {[0, 2].map((i) => {
        const id = order[i] as string;
        const f = (c.focus as Record<string, { x: number; y: number }>)[id];
        return (
          <div key={id} style={{ position: "absolute", inset: 0, transform: `translateY(${slideY(id)}px)`, clipPath: i === 0 ? "inset(0 720px 0 0)" : "inset(0 0 0 720px)" }}>
            <Crop photoId={id as PhotoId} fx={f.x} fy={f.y} zoom={1.08} />
          </div>
        );
      })}
      {/* panel central (interior_03): se expande a pantalla completa */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${slideY(order[1] as string)}px)`, clipPath: `inset(0 ${cr}px 0 ${cl}px)` }}>
        <Crop photoId={hero.photo as PhotoId} fx={hs.cx} fy={hs.cy} zoom={hs.zoom} />
      </div>
      {/* lineas finas acento entre franjas; siguen los bordes del panel central */}
      <Line x={cl} opacity={expoOut(prog(frame, bf(0.4), bf(0.5))) * (1 - prog(frame, expA + expD * 0.6, expD * 0.4))} />
      <Line x={W - cr} opacity={expoOut(prog(frame, bf(0.4), bf(0.5))) * (1 - prog(frame, expA + expD * 0.6, expD * 0.4))} />
    </AbsoluteFill>
  );
};
/** Parte 2D con motion blur hasta que termina la expansion; despues parallax 2.5D real del mismo encuadre. */
export const S2: React.FC = () => {
  const s = scene("s2");
  const cut = bf(T.s2.expandAt + T.s2.expandDur);
  const h = T.s2.hero;
  return (
    <>
      <Sequence from={0} durationInFrames={cut} layout="none"><MB samples={9} angle={220}><S2Panels /></MB></Sequence>
      <Sequence from={cut} durationInFrames={s.frames - cut} layout="none">
        <Parallax photoId="lounge" depthId="lounge" from={h.from} to={h.to} zoom={h.zoom as [number, number]} shift={h.shift} frames={s.frames - cut} />
      </Sequence>
    </>
  );
};

/* ---------------- ESCENA 3: vestibulo, mascara rectangular que sigue el marco de la puerta 3 ---------------- */
export const S3: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("s3"), c = T.s3;
  const p = sineIO(prog(frame, 0, s.frames));
  const fx = lerp(c.focus.from.x, c.focus.to.x, p), fy = 0.5, z = lerp(c.zoom[0], c.zoom[1], p);
  const a = toScreen("vestibulo", c.door.x0, c.door.y0, c.focus.from.x, fy, c.zoom[0]);
  const b = toScreen("vestibulo", c.door.x1, c.door.y1, c.focus.from.x, fy, c.zoom[0]);
  const e = expoOut(prog(frame, bf(c.openAt), bf(c.openDur)));
  const top = lerp(Math.max(0, a.y), 0, e), left = lerp(a.x, 0, e);
  const right = lerp(W - b.x, 0, e), bottom = lerp(Math.max(0, H - b.y), 0, e);
  return (
    <AbsoluteFill>
      <Dark />
      <MB samples={8} angle={200}>
        <AbsoluteFill style={{ clipPath: `inset(${top}px ${right}px ${bottom}px ${left}px)` }}>
          <Crop photoId="vestibulo" fx={fx} fy={fy} zoom={z} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: left - 1, top, width: 1.5, height: H - top - bottom, background: COLORS.accent, opacity: 1 - e }} />
        <div style={{ position: "absolute", left: W - right - 0.5, top, width: 1.5, height: H - top - bottom, background: COLORS.accent, opacity: 1 - e }} />
      </MB>
    </AbsoluteFill>
  );
};

/* ---------------- ESCENA 4: split horizontal -> la oficina toma toda la pantalla ---------------- */
export const S4: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("s4"), c = T.s4;
  const pAll = sineIO(prog(frame, 0, s.frames));
  const tf = c.topFocus, bfc = c.bottomFocus;
  const inTop = 1 - expoOut(prog(frame, 0, bf(c.slideDur)));      // arriba entra desde la izquierda
  const inBot = 1 - expoOut(prog(frame, 0, bf(c.slideDur * 1.2))); // abajo entra desde la derecha
  const ex = expoOut(prog(frame, bf(c.expandAt), bf(c.expandDur)));
  const reveal = lerp(H / 2, 0, ex); // borde superior del panel inferior
  return (
    <AbsoluteFill>
      <Dark />
      <MB samples={8} angle={200}>
        <AbsoluteFill style={{ clipPath: "inset(0 0 960px 0)", transform: `translateX(${-inTop * W}px)` }}>
          <Crop photoId="escalera" fx={lerp(tf.from.x, tf.to.x, pAll)} fy={lerp(tf.from.y, tf.to.y, pAll)} zoom={tf.zoom} />
        </AbsoluteFill>
        <AbsoluteFill style={{ clipPath: `inset(${reveal}px 0 0 0)`, transform: `translateX(${inBot * W}px)` }}>
          <Crop photoId="oficina" fx={lerp(bfc.from.x, bfc.to.x, pAll)} fy={0.5} zoom={lerp(bfc.zoom[0], bfc.zoom[1], pAll)} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, top: reveal - 0.75, width: W, height: 1.5, background: COLORS.accent, opacity: (1 - Math.min(1, inBot)) * (1 - prog(frame, bf(c.expandAt) + bf(c.expandDur) * 0.7, bf(c.expandDur) * 0.3)) }} />
      </MB>
    </AbsoluteFill>
  );
};

/* ---------------- ESCENA 5: sala de reuniones, mascara horizontal + push-in ---------------- */
export const S5: React.FC = () => {
  const frame = useCurrentFrame();
  const s = scene("s5"), c = T.s5;
  const p = sineIO(prog(frame, 0, s.frames));
  const e = expoOut(prog(frame, 0, bf(c.openDur)));
  const band = lerp(46, 0, e);
  return (
    <AbsoluteFill>
      <Dark />
      <MB samples={8} angle={200}>
        <AbsoluteFill style={{ clipPath: `inset(${band}% 0 ${band}% 0)` }}>
          <Crop photoId="sala" fx={lerp(c.focus.from.x, c.focus.to.x, p)} fy={0.5} zoom={lerp(c.zoom[0], c.zoom[1], p)} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 0, top: `${band}%`, width: W, height: 1.5, background: COLORS.accent, opacity: 1 - e }} />
        <div style={{ position: "absolute", left: 0, bottom: `${band}%`, width: W, height: 1.5, background: COLORS.accent, opacity: 1 - e }} />
      </MB>
    </AbsoluteFill>
  );
};

/* ---------------- ESCENA 6: rafaga al beat (zoom punch + whip pan) y luego pausa en el patio ---------------- */
const S6Burst: React.FC = () => {
  const frame = useCurrentFrame();
  const c = T.s6;
  const shots = [...c.burst.map((b) => ({ ...b })), { photo: c.patio.photo, at: c.patio.at, from: c.patio.from, to: c.patio.from }];
  const wd = bf(c.whip.dur), lead = bf(c.whip.lead);
  const punch = c.punch;
  const pz = (k: number) => {
    const t0 = bf(shots[k].at);
    const e = expoOut(prog(frame, t0, bf(c.punchDur)));
    const slow = prog(frame, t0, bf(1), sineIO) * 0.05;
    return lerp(punch[0], punch[1], e) + slow;
  };
  const patioP0 = parallaxState({ photoId: "patio", from: c.patio.from, to: c.patio.to, zoom: c.patio.zoom as [number, number], shift: c.patio.shift }, 0);
  return (
    <AbsoluteFill>
      <Dark />
      {shots.map((sh, k) => {
        const start = bf(sh.at) - (k === 0 ? 0 : lead);
        const end = k < shots.length - 1 ? bf(shots[k + 1].at) - lead + wd : bf(c.patio.at) + 99999;
        if (frame < start || frame > end) return null;
        // whip: entra desde la derecha mientras sale la anterior hacia la izquierda
        const inE = k === 0 ? 1 : cubicIO(prog(frame, start, wd));
        const outStart = k < shots.length - 1 ? bf(shots[k + 1].at) - lead : 1e9;
        const outE = cubicIO(prog(frame, outStart, wd));
        const x = (1 - inE) * W - outE * W;
        const isPatio = k === shots.length - 1;
        const fx = isPatio ? patioP0.cx : lerp(sh.from.x, sh.to.x, prog(frame, bf(sh.at), bf(1), sineIO));
        const fy = isPatio ? patioP0.cy : 0.5;
        const z = isPatio ? patioP0.zoom : pz(k);
        return (
          <AbsoluteFill key={k} style={{ transform: `translateX(${x}px)` }}>
            <Crop photoId={sh.photo as PhotoId} fx={fx} fy={fy} zoom={z} />
          </AbsoluteFill>
        );
      })}
    </AbsoluteFill>
  );
};
export const S6: React.FC = () => {
  const s = scene("s6"), c = T.s6;
  const cut = bf(c.patio.at) - bf(c.whip.lead) + bf(c.whip.dur); // fin de la whip: desde aqui parallax real
  return (
    <>
      <Sequence from={0} durationInFrames={cut} layout="none"><MB samples={9} angle={270}><S6Burst /></MB></Sequence>
      <Sequence from={cut} durationInFrames={s.frames - cut} layout="none">
        <Parallax photoId="patio" depthId="patio" from={c.patio.from} to={c.patio.to} zoom={c.patio.zoom as [number, number]} shift={c.patio.shift} frames={s.frames - cut} />
      </Sequence>
    </>
  );
};

/* ---------------- END CARD: fachada 2 desenfocada y oscurecida, parallax minimo ---------------- */
export const EndBg: React.FC = () => {
  const frame = useCurrentFrame();
  const c = T.end.parallax;
  const a = prog(frame, 0, 6, cubicIO); // entrada rapida (disolvencia de 0.2 s sobre el patio)
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <Dark />
      <AbsoluteFill style={{ filter: "blur(12px) brightness(0.74) saturate(0.92)", transform: "scale(1.04)" }}>
        <Parallax photoId="fachada2" depthId="fachada2" from={c.from} to={c.to} zoom={c.zoom as [number, number]} shift={c.shift} frames={scene("end").frames} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "rgba(27,24,21,0.26)" }} />
    </AbsoluteFill>
  );
};
