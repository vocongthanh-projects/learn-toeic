"""
One-time/offline batch generator for Listening (Part 1-4) audio clips.

Not part of the app build — this is a heavy, separate Python tool (MeloTTS + torch)
run manually on a dev machine to (re)generate static MP3s checked into public/audio/listening/.
Re-run whenever new Listening questions/passages are added to the question bank; it skips
any clip whose output file already exists, so it's safe to re-run incrementally.

Setup (once):
    python3.11 -m venv .venv
    ./.venv/bin/pip install --upgrade pip "setuptools<81"
    git clone https://github.com/myshell-ai/MeloTTS.git /tmp/MeloTTS
    ./.venv/bin/pip install -e /tmp/MeloTTS
    ./.venv/bin/python -m unidic download
    ./.venv/bin/python -c "import nltk; nltk.download('averaged_perceptron_tagger_eng')"

Run:
    ./.venv/bin/python scripts/generate-listening-audio.py
"""

import json
import os
import random
import re

from melo.api import TTS
from pydub import AudioSegment

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUESTIONS_PATH = os.path.join(PROJECT_ROOT, "src/data/question_bank/questions.json")
PASSAGES_PATH = os.path.join(PROJECT_ROOT, "src/data/question_bank/passages.json")
OUT_DIR = os.path.join(PROJECT_ROOT, "public/audio/listening")
TMP_DIR = "/tmp/listening_audio_gen"

# TOEIC uses US/British/Australian/Canadian narrators. MeloTTS (Apache-2.0, local, free)
# only ships US/British/Australian voices — Canadian isn't separately represented and just
# falls out of the random US/British/Australian pick like any other question.
ACCENTS = ["EN-US", "EN-BR", "EN-AU"]

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(TMP_DIR, exist_ok=True)

random.seed(42)  # reproducible accent assignment across re-runs

print("Loading MeloTTS model...")
model = TTS(language="EN", device="cpu")
speaker_ids = model.hps.data.spk2id


def synth(text: str, accent: str, out_wav: str):
    model.tts_to_file(text, speaker_ids[accent], out_wav, speed=1.0)


def synth_single(text: str, accent: str, mp3_path: str):
    tmp_wav = os.path.join(TMP_DIR, "single.wav")
    synth(text, accent, tmp_wav)
    seg = AudioSegment.from_wav(tmp_wav)
    seg.export(mp3_path, format="mp3", bitrate="64k")


OPTION_LABEL_RE = re.compile(r"\b([ABCD])\.\s+")


def synth_part1_options(text: str, accent: str, mp3_path: str):
    # Split "A. sentence B. sentence C. sentence D. sentence" into 4 separate statements and
    # synthesize each on its own, with a real pause between — one continuous MeloTTS call over
    # all 4 ran them together with barely a breath in between, which read as an unnaturally
    # fast, run-on wall of speech compared to real Part 1 audio (which pauses ~1s between options).
    parts = OPTION_LABEL_RE.split(text)
    options = []
    i = 1
    while i < len(parts) - 1:
        label = parts[i]
        option_text = parts[i + 1].strip()
        if option_text:
            options.append((label, option_text))
        i += 2

    if not options:
        synth_single(text, accent, mp3_path)
        return

    combined = AudioSegment.silent(duration=300)
    pause = AudioSegment.silent(duration=900)
    for idx, (label, option_text) in enumerate(options):
        tmp_wav = os.path.join(TMP_DIR, f"p1opt_{idx}.wav")
        synth(f"{label}. {option_text}", accent, tmp_wav)
        seg = AudioSegment.from_wav(tmp_wav)
        combined += seg
        if idx < len(options) - 1:
            combined += pause

    combined.export(mp3_path, format="mp3", bitrate="64k")


SPEAKER_TURN_RE = re.compile(r"([WM]):\s*")


