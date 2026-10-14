#!/usr/bin/env python3
"""Extrae los contornos de Lora (wght 600) de N O D 6 2 4 y los exporta a remotion-reel/src/wordmark.json.
El gancho del reel dibuja el wordmark como SVG para poder usarlo de mascara y hacer zoom a traves de la 'O'."""
import json, pathlib
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.transformPen import TransformPen

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = ROOT / "propuesta-1-recorrido/hf-titles/assets/fonts/Lora.woff2"
font = TTFont(src)
font = instancer.instantiateVariableFont(font, {"wght": 600})
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
out = {"upm": upm, "glyphs": {}}
for ch in "NOD624":
    name = cmap[ord(ch)]
    g = gs[name]
    # SVG: y hacia abajo
    pen = SVGPathPen(gs)
    g.draw(TransformPen(pen, (1, 0, 0, -1, 0, 0)))
    bp = BoundsPen(gs); g.draw(bp)
    rec = DecomposingRecordingPen(gs); g.draw(rec)
    # contornos individuales -> limites (para hallar el contador de la 'O')
    contours, cur = [], []
    for op, args in rec.value:
        cur.append((op, args))
        if op in ("closePath", "endPath"):
            contours.append(cur); cur = []
    cb = []
    for c in contours:
        p = BoundsPen(gs)
        for op, args in c:
            getattr(p, op)(*args)
        cb.append(p.bounds)
    out["glyphs"][ch] = {"d": pen.getCommands(), "adv": g.width, "bounds": bp.bounds, "contours": cb}
    print(ch, g.width, bp.bounds, len(contours))
out["capHeight"] = font["OS/2"].sCapHeight
(ROOT / "remotion-reel/src").mkdir(parents=True, exist_ok=True)
(ROOT / "remotion-reel/src/wordmark.json").write_text(json.dumps(out))
print("capHeight", out["capHeight"], "upm", upm)
