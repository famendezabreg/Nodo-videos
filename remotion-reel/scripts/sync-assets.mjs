// Copia fotos oficiales, mapas de profundidad y capas de HyperFrames a public/ (no se versionan; se regeneran).
import { cpSync, existsSync, mkdirSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pub = join(root, "remotion-reel", "public");
for (const d of ["photos", "depth", "layers", "audio", "sfx"]) mkdirSync(join(pub, d), { recursive: true });

// fotos: si existe la version preparada (tools/enhance.py) se usa esa; si no, los originales
const photoDir = existsSync(join(root, "remotion-reel/assets-enhanced")) ? "remotion-reel/assets-enhanced" : "assets/images";
for (const f of readdirSync(join(root, photoDir))) cpSync(join(root, photoDir, f), join(pub, "photos", f));
for (const f of readdirSync(join(root, "remotion-reel/assets-depth")).filter((f) => f.endsWith(".png") && !f.startsWith("_"))) cpSync(join(root, "remotion-reel/assets-depth", f), join(pub, "depth", f));
// Capas de HyperFrames como secuencias PNG RGBA (alfa fiable dentro de Remotion)
for (const d of readdirSync(join(root, "hf-titles/renders/seq"))) if (d !== "fixed") cpSync(join(root, "hf-titles/renders/seq", d), join(pub, "layers", d), { recursive: true });
cpSync(join(root, "hf-titles/renders/seq/fixed/frame_000001.png"), join(pub, "layers/fixed.png"));
for (const [dir, out] of [["assets/audio", "audio"], ["assets/sfx", "sfx"]]) {
  const p = join(root, dir);
  if (existsSync(p)) for (const f of readdirSync(p).filter((f) => /\.(mp3|wav|m4a|aac|ogg)$/i.test(f))) cpSync(join(p, f), join(pub, out, f));
}
console.log("assets sincronizados");
