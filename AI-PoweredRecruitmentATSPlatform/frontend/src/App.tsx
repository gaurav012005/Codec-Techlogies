import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import JobsPage from './pages/JobsPage';
import JobFormPage from './pages/JobFormPage';
import JobEditPage from './pages/JobEditPage';
import JobDetailPage from './pages/JobDetailPage';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetailPage from './pages/CandidateDetailPage';
import CandidateFormPage from './pages/CandidateFormPage';
import PipelinePage from './pages/PipelinePage';
import InterviewsPage from './pages/InterviewsPage';
import AIInsightsPage from './pages/AIInsightsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import TeamPage from './pages/TeamPage';
import TalentPoolPage from './pages/TalentPoolPage';
import EmailsPage from './pages/EmailsPage';
import SettingsPage from './pages/SettingsPage';
import CandidatePortalPage from './pages/CandidatePortalPage';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/dashboard/jobs" element={<JobsPage />} />
        <Route path="/dashboard/jobs/new" element={<JobFormPage />} />
        <Route path="/dashboard/jobs/:id/edit" element={<JobEditPage />} />
        <Route path="/dashboard/jobs/:id" element={<JobDetailPage />} />
        <Route path="/dashboard/candidates" element={<CandidatesPage />} />
        <Route path="/dashboard/candidates/new" element={<CandidateFormPage />} />
        <Route path="/dashboard/candidates/:id" element={<CandidateDetailPage />} />
        <Route path="/dashboard/pipeline" element={<PipelinePage />} />
        <Route path="/dashboard/interviews" element={<InterviewsPage />} />
        <Route path="/dashboard/ai-insights" element={<AIInsightsPage />} />
        <Route path="/dashboard/analytics" element={<AnalyticsPage />} />
        <Route path="/dashboard/team" element={<TeamPage />} />
        <Route path="/dashboard/talent-pool" element={<TalentPoolPage />} />
        <Route path="/dashboard/emails" element={<EmailsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/portal" element={<CandidatePortalPage />} />
      </Routes>
    </Router>
  );
}

export default App;
