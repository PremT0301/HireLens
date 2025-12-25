import requests
import json

BASE_URL = "http://localhost:8000"

def test_calculate_ranking():
    print("\n🔹 Testing /rankings/calculate...")
    
    payload = {
        "candidate_id": "cand_123",
        "job_id": "job_456",
        "skill_match": 85.5,
        "experience_years": 4.5,
        "required_experience": 3.0,
        "role_confidence": 0.92,
        "ats_score": 78.0,
        "missing_skills": ["Kubernetes", "Redis"]
    }
    
    try:
        response = requests.post(f"{BASE_URL}/rankings/calculate", json=payload)
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Success! Score: {data['total_score']} | Label: {data['suitability_label']}")
        print(f"   Details: {json.dumps(data['details'], indent=2)}")
        
        assert data['candidate_id'] == "cand_123"
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        if 'response' in locals():
            print(response.text)

def test_get_rankings():
    print("\n🔹 Testing /rankings (List)...")
    
    try:
        response = requests.get(f"{BASE_URL}/rankings?sort_by=score_desc")
        response.raise_for_status()
        data = response.json()
        
        print(f"✅ Retrieved {len(data)} rankings.")
        if len(data) > 0:
            top = data[0]
            print(f"   Top Candidate: Score {top['total_score']} ({top['suitability_label']})")
            
    except Exception as e:
        print(f"❌ Failed: {e}")

if __name__ == "__main__":
    print("🚀 Verifying Ranking API endpoint...")
    test_calculate_ranking()
    test_get_rankings()
