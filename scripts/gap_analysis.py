"""
Gap Analysis Function for Resume-Job Matching
Compares extracted skills from resume against job requirements
"""

import spacy
from typing import List, Dict, Set
import re
from pathlib import Path

# Add scripts directory to path if needed, or assume relative import works if package structure is correct
# For this script run standalone, we might need sys path hacking, but within API it's fine.
try:
    from common_utils import extract_skills_keywords
except ImportError:
    # Fallback if running from different directory
    import sys
    sys.path.append(str(Path(__file__).parent))
    from common_utils import extract_skills_keywords


def extract_skills_from_text(text: str, ner_model) -> Set[str]:
    """
    Extract skills from text using trained NER model + Keywords
    """
    skills = set()
    
    # 1. NER Extraction
    if ner_model:
        doc = ner_model(text)
        for ent in doc.ents:
            if ent.label_ == "SKILLS":
                skills.add(ent.text.strip().lower())

    # 2. Keyword Extraction (Hybrid)
    keyword_skills = extract_skills_keywords(text)
    for ks in keyword_skills:
        skills.add(ks.lower())
    
    return skills


def parse_job_requirements(job_description: str) -> Dict[str, any]:
    """
    Parse job description to extract requirements
    
    Args:
        job_description: Job posting text
        
    Returns:
        Dictionary with parsed requirements
    """
    # Use shared keyword extraction for consistent skill detection
    # This replaces the hardcoded list with the central pattern repository in common_utils
    job_text_lower = job_description.lower()
    required_skills = set(extract_skills_keywords(job_text_lower))
    
    # Extract years of experience if mentioned
    experience_pattern = r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)'
    experience_matches = re.findall(experience_pattern, job_text_lower)
    required_experience = int(experience_matches[0]) if experience_matches else 0
    
    return {
        'required_skills': required_skills,
        'required_experience': required_experience,
        'job_text': job_description
    }


def calculate_skill_match(resume_skills: Set[str], job_skills: Set[str]) -> Dict[str, any]:
    """
    Calculate skill match percentage and identify gaps
    
    Args:
        resume_skills: Set of skills from resume
        job_skills: Set of required skills from job
        
    Returns:
        Dictionary with match analysis
    """
    # Normalize skills for comparison
    resume_skills_norm = {skill.lower().strip() for skill in resume_skills}
    job_skills_norm = {skill.lower().strip() for skill in job_skills}
    
    # Find matches and gaps
    matched_skills = resume_skills_norm.intersection(job_skills_norm)
    missing_skills = job_skills_norm - resume_skills_norm
    extra_skills = resume_skills_norm - job_skills_norm
    
    # Calculate match percentage
    if len(job_skills_norm) > 0:
        match_percentage = (len(matched_skills) / len(job_skills_norm)) * 100
    else:
        match_percentage = 0.0
    
    return {
        'match_percentage': round(match_percentage, 2),
        'matched_skills': list(matched_skills),
        'missing_skills': list(missing_skills),
        'extra_skills': list(extra_skills),
        'total_required': len(job_skills_norm),
        'total_matched': len(matched_skills),
        'total_missing': len(missing_skills)
    }


