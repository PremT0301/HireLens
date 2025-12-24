# SmartHireAI - The Intelligent Recruitment Ecosystem

**SmartHireAI** is a comprehensive, full-stack recruitment platform driven by advanced machine learning. It bridges the gap between talent and opportunity by automating resume screening, role validation, and skill-gap analysis. 

This document serves as the **complete manual** for the project, covering its architecture, installation, technical implementation, and a detailed guide to every functionality.

---

## 📑 Table of Contents
1. [Project Overview](#-project-overview)
2. [System Architecture](#-system-architecture)
3. [User Functionalities (The Product)](#-user-functionalities-the-product)
    - [Authentication & Roles](#1-authentication--roles)
    - [Applicant Portal Features](#2-applicant-portal)
    - [Recruiter Portal Features](#3-recruiter-portal)
4. [Machine Learning Pipeline](#-machine-learning-pipeline)
5. [Technical Stack](#-technical-stack)
6. [Installation & Setup](#-installation--setup)
7. [Project Structure](#-project-directory-structure)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Project Overview

**SmartHireAI** solves the "black box" problem of hiring. 
- **For Candidates**: It doesn't just say "rejected"; it explains *why* (Gap Analysis) and *how* to improve (Recommendations).
- **For Recruiters**: It replaces keyword matching with semantic understanding, identifying candidates who have the *right skills* even if they use different terminology.

---

## 🏗️ System Architecture

The application operates as a cohesive trio of services:

```mermaid
graph TD
    User((User))
    User -->|Interacts| Frontend[React 18 Frontend]
    
    Frontend -->|API Calls| Backend[.NET 10 Web API]
    
    Backend -->|Forwards Analysis| AI_Service[Python AI Microservice]
    
    subgraph Intelligence_Layer
        AI_Service
        NER[Spacy NER Model]
        BERT[BERT Classifier]
    end
    
    subgraph Data_Layer
        Backend -->|Persists Data| SQL[SQL Server (Entity Framework)]
    end
```

---

## 🌟 User Functionalities (The Product)

This section details every feature available in the application.

### 1. Authentication & Roles
*   **Unified Login**: A robust login system that supports two distinct personas.
*   **Role Selection**: Users can toggle between **Applicant** and **Recruiter** modes.
    *   *Note: Currently simulates authentication via LocalStorage for rapid prototyping.*

### 2. Applicant Portal
Designed to empower job seekers with data-driven insights.

*   **🏠 Applicant Home & Dashboard**
    *   **Welcome Center**: Personalised greeting and "At a Glance" stats.
    *   **Action Hub**: Quick links to Gap Analysis, Job Search, and Interview Prep.
    *   **News Feed**: A real-time news ticker showing hiring trends and industry updates (Powered by NewsAPI).

*   **📊 Gap Analysis Engine (The Core Feature)**
    *   **Input**: Takes the user's resume and a target job description.
    *   **Processing**: Uses the Python NER model to extract skill sets from both documents.
    *   **Output**: 
        *   **Fit Score**: A percentage (0-100%) indicating match quality.
        *   **Matched Skills**: Green-highlighted skills that overlap.
        *   **Missing Skills**: Red-highlighted skills that the job requires but the user lacks.
        *   **Skill Clouds**: Visual representation of the skill gap.

*   **📝 ATS Score Checker**
    *   Analyzes the resume structure and keywords to predict "passability" through standard Applicant Tracking Systems.
    *   Provides actionable tips (e.g., "Add more strong action verbs").

*   **🤖 Interview Copilot**
    *   A mock interview tool that uses the job description to generate relevant technical and behavioral questions.
    *   **Session Management**: Create, Load, and Delete past interview sessions.
    *   **Privacy**: Deletion is confirmed via a custom modal and permanently removes chat history.
    *   Helps candidates practice before the real interview.

*   **💼 Job Search**
    *   A curated list of jobs that match the user's analyzed profile.

### 3. Recruiter Portal
Designed to streamline the hiring workflow.

*   **📈 Recruiter Dashboard**
    *   **Analytics**: Visual charts showing "Total Applications", "Time to Hire", and "Active Jobs".
    *   **Pipeline View**: A funnel view of candidates in different stages (Applied, Interviewing, Hired).

*   **✍️ Smart Job Creation**
    *   **Dynamic Form**: A rich interface to input Job Title, Department, Salary Range, and Description.
    *   **Requirement Builder**: Interactive list builder to add specific technical requirements (e.g., "React", "5+ Years Experience").
    *   **AI Enhancement**: The system (future) suggests requirements based on the Job Title entered.

*   **👥 Talent Pool**
    *   **Candidate Search**: Searchable database of applicants.
    *   **Smart Ranking**: Candidates are automatically sorted by their AI fit score, not just alphabetical order.
    *   **Profile Preview**: Click to expand a candidate card and see their "Gap Analysis" from the recruiter's perspective.

*   **📊 Analytics Suite**
    *   Deep dive metrics into which jobs are attracting the most attention and where candidates are dropping off.

---

## 🧠 Machine Learning Pipeline

The "Brain" of SmartHireAI is a custom-built Python service.

### 1. Named Entity Recognition (NER) model
*   **Purpose**: To read a resume like a human recruiter would.
*   **Technology**: Spacy (Transformer-based).
*   **Entities Extracted**:
    1.  `SKILLS`: Programming languages, tools, frameworks.
    2.  `EXPERIENCE`: Duration labels (e.g., "5 years", "2019-2023").
    3.  `DESIGNATION`: Job titles (e.g., "Senior Developer").
*   **Training Data**: `datasets/Entity Recognition in Resumes.json`.

### 2. Role Classification Model
*   **Purpose**: To tag a resume with a specific domain.
*   **Technology**: BERT (Bidirectional Encoder Representations from Transformers) - `bert-base-uncased`.
*   **Capabilities**: Classifies text into 20+ roles (Data Science, HR, Engineering, Sales, etc.).
*   **Training Data**: `datasets/Resume/Resume.csv`.

---

## 💻 Technical Stack

### Frontend (User Interface)
| Technology | Description |
|------------|-------------|
| **React 18** | Component-based UI library. |
| **Vite** | Next-generation build tool (Super fast). |
| **Framer Motion** | Physics-based animation library (Page transitions). |
| **Glassmorphism** | Custom CSS design system using backdrops and blurs. |
| **Lucide React** | Consistent, clean icon set. |

### Backend (API Gateway)
| Technology | Description |
|------------|-------------|
| **.NET 10** | Cutting-edge high-performance web framework. |
| **C#** | Strongly typed language for business logic. |
| **ASP.NET Core WebAPI** | RESTful endpoint architecture. |
| **HttpClientFactory** | efficient HTTP communication with the Python service. |

### AI Microservice (Intelligence)
| Technology | Description |
|------------|-------------|
| **Python 3.12** | The standard for Machine Learning. |
| **FastAPI** | High-performance async web framework. |
| **PyTorch** | Deep learning framework for BERT. |
| **Spacy** | Industrial-strength NLP. |

---

## 🛠️ Installation & Setup

Follow these distinct steps to launch the entire ecosystem.

### Prerequisites (Check these first!)
*   [ ] Node.js (v18 or higher)
*   [ ] .NET 10 SDK
*   [ ] Python 3.10+

### Step 1: Ignite the AI Engine 🧠
The brain must come alive first.

```bash
cd d:/Project
# Create virtual environment
python -m venv venv
# Activate it (Windows)
.\venv\Scripts\activate
# Install deps
pip install -r requirements.txt
# Download language model
python -m spacy download en_core_web_sm
# Start the API
cd api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```
*Verify at: http://localhost:8000/docs*

### Step 2: Launch the Backend 🛡️
The gateway needs to be ready.

```bash
# New Terminal
cd d:/Project/backend/SmartHireAI.Backend
dotnet restore
dotnet ef database update
dotnet run
```
*Verify at: Check console for port (usually 5000-5200)*

### Step 3: Start the Frontend 🎨
The interface for the user.

```bash
# New Terminal
cd d:/Project/frontend
npm install
npm run dev
```
*Verify at: http://localhost:5173*

---

## 📂 Project Directory Structure

```plaintext
d:/Project/
├── api/                        # [Python] The AI Brain
│   ├── main.py                 # API Endpoints
│   ├── models.py               # Data definitions
│   └── ...
├── backend/                    # [.NET] The Gateway
│   └── SmartHireAI.Backend/    # C# Solution
├── frontend/                   # [React] The Face
│   ├── src/
│   │   ├── pages/              # (Login, Dashboard, Analysis, etc.)
│   │   ├── components/         # (Navbar, JobCard, Charts)
│   │   └── context/            # (Auth, Toast)
├── data/                       # Pre-processed binaries
├── datasets/                   # Raw CSVs and JSONs
├── models/                     # Saved .pkl and .spacy models
└── scripts/                    # ML Training logic (train_ner.py)
```

---

## 🔧 Troubleshooting

*   **Error: "Fetch failed" in Frontend**
    *   Is the .NET Backend running? The frontend tries to talk to the backend, not the python service directly.
*   **Error: "503 AI Service Unavailable"**
    *   Is the Python `uvicorn` server running on port 8000? The .NET backend needs this to function.
*   **Error: "Module not found: transformers"**
    *   Did you activate the python virtual environment (`.\venv\Scripts\activate`) before running the server?

---

**SmartHireAI** - bridging the gap between talent and opportunity.
