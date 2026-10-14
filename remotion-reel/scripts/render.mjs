// Render final: out/nodo624_reel.mp4, out/nodo624_reel_sin_musica.mp4 y out/nodo624_reel_portada.png
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, mkdirSync } from "node:fs";
mkdirSync("out", { recursive: true });
const audio = existsSync("public/audio") ? readdirSync("public/audio").find((f) => /\.(mp3|wav|m4a|aac)$/i.test(f)) ?? null : null;
const run = (args) => execFileSync("npx", ["remotion", ...args], { stdio: "inherit" });

if (audio) run(["render", "src/index.ts", "Reel", "out/nodo624_reel.mp4", "--props", JSON.stringify({ audioFile: audio })]);
else console.log("Sin musica en assets/audio: el MP4 principal sale sin audio.");
run(["render", "src/index.ts", "Reel", audio ? "out/nodo624_reel_sin_musica.mp4" : "out/nodo624_reel.mp4", "--muted", "--props", '{"audioFile":null}']);
if (!audio) run(["render", "src/index.ts", "Reel", "out/nodo624_reel_sin_musica.mp4", "--muted", "--props", '{"audioFile":null}']);
// Portada: frame del capitulo 1 con el titular ya completo (cap.1 entra en 2.0 s)
run(["still", "src/index.ts", "Reel", "out/nodo624_reel_portada.png", "--frame=108", "--props", '{"audioFile":null}']);
