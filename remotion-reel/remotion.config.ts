import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("png");
Config.setCodec("h264");
Config.setPixelFormat("yuv420p");
Config.setCrf(16);
Config.setX264Preset("slow");
Config.setOverwriteOutput(true);
// Sin red para descargar Chrome: se usa el Chromium preinstalado; WebGL por software (ANGLE/SwiftShader) para el parallax.
Config.setBrowserExecutable("/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell");
Config.setChromiumOpenGlRenderer("angle");
