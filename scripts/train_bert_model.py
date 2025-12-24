"""
Train BERT model for resume role classification
Fine-tunes bert-base-uncased on resume categories
"""

# =========================
# 🔥 MEMORY & DEVICE SAFETY
# =========================
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import (
    BertTokenizer,
    BertForSequenceClassification,
    get_linear_schedule_with_warmup
)
from torch.optim import AdamW
from sklearn.metrics import classification_report
import pandas as pd
import numpy as np
from pathlib import Path
import sys
from tqdm import tqdm
import json

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))
from common_utils import load_pickle, ensure_dir, get_device, calculate_metrics


# =========================
# 📦 DATASET
# =========================
class ResumeDataset(Dataset):
    """PyTorch Dataset for resume classification"""

    def __init__(self, texts, labels, tokenizer, max_length=512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.texts)

    def __getitem__(self, idx):
        encoding = self.tokenizer(
            str(self.texts[idx]),
            max_length=self.max_length,
            padding="max_length",
            truncation=True,
            return_tensors="pt"
        )

        return {
            "input_ids": encoding["input_ids"].squeeze(0),
            "attention_mask": encoding["attention_mask"].squeeze(0),
            "labels": torch.tensor(self.labels[idx], dtype=torch.long),
        }


# =========================
# 🔁 TRAIN ONE EPOCH
# =========================
def train_epoch(model, data_loader, optimizer, scheduler, device):
    model.train()
    losses = []
    correct = 0
    total = 0

    for batch in tqdm(data_loader, desc="Training"):
        optimizer.zero_grad()

        input_ids = batch["input_ids"].to(device)
        attention_mask = batch["attention_mask"].to(device)
        labels = batch["labels"].to(device)

        outputs = model(
            input_ids=input_ids,
            attention_mask=attention_mask,
            labels=labels
        )

        loss = outputs.loss
        logits = outputs.logits

        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
        optimizer.step()
        scheduler.step()

        preds = torch.argmax(logits, dim=1)
        correct += (preds == labels).sum().item()
        total += labels.size(0)

        losses.append(loss.item())

    return float(np.mean(losses)), float(correct / total)


# =========================
# 🔍 EVALUATION
# =========================
def eval_model(model, data_loader, device):
    model.eval()
    losses = []
    preds, labels = [], []

    with torch.no_grad():
        for batch in tqdm(data_loader, desc="Evaluating"):
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            y = batch["labels"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=y
            )

            losses.append(outputs.loss.item())
            preds.extend(torch.argmax(outputs.logits, dim=1).cpu().numpy())
            labels.extend(y.cpu().numpy())

    metrics = calculate_metrics(np.array(labels), np.array(preds))
    metrics["loss"] = float(np.mean(losses))

    return metrics, preds, labels


# =========================
# 🚀 TRAIN BERT CLASSIFIER
# =========================
def train_bert_classifier(
    train_df,
    val_df,
    test_df,
    label_mapping,
    output_dir,
    model_name="bert-base-uncased",
    max_length=512,
    batch_size=8,
    epochs=5,
    learning_rate=2e-5
):
    print("=" * 60)
    print("TRAINING BERT CLASSIFIER")
    print("=" * 60)

    device = get_device()
    print(f"\nUsing device: {device}")

    tokenizer = BertTokenizer.from_pretrained(model_name)

    train_dataset = ResumeDataset(
        train_df["text"].values,
        train_df["label_encoded"].values,
        tokenizer,
        max_length
    )
    val_dataset = ResumeDataset(
        val_df["text"].values,
        val_df["label_encoded"].values,
        tokenizer,
        max_length
    )
    test_dataset = ResumeDataset(
        test_df["text"].values,
        test_df["label_encoded"].values,
        tokenizer,
        max_length
    )

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size)
    test_loader = DataLoader(test_dataset, batch_size=batch_size)

    model = BertForSequenceClassification.from_pretrained(
        model_name,
        num_labels=len(label_mapping)
    ).to(device)

    optimizer = AdamW(model.parameters(), lr=learning_rate)
    total_steps = len(train_loader) * epochs
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )

    best_val_acc = 0.0
    history = {
        "train_loss": [],
        "train_acc": [],
        "val_loss": [],
        "val_acc": [],
        "val_f1": []
    }

    for epoch in range(epochs):
        print(f"\nEpoch {epoch + 1}/{epochs}")

        train_loss, train_acc = train_epoch(
            model, train_loader, optimizer, scheduler, device
        )

        val_metrics, _, _ = eval_model(model, val_loader, device)

        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"Val Loss: {val_metrics['loss']:.4f}")
        print(f"Val Acc: {val_metrics['accuracy']:.4f}")
        print(f"Val F1: {val_metrics['f1']:.4f}")

        history["train_loss"].append(train_loss)
        history["train_acc"].append(train_acc)
        history["val_loss"].append(val_metrics["loss"])
        history["val_acc"].append(val_metrics["accuracy"])
        history["val_f1"].append(val_metrics["f1"])

        if val_metrics["accuracy"] > best_val_acc:
            best_val_acc = val_metrics["accuracy"]
            best_path = Path(output_dir) / "bert_classifier_best"
            ensure_dir(best_path)
            model.save_pretrained(best_path)
            tokenizer.save_pretrained(best_path)

    # =========================
    # 🧪 TEST EVALUATION
    # =========================
    test_metrics, test_preds, test_labels = eval_model(model, test_loader, device)

    print("\nClassification Report:")
    print(classification_report(
        test_labels,
        test_preds,
        target_names=[label_mapping[i] for i in range(len(label_mapping))]
    ))

    final_path = Path(output_dir) / "bert_classifier_final"
    ensure_dir(final_path)
    model.save_pretrained(final_path)
    tokenizer.save_pretrained(final_path)

    # =========================
    # 💾 SAVE HISTORY & RESULTS
    # =========================
    with open(Path(output_dir) / "bert_training_history.json", "w") as f:
        json.dump({k: [float(x) for x in v] for k, v in history.items()}, f, indent=2)

    with open(Path(output_dir) / "bert_test_results.json", "w") as f:
        json.dump(
            {
                "test_metrics": {k: float(v) for k, v in test_metrics.items()},
                "best_val_accuracy": float(best_val_acc)
            },
            f,
            indent=2
        )

    return model, test_metrics


# =========================
# 🧠 MAIN
# =========================
def main():
    DATA_DIR = "d:/Project/data"
    OUTPUT_DIR = "d:/Project/models"

    train_df = load_pickle(Path(DATA_DIR) / "bert_train.pkl")
    val_df = load_pickle(Path(DATA_DIR) / "bert_val.pkl")
    test_df = load_pickle(Path(DATA_DIR) / "bert_test.pkl")
    label_mapping = load_pickle(Path(DATA_DIR) / "label_mapping.pkl")

    model, test_metrics = train_bert_classifier(
        train_df, val_df, test_df, label_mapping, OUTPUT_DIR
    )

    print("\nTRAINING COMPLETE")
    print(f"Test Accuracy: {test_metrics['accuracy']:.4f}")
    print(f"Test F1: {test_metrics['f1']:.4f}")


if __name__ == "__main__":
    main()
