"""
FastAPI application for AI Resume Analyzer
Serves trained NER and BERT models via REST API
"""

from fastapi import FastAPI, HTTPException, Depends

from fastapi.middleware.cors import CORSMiddleware
import spacy
from transformers import BertTokenizer, BertForSequenceClassification
import torch
from pathlib import Path
import sys
import os
from datetime import datetime
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
import os


# Load environment variables
load_dotenv()

# Add scripts directory to path
sys.path.append(str(Path(__file__).parent.parent / "scripts"))

from gap_analysis import perform_gap_analysis
from common_utils import load_pickle, extract_skills_keywords

# Import Pydantic models
from api.models import (
    ResumeInput,
    JobInput,
    ResumeJobInput,
    NEROutput,
    ClassificationOutput,
    GapAnalysisOutput,
    AnalyzeResumeOutput,
    HealthResponse,
    ChatInput,
    ChatInput,
    ChatResponse,
    SessionSchema,
    CreateSessionResponse
)
from api import db_models
from api.database import engine, get_db
from sqlalchemy.orm import Session
from fastapi import Depends


# Initialize FastAPI app
app = FastAPI(
    title="AI Resume Analyzer API",
    description="API for resume entity extraction, role classification, job matching, and interview copilot",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create Tables
db_models.Base.metadata.create_all(bind=engine)

# Globals

ner_model = None
bert_model = None
bert_tokenizer = None
label_mapping = None
device = None
openai_client = None


# -------------------- STARTUP --------------------


@app.on_event("startup")
async def load_models():
    global ner_model, bert_model, bert_tokenizer, label_mapping, device, openai_client


    print("🔹 Loading models...")

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🔹 Device: {device}")

    # NER
    ner_path = Path("d:/Project/models/ner_model_best")
    if ner_path.exists():
        ner_model = spacy.load(ner_path)
        print("✅ NER loaded")
    else:
        print("⚠️ NER model not found")

    # BERT
    bert_path = Path("d:/Project/models/bert_classifier_best")
    if bert_path.exists():
        bert_tokenizer = BertTokenizer.from_pretrained(bert_path)
        bert_model = BertForSequenceClassification.from_pretrained(bert_path)
        bert_model.to(device).eval()
        print("✅ BERT loaded")
    else:
        print("⚠️ BERT model not found")

    # Labels
    label_path = Path("d:/Project/data/label_mapping.pkl")
    if label_path.exists():
        label_mapping = load_pickle(label_path)
        print(f"✅ Label mapping loaded ({len(label_mapping)})")
    else:
        print("⚠️ Label mapping not found")

    # OpenRouter (OpenAI Compatible)
    api_key = os.getenv("OPENROUTER_API_KEY")
    if api_key:
        try:
            openai_client = OpenAI(
                base_url="https://openrouter.ai/api/v1",
                api_key=api_key,
            )
            print("✅ OpenRouter (OpenAI) initialized")
        except Exception as e:
            print(f"❌ Failed to init OpenRouter: {e}")
    else:
        print("⚠️ OPENROUTER_API_KEY missing")


# -------------------- BASIC --------------------

@app.get("/")
async def root():
    return {
        "message": "AI Resume Analyzer API",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "healthy",
        "models_loaded": {
            "ner": ner_model is not None,
            "bert": bert_model is not None,
            "openai": openai_client is not None
        }
    }


# -------------------- ANALYSIS --------------------

@app.post("/analyze-resume", response_model=AnalyzeResumeOutput)
async def analyze_resume(resume: ResumeInput):

    if not ner_model or not bert_model:
        raise HTTPException(status_code=503, detail="Models not loaded")

    try:
        doc = ner_model(resume.text)

        skills, experience, designations = [], [], []
        for ent in doc.ents:
            if ent.label_ == "SKILLS":
                skills.append(ent.text)
            elif ent.label_ == "EXPERIENCE":
                experience.append(ent.text)
            elif ent.label_ == "DESIGNATION":
                designations.append(ent.text)

        # Hybrid skill extraction
        keywords = extract_skills_keywords(resume.text)
        skills = list(set(skills + keywords))

        ner_output = NEROutput(
            entities=[],
            skills=skills,
            experience=experience,
            designations=designations
        )

        encoding = bert_tokenizer.encode_plus(
            resume.text,
            max_length=512,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )

        with torch.no_grad():
            outputs = bert_model(
                input_ids=encoding["input_ids"].to(device),
                attention_mask=encoding["attention_mask"].to(device)
            )
            probs = torch.softmax(outputs.logits, dim=1)

        top_prob, top_idx = torch.max(probs, dim=1)
        role = label_mapping[top_idx.item()]

        classification = ClassificationOutput(
            predicted_role=role,
            confidence=round(top_prob.item(), 4),
            top_predictions=[]
        )

        return AnalyzeResumeOutput(
            ner_results=ner_output,
            classification=classification
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# -------------------- MATCHING --------------------

@app.post("/match-job", response_model=GapAnalysisOutput)
async def match_job(data: ResumeJobInput):

    if not ner_model:
        raise HTTPException(status_code=503, detail="NER model not loaded")

    try:
        report = perform_gap_analysis(
            resume_text=data.resume_text,
            job_description=data.job_description,
            ner_model=ner_model
        )
        return report

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# -------------------- CHAT SESSIONS --------------------

@app.post("/chat/sessions", response_model=CreateSessionResponse)
def create_session(title: str = "New Interview", db: Session = Depends(get_db)):
    session = db_models.ChatSession(title=title)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/chat/sessions", response_model=list[SessionSchema])
def get_sessions(db: Session = Depends(get_db)):
    start_time = datetime.utcnow()
    # Sort by ID desc (newest first)
    sessions = db.query(db_models.ChatSession).order_by(db_models.ChatSession.id.desc()).all()
    print(f"Fetched {len(sessions)} sessions in {(datetime.utcnow() - start_time).total_seconds()}s")
    return sessions

@app.get("/chat/sessions/{session_id}", response_model=SessionSchema)
def get_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(db_models.ChatSession).filter(db_models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@app.delete("/chat/sessions/{session_id}")
def delete_session(session_id: int, db: Session = Depends(get_db)):
    session = db.query(db_models.ChatSession).filter(db_models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}


# -------------------- INTERVIEW COPILOT --------------------

@app.post("/interview-chat", response_model=ChatResponse)
async def interview_chat(chat_input: ChatInput, session_id: int = None, db: Session = Depends(get_db)):

    if not openai_client:
        raise HTTPException(status_code=503, detail="OpenRouter client not initialized")

    try:
        # Save User Message if session exists
        if session_id:
            user_msg = db_models.ChatMessage(session_id=session_id, sender="user", content=chat_input.message)
            db.add(user_msg)
            db.commit()

        # Convert history to OpenAI format
        messages = [
            {"role": "system", "content": "You are a helpful Interview Copilot. You help candidates practice technical interviews."}
        ]
        
        for msg in chat_input.history:
            role = "user" if msg.role == "user" else "assistant"
            messages.append({"role": role, "content": msg.content})

        user_content = chat_input.message
        if chat_input.context:
            user_content = f"Context:\n{chat_input.context}\n\nUser Question:\n{chat_input.message}"
            
        messages.append({"role": "user", "content": user_content})

        response = openai_client.chat.completions.create(
            model="meta-llama/llama-3.1-8b-instruct",
            messages=messages,
        )

        ai_message_text = response.choices[0].message.content

        # Save AI Message if session exists
        if session_id:
            ai_msg = db_models.ChatMessage(session_id=session_id, sender="ai", content=ai_message_text)
            db.add(ai_msg)
            db.commit()

        return ChatResponse(
            response=ai_message_text,
            confidence=0.85
        )

    except Exception as e:
        print(f"OpenRouter Error: {e}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")


# -------------------- ENTRY --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
