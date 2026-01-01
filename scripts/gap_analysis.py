"""
Gap Analysis Function for Resume-Job Matching
Compares extracted skills from resume against job requirements
"""

import spacy
from typing import List, Dict, Set
import re
from pathlib import Path


try:
    from common_utils import extract_skills_keywords
except ImportError:
 
    import sys
    sys.path.append(str(Path(__file__).parent))
    from common_utils import extract_skills_keywords


def extract_skills_from_text(text: str, ner_model) -> Set[str]:
    """
    Extract skills from text using trained NER model + Keywords
    """
    skills = set()
    

    if ner_model:
        doc = ner_model(text)
        for ent in doc.ents:
            if ent.label_ == "SKILLS":
                skills.add(ent.text.strip().lower())

  
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
    
    job_text_lower = job_description.lower()
    required_skills = set(extract_skills_keywords(job_text_lower))
    

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

    resume_skills_norm = {skill.lower().strip() for skill in resume_skills}
    job_skills_norm = {skill.lower().strip() for skill in job_skills}

    matched_skills = resume_skills_norm.intersection(job_skills_norm)
    missing_skills = job_skills_norm - resume_skills_norm
    extra_skills = resume_skills_norm - job_skills_norm
    

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



def check_missing_sections(resume_text: str) -> List[str]:
    """
    Check for presence of standard resume sections
    """
    text_lower = resume_text.lower()
   
    sections = {
        'experience': ['experience', 'work history', 'employment'],
        'projects': ['projects', 'personal projects', 'key projects'],
        'education': ['education', 'academic background', 'qualifications'],
        'skills': ['skills', 'technical skills', 'competencies', 'technologies'],
        'certifications': ['certifications', 'certificates', 'courses']
    }
    
    missing = []
    
    for section, keywords in sections.items():
        if not any(keyword in text_lower for keyword in keywords):
            missing.append(section)
            
    return missing


def generate_smart_suggestions(
    skill_match: Dict[str, any], 
    job_requirements: Dict[str, any],
    resume_section_gaps: List[str]
) -> List[str]:
    """
    Generate personalized, actionable suggestions
    """
    suggestions = []
    missing_skills = skill_match.get('missing_skills', [])
    match_percentage = skill_match.get('match_percentage', 0)
    
 
    if missing_skills:
        
        top_missing = missing_skills[:3]
        others_count = len(missing_skills) - 3
        
        skills_str = ", ".join(top_missing)
        if others_count > 0:
            skills_str += f" and {others_count} others"
            
        suggestions.append(f"Add projects demonstrating {skills_str}.")
        suggestions.append(f"Consider acquiring certifications related to {top_missing[0]} to validate your expertise.")
    

    for section in resume_section_gaps:
        if section == 'projects':
            suggestions.append("Add a 'Projects' section to showcase practical application of your skills.")
        elif section == 'certifications':
            suggestions.append("Include a 'Certifications' section if you have completed relevant courses.")
        elif section == 'experience' and job_requirements.get('required_experience', 0) > 0:
            suggestions.append("Ensure your 'Experience' section clearly outlines your roles and responsibilities.")
            

    if match_percentage < 50:
        suggestions.append("Focus on hands-on practice with the required technologies to build a stronger portfolio.")
    elif match_percentage >= 80:
        suggestions.append("Excellent alignment! Ensure your summary highlights your strongest matching skills.")

    if missing_skills:
        suggestions.append(f"Ensure your resume explicitly mentions: {', '.join(missing_skills[:5])} to pass ATS filters.")
        
    return suggestions


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
    if ner_model is None:
        if ner_model_path is None:
            raise ValueError("Either ner_model or ner_model_path must be provided")
        print(f"Loading NER model from {ner_model_path}...")
        ner_model = spacy.load(ner_model_path)
    
    print("Extracting skills from resume...")
    resume_skills = extract_skills_from_text(resume_text, ner_model)
    
    print("Parsing job requirements...")
    job_requirements = parse_job_requirements(job_description)
    job_skills = job_requirements['required_skills']
    
    print("Calculating skill match...")
    skill_match = calculate_skill_match(resume_skills, job_skills)
    
    section_gaps = check_missing_sections(resume_text)
    
 
    print("Generating recommendations...")
    recommendations = generate_smart_suggestions(skill_match, job_requirements, section_gaps)

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
    print("SMART RECOMMENDATIONS:")
    for i, rec in enumerate(report['recommendations'], 1):
        print(f"  {i}. {rec}")
    
    print("\n" + "="*60)


if __name__ == "__main__":
  
    sample_resume = """
    Experienced Python developer with 5 years of experience in machine learning and data science.
    Proficient in Python, TensorFlow, PyTorch, scikit-learn, pandas, and NumPy.
    Strong background in deep learning, NLP, and computer vision.
    Experience with AWS, Docker, and Git.
    """
    
    sample_job = """
    We are looking for a Machine Learning Engineer with 3+ years of experience.
    Required skills: Python, TensorFlow, PyTorch, machine learning, deep learning, NLP, Kubernetes, Azure.
    Nice to have: AWS, Docker, MLOps experience.
    """
    
    print("Example Gap Analysis (Smart Suggestions Demo):")
    print("\nNote: For actual usage, load the trained NER model")
    
  
    job_reqs = parse_job_requirements(sample_job)
    resume_skills = {'python', 'tensorflow', 'pytorch', 'machine learning', 
                     'deep learning', 'nlp', 'aws', 'docker'}
    
    match_result = calculate_skill_match(resume_skills, job_reqs['required_skills'])
    section_gaps = check_missing_sections(sample_resume)
    
    suggestions = generate_smart_suggestions(match_result, job_reqs, section_gaps)
    
    report = {
        'fit_score': 'Good',
        'match_summary': {'match_percentage': match_result['match_percentage'], 
                          'total_matched_skills': match_result['total_matched'],
                          'total_required_skills': match_result['total_required']},
        'skill_analysis': {
            'matched_skills': match_result['matched_skills'],
            'missing_skills': match_result['missing_skills'],
            'additional_skills': match_result['extra_skills']
        },
        'recommendations': suggestions
    }
    
    print_gap_analysis_report(report)
