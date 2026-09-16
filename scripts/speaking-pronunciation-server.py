"""
Tiny local HTTP wrapper around the `openpronounce` Python library, since it only ships a
CLI/library interface (no built-in server). Used only by the Speaking feature's Task 1
(Read Aloud), where there is a known reference text to score pronunciation against.

Not part of the app build — a separate local tool the user runs alongside `npm run dev`,
`ollama serve`, and `whisper-server`. Never reachable from the public deployed site.

Setup (once):
    python3.11 -m venv .venv-pronounce
    ./.venv-pronounce/bin/pip install torch --index-url https://download.pytorch.org/whl/cpu
    ./.venv-pronounce/bin/pip install openpronounce flask
    brew install espeak-ng   # system dependency openpronounce needs for phoneme alignment

Run:
    ./.venv-pronounce/bin/python scripts/speaking-pronunciation-server.py
Listens on http://127.0.0.1:8091
"""

import tempfile
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# CORS: allow the Vite dev origin to call this from the browser.
@app.after_request
def add_cors_headers(resp):
    resp.headers['Access-Control-Allow-Origin'] = '*'
    resp.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
    resp.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return resp


@app.route('/pronunciation', methods=['OPTIONS'])
def preflight():
    return '', 204


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})


@app.route('/pronunciation', methods=['POST'])
def pronunciation():
    if 'audio' not in request.files:
        return jsonify({'error': 'missing "audio" file field'}), 400
    text = request.form.get('text', '').strip()
    if not text:
        return jsonify({'error': 'missing "text" field'}), 400

    audio_file = request.files['audio']
    suffix = os.path.splitext(audio_file.filename or 'audio.webm')[1] or '.webm'

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        from openpronounce import audio as op_audio, speech as op_speech
        sound = op_audio.load(tmp_path)
        result = op_speech.compare_audio_with_text(sound, text, lang='en')
        result.pop('prosody', None)  # not needed by the app, keeps the response small
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.unlink(tmp_path)


if __name__ == '__main__':
    print('Loading OpenPronounce model (first call may still be slow)...')
    app.run(host='127.0.0.1', port=8091)
