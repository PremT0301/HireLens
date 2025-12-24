"""
Preprocess NER data from JSON format to SpaCy binary format
Converts Entity Recognition in Resumes.json to SpaCy DocBin format
"""

import json
import spacy
from spacy.tokens import DocBin
from pathlib import Path
from typing import List, Dict, Tuple
from tqdm import tqdm
import sys
from spacy.util import filter_spans


# Add parent directory to path for imports
sys.path.append(str(Path(__file__).parent))
from common_utils  import create_train_val_split, ensure_dir


def load_ner_json(file_path: str) -> List[Dict]:
    """Load NER annotations from JSON Lines file"""
    print(f"Loading NER data from {file_path}...")
    
    data = []
    with open(file_path, 'r', encoding='utf-8') as f:
        for line_num, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                data.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"⚠️ Skipping invalid JSON at line {line_num}: {e}")
    
    print(f"Loaded {len(data)} resume annotations")
    return data


def filter_entities(annotations: List[Dict], target_entities: List[str]) -> List[Dict]:
    """
    Filter annotations to keep only target entities
    
    Args:
        annotations: List of annotation dictionaries
        target_entities: List of entity labels to keep (e.g., ['Skills', 'Designation', 'Experience'])
        
    Returns:
        Filtered annotations
    """
    filtered = []
    for item in annotations:
        filtered_item = {
            'content': item['content'],
            'annotation': []
        }
        
        for ann in item.get('annotation', []):
            # Check if label matches target entities (case-insensitive)
            label = ann.get('label', [])
            if isinstance(label, list) and len(label) > 0:
                label_text = label[0].lower()
                if any(target.lower() in label_text for target in target_entities):
                    filtered_item['annotation'].append(ann)
        
        if filtered_item['annotation']:  # Only add if has annotations
            filtered.append(filtered_item)
    
    return filtered


def convert_to_spacy_format(data: List[Dict]) -> List[Tuple[str, Dict]]:
    """
    Convert JSON annotations to SpaCy training format
    
    Args:
        data: List of annotation dictionaries
        
    Returns:
        List of (text, {"entities": [(start, end, label)]}) tuples
    """
    spacy_data = []
    
    for item in tqdm(data, desc="Converting to SpaCy format"):
        text = item['content']
        entities = []
        
        for ann in item.get('annotation', []):
            label = ann.get('label', [])
            points = ann.get('points', [])
            
            if label and points and len(points) > 0:
                # Get entity label
                entity_label = label[0].upper()
                
                # Normalize entity labels
                if 'SKILL' in entity_label:
                    entity_label = 'SKILLS'
                elif 'DESIGNATION' in entity_label or 'TITLE' in entity_label:
                    entity_label = 'DESIGNATION'
                elif 'EXPERIENCE' in entity_label or 'COMPANIES' in entity_label:
                    entity_label = 'EXPERIENCE'
                else:
                    continue  # Skip other entities
                
                # Get start and end positions
                for point in points:
                    start = point.get('start', 0)
                    end = point.get('end', 0) + 1  # SpaCy uses exclusive end
                    
                    # Validate positions
                    if 0 <= start < end <= len(text):
                        entities.append((start, end, entity_label))
        
        if entities:  # Only add if has valid entities
            spacy_data.append((text, {"entities": entities}))
    
    print(f"Converted {len(spacy_data)} samples with entities")
    return spacy_data


def create_docbin(data: List[Tuple[str, Dict]], nlp) -> DocBin:
    doc_bin = DocBin()

    for text, annotations in tqdm(data, desc="Creating DocBin"):
        doc = nlp.make_doc(text)
        spans = []

        for start, end, label in annotations["entities"]:
            span = doc.char_span(
                start,
                end,
                label=label,
                alignment_mode="contract"
            )
            if span is not None:
                spans.append(span)

        # 🔥 REMOVE OVERLAPPING SPANS
        doc.ents = filter_spans(spans)

        doc_bin.add(doc)

    return doc_bin



def main():
    """Main preprocessing pipeline"""
    
    # Configuration
    INPUT_FILE = "d:/Project/datasets/Entity Recognition in Resumes.json"
    OUTPUT_DIR = "d:/Project/data"
    TARGET_ENTITIES = ['Skills', 'Designation', 'Experience', 'Companies']
    VAL_SPLIT = 0.2
    
    # Ensure output directory exists
    ensure_dir(OUTPUT_DIR)
    
    # Load data
    raw_data = load_ner_json(INPUT_FILE)
    
    # Filter to target entities
    print(f"\nFiltering for entities: {TARGET_ENTITIES}")
    filtered_data = filter_entities(raw_data, TARGET_ENTITIES)
    print(f"Filtered to {len(filtered_data)} samples with target entities")
    
    # Convert to SpaCy format
    print("\nConverting to SpaCy format...")
    spacy_data = convert_to_spacy_format(filtered_data)
    
    # Split into train and validation
    print(f"\nSplitting data (validation size: {VAL_SPLIT})...")
    train_data, val_data = create_train_val_split(spacy_data, val_size=VAL_SPLIT)
    print(f"Train samples: {len(train_data)}")
    print(f"Validation samples: {len(val_data)}")
    
    # Initialize blank English model
    print("\nInitializing SpaCy model...")
    nlp = spacy.blank("en")
    
    # Create DocBins
    print("\nCreating training DocBin...")
    train_docbin = create_docbin(train_data, nlp)
    train_output = Path(OUTPUT_DIR) / "ner_train.spacy"
    train_docbin.to_disk(train_output)
    print(f"Saved training data to {train_output}")
    
    print("\nCreating validation DocBin...")
    val_docbin = create_docbin(val_data, nlp)
    val_output = Path(OUTPUT_DIR) / "ner_val.spacy"
    val_docbin.to_disk(val_output)
    print(f"Saved validation data to {val_output}")
    
    # Print statistics
    print("\n" + "="*50)
    print("PREPROCESSING COMPLETE")
    print("="*50)
    print(f"Total samples processed: {len(spacy_data)}")
    print(f"Training samples: {len(train_data)}")
    print(f"Validation samples: {len(val_data)}")
    print(f"Output directory: {OUTPUT_DIR}")
    print("="*50)


if __name__ == "__main__":
    main()
