#!/usr/bin/env python3
"""Genera las composiciones de HyperFrames (capas tipograficas del reel NODO 624)."""
import pathlib, json
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "compositions"
OUT.mkdir(exist_ok=True)

CSS = """
@font-face{font-family:"Lora";src:url("../assets/fonts/Lora.woff2") format("woff2");font-weight:400 700;font-style:normal}
@font-face{font-family:"Lora";src:url("../assets/fonts/Lora-Italic.woff2") format("woff2");font-weight:400 700;font-style:italic}
@font-face{font-family:"Work Sans";src:url("../assets/fonts/WorkSans.woff2") format("woff2");font-weight:400 600;font-style:normal}
:root{--bg:#1B1815;--text:#F7F2EA;--accent:#EBB593;--eyebrow:#E8C3A4}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:transparent}
#root{position:relative;width:100%;height:100%;color:var(--text);font-family:"Lora",serif}
.eyebrow{font-family:"Work Sans",sans-serif;font-weight:600;font-size:28px;letter-spacing:.3em;text-transform:uppercase;color:var(--eyebrow);white-space:nowrap}
.rule{height:2px;background:var(--accent);transform-origin:left center}
h1,.h{font-family:"Lora",serif;font-weight:500;color:var(--text);text-shadow:0 2px 24px rgba(27,24,21,.55)}
h1 .l{display:block}
em{font-style:italic;color:var(--accent);font-weight:500}
.small{font-family:"Work Sans",sans-serif;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--eyebrow);font-size:22px;white-space:nowrap}
"""

def page(cid, dur, body, css, js, fps=30):
    return f"""<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="../assets/gsap.min.js"></script>
    <style>{CSS}{css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920" data-fps="{fps}">
{body}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
      const IN = {{ duration: 0.9, ease: "power3.out" }};
      const rise = (sel, at, y = 40) => tl.fromTo(sel, {{ y, opacity: 0 }}, {{ y: 0, opacity: 1, ...IN }}, at);
{js}
      window.__timelines["{cid}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""

def write(name, cid, dur, body, css, js):
    (OUT / f"{name}.html").write_text(page(cid, dur, body, css, js))

# ---------- Intro (0.0 - 1.6 s) ----------
write("intro", "intro", 1.6, """
      <div id="stack" class="clip" data-start="0" data-duration="1.6" data-track-index="0">
        <div id="eb" class="eyebrow">Un recorrido por</div>
        <img id="logo" src="../assets/logo.png" alt="NODO 624" />
        <div id="rule" class="rule"></div>
        <div id="sub" class="small">Colonia Escalón · San Salvador</div>
      </div>""", """
#stack{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
#eb{margin-bottom:46px}
#logo{width:640px;height:auto;display:block}
#rule{width:120px;margin:46px 0 30px}
#sub{font-size:24px}
""", """
      rise("#eb", 0.05, 24);
      tl.fromTo("#logo", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, 0.3);
      tl.fromTo("#rule", { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "power2.inOut" }, 0.7);
      tl.fromTo("#sub", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }, 0.85);
      tl.to("#stack", { opacity: 0, duration: 0.4, ease: "power2.inOut" }, 1.2);
""")

# ---------- Capitulos ----------
CHAPTERS = [
    ("cap1", "01 · Llegada",     "Llegas a",            "",      "Colonia Escalón.", 3.0),
    ("cap2", "02 · Bienvenida",  "Te recibe un",        "espacio ", "sereno.",       3.0),
    ("cap3", "03 · Trabajo",     "Trabajas a",          "",      "tu ritmo.",        3.2),
    ("cap4", "04 · Reuniones",   "Recibes a tus",       "clientes ", "como se merecen.", 2.4),
    ("cap5", "05 · Pausa",       "Y cuando lo necesitas,", "",   "respiras.",        3.2),
]
for cid, eb, l1, pre, acc, dur in CHAPTERS:
    l2 = (pre + f"<em>{acc}</em>") if pre else f"<em>{acc}</em>"
    out_at = round(dur - 0.45, 2)
    write(cid, cid, dur, f"""
      <div id="block" class="clip" data-start="0" data-duration="{dur}" data-track-index="0">
        <div id="eb" class="eyebrow">{eb}</div>
        <div id="rule" class="rule"></div>
        <h1><span id="l1" class="l">{l1}</span><span id="l2" class="l">{l2}</span></h1>
      </div>""", """
