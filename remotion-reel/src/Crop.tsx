import React from "react";
import { Img, staticFile } from "remotion";
import { H, PhotoId, W, clamp, coverSize, photoUrl, windowHalf } from "./config";

/** Foto 2D a pantalla completa (cover) con foco (fx,fy en UV de imagen) y zoom. Mismo encuadre que el plano WebGL. */
export const Crop: React.FC<{ photoId: PhotoId; fx: number; fy: number; zoom: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ photoId, fx, fy, zoom, style, children }) => {
  const { bw, bh } = coverSize(photoId);
  const { hx, hy } = windowHalf(photoId, zoom);
  const cx = clamp(fx, hx, 1 - hx), cy = clamp(fy, hy, 1 - hy);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Img src={staticFile(photoUrl(photoId))} style={{ position: "absolute", width: bw * zoom, height: bh * zoom, left: W / 2 - cx * bw * zoom, top: H / 2 - cy * bh * zoom, maxWidth: "none" }} />
      {children}
    </div>
  );
};

/** Posicion en pantalla de un punto (u,v) de la imagen para un encuadre dado. */
export const toScreen = (photoId: PhotoId, u: number, v: number, fx: number, fy: number, zoom: number) => {
  const { bw, bh } = coverSize(photoId);
  const { hx, hy } = windowHalf(photoId, zoom);
  const cx = clamp(fx, hx, 1 - hx), cy = clamp(fy, hy, 1 - hy);
  return { x: W / 2 + (u - cx) * bw * zoom, y: H / 2 + (v - cy) * bh * zoom };
};
