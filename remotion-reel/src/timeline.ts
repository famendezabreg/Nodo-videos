// Fuente unica de tiempos (segundos) del reel NODO 624.
export const FPS = 30;
export const W = 1080;
export const H = 1920;
export const TOTAL_S = 23.0;
export const DISSOLVE_S = 0.4;

export const COLORS = { bg: "#1B1815", text: "#F7F2EA", accent: "#EBB593", eyebrow: "#E8C3A4" };

export type Shot = {
  id: string;
  file: string; // en public/photos
  w: number; // tamano natural
  h: number;
  start: number;
  end: number;
  // Ken Burns: foco (fraccion de la imagen) al inicio y al final de la toma
  from: { x: number; y: number };
  to: { x: number; y: number };
  zoom?: [number, number]; // por defecto 1.04 -> 1.12
};

export const SHOTS: Shot[] = [
  { id: "fachada-nodo624", file: "recibido_15_fachada-frontal-nodo624.png", w: 2560, h: 1440, start: 1.5, end: 3.8, from: { x: 0.80, y: 0.42 }, to: { x: 0.82, y: 0.42 } },
  { id: "fachada-4", file: "recibido_22_entrada-planter.png", w: 2560, h: 1440, start: 3.4, end: 5.2, from: { x: 0.56, y: 0.5 }, to: { x: 0.46, y: 0.5 } },
  { id: "recepcion", file: "recibido_18_recepcion.png", w: 1448, h: 1086, start: 4.8, end: 7.0, from: { x: 0.40, y: 0.5 }, to: { x: 0.56, y: 0.5 } },
  { id: "lounge", file: "recibido_20_lounge-sofa-muro-verde.png", w: 1448, h: 1086, start: 6.6, end: 8.4, from: { x: 0.62, y: 0.5 }, to: { x: 0.46, y: 0.5 } },
  { id: "vestibulo", file: "recibido_10_vestibulo-escalera.png", w: 1495, h: 1052, start: 8.0, end: 9.8, from: { x: 0.30, y: 0.5 }, to: { x: 0.40, y: 0.5 } },
  { id: "escalera", file: "recibido_17_escalera.png", w: 1490, h: 1056, start: 9.4, end: 11.0, from: { x: 0.40, y: 0.80 }, to: { x: 0.40, y: 0.20 }, zoom: [1.12, 1.22] },
  { id: "oficina", file: "recibido_01_oficina-jardin.png", w: 2304, h: 1536, start: 10.6, end: 12.8, from: { x: 0.40, y: 0.5 }, to: { x: 0.55, y: 0.5 } },
  { id: "sala-reuniones", file: "recibido_08_sala-reuniones-b.png", w: 2304, h: 1536, start: 12.4, end: 15.0, from: { x: 0.35, y: 0.5 }, to: { x: 0.55, y: 0.5 } },
  { id: "comedor", file: "recibido_12_comedor-arcos.jpg", w: 1494, h: 1053, start: 14.6, end: 16.4, from: { x: 0.55, y: 0.5 }, to: { x: 0.42, y: 0.5 } },
  { id: "terraza", file: "recibido_14_terraza-pergola.png", w: 1536, h: 1024, start: 16.0, end: 17.8, from: { x: 0.38, y: 0.5 }, to: { x: 0.52, y: 0.5 } },
  { id: "patio", file: "recibido_06_fachada-posterior-arcos.png", w: 2304, h: 1536, start: 17.4, end: 20.0, from: { x: 0.40, y: 0.55 }, to: { x: 0.55, y: 0.55 } },
];

export const INTRO = { file: "intro", start: 0, dur: 1.6, solidUntil: 1.9 };

export const CHAPTERS = [
  { file: "cap1", start: 2.0, dur: 3.0 },
  { file: "cap2", start: 5.2, dur: 3.0 },
  { file: "cap3", start: 8.4, dur: 3.2 },
  { file: "cap4", start: 12.6, dur: 2.4 },
  { file: "cap5", start: 16.2, dur: 3.2 },
];

export const FIXED = { file: "fixed.png", start: 1.7, end: 19.6, fade: 0.5 };

export const ENDCARD = {
  file: "endcard",
  bg: { file: "recibido_16_fachada-angulo-nodo624.png", w: 2560, h: 1440 },
  start: 19.6,
  dur: 3.4,
};

export const AUDIO = { file: "audio/musica.mp3", fadeIn: 1.0, fadeOut: 1.5, volume: 0.9 };
