// Render final. Sin musica en /assets/audio solo se exporta la version sin musica (sin pista de audio).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync } from "node:fs";
mkdirSync("out", { recursive: true });
const list = (d) => (existsSync(d) ? readdirSync(d).filter((f) => /\.(mp3|wav|m4a|aac|ogg)$/i.test(f)) : []);
const music = list("public/audio")[0] ?? null;
const sfx = list("public/sfx");
const run = (args) => execFileSync("npx", ["remotion", ...args, "--concurrency=4"], { stdio: "inherit" });

if (music) {
  // efectos de sonido solo si hay archivos: whoosh en zooms/whips, riser antes del end card, impacto en el ultimo corte del gancho
  const pick = (re) => sfx.find((f) => re.test(f));
  const fx = [];
  const add = (re, at, volume) => { const f = pick(re); if (f) fx.push({ file: f, at, volume }); };
  add(/whoosh/i, 2.4, 0.35); add(/whoosh/i, 23, 0.35); add(/whoosh/i, 24, 0.35); add(/whoosh/i, 25, 0.35);
  add(/riser/i, 24.5, 0.3); add(/impact|impacto|hit/i, 3, 0.4);
  run(["render", "src/index.ts", "Reel", "out/nodo624_reel_impacto.mp4", "--props", JSON.stringify({ music, sfx: fx })]);
}
run(["render", "src/index.ts", "Reel", "out/nodo624_reel_impacto_sin_musica.mp4", "--muted", "--props", JSON.stringify({ music: null, sfx: [] })]);
run(["still", "src/index.ts", "Reel", "out/portada.png", "--frame=44", "--props", JSON.stringify({ music: null, sfx: [] })]);
