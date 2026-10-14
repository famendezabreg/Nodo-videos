import { Easing, interpolate } from "remotion";

export const expoOut = Easing.out(Easing.exp);
export const expoIO = Easing.inOut(Easing.exp);
export const cubicIO = Easing.inOut(Easing.cubic);
export const cubicIn = Easing.in(Easing.cubic);
export const sineIO = Easing.inOut(Easing.sin);

/** progreso 0..1 de [start, start+dur] frames con easing */
export const prog = (frame: number, start: number, dur: number, easing: (t: number) => number = (t) => t) =>
  interpolate(frame, [start, start + dur], [0, 1], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
