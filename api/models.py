"""
Pydantic models for API request/response validation
"""
from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
class ResumeInput(BaseModel):
    """Input model for resume analysis"""
    text: str = Field(..., description="Resume text content", min_length=50)
    
    class Config:
        json_schema_extra = {
            "example": {
                "text": "Experienced Python developer with 5 years in ML..."
            }
        }


class JobInput(BaseModel):
    """Input model for job description"""
    description: str = Field(..., description="Job description text", min_length=20)
    
    class Config:
        json_schema_extra = {
            "example": {
                "description": "Looking for ML Engineer with Python, TensorFlow..."
            }
        }


class ResumeJobInput(BaseModel):
    """Input model for resume-job matching"""
    resume_text: str = Field(..., description="Resume text content", min_length=50)
    job_description: str = Field(..., description="Job description text", min_length=20)
    
    class Config:
        json_schema_extra = {
            "example": {
                "resume_text": "Experienced Python developer...",
                "job_description": "Looking for ML Engineer..."
            }
        }


class Entity(BaseModel):
    """Extracted entity"""
    text: str = Field(..., description="Entity text")
    label: str = Field(..., description="Entity label (SKILLS, EXPERIENCE, DESIGNATION)")
    start: int = Field(..., description="Start character position")
    end: int = Field(..., description="End character position")


class NEROutput(BaseModel):
    """Output model for NER extraction"""
    entities: List[Entity] = Field(..., description="List of extracted entities")
    skills: List[str] = Field(default=[], description="Extracted skills")
    experience: List[str] = Field(default=[], description="Extracted experience")
    designations: List[str] = Field(default=[], description="Extracted job titles")
    
    class Config:
        json_schema_extra = {
            "example": {
                "entities": [
                    {"text": "Python", "label": "SKILLS", "start": 0, "end": 6}
                ],
                "skills": ["Python", "TensorFlow"],
                "experience": ["5 years"],
                "designations": ["ML Engineer"]
            }
        }


class ClassificationOutput(BaseModel):
    """Output model for role classification"""
    predicted_role: str = Field(..., description="Predicted job role/category")
    confidence: float = Field(..., description="Prediction confidence score", ge=0.0, le=1.0)
    top_predictions: List[Dict[str, float]] = Field(..., description="Top 3 predictions with scores")
    
    class Config:
        json_schema_extra = {
            "example": {
                "predicted_role": "Data Scientist",
                "confidence": 0.92,
                "top_predictions": [
                    {"Data Scientist": 0.92},
                    {"ML Engineer": 0.05},
                    {"Software Engineer": 0.02}
                ]
            }
        }


class SkillMatch(BaseModel):
    """Skill matching details"""
    match_percentage: float = Field(..., description="Percentage of required skills matched")
    matched_skills: List[str] = Field(..., description="Skills that match")
    missing_skills: List[str] = Field(..., description="Required skills not found in resume")
    additional_skills: List[str] = Field(..., description="Extra skills from resume")
    total_required: int = Field(..., description="Total required skills")
    total_matched: int = Field(..., description="Total matched skills")


class GapAnalysisOutput(BaseModel):
    """Output model for gap analysis"""
    match_summary: Dict[str, Any] = Field(..., description="Overall match summary")
    skill_analysis: SkillMatch = Field(..., description="Detailed skill matching")
    experience_requirements: Dict[str, int] = Field(..., description="Experience requirements")
    recommendations: List[str] = Field(..., description="Recommendations for candidate")
    fit_score: str = Field(..., description="Overall fit assessment (Excellent/Good/Fair)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "match_summary": {
                    "match_percentage": 85.5,
                    "total_required_skills": 10,
                    "total_matched_skills": 8
                },
                "skill_analysis": {
                    "match_percentage": 85.5,
                    "matched_skills": ["Python", "TensorFlow"],
                    "missing_skills": ["Kubernetes"],
                    "additional_skills": ["Docker"],
                    "total_required": 10,
                    "total_matched": 8
                },
                "experience_requirements": {"required_years": 3},
                "recommendations": ["Excellent match!"],
                "fit_score": "Excellent"
            }
        }


class AnalyzeResumeOutput(BaseModel):
    """Combined output for resume analysis"""
    ner_results: NEROutput = Field(..., description="NER extraction results")
    classification: ClassificationOutput = Field(..., description="Role classification results")
    
    class Config:
        json_schema_extra = {
            "example": {
                "ner_results": {
                    "entities": [],
                    "skills": ["Python"],
                    "experience": ["5 years"],
                    "designations": ["ML Engineer"]
                },
                "classification": {
                    "predicted_role": "Data Scientist",
                    "confidence": 0.92,
                    "top_predictions": []
                }
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    models_loaded: Dict[str, bool] = Field(..., description="Model loading status")
    
    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "models_loaded": {
                    "ner_model": True,
                    "bert_classifier": True
                }
            }
        }

class ChatMessage(BaseModel):
    role: str = Field(..., description="Role of the sender (user/model)")
    content: str = Field(..., description="Content of the message")


class ChatInput(BaseModel):
    history: List[ChatMessage] = Field(default=[], description="Chat history")
    message: str = Field(..., description="Current user message")
    context: Optional[str] = Field(default=None, description="Optional context like resume or job description")
    
    class Config:
        json_schema_extra = {
            "example": {
                "history": [{"role": "user", "content": "Hi"}, {"role": "model", "content": "Hello"}],
                "message": "How do I optimize Docker images?",
                "context": "Candidate is applying for DevOps role."
            }
        }


class ChatResponse(BaseModel):
    response: str = Field(..., description="AI response text")
    confidence: float = Field(default=0.0, description="Confidence score")


class MessageSchema(BaseModel):
    id: int
    sender: str
    content: str
    timestamp: datetime

    class Config:
        from_attributes = True

class SessionSchema(BaseModel):
    id: int
    title: str
    created_at: datetime
    messages: List[MessageSchema] = []

    class Config:
        from_attributes = True

class CreateSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
