// Stills de verificacion en 1.0, 3.0, 6.0, 10.0, 13.5, 18.5 y 21.5 s.
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
mkdirSync("out/stills", { recursive: true });
for (const t of [1.0, 3.0, 6.0, 10.0, 13.5, 18.5, 21.5]) {
  execFileSync("npx", ["remotion", "still", "src/index.ts", "Reel", `out/stills/still_${t.toFixed(1)}.png`, `--frame=${Math.round(t * 30)}`, "--props", '{"audioFile":null}'], { stdio: "inherit" });
}
