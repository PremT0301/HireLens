import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import VerifyEmail from './pages/VerifyEmail';
import ApplicantLayout from './components/ApplicantLayout';
import ApplicantDashboard from './pages/applicant/ApplicantDashboard';
import Jobs from './pages/applicant/Jobs';
import GapAnalysis from './pages/applicant/GapAnalysis';
import ATSScore from './pages/applicant/ATSScore';
import InterviewCopilot from './pages/applicant/InterviewCopilot';
import RecruiterLayout from './components/RecruiterLayout';
import RecruiterDashboard from './pages/recruiter/RecruiterDashboard';
import JobPostings from './pages/recruiter/JobPostings';
import TalentPool from './pages/recruiter/TalentPool';
import Analytics from './pages/recruiter/Analytics';
import CreateJob from './pages/recruiter/CreateJob';
import CandidateProfile from './pages/recruiter/CandidateProfile';
import ScheduleMeeting from './pages/recruiter/ScheduleMeeting';
import ContactCandidate from './pages/recruiter/ContactCandidate';
import JobDetails from './pages/JobDetails';
import ProtectedRoute from './components/ProtectedRoute';
import PublicOnlyRoute from './components/PublicOnlyRoute';

// AnimatedRoutes component to use useLocation hook inside Router
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes (Accessible only to guests) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
        </Route>

        {/* Applicant Routes - PROTECTED */}
        <Route path="/applicant" element={
          <ProtectedRoute requiredRole="applicant">
            <ApplicantLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/applicant/dashboard" replace />} />
          <Route path="dashboard" element={<ApplicantDashboard />} />
          <Route path="ats-score" element={<ATSScore />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="jobs/:jobId" element={<JobDetails />} />
          <Route path="gap-analysis" element={<GapAnalysis />} />
          <Route path="interview-copilot" element={<InterviewCopilot />} />
        </Route>

        {/* Recruiter Routes - PROTECTED */}
        <Route path="/recruiter" element={
          <ProtectedRoute requiredRole="recruiter">
            <RecruiterLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/recruiter/dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterDashboard />} />
          <Route path="jobs" element={<JobPostings />} />
          <Route path="jobs/:jobId" element={<JobDetails />} />
          <Route path="create-job" element={<CreateJob />} />
          <Route path="edit-job/:jobId" element={<CreateJob />} />
          <Route path="talent-pool" element={<TalentPool />} />
          <Route path="candidate/:applicationId" element={<CandidateProfile />} />
          <Route path="schedule/:applicationId" element={<ScheduleMeeting />} />
          <Route path="contact/:applicationId" element={<ContactCandidate />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>

        <Route path="*" element={<Landing />} />
      </Routes>
    </AnimatePresence>
  );
};

import Footer from './components/Footer';
import AnimatedBackground from './components/ui/AnimatedBackground';

const AppContent = () => {
  const location = useLocation();
  const hideNavAndFooter = ['/login', '/signup', '/verify-email'];
  const shouldHide = hideNavAndFooter.includes(location.pathname);

  return (
    <div className="app" style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      position: 'relative'
    }}>
      <AnimatedBackground />
      {!shouldHide && <Navbar />}
      {/* Main content wrapper to push footer down */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
        <AnimatedRoutes />
      </div>
      {/* Gap before footer handled by margin-top: auto in Footer or here */}
      {!shouldHide && <div style={{ height: '4rem' }}></div>}
      {!shouldHide && <Footer />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </Router>
  );
}

export default App;
