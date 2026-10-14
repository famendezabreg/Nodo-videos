#!/usr/bin/env python3
"""Detecta tempo y beats con librosa si hay una pista en assets/audio; si no, usa la rejilla fija de 100 BPM.
Salida: config/beats.json. Todos los tiempos del reel (config/timing.json) estan en beats, asi que al cambiar el BPM
(o conectar una pista real) basta con regenerar este archivo y 'bpm' en timing.json."""
import json, pathlib, sys
ROOT = pathlib.Path(__file__).resolve().parent.parent
cfg = json.loads((ROOT / "config/timing.json").read_text())
audio = [p for p in sorted((ROOT / "assets/audio").glob("*")) if p.suffix.lower() in {".mp3", ".wav", ".m4a", ".aac", ".ogg", ".flac"}]
total_beats = cfg["scenes"]["end"][1]
if audio:
    import librosa
    y, sr = librosa.load(audio[0], sr=None, mono=True)
    tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
    beats = librosa.frames_to_time(frames, sr=sr).tolist()
    bpm = float(tempo if not hasattr(tempo, "__len__") else tempo[0])
    out = {"source": audio[0].name, "bpm": round(bpm, 2), "beats": [round(b, 3) for b in beats]}
    print(f"{audio[0].name}: {bpm:.1f} BPM, {len(beats)} beats. Ajusta 'bpm' en config/timing.json a {round(bpm)} si difiere.")
else:
    bpm = cfg["bpm"]
    out = {"source": "rejilla fija (sin pista en assets/audio)", "bpm": bpm, "beats": [round(i * 60 / bpm, 3) for i in range(total_beats + 1)]}
    print(f"Sin musica: rejilla fija de {bpm} BPM ({60/bpm:.2f} s), {total_beats} beats = {total_beats*60/bpm:.1f} s")
(ROOT / "config/beats.json").write_text(json.dumps(out, indent=1))
