import requests
import json

url = "http://127.0.0.1:8000/analyze-resume"

payload = {
    "text": "Experienced Python Developer with 5 years of experience in Django and Flask. Skills: Python, Docker, Kubernetes, AWS, React. Education: B.Tech in Computer Science from IIT Bombay (2018-2022). Projects: Built an e-commerce platform using Microservices. Contact: test@example.com, (555) 123-4567."
}

try:
    response = requests.post(url, json=payload)
    if response.status_code == 200:
        data = response.json()
        print("✅ API Success")
        print(f"ATS Score: {data.get('ats_score')}")
        print(f"ATS Level: {data.get('ats_level')}")
        print(f"Feedback: {data.get('feedback')}")
        
        if 'ats_score' in data:
            print("TEST: PASS")
        else:
            print("TEST: FAIL (Missing ats_score)")
    else:
        print(f"❌ API Failed: {response.text}")

except Exception as e:
    print(f"❌ Connection Error: {e}")
