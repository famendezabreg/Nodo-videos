import React, { useEffect, useMemo, useState } from "react";
import { cancelRender, continueRender, delayRender, Easing, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { H, PhotoId, W, clamp, photoUrl, windowHalf } from "./config";

const VERT = `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Desplazamiento de UV segun profundidad (Depth Anything V2): lo cercano se mueve mas que lo lejano.
const FRAG = `
precision highp float;
uniform sampler2D map; uniform sampler2D depth;
uniform vec2 center; uniform vec2 halfSize; uniform vec2 shift; uniform float dolly;
varying vec2 vUv;
void main(){
  vec2 p = center + (vUv - 0.5) * 2.0 * halfSize;          // ventana de recorte -> UV de imagen
  float d = texture2D(depth, p).r - 0.5;                    // -0.5 lejos ... +0.5 cerca
  vec2 q = p - shift * d * 2.0 * halfSize.x;                // paralaje lateral (fraccion del ancho de ventana)
  q = q - (p - center) * dolly * d * 2.0;                   // dolly: lo cercano crece mas rapido
  gl_FragColor = vec4(texture2D(map, clamp(q, 0.001, 0.999)).rgb, 1.0);
}`;

const loadTex = (url: string, srgb: boolean) =>
  new Promise<THREE.Texture>((res, rej) =>
    new THREE.TextureLoader().load(url, (t) => {
      t.colorSpace = THREE.NoColorSpace; // valores crudos: la salida coincide con la foto original
      t.minFilter = THREE.LinearFilter; t.magFilter = THREE.LinearFilter; t.generateMipmaps = false;
      res(t);
    }, undefined, rej));

export type ParallaxProps = {
  photoId: PhotoId;
  depthId: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  zoom: [number, number];
  /** desplazamiento maximo de paralaje, fraccion del ancho de ventana (0.02-0.03) */
  shift: number;
  frames: number; // duracion del movimiento en frames
  /** parte del movimiento ya recorrida al arrancar (para continuidad entre secuencias) */
  startAt?: number;
};

/** Estado de camara 2.5D en el progreso p (0..1). Compartido con la version 2D para que el cambio sea invisible. */
export const parallaxState = (a: Pick<ParallaxProps, "photoId" | "from" | "to" | "zoom" | "shift">, p: number) => {
  const e = Easing.inOut(Easing.sin)(clamp(p, 0, 1));
  const zoom = a.zoom[0] + (a.zoom[1] - a.zoom[0]) * e;
  const { hx, hy } = windowHalf(a.photoId, zoom);
  const m = a.shift * 1.2; // margen para que el desplazamiento nunca muestre el borde
  const cx = clamp(a.from.x + (a.to.x - a.from.x) * e, hx + m * hx * 2, 1 - hx - m * hx * 2);
  const cy = clamp(a.from.y + (a.to.y - a.from.y) * e, hy + 0.004, 1 - hy - 0.004);
  // arco lateral que arranca en 0 (primer frame = foto plana) y llega a +shift, con leve curva vertical
  const sx = a.shift * e;
  const sy = a.shift * 0.25 * Math.sin(Math.PI * e);
  return { zoom, hx, hy, cx, cy, sx, sy, dolly: 0.03 * e };
};

export const Parallax: React.FC<ParallaxProps> = (props) => {
  const frame = useCurrentFrame();
  const [tex, setTex] = useState<{ map: THREE.Texture; depth: THREE.Texture } | null>(null);
  useEffect(() => {
    const h = delayRender(`parallax ${props.photoId}`);
    Promise.all([loadTex(staticFile(photoUrl(props.photoId)), true), loadTex(staticFile(`depth/${props.depthId}.png`), false)])
      .then(([map, depth]) => { setTex({ map, depth }); continueRender(h); })
      .catch((e) => cancelRender(e));
  }, [props.photoId, props.depthId]);

  const p = ((props.startAt ?? 0) * props.frames + frame) / props.frames;
  const s = parallaxState(props, p);
  const uniforms = useMemo(() => ({
    map: { value: tex?.map ?? null }, depth: { value: tex?.depth ?? null },
    center: { value: new THREE.Vector2(s.cx, 1 - s.cy) }, halfSize: { value: new THREE.Vector2(s.hx, s.hy) },
    shift: { value: new THREE.Vector2(s.sx, -s.sy) }, dolly: { value: s.dolly },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [tex, frame, props.photoId]);
  if (!tex) return null;
  return (
    <ThreeCanvas width={W} height={H} orthographic camera={{ position: [0, 0, 5], zoom: 1, near: 0.1, far: 20 }}
      gl={{ antialias: false, toneMapping: THREE.NoToneMapping, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      <mesh>
        <planeGeometry args={[W, H]} />
        <shaderMaterial uniforms={uniforms} vertexShader={VERT} fragmentShader={FRAG} />
      </mesh>
    </ThreeCanvas>
  );
};
