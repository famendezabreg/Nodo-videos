#!/usr/bin/env python3
"""Prepara las fotos oficiales para el reel: remuestreo Lanczos a una altura suficiente para el recorte vertical con zoom
(~2600 px) y un enfoque suave. No inventa detalle: con originales de mayor resolucion en assets/images el resultado es 1:1
y este paso solo evita que el navegador interpole en bilineal. Salida: remotion-reel/assets-enhanced/ (no se versiona)."""
import pathlib
from PIL import Image, ImageFilter
ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC, OUT = ROOT / "assets/images", ROOT / "remotion-reel/assets-enhanced"
OUT.mkdir(exist_ok=True)
TARGET_H = 2600
for f in sorted(SRC.iterdir()):
    if f.suffix.lower() not in {".png", ".jpg", ".jpeg"}: continue
    im = Image.open(f).convert("RGB")
    scale = TARGET_H / im.height
    if scale > 1.0:
        im = im.resize((round(im.width * scale), TARGET_H), Image.LANCZOS)
        im = im.filter(ImageFilter.UnsharpMask(radius=1.6, percent=60, threshold=2))
    out = OUT / f.name
    if f.suffix.lower() == ".png": im.save(out, optimize=False, compress_level=3)
    else: im.save(out, quality=96, subsampling=0)
    print(f.name, Image.open(f).size, "->", im.size)
