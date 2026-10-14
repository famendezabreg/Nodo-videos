# NODO 624 · Reel de recorrido (9:16, 23 s)

- `hf-titles/` — capas tipográficas animadas (HyperFrames + GSAP). `python3 hf-titles/tools/gen.py` regenera las composiciones; se renderizan con alfa (`--format png-sequence` / `webm`).
- `remotion-reel/` — edición maestra (Remotion). `npm run assets` sincroniza fotos y capas; `npm run stills`; `npm run render` (usa `/opt/pw-browsers` vía `remotion.config.ts`).
- `assets/` — fotos y logos oficiales. Sin `assets/audio/*.mp3` el reel sale sin música.
- Salidas en `remotion-reel/out/`.
