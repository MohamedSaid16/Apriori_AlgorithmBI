import os
import json
import subprocess
import tempfile
from flask import Flask, request, jsonify
from flask_cors import CORS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APRIORI_BIN = os.path.join(ROOT, "apriori.exe")

app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "binary": os.path.exists(APRIORI_BIN)})


@app.route("/api/run", methods=["POST"])
def run_apriori():
    dataset_text = None
    min_support = 2

    if request.content_type and request.content_type.startswith("multipart/form-data"):
        if "dataset" in request.files:
            dataset_text = request.files["dataset"].read().decode("utf-8", errors="ignore")
        if "minSupport" in request.form:
            try:
                min_support = int(request.form["minSupport"])
            except ValueError:
                pass
    else:
        data = request.get_json(silent=True) or {}
        dataset_text = data.get("text")
        try:
            min_support = int(data.get("minSupport", 2))
        except (TypeError, ValueError):
            pass

    if not dataset_text or not dataset_text.strip():
        return jsonify({"error": "No dataset provided"}), 400
    if min_support < 1:
        min_support = 1

    tmp = tempfile.NamedTemporaryFile(mode="w", delete=False, suffix=".txt", encoding="utf-8")
    try:
        tmp.write(dataset_text)
        tmp.close()

        if not os.path.exists(APRIORI_BIN):
            return jsonify({"error": f"Binary not found at {APRIORI_BIN}"}), 500

        proc = subprocess.run(
            [APRIORI_BIN, tmp.name, str(min_support)],
            capture_output=True,
            text=True,
            timeout=30,
        )
        if proc.returncode != 0:
            return jsonify({"error": "Apriori failed", "stderr": proc.stderr}), 500

        try:
            result = json.loads(proc.stdout)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON from binary", "raw": proc.stdout}), 500

        return jsonify(result)
    finally:
        try:
            os.unlink(tmp.name)
        except OSError:
            pass


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
