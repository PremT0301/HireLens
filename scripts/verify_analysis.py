import requests
import json

BASE_URL = "http://localhost:8000"

def test_analyze_resume():
    print("\n🔹 Testing /analyze-resume...")
    
    payload = {
        "text": "Experienced Python Developer with 5 years of experience in Django, FastAPI, and React. Strong background in AWS and Docker. Education: BS in Computer Science."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/analyze-resume", json=payload)
        response.raise_for_status()
        data = response.json()
        
        print("✅ Success!")
        print(f"   Role: {data['classification']['predicted_role']} ({data['classification']['confidence']})")
        print(f"   Skills: {data['ner_results']['skills']}")
        print(f"   ATS Score: {data['ats_score']} ({data['ats_level']})")
        
    except Exception as e:
        print(f"❌ Failed: {e}")
        if 'response' in locals():
            print(response.text)

if __name__ == "__main__":
    test_analyze_resume()
