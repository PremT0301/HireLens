# HireLens AI - Project Flow & Architecture

This document describes the high-level operational flow of the HireLens AI platform, detailing how the user interacts with the system and how data moves between the Frontend, Backend, and AI Service.

## 🔄 High-Level Architecture Flow

The system operates on a 3-tier architecture:

1.  **Frontend (React)**: The user interface layer.
2.  **Backend (.NET API)**: The business logic and data management layer.
3.  **AI Service (Python)**: The intelligence layer for NLP and analysis.

```mermaid
graph TD
    User((User))
    Frontend[Frontend - React/Vite]
    Backend[Backend - .NET Core WebAPI]
    DB[(Database - MySQL)]
    AI[AI Service - Python/FastAPI]

    User -->|Interacts| Frontend
    Frontend -->|API Calls (HTTP)| Backend
    Backend -->|Queries/Updates| DB
    Backend -->|Analysis Request| AI
    AI -->|Analysis Result| Backend
```

## 👤 User Journeys

### 1. Authentication Flow
*   **User** authenticates via Login or Signup.
*   **Frontend** sends credentials to `AuthController`.
*   **Backend** validates against `Users` table.
*   **Result**: A JWT Token is returned and stored in the frontend key-value store.
*   **Role Routing**: User is redirected to `ApplicantDashboard` or `RecruiterDashboard` based on their role.

### 2. The Job Application Flow (Applicant)
1.  **Profile Setup**: Applicant creates a profile and uploads a resume.
    *   *Resume Upload* -> `ResumesController` -> Stores file & parses content.
2.  **Job Search**: Applicant browses open roles (`JobsController`).
3.  **Application**: Applicant clicks "Apply".
    *   Backend creates a `JobApplication` record.
    *   Backend automatically triggers an **ATS Score** check.

### 3. The Recruitment Flow (Recruiter)
1.  **Post Job**: Recruiter creates a job description (`JobsController`).
2.  **View Talent Pool**: Recruiter sees a list of applicants (`ProfilesController`/`ApplicationsController`).
3.  **Analysis**: The system automatically ranks candidates.
    *   Background Process: `AnalysisController` requests **Gap Analysis** from the Python AI Service.
    *   AI Service compares `Proccessed Resume` vs `Job Description` (NER & Semantic Matching).
    *   Returns: Match %, Skills Match, Missing Skills.
4.  **Action**: Recruiter schedules an interview or rejects the candidate.
    *   **Unified Contact**: Recruiter can send "Interview Request", "Follow-up", or "Rejection" via `ContactCandidate`.
    *   **Notifications**: Actions trigger emails and in-app alerts for the applicant.
5.  **Hiring**: Recruiter clicks "Hire Candidate".
    *   **Validation**: Backend checks if the candidate is already hired elsewhere and if the job has remaining openings.
    *   **Auto-Close**: If the hire fills the last opening (e.g., 3/3 hires), the job status is automatically updated to `Closed`.

## 🧠 AI Intelligence Flow

The "Brain" of the operation works as follows:

1.  **Input**: Text data (Resume Text + Job Description).
2.  **Processing (Python Service)**:
    *   **NER Model (Spacy)**: Extracts entities like `SKILLS`, `EXPERIENCE`, `DESIGNATION`.
    *   **Classification (BERT)**: Determines the domain/role of the resume.
3.  **Output**: Structured JSON data containing the fit score and recommendations, which the Backend relays to the Frontend.

## 📂 Key Controllers & Responsibilities

| Controller | Responsibility |
| :--- | :--- |
| `AuthController` | Login, Signup, Token Generation. |
| `ProfilesController` | Management of Applicant & Recruiter profiles. |
| `JobsController` | Creating, editing, and listing job postings. |
| `ApplicationsController` | Handling the act of applying and tracking status. |
| `ResumesController` | Uploading and parsing resume files. |
| `AnalysisController` | Bridge between .NET and Python AI Service. |
| `InboxController` | Management of in-app notifications and messages. |

## 🔗 Deep Links
- [Frontend Codebase](file:///d:/HireLens/frontend)
- [Backend Codebase](file:///d:/HireLens/backend/SmartHireAI.Backend)
- [AI Service Codebase](file:///d:/HireLens/api)
