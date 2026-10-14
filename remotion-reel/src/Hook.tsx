import React from "react";
import { CameraMotionBlur } from "@remotion/motion-blur";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import wm from "./wordmark.json";
import { COLORS, H, T, W, bf } from "./config";
import { cubicIO, expoOut, lerp, prog } from "./util";

type G = { d: string; adv: number; bounds: number[]; contours: number[][] };
const G = wm.glyphs as unknown as Record<string, G>;

const F = 304;               // cuerpo del titular (px): NODO ocupa ~908 px de ancho
const SC = F / wm.upm;
const BASE1 = 880, BASE2 = 1190; // lineas base de NODO y 624
const advN = G.N.adv + G.O.adv + G.D.adv;
const inkL = G.N.bounds[0], inkR = advN + G.O.bounds[2];
const X0 = (W - (inkR - inkL) * SC) / 2 - inkL * SC;
// 624 repartido en el mismo ancho de tinta que NODO
const g624 = (inkR - inkL - (G["6"].bounds[2] - G["6"].bounds[0]) - (G["2"].bounds[2] - G["2"].bounds[0]) - (G["4"].bounds[2] - G["4"].bounds[0])) / 2;
const x2 = G["6"].bounds[2] + g624 - G["2"].bounds[0];
const x4 = x2 + G["2"].bounds[2] + g624 - G["4"].bounds[0];

const LETTERS = [
  { id: "N", ch: "N", x: 0, base: BASE1, at: T.hook.letters.N },
  { id: "O1", ch: "O", x: G.N.adv, base: BASE1, at: T.hook.letters.O1 },
  { id: "D", ch: "D", x: G.N.adv + G.O.adv, base: BASE1, at: T.hook.letters.D },
  { id: "O2", ch: "O", x: advN, base: BASE1, at: T.hook.letters.O2 },
  { id: "6", ch: "6", x: 0, base: BASE2, at: T.hook.digits },
  { id: "2", ch: "2", x: x2, base: BASE2, at: T.hook.digits + 0.15 },
  { id: "4", ch: "4", x: x4, base: BASE2, at: T.hook.digits + 0.3 },
];

// contador (hueco) y silueta de la ultima "O"
const o = G.O;
const outerIdx = (o.contours[0][2] - o.contours[0][0]) > (o.contours[1][2] - o.contours[1][0]) ? 0 : 1;
const inner = o.contours[1 - outerIdx];
const counterC = { x: X0 + (advN + (inner[0] + inner[2]) / 2) * SC, y: BASE1 - ((inner[1] + inner[3]) / 2) * SC };
const subpaths = o.d.split("Z").filter((s) => s.trim()).map((s) => s + "Z");
const oDisc = subpaths[outerIdx], oCounter = subpaths[1 - outerIdx];
const px = (x: number) => X0 + x * SC;

const Overlay: React.FC = () => {
  const frame = useCurrentFrame();
  const fillF = bf(T.hook.fillAt), zA = bf(T.hook.zoom[0]), zB = bf(T.hook.zoom[1]);
  const hFill = prog(frame, fillF, bf(0.3));
  const zp = prog(frame, zA, zB - zA, (t) => t * t);
  const S = Math.exp(Math.log(30) * zp);
  const tz = Math.pow(zp, 0.6); // la "O" viaja al centro de la pantalla mientras la camara entra en ella
  const open = prog(frame, zA - 2, 5); // el contador de la O se abre como portal
  const fade = 1 - prog(frame, zA, bf(0.4));
  const mid = `hm-${frame}`; // id unico por muestra de motion blur

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <mask id={mid} maskUnits="userSpaceOnUse" x={-40000} y={-40000} width={80000} height={80000}>
          <rect x={-40000} y={-40000} width={80000} height={80000} fill="white" />
          {LETTERS.map((l) => {
            const isDigit = "624".includes(l.ch);
            const e = expoOut(prog(frame, bf(l.at), 10));
            const h = isDigit ? e : hFill * e;
            const ty = isDigit ? 0 : (1 - e) * 60;
            return <path key={l.id} d={G[l.ch].d} fill="black" opacity={h}
              transform={`translate(${px(l.x)} ${l.base + ty}) scale(${SC})`} />;
          })}
          <path d={oDisc} fill="black" opacity={open}
            transform={`translate(${px(advN)} ${BASE1}) scale(${SC})`} />
        </mask>
      </defs>
      <g transform={`translate(${lerp(counterC.x, W / 2, tz)} ${lerp(counterC.y, H / 2, tz)}) scale(${S}) translate(${-counterC.x} ${-counterC.y})`}>
        <rect x={-40000} y={-40000} width={80000} height={80000} fill={COLORS.bg} mask={`url(#${mid})`} />
        {LETTERS.filter((l) => !"624".includes(l.ch)).map((l) => {
          const e = expoOut(prog(frame, bf(l.at), 10));
          return <path key={l.id} d={G[l.ch].d} fill={COLORS.text} opacity={e * (1 - hFill)}
            transform={`translate(${px(l.x)} ${l.base + (1 - e) * 60}) scale(${SC})`} />;
        })}
        {LETTERS.map((l) => {
          const isDigit = "624".includes(l.ch);
          const e = expoOut(prog(frame, bf(l.at), 10));
          return <path key={`s${l.id}`} d={G[l.ch].d} fill="none" stroke={COLORS.text} strokeWidth={2} vectorEffect="non-scaling-stroke"
            strokeOpacity={0.5 * e * (isDigit ? 1 : hFill) * fade}
            transform={`translate(${px(l.x)} ${l.base + (isDigit ? 0 : (1 - e) * 60)}) scale(${SC})`} />;
        })}
        {/* filete acento entre NODO y 624, como en el logo */}
        <rect x={px(G.N.bounds[0])} y={(BASE1 + BASE2 - 700 * SC) / 2 + 2} width={(inkR - inkL) * SC} height={2} fill={COLORS.accent}
          opacity={0.9 * expoOut(prog(frame, bf(T.hook.digits), 8)) * fade} />
      </g>
    </svg>
  );
};

/** GANCHO: NODO letra por letra, 624, la fachada solo a traves de las letras y zoom a traves de la O. */
export const Hook: React.FC = () => (
  <AbsoluteFill>
    <CameraMotionBlur samples={24} shutterAngle={200}><Overlay /></CameraMotionBlur>
  </AbsoluteFill>
);
