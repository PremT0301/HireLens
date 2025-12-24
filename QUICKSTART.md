# Quick Start Guide

## Step 1: Create Virtual Environment
```bash
cd d:/Project
python -m venv venv
.\venv\Scripts\activate
```

## Step 2: Install Dependencies
```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

## Step 3: Preprocess Data
```bash
# NER data preprocessing (~5 minutes)
python scripts/preprocess_ner_data.py

# BERT data preprocessing (~2 minutes)
python scripts/preprocess_bert_data.py
```

## Step 4: Train Models

### Option A: Train NER Model First
```bash
python scripts/train_ner_model.py
# Expected time: 2-4 hours
# Output: models/ner_model_best/
```

### Option B: Train BERT Model First
```bash
python scripts/train_bert_model.py
# Expected time: 4-8 hours (CPU), 1-2 hours (GPU)
# Output: models/bert_classifier_best/
```

**Recommendation**: Run both in parallel if you have sufficient resources, or train NER first as it's faster.

## Step 5: Test Models

### Test NER Model
```bash
python
>>> import spacy
>>> nlp = spacy.load("d:/Project/models/ner_model_best")
>>> doc = nlp("Experienced Python developer with 5 years in machine learning")
>>> for ent in doc.ents:
...     print(f"{ent.text} - {ent.label_}")
```

### Test BERT Classifier
```bash
python
>>> from transformers import BertTokenizer, BertForSequenceClassification
>>> import torch
>>> tokenizer = BertTokenizer.from_pretrained("d:/Project/models/bert_classifier_best")
>>> model = BertForSequenceClassification.from_pretrained("d:/Project/models/bert_classifier_best")
```

## Step 6: Start API Server
```bash
cd api
uvicorn main:app --reload
```

Visit: http://localhost:8000/docs

## Troubleshooting

### Virtual Environment Creation Failed
```bash
# Try with python3
python3 -m venv venv
```

### CUDA Out of Memory
Edit training scripts and reduce batch_size:
- `train_ner_model.py`: Change `BATCH_SIZE = 8` to `BATCH_SIZE = 4`
- `train_bert_model.py`: Change `batch_size=8` to `batch_size=4`

### SpaCy Model Download Failed
```bash
pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_sm-3.7.0/en_core_web_sm-3.7.0-py3-none-any.whl
```

## Next Steps

1. **Monitor Training**: Check `models/` directory for training history JSON files
2. **Evaluate Performance**: Review metrics in training output
3. **Integrate with .NET**: Use API endpoints from your ASP.NET Core backend
4. **Deploy**: Consider containerizing with Docker for production

## Expected Results

- **NER Model F1**: 0.75-0.85
- **BERT Accuracy**: 0.85-0.92
- **API Response Time**: < 2 seconds

## Step 7: Launch Backend (.NET)
```bash
cd d:/Project/backend/SmartHireAI.Backend
dotnet restore
dotnet ef database update
dotnet run
```

## Step 8: Launch Frontend (React)
```bash
cd d:/Project/frontend
npm install
npm run dev
```