def perform_gap_analysis(
    resume_text: str,
    job_description: str,
    ner_model_path: str = None,
    ner_model = None
) -> Dict[str, any]:
    """
    Perform comprehensive gap analysis between resume and job
    
    Args:
        resume_text: Resume text content
        job_description: Job posting text
        ner_model_path: Path to trained NER model (optional if ner_model provided)
        ner_model: Loaded NER model (optional if ner_model_path provided)
        
    Returns:
        Comprehensive gap analysis report
    """
    # Load NER model if not provided
    if ner_model is None:
        if ner_model_path is None:
            raise ValueError("Either ner_model or ner_model_path must be provided")
        print(f"Loading NER model from {ner_model_path}...")
        ner_model = spacy.load(ner_model_path)
    
    # Extract skills from resume
    print("Extracting skills from resume...")
    resume_skills = extract_skills_from_text(resume_text, ner_model)
    
    # Parse job requirements
    print("Parsing job requirements...")
    job_requirements = parse_job_requirements(job_description)
    job_skills = job_requirements['required_skills']
    
    # Calculate skill match
    print("Calculating skill match...")
    skill_match = calculate_skill_match(resume_skills, job_skills)
    
    # Generate recommendations
    recommendations = []
    
    if skill_match['match_percentage'] < 50:
        recommendations.append("Consider acquiring more of the required skills before applying")
    elif skill_match['match_percentage'] < 75:
        recommendations.append("Good match! Consider highlighting relevant projects that demonstrate missing skills")
    else:
        recommendations.append("Excellent match! You meet most of the requirements")
    
    if skill_match['total_missing'] > 0:
        top_missing = skill_match['missing_skills'][:5]  # Top 5 missing skills
        recommendations.append(f"Focus on learning: {', '.join(top_missing)}")
    
    # Compile final report
    report = {
        'match_summary': {
            'match_percentage': skill_match['match_percentage'],
            'total_required_skills': skill_match['total_required'],
            'total_matched_skills': skill_match['total_matched'],
            'total_missing_skills': skill_match['total_missing']
        },
        'skill_analysis': {
            'matched_skills': skill_match['matched_skills'],
            'missing_skills': skill_match['missing_skills'],
            'additional_skills': skill_match['extra_skills'],
            'match_percentage': skill_match['match_percentage'],
            'total_required': skill_match['total_required'],
            'total_matched': skill_match['total_matched']
        },
        'experience_requirements': {
            'required_years': job_requirements['required_experience']
        },
        'recommendations': recommendations,
        'fit_score': 'Excellent' if skill_match['match_percentage'] >= 75 
                     else 'Good' if skill_match['match_percentage'] >= 50 
                     else 'Fair'
    }
    
    return report


def print_gap_analysis_report(report: Dict[str, any]):
    """Pretty print gap analysis report"""
    print("\n" + "="*60)
    print("GAP ANALYSIS REPORT")
    print("="*60)
    
    print(f"\nOverall Fit: {report['fit_score']}")
    print(f"Match Percentage: {report['match_summary']['match_percentage']}%")
    print(f"Matched Skills: {report['match_summary']['total_matched_skills']}/{report['match_summary']['total_required_skills']}")
    
    print("\n" + "-"*60)
    print("MATCHED SKILLS:")
    for skill in report['skill_analysis']['matched_skills']:
        print(f"  ✓ {skill}")
    
    if report['skill_analysis']['missing_skills']:
        print("\n" + "-"*60)
        print("MISSING SKILLS:")
        for skill in report['skill_analysis']['missing_skills']:
            print(f"  ✗ {skill}")
    
    if report['skill_analysis']['additional_skills']:
        print("\n" + "-"*60)
        print("ADDITIONAL SKILLS (Not required but valuable):")
        for skill in report['skill_analysis']['additional_skills'][:10]:  # Show top 10
            print(f"  + {skill}")
    
    print("\n" + "-"*60)
    print("RECOMMENDATIONS:")
    for i, rec in enumerate(report['recommendations'], 1):
        print(f"  {i}. {rec}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
    # Example usage
    sample_resume = """
    Experienced Python developer with 5 years of experience in machine learning and data science.
    Proficient in Python, TensorFlow, PyTorch, scikit-learn, pandas, and NumPy.
    Strong background in deep learning, NLP, and computer vision.
    Experience with AWS, Docker, and Git.
    """
    
    sample_job = """
    We are looking for a Machine Learning Engineer with 3+ years of experience.
    Required skills: Python, TensorFlow, PyTorch, machine learning, deep learning, NLP.
    Nice to have: AWS, Docker, Kubernetes, MLOps experience.
    """
    
    print("Example Gap Analysis (without NER model):")
    print("\nNote: For actual usage, load the trained NER model")
    print("This example uses keyword matching only")
    
    # Simple keyword-based analysis for demo
    job_reqs = parse_job_requirements(sample_job)
    resume_skills = {'python', 'tensorflow', 'pytorch', 'machine learning', 
                     'deep learning', 'nlp', 'aws', 'docker'}
    
    match_result = calculate_skill_match(resume_skills, job_reqs['required_skills'])
    print(f"\nMatch Percentage: {match_result['match_percentage']}%")
    print(f"Matched Skills: {match_result['matched_skills']}")
    print(f"Missing Skills: {match_result['missing_skills']}")
