import React from "react";
import { Composition, getRemotionEnvironment } from "remotion";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";
import { loadFont as loadWorkSans } from "@remotion/google-fonts/WorkSans";
import { Reel, ReelProps } from "./Reel";
import { FPS, H, TOTAL_FRAMES, W } from "./config";

// La tipografia animada vive en las capas de HyperFrames (con Lora/Work Sans embebidas). En Studio se cargan
// desde Google Fonts para cualquier texto nativo; en el render sin red se omiten (no se usan).
if (getRemotionEnvironment().isStudio) {
  loadLora("normal", { weights: ["500"], subsets: ["latin"] });
  loadLora("italic", { weights: ["500"], subsets: ["latin"] });
  loadWorkSans("normal", { weights: ["400", "600"], subsets: ["latin"] });
}

export const Root: React.FC = () => (
  <Composition id="Reel" component={Reel} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H}
    defaultProps={{ music: null, sfx: [] } as ReelProps} />
);
