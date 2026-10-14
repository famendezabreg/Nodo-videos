# NODO 624 · Reels

- `propuesta-1-recorrido/` — reel de recorrido 23 s (Ken Burns + capas HyperFrames).
- **Propuesta 2 · "impacto"** (esta carpeta raíz, ~31.7 s, ritmo a 72 BPM):
  - `config/timing.json` — única fuente de tiempos (en beats). `config/beats.json` lo genera `tools/beats.py`.
  - `tools/` — `beats.py` (librosa o rejilla fija), `depth.py` (Depth Anything V2 Small → mapas de profundidad), `rotulo.py` (extrae las letras oficiales del rótulo, assets/rotulo/ROTULO_FACHADA_1.pdf, para el gancho), `contact_sheet.py`.
  - `hf-titles/` — capas tipográficas (HyperFrames + GSAP): `python3 hf-titles/tools/gen.py`, luego `hyperframes render -c compositions/<x>.html --format png-sequence -o renders/seq/<x>`.
  - `remotion-reel/` — edición maestra (Remotion + three.js + motion blur): `npm run assets`, `npm run contact`, `npm run render`. Configuración en `src/config.ts`.
  - `assets/` — fotos y logos oficiales. Sin `assets/audio` ni `assets/sfx` el reel sale sin música ni efectos.
  - Salidas en `remotion-reel/out/`.
