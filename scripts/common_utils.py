"""
Utility functions for AI Resume Analyzer
Common helpers for data preprocessing, text cleaning, and model utilities
"""

import re
import json
import pickle
from pathlib import Path
from typing import List, Dict, Any, Tuple
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split


def clean_text(text: str) -> str:
    """
    Clean and normalize text data
    
    Args:
        text: Raw text string
        
    Returns:
        Cleaned text string
    """
    if not isinstance(text, str):
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    
    # Strip leading/trailing whitespace
    text = text.strip()
    
    return text


def load_json_data(file_path: str) -> List[Dict[str, Any]]:
    """
    Load JSON data from file
    
    Args:
        file_path: Path to JSON file
        
    Returns:
        List of dictionaries containing JSON data
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data


def save_json_data(data: Any, file_path: str) -> None:
    """
    Save data to JSON file
    
    Args:
        data: Data to save
        file_path: Output file path
    """
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def load_pickle(file_path: str) -> Any:
    """Load data from pickle file"""
    with open(file_path, 'rb') as f:
        return pickle.load(f)


def save_pickle(data: Any, file_path: str) -> None:
    """Save data to pickle file"""
    with open(file_path, 'wb') as f:
        pickle.dump(data, f)


def create_train_val_split(
    data: List[Any], 
    val_size: float = 0.2, 
    random_state: int = 42
) -> Tuple[List[Any], List[Any]]:
    """
    Split data into training and validation sets
    
    Args:
        data: List of data samples
        val_size: Validation set proportion (default: 0.2)
        random_state: Random seed for reproducibility
        
    Returns:
        Tuple of (train_data, val_data)
    """
    train_data, val_data = train_test_split(
        data, 
        test_size=val_size, 
        random_state=random_state
    )
    return train_data, val_data


def extract_skills_keywords(text: str) -> List[str]:
    """
    Extract potential skill keywords from text
    Simple keyword extraction based on common patterns
    
    Args:
        text: Resume or job description text
        
    Returns:
        List of potential skill keywords
    """
    # Common skill patterns
    skill_patterns = [
        # Programming Languages
        r'\b(?:Python|Java|JavaScript|TypeScript|C\+\+|C#|\.NET|Go|Ruby|PHP|Swift|Kotlin|Rust|Scala|Perl)\b',
        
        # Web Technologies
        r'\b(?:HTML\d?|CSS\d?|React|Angular|Vue|Node\.js|Next\.js|Express|Django|Flask|Spring|ASP\.NET|Blazor)\b',
        
        # AI/ML/Data
        r'\b(?:Machine Learning|Deep Learning|NLP|Computer Vision|AI|TensorFlow|PyTorch|Scikit-learn|Pandas|NumPy|Keras|OpenCV|Spacy|NLTK)\b',
        
        # Cloud & DevOps
        r'\b(?:AWS|Azure|GCP|Docker|Kubernetes|Jenkins|Terraform|Ansible|CircleCI|Git|GitHub|GitLab|CI/CD)\b',
        
        # Databases
        r'\b(?:SQL|MySQL|PostgreSQL|MongoDB|Redis|Oracle|Cassandra|DynamoDB|Elasticsearch)\b',
        
        # Tools & Concepts
        r'\b(?:Agile|Scrum|JIRA|Rest API|GraphQL|Microservices|System Design|Unit Testing)\b'
    ]
    
    skills = []
    for pattern in skill_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        skills.extend(matches)
    
    return list(set(skills))  # Remove duplicates


def calculate_metrics(y_true: np.ndarray, y_pred: np.ndarray) -> Dict[str, float]:
    """
    Calculate classification metrics
    
    Args:
        y_true: True labels
        y_pred: Predicted labels
        
    Returns:
        Dictionary of metrics
    """
    from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
    
    return {
        'accuracy': accuracy_score(y_true, y_pred),
        'precision': precision_score(y_true, y_pred, average='weighted', zero_division=0),
        'recall': recall_score(y_true, y_pred, average='weighted', zero_division=0),
        'f1': f1_score(y_true, y_pred, average='weighted', zero_division=0)
    }


def ensure_dir(directory: str) -> Path:
    """
    Ensure directory exists, create if it doesn't
    
    Args:
        directory: Directory path
        
    Returns:
        Path object
    """
    path = Path(directory)
    path.mkdir(parents=True, exist_ok=True)
    return path


def get_device():
    """
    Get the best available device (CUDA, MPS, or CPU)
    
    Returns:
        torch.device object
    """
    import torch
    
    if torch.cuda.is_available():
        return torch.device('cuda')
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return torch.device('mps')
    else:
        return torch.device('cpu')


if __name__ == "__main__":
    # Test utilities
    print("Testing utility functions...")
    
    # Test text cleaning
    sample_text = "  This is   a  test   text!!!  "
    cleaned = clean_text(sample_text)
    print(f"Cleaned text: '{cleaned}'")
    
    # Test device detection
    device = get_device()
    print(f"Available device: {device}")
    
    print("Utility functions loaded successfully!")
