#!/usr/bin/env python3
"""Extrae las letras oficiales del rotulo (assets/rotulo/ROTULO_FACHADA_1.pdf: una letra vectorial por pagina,
N O D O 6 2 4) y genera remotion-reel/src/wordmark.json. Sustituye a la tipografia Lora en el gancho."""
import json, pathlib, re, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
PDF = ROOT / "assets/rotulo/ROTULO_FACHADA_1.pdf"
PAGES = ["N", "O", "D", "O", "6", "2", "4"]
CAP = 700.0   # altura de mayuscula en unidades del glifo
GAP = 70.0    # espacio entre letras (suma de los dos apoyos laterales)

def page_path(i):
    with tempfile.TemporaryDirectory() as t:
        svg = pathlib.Path(t) / "p.svg"
        subprocess.run(["pdftocairo", "-svg", "-f", str(i), "-l", str(i), str(PDF), str(svg)], check=True)
        s = svg.read_text()
    m = re.search(r'<path[^>]*\bd="([^"]+)"[^>]*transform="matrix\(([^)]+)\)"', s) or re.search(r'<path[^>]*transform="matrix\(([^)]+)\)"[^>]*\bd="([^"]+)"', s)
    d, mat = (m.group(1), m.group(2)) if "M" in m.group(1) else (m.group(2), m.group(1))
    a, b, c, dd, e, f = [float(x) for x in mat.split(",")]
    toks = re.findall(r"[MLCZ]|-?\d+\.?\d*(?:e-?\d+)?", d)
    out, pts, i2 = [], [], 0
    while i2 < len(toks):
        t = toks[i2]
        if t in "MLC":
            n = {"M": 1, "L": 1, "C": 3}[t]
            seg = [t]
            for k in range(n):
                x, y = float(toks[i2 + 1 + 2 * k]), float(toks[i2 + 2 + 2 * k])
                X, Y = a * x + c * y + e, b * x + dd * y + f   # coordenadas de pagina (y hacia abajo)
                seg.append((X, Y)); pts.append((X, Y))
            out.append(seg); i2 += 1 + 2 * n
        else:
            out.append(["Z"]); i2 += 1
    return out, pts

glyphs, boxes = {}, {}
for i, ch in enumerate(PAGES, 1):
    cmds, pts = page_path(i)
    xs, ys = [p[0] for p in pts], [p[1] for p in pts]
    boxes[i] = (ch, min(xs), min(ys), max(xs), max(ys)); print(i, ch, [round(v, 1) for v in boxes[i][1:]])
    glyphs[i] = cmds

# linea base = parte inferior de la N (sin sobresalir); escala para que la N mida CAP
_, nx0, ny0, nx1, ny1 = boxes[1]
base = ny1
k = CAP / (ny1 - ny0)
res = {"upm": 1000, "capHeight": CAP, "glyphs": {}}
for i, ch in enumerate(PAGES, 1):
    if ch in res["glyphs"]: continue
    _, x0, y0, x1, y1 = boxes[i]
    lsb = GAP / 2
    def tx(p): return ((p[0] - x0) * k + lsb, (p[1] - base) * k)
    d, subs, cur = [], [], []
    for seg in glyphs[i]:
        if seg[0] == "Z":
            d.append("Z"); continue
        if seg[0] == "M" and cur: subs.append(cur); cur = []
        cur.append(seg)
        d.append(seg[0] + " " + " ".join(f"{tx(p)[0]:.2f} {tx(p)[1]:.2f}" for p in seg[1:]))
    if d and d[-1].startswith("M"): d.pop()   # el PDF deja un moveTo suelto al final
    if cur: subs.append(cur)
    cb = []
    for sub in subs:
        if len(sub) < 2: continue
        pp = [tx(p) for seg in sub for p in seg[1:]]
        cb.append([min(p[0] for p in pp), -max(p[1] for p in pp), max(p[0] for p in pp), -min(p[1] for p in pp)])  # y hacia arriba
    w = (x1 - x0) * k
    res["glyphs"][ch] = {"d": " ".join(d), "adv": w + GAP, "bounds": [lsb, -(y1 - base) * k, lsb + w, -(y0 - base) * k], "contours": cb}
(ROOT / "remotion-reel/src/wordmark.json").write_text(json.dumps(res))
print({c: (round(g["adv"]), [round(b) for b in g["bounds"]], len(g["contours"])) for c, g in res["glyphs"].items()})
