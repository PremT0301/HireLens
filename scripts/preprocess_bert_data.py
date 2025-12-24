"""
Preprocess resume data for BERT role classification
Loads Resume.csv and prepares data for BERT fine-tuning
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import sys
from tqdm import tqdm

# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))
from common_utils import clean_text, save_pickle, ensure_dir



def load_resume_data(file_path: str) -> pd.DataFrame:
    """Load resume CSV data"""
    print(f"Loading resume data from {file_path}...")
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} resumes")
    print(f"Columns: {df.columns.tolist()}")
    return df


def preprocess_resumes(df: pd.DataFrame) -> pd.DataFrame:
    """
    Clean and preprocess resume data
    
    Args:
        df: DataFrame with resume data
        
    Returns:
        Preprocessed DataFrame
    """
    print("\nPreprocessing resumes...")
    
    # Create a copy
    df = df.copy()
    
    # Use Resume_str column for text (plain text version)
    if 'Resume_str' in df.columns:
        text_column = 'Resume_str'
    elif 'Resume' in df.columns:
        text_column = 'Resume'
    else:
        raise ValueError("No resume text column found!")
    
    # Clean text
    print("Cleaning text...")
    df['text'] = df[text_column].apply(lambda x: clean_text(str(x)) if pd.notna(x) else "")
    
    # Remove empty resumes
    df = df[df['text'].str.len() > 50]  # At least 50 characters
    print(f"Resumes after removing empty: {len(df)}")
    
    # Get category/label column
    if 'Category' in df.columns:
        label_column = 'Category'
    elif 'category' in df.columns:
        label_column = 'category'
    else:
        raise ValueError("No category column found!")
    
    df['label'] = df[label_column]
    
    # Remove rows with missing labels
    df = df.dropna(subset=['label'])
    print(f"Resumes after removing missing labels: {len(df)}")
    
    return df[['text', 'label']]


def encode_labels(df: pd.DataFrame) -> tuple:
    """
    Encode text labels to integers
    
    Args:
        df: DataFrame with 'label' column
        
    Returns:
        Tuple of (df with encoded labels, label_encoder, label_mapping)
    """
    print("\nEncoding labels...")
    
    label_encoder = LabelEncoder()
    df['label_encoded'] = label_encoder.fit_transform(df['label'])
    
    # Create label mapping
    label_mapping = {
        idx: label for idx, label in enumerate(label_encoder.classes_)
    }
    
    print(f"Number of unique categories: {len(label_mapping)}")
    print("\nCategory distribution:")
    print(df['label'].value_counts())
    
    return df, label_encoder, label_mapping


def create_splits(df: pd.DataFrame, test_size: float = 0.15, val_size: float = 0.15, random_state: int = 42):
    """
    Create train/validation/test splits
    
    Args:
        df: DataFrame with preprocessed data
        test_size: Proportion for test set
        val_size: Proportion for validation set (from remaining data)
        random_state: Random seed
        
    Returns:
        Tuple of (train_df, val_df, test_df)
    """
    print(f"\nCreating data splits...")
    print(f"Test size: {test_size}, Validation size: {val_size}")
    
    # First split: separate test set
    train_val_df, test_df = train_test_split(
        df,
        test_size=test_size,
        random_state=random_state,
        stratify=df['label_encoded']
    )
    
    # Second split: separate validation from training
    val_size_adjusted = val_size / (1 - test_size)  # Adjust for remaining data
    train_df, val_df = train_test_split(
        train_val_df,
        test_size=val_size_adjusted,
        random_state=random_state,
        stratify=train_val_df['label_encoded']
    )
    
    print(f"Train samples: {len(train_df)}")
    print(f"Validation samples: {len(val_df)}")
    print(f"Test samples: {len(test_df)}")
    
    return train_df, val_df, test_df


def save_preprocessed_data(train_df, val_df, test_df, label_encoder, label_mapping, output_dir: str):
    """Save preprocessed data to disk"""
    print(f"\nSaving preprocessed data to {output_dir}...")
    
    output_path = Path(output_dir)
    ensure_dir(output_path)
    
    # Save DataFrames as pickle
    save_pickle(train_df, output_path / "bert_train.pkl")
    save_pickle(val_df, output_path / "bert_val.pkl")
    save_pickle(test_df, output_path / "bert_test.pkl")
    
    # Save label encoder and mapping
    save_pickle(label_encoder, output_path / "label_encoder.pkl")
    save_pickle(label_mapping, output_path / "label_mapping.pkl")
    
    # Also save as CSV for inspection
    train_df.to_csv(output_path / "bert_train.csv", index=False)
    val_df.to_csv(output_path / "bert_val.csv", index=False)
    test_df.to_csv(output_path / "bert_test.csv", index=False)
    
    print("Data saved successfully!")


def main():
    """Main preprocessing pipeline"""
    
    # Configuration
    INPUT_FILE = "d:/Project/datasets/Resume/Resume.csv"
    OUTPUT_DIR = "d:/Project/data"
    
    # Load data
    df = load_resume_data(INPUT_FILE)
    
    # Preprocess
    df_clean = preprocess_resumes(df)
    
    # Encode labels
    df_encoded, label_encoder, label_mapping = encode_labels(df_clean)
    
    # Create splits
    train_df, val_df, test_df = create_splits(df_encoded)
    
    # Save preprocessed data
    save_preprocessed_data(train_df, val_df, test_df, label_encoder, label_mapping, OUTPUT_DIR)
    
    # Print summary
    print("\n" + "="*50)
    print("PREPROCESSING COMPLETE")
    print("="*50)
    print(f"Total samples: {len(df_encoded)}")
    print(f"Training samples: {len(train_df)}")
    print(f"Validation samples: {len(val_df)}")
    print(f"Test samples: {len(test_df)}")
    print(f"Number of categories: {len(label_mapping)}")
    print(f"\nCategories: {list(label_mapping.values())}")
    print(f"Output directory: {OUTPUT_DIR}")
    print("="*50)


if __name__ == "__main__":
    main()
