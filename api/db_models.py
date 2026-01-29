from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(String(255), index=True, nullable=False)  # Links session to authenticated applicant
    title = Column(String(255), default="New Interview Session")
    created_at = Column(DateTime, default=datetime.utcnow)
    
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    sender = Column(String(50)) # 'user' or 'ai'
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    session = relationship("ChatSession", back_populates="messages")

class CandidateRanking(Base):
    __tablename__ = "candidate_rankings"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(String(255), index=True) # ID from the main auth system or resume hash
    job_id = Column(String(255), index=True)
    
    total_score = Column(Float)
    suitability_label = Column(String(50))
    
    # Component Scores for transparency
    skill_score = Column(Float)
    experience_score = Column(Float)
    role_confidence_score = Column(Float)
    ats_score = Column(Float)
    
    # Analysis Data
    missing_skills = Column(Text) # Stored as comma-separated string
    created_at = Column(DateTime, default=datetime.utcnow)

