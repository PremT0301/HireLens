# Project Timeline & Task Roadmap

This document outlines the strategic roadmap for bringing **SmartHireAI** from its current prototype state to a fully functional production release.

---

## 📅 Timeline Overview

| Phase | Focus Area | Duration | Status |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Database & Core Backend** | Weeks 1-2 | 🟢 Complete |
| **Phase 2** | **Frontend-Backend Integration** | Weeks 3-4 | 🟢 Complete |
| **Phase 3** | **AI Integration & Workflows** | Week 5 | 🟢 Complete |
| **Phase 4** | **Testing, Polish & Deploy** | Week 6+ | 🟡 In Progress |

---

## ✅ Phase 0: Foundations (Completed)
*   [x] **AI Microservice**: Python wrapper for Spacy/BERT is running and exposing endpoints.
*   [x] **Frontend UI**: Visual design system, routing, and mock pages are complete.
*   [x] **Backend Skeleton**: .NET 10 WebAPI project is created and receiving requests.

---

## 🛠️ Phase 1: Database & Core Backend (Weeks 1-2)
**Goal**: Establish a persistent data layer and secure authentication.

### 1.1 Database Design & Setup
- [x] **Schema Design**: Finalize ER Diagram for:
    - `Users` (Recruiters/Applicants)
    - `Jobs` (Postings with requirements)
    - `Resumes` (parsed text and metadata)
    - `Applications` (mapping Users to Jobs)
    - `AnalysisResults` (AI scores and cached results)
- [x] **Implementation**: Setup MySQL (Dependencies & Config).
- [x] **EF Core Setup**: Configure `DbContext` and Connection Strings.

### 1.2 Authentication System
- [x] **Identity**: Implement ASP.NET Core Identity or custom JWT-based auth.
- [x] **Endpoints**: specific `POST /auth/login` and `POST /auth/register` controllers.
- [x] **Role Management**: enforce `[Authorize(Roles="Recruiter")]` on protected endpoints.

### 1.3 Core CRUD Operations
- [x] **Jobs API**: `GET`, `POST`, `PUT`, `DELETE` for Job Postings.
- [x] **Profiles API**: CRUD for Candidate Profiles.

---

## 🔗 Phase 2: Frontend Integration (Weeks 3-4)
**Goal**: Connect the "Glassmorphism" UI to the real API.

### 2.1 API Service Layer
- [x] **Axios Setup**: configure base URL, interceptors for JWT tokens, and error handling.
- [x] **Services**: Create typed services `authService.js` (Done), `jobService.js` (Done), `analysisService.js` (Pending).

### 2.2 Functional Auth Flow
- [x] **Login Integration**: Replace `localStorage` mocks with real API calls.
- [x] **Registration**: Allow new users to sign up and inherit correct roles.
- [x] **Session Persistence**: Handle token expiration and auto-logout.

### 2.3 Dashboard Wiring
- [x] **Recruiter Dashboard**: Fetch real "Active Jobs" count from database.
- [x] **Applicant Dashboard**: Fetch "Recently Applied" list and News feed (Mock/API).

---

## 🧠 Phase 3: The "Smart" Loop (Week 5)
**Goal**: End-to-end integration of the Resume Parsing and Job Matching workflow.

### 3.1 Resume Upload Pipeline
### 3.1 Resume Upload Pipeline
- [x] **Components**: Build a real file uploader (Drag & Drop) in React.
- [x] **Backend Processing**:
    - [x] Receive File (`IFormFile`).
    - [x] Extract Text (using `PdfPig` or `iTextSharp`).
    - [x] **Forward to AI**: Send text to Python Microservice (`/analyze-resume`).
- [x] **Storage**: Save the JSON result (Skills, Experience) to the database.

### 3.2 Job Matching Engine
- [x] **Trigger**: User triggers Gap Analysis via Dashboard or dedicate page.
- [x] **Display**: Render the "Skill Clouds" and "Fit Score" based on live data (Gauge, Charts).

### 3.3 UI/UX Refinements
- [x] **Landing Page**: Modernize design and animation.
- [x] **Navigation**: Strict role-based routing and redirection.
- [x] **Dashboard**: Add News Feeds and Personalization.
- [x] **Recruiter Profile**: Extended fields (Company, Designation) and Logo Upload.

---

## 🚀 Phase 4: Polish & Launch (Week 6+)
**Goal**: Hardening the application for release.

### 4.1 Production Readiness
- [ ] **Dockerization**: Create `Dockerfile` for .NET, Python, and React apps, and a `docker-compose.yml`.
- [ ] **Environment Config**: Move connection strings and keys to Environment Variables.

### 4.2 Quality Assurance
- [ ] **Unit Tests**: Add NUnit tests for Backend Services.
- [ ] **E2E Tests**: Verify critical paths (Sign Up -> Create Job -> Apply -> Match).

### 4.3 Advanced Features (Nice to Have)
### 4.3 Advanced Features (Nice to Have)
- [x] **Interview Copilot Basis**: Session management (Create/Load/Delete) and History persistence.
- [ ] **LLM Integration**: Connect Interview Copilot to an actual LLM API for dynamic responses.
- [ ] **Email Notifications**: Send confirmation emails on application submission.
