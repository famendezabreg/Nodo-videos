// Stills de verificacion. Sin argumentos: 0.8, 1.8, 3.0, 5.0, 6.2, 7.8, 10.0, 12.5, 14.2, 15.8, 17.5 y 19.5 s.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
mkdirSync("out/stills", { recursive: true });
const times = process.argv.slice(2).map(Number);
for (const t of times.length ? times : [0.8, 1.8, 3.0, 5.0, 6.2, 7.8, 10.0, 12.5, 14.2, 15.8, 17.5, 19.5]) {
  execFileSync("npx", ["remotion", "still", "src/index.ts", "Reel", `out/stills/still_${t.toFixed(1)}.png`, `--frame=${Math.min(593, Math.round(t * 30))}`], { stdio: "ignore" });
}
console.log("stills listos");