def synth_dialogue(text: str, mp3_path: str):
    # Split "W: ... M: ... W: ..." into (label, text) turns
    parts = SPEAKER_TURN_RE.split(text)
    turns = []
    i = 1
    while i < len(parts) - 1:
        label = parts[i]
        turn_text = parts[i + 1].strip()
        if turn_text:
            turns.append((label, turn_text))
        i += 2

    if not turns:
        # Not actually a dialogue (no W:/M: labels found) — treat as a single talk
        accent = random.choice(ACCENTS)
        synth_single(text, accent, mp3_path)
        return

    labels = sorted(set(t[0] for t in turns))
    accent_pool = random.sample(ACCENTS, k=min(len(labels), len(ACCENTS)))
    label_to_accent = {label: accent_pool[idx % len(accent_pool)] for idx, label in enumerate(labels)}

    combined = AudioSegment.silent(duration=200)
    pause = AudioSegment.silent(duration=450)
    for idx, (label, turn_text) in enumerate(turns):
        accent = label_to_accent[label]
        tmp_wav = os.path.join(TMP_DIR, f"turn_{idx}.wav")
        synth(turn_text, accent, tmp_wav)
        seg = AudioSegment.from_wav(tmp_wav)
        combined += seg + pause

    combined.export(mp3_path, format="mp3", bitrate="64k")


def main():
    with open(QUESTIONS_PATH, "r", encoding="utf-8") as f:
        questions = json.load(f)
    with open(PASSAGES_PATH, "r", encoding="utf-8") as f:
        passages = json.load(f)

    qmap = {q["id"]: q for q in questions}

    generated = 0
    failed = []

    # --- Part 1 & 2: standalone questions (no shared passage) ---
    standalone = [q for q in questions if q["part"] in (1, 2) and q.get("transcript")]
    print(f"Generating {len(standalone)} standalone Part 1/2 clips...")
    for i, q in enumerate(standalone):
        mp3_path = os.path.join(OUT_DIR, f"{q['id']}.mp3")
        rel_url = f"/audio/listening/{q['id']}.mp3"
        if os.path.exists(mp3_path):
            q["audioUrl"] = rel_url
            continue
        try:
            accent = random.choice(ACCENTS)
            if q["part"] == 1:
                synth_part1_options(q["transcript"], accent, mp3_path)
            else:
                synth_single(q["transcript"], accent, mp3_path)
            q["audioUrl"] = rel_url
            generated += 1
        except Exception as e:
            failed.append((q["id"], str(e)))
        if (i + 1) % 20 == 0:
            print(f"  ...{i + 1}/{len(standalone)}")

    # --- Part 3 & 4: one clip per passage (dialogue for Part 3, talk for Part 4) ---
    grouped_passages = [
        p for p in passages
        if p.get("transcript") and qmap.get(p["questionIds"][0], {}).get("part") in (3, 4)
    ]
    print(f"Generating {len(grouped_passages)} Part 3/4 passage clips...")
    for i, p in enumerate(grouped_passages):
        mp3_path = os.path.join(OUT_DIR, f"{p['id']}.mp3")
        rel_url = f"/audio/listening/{p['id']}.mp3"
        part = qmap.get(p["questionIds"][0], {}).get("part")
        if os.path.exists(mp3_path):
            p["audioUrl"] = rel_url
            for qid in p["questionIds"]:
                if qid in qmap:
                    qmap[qid]["audioUrl"] = rel_url
            continue
        try:
            if part == 3:
                synth_dialogue(p["transcript"], mp3_path)
            else:
                accent = random.choice(ACCENTS)
                synth_single(p["transcript"], accent, mp3_path)
            p["audioUrl"] = rel_url
            for qid in p["questionIds"]:
                if qid in qmap:
                    qmap[qid]["audioUrl"] = rel_url
            generated += 1
        except Exception as e:
            failed.append((p["id"], str(e)))
        if (i + 1) % 10 == 0:
            print(f"  ...{i + 1}/{len(grouped_passages)}")

    with open(QUESTIONS_PATH, "w", encoding="utf-8") as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    with open(PASSAGES_PATH, "w", encoding="utf-8") as f:
        json.dump(passages, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Generated {generated} new clips. Failed: {len(failed)}")
    for fid, err in failed:
        print(f"  FAILED {fid}: {err}")


if __name__ == "__main__":
    main()
