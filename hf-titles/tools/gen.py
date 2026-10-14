#!/usr/bin/env python3
"""Capas tipograficas (HyperFrames + GSAP) del reel 'impacto'. Los tiempos salen de config/timing.json (en beats)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
CFG = json.loads((ROOT.parent / "config/timing.json").read_text())
BEAT = 60 / CFG["bpm"]
OUT = ROOT / "compositions"
OUT.mkdir(exist_ok=True)
b = lambda x: round(x * BEAT, 4)

CSS = """
@font-face{font-family:"Lora";src:url("../assets/fonts/Lora.woff2") format("woff2");font-weight:400 700;font-style:normal}
@font-face{font-family:"Lora";src:url("../assets/fonts/Lora-Italic.woff2") format("woff2");font-weight:400 700;font-style:italic}
@font-face{font-family:"Work Sans";src:url("../assets/fonts/WorkSans.woff2") format("woff2");font-weight:400 600;font-style:normal}
:root{--bg:#1B1815;--text:#F7F2EA;--accent:#EBB593;--eyebrow:#E8C3A4}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:transparent}
#root{position:relative;width:100%;height:100%;color:var(--text);font-family:"Lora",serif}
.eyebrow{font-family:"Work Sans",sans-serif;font-weight:600;font-size:26px;letter-spacing:.3em;text-transform:uppercase;color:var(--eyebrow);white-space:nowrap}
.small{font-family:"Work Sans",sans-serif;font-weight:600;letter-spacing:.22em;text-transform:uppercase;color:var(--eyebrow);font-size:21px;white-space:nowrap}
.h{font-family:"Lora",serif;font-weight:500;color:var(--text);text-shadow:0 2px 28px rgba(27,24,21,.6);letter-spacing:-.01em}
.line{display:block;white-space:nowrap}
.w{display:inline-block;will-change:transform}
.w+.w{margin-left:.26em}
em{font-style:italic;color:var(--accent);font-weight:500}
"""

def page(cid, dur, body, css, js):
    return f"""<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <script src="../assets/gsap.min.js"></script>
    <style>{CSS}{css}</style>
  </head>
  <body>
    <div id="root" data-composition-id="{cid}" data-start="0" data-duration="{dur}" data-width="1080" data-height="1920" data-fps="{CFG['fps']}">
{body}
    </div>
    <script>
      const tl = gsap.timeline({{ paused: true }});
{js}
      window.__timelines["{cid}"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
"""

def words(lines, cls="h", size=110, group="g"):
    """lines: lista de lineas; cada linea lista de palabras ('*' al inicio/fin marca itálica acento)."""
    html, n = [], 0
    for ln in lines:
        ws = []
        for w in ln:
            em = w.startswith("*")
            t = w.strip("*")
            ws.append(f'<span class="w" id="{group}{n}">' + (f"<em>{t}</em>" if em else t) + "</span>")
            n += 1
        html.append('<span class="line">' + "".join(ws) + "</span>")
    return f'<div class="{cls}" id="{group}" style="font-size:{size}px;line-height:1.05">' + "".join(html) + "</div>", n

def in_words(group, n, at, step, y=64):
    return "".join(
        f'      tl.fromTo("#{group}{i}", {{ y: {y}, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.75, ease: "expo.out" }}, {b(at + step * i)});\n'
        for i in range(n))

def out(sel, at, d=0.3):
    return f'      tl.to("{sel}", {{ opacity: 0, y: -18, duration: {d}, ease: "power2.in" }}, {b(at)});\n'

def scene_dur(sid):
    a, z = CFG["scenes"][sid]
    return round((z - a) * BEAT, 4)

BLOCK = "#blk{position:absolute;left:72px;bottom:%dpx;width:936px}"
def write(name, cid, dur, body, css, js):
    (OUT / f"{name}.html").write_text(page(cid, dur, body, css, js))

TXT = CFG["text"]

# S1
t = TXT["s1"]; h, n = words([["Más", "que", "un"], ["*espacio.*"]], size=124)
write("s1", "s1", scene_dur("s1"), f"""
      <div id="blk" class="clip" data-start="0" data-duration="{scene_dur('s1')}" data-track-index="0">
        <div class="eyebrow" id="eb">Colonia Escalón · San Salvador</div>
        <div id="rule"></div>
        {h}
      </div>""", BLOCK % 380 + "#rule{width:72px;height:2px;background:var(--accent);margin:24px 0 28px;transform-origin:left}#eb{font-size:24px}",
  f'      tl.fromTo("#eb", {{ y: 30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }}, {b(t["eyebrowAt"])});\n'
  f'      tl.fromTo("#rule", {{ scaleX: 0 }}, {{ scaleX: 1, duration: 0.6, ease: "power2.inOut" }}, {b(t["eyebrowAt"] + 0.3)});\n'
  + in_words("g", n, t["wordsAt"], t["step"]) + out("#blk", t["outAt"], 0.35))

# S2
t = TXT["s2"]; h, n = words([["Te", "recibe", "un"], ["espacio", "*sereno.*"]], size=112)
write("s2", "s2", scene_dur("s2"), f'<div id="blk" class="clip" data-start="0" data-duration="{scene_dur("s2")}" data-track-index="0">{h}</div>',
      BLOCK % 380, in_words("g", n, t["wordsAt"], t["step"]) + out("#blk", t["outAt"], 0.35))

# S3: dos frases grandes, una por beat
t = TXT["s3"]
h1, n1 = words([["Tu"], ["puerta."]], size=196, group="a")
h2, n2 = words([["Tu"], ["*espacio.*"]], size=196, group="b")
write("s3", "s3", scene_dur("s3"), f"""
      <div id="p1" class="clip" data-start="0" data-duration="{scene_dur('s3')}" data-track-index="0">{h1}</div>
      <div id="p2" class="clip" data-start="0" data-duration="{scene_dur('s3')}" data-track-index="1">{h2}</div>""",
      "#p1,#p2{position:absolute;left:72px;bottom:380px;width:936px}",
      in_words("a", n1, t["phrase1At"], t["step"], 90) + out("#p1", t["p1OutAt"], 0.2)
      + in_words("b", n2, t["phrase2At"], t["step"], 90) + out("#p2", t["outAt"], 0.35))

# S4: texto pequeño
t = TXT["s4"]; h, n = words([["Oficinas", "privadas,"], ["cada", "una", "con", "acceso", "propio."]], size=54)
write("s4", "s4", scene_dur("s4"), f'<div id="blk" class="clip" data-start="0" data-duration="{scene_dur("s4")}" data-track-index="0">{h}</div>',
      BLOCK % 380, in_words("g", n, t["wordsAt"], t["step"], 30) + out("#blk", t["outAt"], 0.35))

# S5
t = TXT["s5"]; h, n = words([["Recibe", "a", "tus"], ["clientes"], ["*como*", "*se*", "*merecen.*"]], size=108)
write("s5", "s5", scene_dur("s5"), f'<div id="blk" class="clip" data-start="0" data-duration="{scene_dur("s5")}" data-track-index="0">{h}</div>',
      BLOCK % 380 + ".w+.w{margin-left:.24em}", in_words("g", n, t["wordsAt"], t["step"]) + out("#blk", t["outAt"], 0.35))

# S6: solo la frase final (la rafaga va sin texto)
t = TXT["s6"]; h, n = words([["Del", "otro", "lado,"], ["un", "*jardín.*"]], size=124)
write("s6", "s6", scene_dur("s6"), f'<div id="blk" class="clip" data-start="0" data-duration="{scene_dur("s6")}" data-track-index="0">{h}</div>',
      BLOCK % 380, in_words("g", n, t["wordsAt"], t["step"]) + out("#blk", t["outAt"], 0.3))

# End card
t = TXT["end"]; h, n = words([["Agenda", "tu", "*visita.*"]], size=104)
dur = scene_dur("end")
js = (f'      tl.fromTo("#logo", {{ scale: 0.96, opacity: 0 }}, {{ scale: 1, opacity: 1, duration: 0.9, ease: "power3.out" }}, {b(t["logoAt"])});\n')
for i, at in enumerate(t["wordsAt"]):
    js += f'      tl.fromTo("#g{i}", {{ y: 56, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.75, ease: "expo.out" }}, {b(at)});\n'
js += (f'      tl.fromTo("#btn", {{ y: 30, opacity: 0 }}, {{ y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }}, {b(t["buttonAt"])});\n'
       f'      tl.fromTo("#shine", {{ x: -180 }}, {{ x: 780, duration: 1.0, ease: "power2.inOut" }}, {b(t["shineAt"])});\n'
       f'      tl.fromTo("#foot", {{ opacity: 0 }}, {{ opacity: 1, duration: 0.7, ease: "power2.out" }}, {b(t["footerAt"])});\n')
write("end", "end", dur, f"""
      <div id="wrap" class="clip" data-start="0" data-duration="{dur}" data-track-index="0">
        <img id="logo" src="../assets/logo.png" alt="NODO 624" />
        <div id="hd" style="position:absolute;left:0;right:0;top:880px;text-align:center">{h}</div>
        <div id="btn"><span id="shine"></span><span class="bt">Agenda en nodo624.com</span></div>
        <div id="foot" class="small">Colonia Escalón · San Salvador</div>
      </div>""", """
#wrap{position:absolute;inset:0}
#logo{position:absolute;left:50%;top:400px;width:560px;margin-left:-280px;will-change:transform}
#btn{position:absolute;left:50%;top:1130px;transform:translateX(-50%);padding:34px 58px;border:2px solid var(--accent);border-radius:999px;overflow:hidden;white-space:nowrap}
#btn .bt{position:relative;font-family:"Work Sans",sans-serif;font-weight:600;font-size:28px;letter-spacing:.2em;text-transform:uppercase;color:var(--text)}
#shine{position:absolute;top:-10px;bottom:-10px;left:0;width:90px;background:linear-gradient(100deg,rgba(235,181,147,0),rgba(247,242,234,.55),rgba(235,181,147,0));transform:skewX(-18deg)}
#foot{position:absolute;left:0;right:0;top:1712px;text-align:center}
#hd .w+.w{margin-left:.22em}
""", js.replace('tl.fromTo("#btn", { y: 30, opacity: 0 }', 'tl.fromTo("#btn", { y: 30, opacity: 0, xPercent: -50 }').replace('{ y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }, %s);\n      tl.fromTo("#shine"' % b(t["buttonAt"]), '{ y: 0, opacity: 1, xPercent: -50, duration: 0.7, ease: "expo.out" }, %s);\n      tl.fromTo("#shine"' % b(t["buttonAt"])))

# Capa fija (1 frame)
write("fixed", "fixed", 0.1, """
      <div id="fx" class="clip" data-start="0" data-duration="0.1" data-track-index="0">
        <img id="logo" src="../assets/logo.png" alt="NODO 624" />
        <div id="f2" class="small">nodo624.com</div>
        <div id="f3">Imágenes con fines ilustrativas.</div>
      </div>""".replace("ilustrativas", "ilustrativos"), """
#fx{position:absolute;inset:0}
#logo{position:absolute;left:50%;margin-left:-130px;top:262px;width:260px;filter:drop-shadow(0 2px 12px rgba(27,24,21,.55))}
#f2{position:absolute;right:72px;top:1760px;font-size:21px}
#f3{position:absolute;left:72px;top:1760px;font-family:"Work Sans",sans-serif;font-weight:400;font-size:20px;letter-spacing:.04em;color:rgba(247,242,234,.8)}
""", "")
(ROOT / "index.html").write_text((OUT / "s1.html").read_text().replace("../assets/", "assets/"))
print("ok", [p.name for p in sorted(OUT.glob("*.html"))])
