from typing import Dict, List, Optional
from pydantic import BaseModel

class RankingWeights:
    SKILL_MATCH = 0.40
    EXPERIENCE_MATCH = 0.30
    ROLE_CONFIDENCE = 0.20
    ATS_SCORE = 0.10

class SuitabilityLabels:
    HIGHLY_SUITABLE = "Highly Suitable"
    SUITABLE = "Suitable"
    NEEDS_IMPROVEMENT = "Needs Improvement"

def calculate_ranking_score(
    skill_match_percentage: float,
    experience_years: float,
    required_experience: float,
    role_confidence: float,
    ats_score: float
) -> Dict[str, any]:
    """
    Calculate the weighted ranking score for a candidate.
    
    Args:
        skill_match_percentage (float): 0-100 indicating percentage of skills matched.
        experience_years (float): Candidate's years of experience.
        required_experience (float): Job's required years of experience.
        role_confidence (float): 0-1 confidence score from BERT classifier.
        ats_score (float): 0-100 ATS score.
        
    Returns:
        Dict containing total_score, component_scores, and suitability_label.
    """
    
    # Normalize Experience Score (0-100)
    # If candidate meets or exceeds requirement -> 100
    # If candidate has 0 exp but requires > 0 -> 0
    # Linear scale in between
    if required_experience <= 0:
        exp_score = 100.0
    else:
        exp_score = min(100.0, (experience_years / required_experience) * 100.0)
    
    # Normalize Role Confidence (0-100)
    role_score = role_confidence * 100.0
    
    # Calculate Weighted Score
    # Weights: Skills (40%), Experience (30%), Role (20%), ATS (10%)
    ws = RankingWeights
    
    total_score = (
        (skill_match_percentage * ws.SKILL_MATCH) +
        (exp_score * ws.EXPERIENCE_MATCH) +
        (role_score * ws.ROLE_CONFIDENCE) +
        (ats_score * ws.ATS_SCORE)
    )
    
    # Determine Suitability Label
    if total_score >= 80:
        label = SuitabilityLabels.HIGHLY_SUITABLE
    elif total_score >= 60:
        label = SuitabilityLabels.SUITABLE
    else:
        label = SuitabilityLabels.NEEDS_IMPROVEMENT
        
    return {
        "score": round(total_score, 2),
        "label": label,
        "details": {
            "skill_score": round(skill_match_percentage, 2),
            "experience_score": round(exp_score, 2),
            "role_confidence_score": round(role_score, 2),
            "ats_score": round(ats_score, 2)
        }
    }