#block{position:absolute;left:72px;bottom:360px;width:936px}
#eb{font-size:26px}
#rule{width:72px;margin:26px 0 30px}
h1{font-size:68px;line-height:1.14;letter-spacing:-.005em}
""", f"""
      rise("#eb", 0.05, 24);
      tl.fromTo("#rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.6, ease: "power2.inOut" }}, 0.2);
      rise("#l1", 0.3);
      rise("#l2", 0.5);
      tl.to("#block", {{ opacity: 0, duration: 0.45, ease: "power2.inOut" }}, {out_at});
""")

# ---------- End card (19.6 - 23.0 s) ----------
write("endcard", "endcard", 3.4, """
      <div id="wrap" class="clip" data-start="0" data-duration="3.4" data-track-index="0">
        <img id="logo" src="../assets/logo.png" alt="NODO 624" />
        <div id="eb" class="eyebrow">NODO 624</div>
        <h1 id="h"><span class="l">Agenda tu <em>visita.</em></span></h1>
        <div id="btn">Agenda en nodo624.com</div>
        <div id="foot" class="small">Colonia Escalón · San Salvador</div>
      </div>""", """
#wrap{position:absolute;inset:0}
#logo{position:absolute;left:50%;top:430px;width:520px;margin-left:-260px}
#eb{position:absolute;left:0;right:0;top:830px;text-align:center}
#h{position:absolute;left:0;right:0;top:900px;text-align:center;font-size:100px;line-height:1.1}
#btn{position:absolute;left:50%;top:1130px;transform:translateX(-50%);padding:34px 60px;border:2px solid var(--accent);border-radius:999px;
  font-family:"Work Sans",sans-serif;font-weight:600;font-size:28px;letter-spacing:.2em;text-transform:uppercase;color:var(--text);white-space:nowrap}
#foot{position:absolute;left:0;right:0;top:1712px;text-align:center}
""", """
      tl.fromTo("#logo", { y: 28, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }, 0.4);
      rise("#eb", 0.85, 24);
      rise("#h", 1.1);
      tl.fromTo("#btn", { y: 30, opacity: 0, xPercent: -50 }, { y: 0, opacity: 1, xPercent: -50, ...IN }, 1.6);
      tl.fromTo("#foot", { opacity: 0 }, { opacity: 1, duration: 0.8, ease: "power2.out" }, 2.1);
""")

# ---------- Capa fija (1 frame) ----------
write("fixed", "fixed", 0.1, """
      <div id="fx" class="clip" data-start="0" data-duration="0.1" data-track-index="0">
        <img id="logo" src="../assets/logo.png" alt="NODO 624" />
        <div id="f1" class="small">Colonia Escalón · San Salvador</div>
        <div id="f2" class="small">nodo624.com</div>
        <div id="f3">Imágenes con fines ilustrativos.</div>
      </div>""", """
#fx{position:absolute;inset:0}
#logo{position:absolute;left:72px;top:262px;width:168px;filter:drop-shadow(0 2px 10px rgba(27,24,21,.45))}
#f1{position:absolute;left:72px;top:1712px;font-size:21px}
#f2{position:absolute;right:72px;top:1712px;font-size:21px}
#f3{position:absolute;left:72px;top:1764px;font-family:"Work Sans",sans-serif;font-weight:400;font-size:20px;letter-spacing:.04em;color:rgba(247,242,234,.72)}
""", "")

(ROOT / "index.html").write_text((OUT / "intro.html").read_text().replace("../assets/", "assets/"))
print("ok")
