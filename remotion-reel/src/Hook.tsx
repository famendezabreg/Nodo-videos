import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import wm from "./wordmark.json";
import { COLORS, H, T, W, bf } from "./config";
import { cubicIO, expoOut, lerp, prog } from "./util";

type Glyph = { d: string; adv: number; bounds: number[]; contours: number[][] };
const G = wm.glyphs as unknown as Record<string, Glyph>;
const L = wm.layout; // geometria exacta del logo oficial (NODO / filete / 624) medida en el PNG

// El gancho reproduce el logo OFICIAL: NODO a 920 px de ancho, filete corto y 624 pequeno debajo, centrado.
const nodoX0 = L.letters[0].box[0], nodoX1 = L.letters[3].box[2], nodoY0 = Math.min(...L.letters.map((l) => l.box[1]));
const K = 920 / (nodoX1 - nodoX0);                    // px de pantalla por px del logo
const logoBottom = Math.max(...L.digits.map((d) => d.box[3]));
const OX = W / 2 - ((nodoX0 + nodoX1) / 2) * K;       // origen del logo en pantalla (centrado)
const OY = H / 2 - ((nodoY0 + logoBottom) / 2) * K;
const sx = (x: number) => OX + x * K, sy = (y: number) => OY + y * K;

/** transform que lleva la caja de tinta del glifo a la caja objetivo del logo */
const place = (ch: string, box: number[]) => {
  const g = G[ch], [bx0, by0, bx1, by1] = g.bounds; // by0/by1 en y hacia arriba
  const w = (box[2] - box[0]) * K, h = (box[3] - box[1]) * K;
  const kx = w / (bx1 - bx0), ky = h / (by1 - by0);
  return { tx: sx(box[0]) - bx0 * kx, ty: sy(box[1]) + by1 * ky, kx, ky };
};

type Item = { id: string; ch: string; at: number; digit: boolean; p: ReturnType<typeof place> };
const ITEMS: Item[] = [
  ...L.letters.map((l) => ({ id: l.id, ch: l.ch, at: (T.hook.letters as Record<string, number>)[l.id], digit: false, p: place(l.ch, l.box) })),
  ...L.digits.map((d, i) => ({ id: d.id, ch: d.ch, at: T.hook.digits + 0.15 * i, digit: true, p: place(d.ch, d.box) })),
];

// contador (hueco) y silueta de la ultima "O" del rotulo
const o2 = ITEMS.find((i) => i.id === "O2")!;
const og = G.O;
const outerIdx = og.contours[0][2] - og.contours[0][0] > og.contours[1][2] - og.contours[1][0] ? 0 : 1;
const inner = og.contours[1 - outerIdx];
const counterC = { x: o2.p.tx + ((inner[0] + inner[2]) / 2) * o2.p.kx, y: o2.p.ty - ((inner[1] + inner[3]) / 2) * o2.p.ky };
const subpaths = og.d.split("Z").filter((s) => s.trim()).map((s) => s + "Z");
const oDisc = subpaths[outerIdx];
const tf = (p: Item["p"], dy = 0) => `translate(0 ${dy}) translate(${p.tx} ${p.ty}) scale(${p.kx} ${p.ky})`;

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const fillF = bf(T.hook.fillAt), zA = bf(T.hook.zoom[0]), zB = bf(T.hook.zoom[1]);
  const hFill = prog(frame, fillF, bf(0.3));
  const zp = prog(frame, zA, zB - zA, (t) => t * t);
  const S = Math.exp(Math.log(40) * zp);
  const tz = Math.pow(zp, 0.6); // la "O" viaja al centro mientras la camara entra en ella
  const open = prog(frame, zA - 2, 5); // el contador de la O se abre como portal
  const fade = 1 - prog(frame, zA, bf(0.4));
  const mid = `hm-${frame}`; // id unico por muestra de motion blur
  const rule = L.rule;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x={-40000} y={-40000} width={80000} height={80000}>
          <rect x={-40000} y={-40000} width={80000} height={80000} fill="white" />
          {ITEMS.map((l) => {
            const e = expoOut(prog(frame, bf(l.at), 10));
            const h = l.digit ? e : hFill * e;
            return <path key={l.id} d={G[l.ch].d} fill="black" fillRule="evenodd" opacity={h} transform={tf(l.p, l.digit ? 0 : (1 - e) * 60)} />;
          })}
          <path d={oDisc} fill="black" opacity={open} transform={tf(o2.p)} />
        </mask>
      </defs>
      <g transform={`translate(${lerp(counterC.x, W / 2, tz)} ${lerp(counterC.y, H / 2, tz)}) scale(${S}) translate(${-counterC.x} ${-counterC.y})`}>
        <rect x={-40000} y={-40000} width={80000} height={80000} fill={COLORS.bg} mask={`url(#${mid})`} />
        {ITEMS.filter((l) => !l.digit).map((l) => {
          const e = expoOut(prog(frame, bf(l.at), 10));
          return <path key={l.id} d={G[l.ch].d} fill={COLORS.text} fillRule="evenodd" opacity={e * (1 - hFill)} transform={tf(l.p, (1 - e) * 60)} />;
        })}
        {ITEMS.map((l) => {
          const e = expoOut(prog(frame, bf(l.at), 10));
          return <path key={`s${l.id}`} d={G[l.ch].d} fill="none" stroke={COLORS.text} strokeWidth={l.digit ? 1.6 : 2} vectorEffect="non-scaling-stroke"
            strokeOpacity={(l.digit ? 0.85 : 0.5 * hFill) * e * fade} transform={tf(l.p, l.digit ? 0 : (1 - e) * 60)} />;
        })}
        {/* filete del logo oficial */}
        <rect x={sx(rule[0])} y={sy(rule[1])} width={(rule[2] - rule[0]) * K} height={Math.max(2, (rule[3] - rule[1]) * K)} fill={COLORS.text}
          opacity={0.9 * expoOut(prog(frame, bf(T.hook.digits), 8)) * fade} />
      </g>
    </svg>
  );
};

/** GANCHO: el logo oficial NODO 624 entra letra por letra, se llena con la fachada y la camara atraviesa la "O". */
export const Hook: React.FC = () => (
  <AbsoluteFill>
    <CameraMotionBlur samples={24} shutterAngle={200}><Overlay /></CameraMotionBlur>
  </AbsoluteFill>
);
