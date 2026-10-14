#!/usr/bin/env python3
"""Mapas de profundidad con Depth Anything V2 Small (export ONNX) para las tomas hero.

Hugging Face esta bloqueado en este entorno, asi que en lugar de transformers.pipeline("depth-estimation")
se usa el mismo modelo (Depth-Anything-V2-Small) exportado a ONNX (fabio-sim/Depth-Anything-ONNX v2.0.0, GitHub Releases)
y ejecutado con onnxruntime. Salida: remotion-reel/assets-depth/<id>.png (gris; blanco = cerca) + hoja de revision.
"""
import json, pathlib, sys, urllib.request
import numpy as np
import onnxruntime as ort
from PIL import Image
from scipy.ndimage import gaussian_filter

ROOT = pathlib.Path(__file__).resolve().parent.parent
MODEL = ROOT / "tools/models/depth_anything_v2_vits.onnx"
URL = "https://github.com/fabio-sim/Depth-Anything-ONNX/releases/download/v2.0.0/depth_anything_v2_vits.onnx"
OUT = ROOT / "remotion-reel/assets-depth"
CFG = json.loads((ROOT / "config/timing.json").read_text())

if not MODEL.exists():
    MODEL.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve(URL, MODEL)

sess = ort.InferenceSession(str(MODEL), providers=["CPUExecutionProvider"])
MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32)
STD = np.array([0.229, 0.224, 0.225], dtype=np.float32)
S = 518


def infer(img: Image.Image) -> np.ndarray:
    x = np.asarray(img.convert("RGB").resize((S, S), Image.BICUBIC), dtype=np.float32) / 255.0
    x = ((x - MEAN) / STD).transpose(2, 0, 1)[None]
    return sess.run(None, {sess.get_inputs()[0].name: x})[0][0]


def depth_for(path: pathlib.Path) -> Image.Image:
    img = Image.open(path)
    d = infer(img)
    d = (d + infer(img.transpose(Image.FLIP_LEFT_RIGHT))[:, ::-1]) / 2  # TTA con flip horizontal
    lo, hi = np.percentile(d, [1, 99])
    d = np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)
    w = 1024
    h = round(w * img.height / img.width)
    big = np.asarray(Image.fromarray((d * 255).astype(np.uint8)).resize((w, h), Image.BICUBIC), dtype=np.float32) / 255
    big = gaussian_filter(big, 2.0)  # bordes suaves: evita desgarros en el parallax
    return Image.fromarray((np.clip(big, 0, 1) * 255).astype(np.uint8))


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    sheet = []
    for pid, spec in CFG["depth"].items():
        src = ROOT / "assets/images" / CFG["photos"][spec]["file"]
        dm = depth_for(src)
        dm.save(OUT / f"{pid}.png")
        im = Image.open(src).convert("RGB")
        t = 360
        sheet.append((pid, im.resize((t, round(t * im.height / im.width))), dm.convert("RGB").resize((t, round(t * im.height / im.width)))))
        print("ok", pid, dm.size)
    H = sum(max(a.height, 1) for _, a, _ in sheet)
    S_ = Image.new("RGB", (720, H), (30, 30, 30))
    y = 0
    for _, a, b in sheet:
        S_.paste(a, (0, y)); S_.paste(b, (360, y)); y += a.height
    S_.save(OUT / "_revision.png")
