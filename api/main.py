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
from openai import OpenAI
from dotenv import load_dotenv
import os
import re
from typing import List, Optional


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

    ChatResponse,
    SessionSchema,
    CreateSessionResponse,
    RankingInput,
    RankingOutput
)
from api import db_models
from api.database import engine, get_db
from sqlalchemy.orm import Session
from fastapi import Depends, Query
from api.ranking import calculate_ranking_score, SuitabilityLabels


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
    base_dir = Path(__file__).parent.parent
    ner_path = base_dir / "models/ner_model_best"
    if ner_path.exists():
        ner_model = spacy.load(ner_path)
        print("✅ NER loaded")
    else:
        print("⚠️ NER model not found")

    # BERT
    bert_path = base_dir / "models/bert_classifier_best"
    if bert_path.exists():
        bert_tokenizer = BertTokenizer.from_pretrained(bert_path)
        bert_model = BertForSequenceClassification.from_pretrained(bert_path)
        bert_model.to(device).eval()
        print("✅ BERT loaded")
    else:
        print("⚠️ BERT model not found")

    # Labels
    label_path = base_dir / "data/label_mapping.pkl"
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

def calculate_ats_score(text: str, skills: list, role: str) -> dict:
    score = 0
    feedback = []
    
    # 1. Length Check (20 pts)
    word_count = len(text.split())
    if word_count < 200:
        score += 5
        feedback.append("Resume is too short. Aim for 400-1000 words.")
    elif word_count > 1500:
        score += 10
        feedback.append("Resume is quite long. Ensure it is concise.")
    else:
        score += 20
        feedback.append("Optimal resume length.")
        
    # 2. Structure Check (30 pts)
    sections = {
        "Experience": ["experience", "employment", "work history"],
        "Education": ["education", "academic", "qualification"],
        "Skills": ["skills", "technologies", "competencies"],
        "Projects": ["projects", "personal projects"],
        "Contact": ["email", "phone", "contact"] # Heuristic check via regex later for actual content
    }
    
    text_lower = text.lower()
    sections_found = 0
    for section, keywords in sections.items():
        if any(k in text_lower for k in keywords):
            sections_found += 1
        else:
            feedback.append(f"Missing '{section}' section or header.")
            
    # Max 30 points for sections (6 pts each for 5 sections)
    structure_score = min(30, sections_found * 6)
    score += structure_score
    
    if sections_found == 5:
        feedback.append("Good structure with all key sections.")
    
    # 3. Skill Density & Relevance (30 pts)
    unique_skills = len(set(skills))
    if unique_skills < 5:
        score += 5
        feedback.append("Low skill count. Add more relevant technical skills.")
    elif unique_skills < 10:
        score += 15
        feedback.append("Moderate skill representation.")
    else:
        score += 30
        feedback.append(f"Strong skill profile with {unique_skills} skills detected.")
        
    # 4. Keyword/Role Formatting (20 pts)
    # Simple check: if predicted role matches keywords or simple formatting checks
    email_pattern = r"[\w\.-]+@[\w\.-]+"
    phone_pattern = r"\b\d{10,}\b|\(\d{3}\)"
    
    contact_score = 0
    if re.search(email_pattern, text):
        contact_score += 10
    else:
        feedback.append("Email address not detected.")
        
    if re.search(phone_pattern, text):
        contact_score += 10
    else:
        feedback.append("Phone number not detected.")
        
    score += contact_score

    # Final Adjustment
    final_score = min(100, max(0, score))
    
    level = "Low"
    if final_score >= 80:
        level = "High"
    elif final_score >= 51:
        level = "Medium"
        
    return {
        "score": final_score,
        "level": level,
        "feedback": feedback
    }

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
        
        # Calculate ATS Score
        ats_result = calculate_ats_score(resume.text, skills, role)

        return AnalyzeResumeOutput(
            ner_results=ner_output,
            classification=classification,
            ats_score=ats_result["score"],
            ats_level=ats_result["level"],
            feedback=ats_result["feedback"]
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
def create_session(title: str = "New Interview", applicant_id: str = None, db: Session = Depends(get_db)):
    if not applicant_id:
        raise HTTPException(status_code=400, detail="applicant_id is required")
    
    session = db_models.ChatSession(title=title, applicant_id=applicant_id)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@app.get("/chat/sessions", response_model=list[SessionSchema])
def get_sessions(applicant_id: str = None, db: Session = Depends(get_db)):
    if not applicant_id:
        raise HTTPException(status_code=400, detail="applicant_id is required")
    
    start_time = datetime.utcnow()
    # Filter by applicant_id and sort by ID desc (newest first)
    sessions = db.query(db_models.ChatSession).filter(
        db_models.ChatSession.applicant_id == applicant_id
    ).order_by(db_models.ChatSession.id.desc()).all()
    print(f"Fetched {len(sessions)} sessions for applicant {applicant_id} in {(datetime.utcnow() - start_time).total_seconds()}s")
    return sessions

@app.get("/chat/sessions/{session_id}", response_model=SessionSchema)
def get_session(session_id: int, applicant_id: str = None, db: Session = Depends(get_db)):
    if not applicant_id:
        raise HTTPException(status_code=400, detail="applicant_id is required")
    
    session = db.query(db_models.ChatSession).filter(db_models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify ownership
    if session.applicant_id != applicant_id:
        raise HTTPException(status_code=403, detail="Access denied: Session belongs to another applicant")
    
    return session

@app.delete("/chat/sessions/{session_id}")
def delete_session(session_id: int, applicant_id: str = None, db: Session = Depends(get_db)):
    if not applicant_id:
        raise HTTPException(status_code=400, detail="applicant_id is required")
    
    session = db.query(db_models.ChatSession).filter(db_models.ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Verify ownership
    if session.applicant_id != applicant_id:
        raise HTTPException(status_code=403, detail="Access denied: Session belongs to another applicant")
    
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
            {"role": "system", "content": """You are an expert technical interviewer. Your goal is to help candidates improve their answers.
When providing feedback:
1. Acknowledge what the candidate got right.
2. ONLY provide 'Suggestions for improvement' if the candidate missed key concepts or made mistakes.
3. CRITICAL: DO NOT suggest points the candidate has already mentioned in their answer.
4. If the answer is accurate and complete, simply state that it is excellent and move to the next question."""}
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


# -------------------- RANKING & TRANSPARENCY --------------------

@app.post("/rankings/calculate", response_model=RankingOutput)
def calculate_ranking(input_data: RankingInput, db: Session = Depends(get_db)):
    """
    Calculate and persist candidate ranking score
    """
    try:
        # Calculate scores
        ranking_result = calculate_ranking_score(
            skill_match_percentage=input_data.skill_match,
            experience_years=input_data.experience_years,
            required_experience=input_data.required_experience,
            role_confidence=input_data.role_confidence,
            ats_score=input_data.ats_score
        )
        
        # Check if ranking exists
        existing_ranking = db.query(db_models.CandidateRanking).filter(
            db_models.CandidateRanking.candidate_id == input_data.candidate_id,
            db_models.CandidateRanking.job_id == input_data.job_id
        ).first()
        
        if existing_ranking:
            # Update existing
            existing_ranking.total_score = ranking_result["score"]
            existing_ranking.suitability_label = ranking_result["label"]
            existing_ranking.skill_score = ranking_result["details"]["skill_score"]
            existing_ranking.experience_score = ranking_result["details"]["experience_score"]
            existing_ranking.role_confidence_score = ranking_result["details"]["role_confidence_score"]
            existing_ranking.ats_score = ranking_result["details"]["ats_score"]
            existing_ranking.missing_skills = ",".join(input_data.missing_skills)
            existing_ranking.created_at = datetime.utcnow()
            
            db.commit()
            db.refresh(existing_ranking)
            db_obj = existing_ranking
        else:
            # Create new
            db_obj = db_models.CandidateRanking(
                candidate_id=input_data.candidate_id,
                job_id=input_data.job_id,
                total_score=ranking_result["score"],
                suitability_label=ranking_result["label"],
                skill_score=ranking_result["details"]["skill_score"],
                experience_score=ranking_result["details"]["experience_score"],
                role_confidence_score=ranking_result["details"]["role_confidence_score"],
                ats_score=ranking_result["details"]["ats_score"],
                missing_skills=",".join(input_data.missing_skills)
            )
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            
        return RankingOutput(
            candidate_id=db_obj.candidate_id,
            job_id=db_obj.job_id,
            total_score=db_obj.total_score,
            suitability_label=db_obj.suitability_label,
            details={
                "skill_score": db_obj.skill_score,
                "experience_score": db_obj.experience_score,
                "role_confidence_score": db_obj.role_confidence_score,
                "ats_score": db_obj.ats_score
            },
            missing_skills=db_obj.missing_skills.split(",") if db_obj.missing_skills else [],
            created_at=db_obj.created_at
        )
        
    except Exception as e:
        print(f"Ranking Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/rankings", response_model=List[RankingOutput])
def get_rankings(
    job_id: Optional[str] = None, 
    min_score: Optional[float] = None,
    sort_by: str = Query("score_desc", regex="^(score_asc|score_desc|date_desc)$"),
    db: Session = Depends(get_db)
):
    query = db.query(db_models.CandidateRanking)
    
    if job_id:
        query = query.filter(db_models.CandidateRanking.job_id == job_id)
        
    if min_score is not None:
        query = query.filter(db_models.CandidateRanking.total_score >= min_score)
        
    if sort_by == "score_desc":
        query = query.order_by(db_models.CandidateRanking.total_score.desc())
    elif sort_by == "score_asc":
        query = query.order_by(db_models.CandidateRanking.total_score.asc())
    else:
        query = query.order_by(db_models.CandidateRanking.created_at.desc())
        
    results = query.all()
    
    return [
        RankingOutput(
            candidate_id=r.candidate_id,
            job_id=r.job_id,
            total_score=r.total_score,
            suitability_label=r.suitability_label,
            details={
                "skill_score": r.skill_score,
                "experience_score": r.experience_score,
                "role_confidence_score": r.role_confidence_score,
                "ats_score": r.ats_score
            },
            missing_skills=r.missing_skills.split(",") if r.missing_skills else [],
            created_at=r.created_at
        )
        for r in results
    ]


# -------------------- ENTRY --------------------

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

