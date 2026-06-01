#!/usr/bin/env python3
"""Predict sentimen untuk 1 teks. Usage: predict.py "<text>" """
import json, sys
from pathlib import Path
import joblib

MODEL_PATH = Path(__file__).resolve().parent.parent / "data" / "models" / "svm.joblib"

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: predict.py <text>"})); return 1
    text = sys.argv[1]
    bundle = joblib.load(MODEL_PATH)
    pipe = bundle["pipeline"]
    proba = pipe.predict_proba([text])[0]
    classes = list(pipe.classes_)
    i = int(proba.argmax())
    print(json.dumps({"sentiment": classes[i], "confidence": float(proba[i])}))
    return 0

if __name__ == "__main__":
    sys.exit(main())
