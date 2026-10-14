#!/usr/bin/env python3
"""Hoja de contacto de stills (con guias rojas de safe zones IG: 250 px arriba / 340 px abajo). Uso: contact_sheet.py out.png t1 t2 ..."""
import sys, pathlib
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parent.parent
out, times = sys.argv[1], sys.argv[2:]
w, h, cols = 360, 640, 6
rows = (len(times) + cols - 1) // cols
S = Image.new("RGB", (cols * (w + 8), rows * (h + 22)), (50, 50, 50))
d = ImageDraw.Draw(S)
for i, t in enumerate(times):
    im = Image.open(ROOT / f"remotion-reel/out/stills/still_{float(t):.1f}.png").convert("RGB").resize((w, h))
    g = ImageDraw.Draw(im)
    for y in (250, 1920 - 340):
        g.line([(0, y * h / 1920), (w, y * h / 1920)], fill=(255, 40, 40), width=1)
    x, y = (i % cols) * (w + 8), (i // cols) * (h + 22)
    S.paste(im, (x, y + 18)); d.text((x + 4, y + 3), f"{t} s", fill=(255, 255, 255))
S.save(out)
