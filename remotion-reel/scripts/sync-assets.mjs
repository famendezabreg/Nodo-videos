// Copia fotos oficiales y capas de HyperFrames a public/ (no se versionan; se regeneran).
import { cpSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const pub = join(root, "remotion-reel", "public");
mkdirSync(join(pub, "photos"), { recursive: true });
mkdirSync(join(pub, "layers"), { recursive: true });
mkdirSync(join(pub, "audio"), { recursive: true });

for (const f of readdirSync(join(root, "assets/images"))) cpSync(join(root, "assets/images", f), join(pub, "photos", f));
// Capas de HyperFrames como secuencias PNG RGBA (alfa fiable dentro de Remotion)
for (const d of readdirSync(join(root, "hf-titles/renders/seq"))) cpSync(join(root, "hf-titles/renders/seq", d), join(pub, "layers", d), { recursive: true });
cpSync(join(root, "hf-titles/renders/fixed/frame_000001.png"), join(pub, "layers/fixed.png"));
const audioDir = join(root, "assets/audio");
if (existsSync(audioDir)) for (const f of readdirSync(audioDir).filter((f) => /\.(mp3|wav|m4a|aac)$/i.test(f))) cpSync(join(audioDir, f), join(pub, "audio", f));
console.log("assets sincronizados");
