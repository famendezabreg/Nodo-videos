import React from "react";
import { Composition, getRemotionEnvironment } from "remotion";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadWorkSans } from "@remotion/google-fonts/WorkSans";
import { Reel, ReelProps } from "./Reel";
import { FPS, H, TOTAL_S, W } from "./timeline";

// Tipografias de marca. Los titulares animados viven en las capas de HyperFrames (con las mismas fuentes embebidas);
// en Studio se cargan desde Google Fonts para cualquier texto nativo. En render offline se omiten (no se usan).
if (getRemotionEnvironment().isStudio) {
  loadLora("normal", { weights: ["500"], subsets: ["latin"] });
  loadLora("italic", { weights: ["500"], subsets: ["latin"] });
  loadWorkSans("normal", { weights: ["400", "600"], subsets: ["latin"] });
}

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    durationInFrames={Math.round(TOTAL_S * FPS)}
    fps={FPS}
    width={W}
    height={H}
    defaultProps={{ audioFile: null } as ReelProps}
  />
);
