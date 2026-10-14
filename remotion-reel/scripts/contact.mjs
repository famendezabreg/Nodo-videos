// Stills de verificacion. Sin argumentos: los mismos 12 momentos del guion, reescalados a 72 BPM (x1.389).
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
mkdirSync("out/stills", { recursive: true });
const times = process.argv.slice(2).map(Number);
for (const t of times.length ? times : [1.1, 2.5, 4.2, 6.9, 8.6, 10.8, 13.9, 17.4, 19.7, 21.9, 24.3, 27.1]) {
  execFileSync("npx", ["remotion", "still", "src/index.ts", "Reel", `out/stills/still_${t.toFixed(1)}.png`, `--frame=${Math.min(824, Math.round(t * 30))}`], { stdio: "ignore" });
}
console.log("stills listos");
