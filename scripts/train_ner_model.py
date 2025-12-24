"""
Train SpaCy NER model for resume entity extraction
Extracts: SKILLS, EXPERIENCE, DESIGNATION
"""

# =========================
# 🔥 MEMORY & CPU SAFETY
# =========================
import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"

import spacy
spacy.require_cpu()

from spacy.training import Example
from spacy.util import minibatch, compounding
from pathlib import Path
import random
import sys
from tqdm import tqdm
import json

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))
from common_utils import ensure_dir


def train_ner_model(
    train_data_path: str,
    val_data_path: str,
    output_dir: str,
    n_iter: int = 15,
    dropout: float = 0.2,
    batch_size: int = 8
):
    """
    Train SpaCy NER model
    """

    print("=" * 60)
    print("TRAINING SPACY NER MODEL")
    print("=" * 60)

    # -------------------------------------------------
    # 1️⃣ Initialize SpaCy model
    # -------------------------------------------------
    print("\nInitializing SpaCy model...")

    # OPTION A (recommended – better accuracy, uncomment if needed)
    # nlp = spacy.load("en_core_web_sm")

    # OPTION B (from scratch)
    nlp = spacy.blank("en")

    # -------------------------------------------------
    # 2️⃣ Add NER pipeline
    # -------------------------------------------------
    print("Adding NER pipeline component...")
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner", last=True)
    else:
        ner = nlp.get_pipe("ner")

    labels = ["SKILLS", "EXPERIENCE", "DESIGNATION"]
    print(f"\nAdding entity labels: {labels}")
    for label in labels:
        ner.add_label(label)

    # -------------------------------------------------
    # 3️⃣ Load DocBin data
    # -------------------------------------------------
    print(f"\nLoading training data from {train_data_path}...")
    from spacy.tokens import DocBin

    train_docs = list(DocBin().from_disk(train_data_path).get_docs(nlp.vocab))
    print(f"Loaded {len(train_docs)} training documents")

    print(f"Loading validation data from {val_data_path}...")
    val_docs = list(DocBin().from_disk(val_data_path).get_docs(nlp.vocab))
    print(f"Loaded {len(val_docs)} validation documents")

    # -------------------------------------------------
    # 4️⃣ Convert to Examples
    # -------------------------------------------------
    print("\nConverting to training examples...")

    train_examples = [
        Example.from_dict(
            doc,
            {"entities": [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]}
        )
        for doc in train_docs
    ]

    val_examples = [
        Example.from_dict(
            doc,
            {"entities": [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]}
        )
        for doc in val_docs
    ]

    print(f"Created {len(train_examples)} training examples")
    print(f"Created {len(val_examples)} validation examples")

    # -------------------------------------------------
    # 5️⃣ Initialize optimizer
    # -------------------------------------------------
    print("\nInitializing optimizer...")
    optimizer = nlp.initialize(lambda: train_examples)

    # -------------------------------------------------
    # 6️⃣ Training loop
    # -------------------------------------------------
    print(f"\n{'=' * 60}")
    print(f"STARTING TRAINING - {n_iter} ITERATIONS")
    print(f"{'=' * 60}")

    best_score = 0.0
    losses_history = []
    scores_history = []

    for iteration in range(n_iter):
        print(f"\nIteration {iteration + 1}/{n_iter}")

        random.shuffle(train_examples)
        losses = {}

        batches = minibatch(
            train_examples,
            size=compounding(2.0, batch_size, 1.001)
        )

        for batch in tqdm(batches, desc="Training batches"):
            nlp.update(
                batch,
                drop=dropout,
                sgd=optimizer,
                losses=losses
            )

        train_loss = losses.get("ner", 0.0)
        losses_history.append(float(train_loss))
        print(f"Training Loss: {train_loss:.4f}")

        # -------------------------------------------------
        # 7️⃣ Validation
        # -------------------------------------------------
        if (iteration + 1) % 5 == 0 or iteration == n_iter - 1:
            print("\nEvaluating on validation set...")
            scores = nlp.evaluate(val_examples)

            ents_f = float(scores.get("ents_f", 0.0))
            ents_p = float(scores.get("ents_p", 0.0))
            ents_r = float(scores.get("ents_r", 0.0))

            scores_history.append({
                "iteration": iteration + 1,
                "f1": ents_f,
                "precision": ents_p,
                "recall": ents_r
            })

            print(f"Validation F1: {ents_f:.4f}")
            print(f"Validation Precision: {ents_p:.4f}")
            print(f"Validation Recall: {ents_r:.4f}")

            if ents_f > best_score:
                best_score = ents_f
                print(f"🔥 New best F1: {best_score:.4f} – Saving model")

                best_path = Path(output_dir) / "ner_model_best"
                ensure_dir(best_path)
                nlp.to_disk(best_path)

    # -------------------------------------------------
    # 8️⃣ Save final model & history
    # -------------------------------------------------
    print(f"\n{'=' * 60}")
    print("TRAINING COMPLETE")
    print(f"{'=' * 60}")
    print(f"Best Validation F1: {best_score:.4f}")

    final_path = Path(output_dir) / "ner_model_final"
    ensure_dir(final_path)
    nlp.to_disk(final_path)

    history_path = Path(output_dir) / "ner_training_history.json"
    with open(history_path, "w") as f:
        json.dump(
            {
                "losses": losses_history,
                "scores": scores_history,
                "best_f1": float(best_score)
            },
            f,
            indent=2
        )

    print(f"Final model saved to: {final_path}")
    print(f"Training history saved to: {history_path}")

    return nlp, best_score


def main():
    TRAIN_DATA = "d:/Project/data/ner_train.spacy"
    VAL_DATA = "d:/Project/data/ner_val.spacy"
    OUTPUT_DIR = "d:/Project/models"

    N_ITER = 15
    DROPOUT = 0.2
    BATCH_SIZE = 6

    if not Path(TRAIN_DATA).exists():
        print("ERROR: Training data not found.")
        return

    if not Path(VAL_DATA).exists():
        print("ERROR: Validation data not found.")
        return

    model, best_score = train_ner_model(
        TRAIN_DATA,
        VAL_DATA,
        OUTPUT_DIR,
        n_iter=N_ITER,
        dropout=DROPOUT,
        batch_size=BATCH_SIZE
    )

    print("\n" + "=" * 60)
    print("TRAINING SUMMARY")
    print("=" * 60)
    print(f"Best F1 Score: {best_score:.4f}")
    print(f"Models saved in: {OUTPUT_DIR}")
    print("=" * 60)


if __name__ == "__main__":
    main()
