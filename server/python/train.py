#!/usr/bin/env python3
"""
Train SVM (LinearSVC + TF-IDF) untuk klasifikasi sentimen.
- Baca dataset dari SQLite (data/app.db)
- Stratified split 80/20 (random_state=42)
- Tulis kolom split & predicted_sentiment & confidence kembali ke SQLite
- Simpan model ke data/models/svm.joblib
- Print JSON metrik di baris terakhir stdout
"""
import json, os, sqlite3, sys
from pathlib import Path

import joblib
import numpy as np
from sklearn.calibration import CalibratedClassifierCV
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix, f1_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "data" / "app.db"
MODEL_PATH = ROOT / "data" / "models" / "svm.joblib"
LABELS = ["positive", "neutral", "negative"]

def log(*a):
    print(*a, file=sys.stderr)

def main():
    con = sqlite3.connect(DB_PATH)
    con.row_factory = sqlite3.Row
    rows = con.execute(
        "SELECT id, text, processed_text, actual_sentiment FROM tweets "
        "WHERE actual_sentiment IS NOT NULL AND actual_sentiment != ''"
    ).fetchall()
    if not rows:
        print(json.dumps({"error": "no labeled rows"}))
        return 1

    ids = [r["id"] for r in rows]
    X = [(r["processed_text"] or r["text"] or "").strip() for r in rows]
    y = [r["actual_sentiment"] for r in rows]

    # Filter ke label yang dikenal
    keep = [i for i, lbl in enumerate(y) if lbl in LABELS]
    ids = [ids[i] for i in keep]
    X = [X[i] for i in keep]
    y = [y[i] for i in keep]

    log(f"dataset size: {len(X)}")

    ids_tr, ids_te, X_tr, X_te, y_tr, y_te = train_test_split(
        ids, X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=2, max_df=0.95, sublinear_tf=True)),
        ("clf", CalibratedClassifierCV(LinearSVC(C=1.0), cv=3)),  # calibrated supaya bisa predict_proba (confidence)
    ])
    pipe.fit(X_tr, y_tr)

    proba = pipe.predict_proba(X_te)
    classes = list(pipe.classes_)
    y_pred = [classes[i] for i in proba.argmax(axis=1)]
    confs = proba.max(axis=1).tolist()

    acc = accuracy_score(y_te, y_pred)
    f1 = f1_score(y_te, y_pred, labels=LABELS, average="macro", zero_division=0)
    cm = confusion_matrix(y_te, y_pred, labels=LABELS).tolist()
    report = classification_report(y_te, y_pred, labels=LABELS, output_dict=True, zero_division=0)
    per_class = [
        {
            "label": lbl,
            "precision": report[lbl]["precision"],
            "recall": report[lbl]["recall"],
            "f1": report[lbl]["f1-score"],
            "support": report[lbl]["support"],
        }
        for lbl in LABELS
    ]

    # Simpan model
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipe, "labels": LABELS}, MODEL_PATH)

    # Tulis split & prediksi ke SQLite
    cur = con.cursor()
    cur.execute("UPDATE tweets SET split=NULL, predicted_sentiment=NULL, confidence=NULL")
    cur.executemany(
        "UPDATE tweets SET split='train', predicted_sentiment=NULL, confidence=NULL WHERE id=?",
        [(i,) for i in ids_tr],
    )
    cur.executemany(
        "UPDATE tweets SET split='test', predicted_sentiment=?, confidence=? WHERE id=?",
        list(zip(y_pred, [round(c, 4) for c in confs], ids_te)),
    )
    con.commit()
    con.close()

    out = {
        "algo": "LinearSVC + TF-IDF (calibrated)",
        "accuracy": acc,
        "macro_f1": f1,
        "train_size": len(X_tr),
        "test_size": len(X_te),
        "labels": LABELS,
        "confusion": cm,
        "per_class": per_class,
    }
    print(json.dumps(out))
    return 0

if __name__ == "__main__":
    sys.exit(main())
