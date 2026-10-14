// Fuente unica de tiempos y parametros del reel. Los tiempos viven en ../../config/timing.json (en BEATS)
// y tambien los lee hf-titles/tools/gen.py, asi las capas de HyperFrames y Remotion nunca se desfasan.
import timing from "../../config/timing.json";

export const T = timing;
export const FPS = timing.fps;
export const W = 1080;
export const H = 1920;
export const BEAT_S = 60 / timing.bpm; // 0.6 s a 100 BPM
export const COLORS = { bg: "#1B1815", text: "#F7F2EA", accent: "#EBB593", eyebrow: "#E8C3A4" };

/** beats -> segundos / frames */
export const bs = (b: number) => b * BEAT_S;
export const bf = (b: number) => Math.round(b * BEAT_S * FPS);

export type SceneId = keyof typeof timing.scenes;
export const scene = (id: SceneId) => {
  const [a, b] = timing.scenes[id];
  return { startB: a, endB: b, from: bf(a), frames: bf(b) - bf(a), durS: bs(b - a) };
};
export const TOTAL_FRAMES = bf(timing.scenes.end[1]);
export const TOTAL_S = bs(timing.scenes.end[1]);

export type PhotoId = keyof typeof timing.photos;
export const photo = (id: PhotoId) => timing.photos[id];
export const photoUrl = (id: PhotoId) => `photos/${timing.photos[id].file}`;

/** Ventana de recorte 9:16 (cover) sobre la foto: tamano cover en px y semitamano de la ventana en UV de imagen. */
export const coverSize = (id: PhotoId) => {
  const p = photo(id);
  const base = Math.max(W / p.w, H / p.h);
  return { bw: p.w * base, bh: p.h * base };
};
export const windowHalf = (id: PhotoId, zoom: number) => {
  const { bw, bh } = coverSize(id);
  return { hx: W / (2 * zoom * bw), hy: H / (2 * zoom * bh) };
};
export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
