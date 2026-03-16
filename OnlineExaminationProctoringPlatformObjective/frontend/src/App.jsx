import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Pages
import Landing from './pages/Landing/Landing';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dashboard Pages
import DashboardOverview from './pages/dashboard/DashboardOverview';

// Feature Pages
import QuestionBankPage from './pages/questions/QuestionBankPage';
import QuestionEditorPage from './pages/questions/QuestionEditorPage';
import ExamListPage from './pages/exams/ExamListPage';
import ExamBuilderPage from './pages/exams/ExamBuilderPage';
import UserManagementPage from './pages/users/UserManagementPage';

// Feature 6: Student Exam Flow
import StudentExamListPage from './pages/student/StudentExamListPage';
import ExamPlayer from './pages/student/ExamPlayer';

// Feature 7: Results Engine
import ResultPage from './pages/student/ResultPage';
import MyResultsPage from './pages/student/MyResultsPage';

// Feature 9: Proctoring Dashboard
import ProctoringDashboard from './pages/proctoring/ProctoringDashboard';

// Feature 12: Analytics & Grading
import AnalyticsDashboard from './pages/analytics/AnalyticsDashboard';
import GradingPage from './pages/analytics/GradingPage';

// Feature 13: Plagiarism Detection
import PlagiarismDashboard from './pages/plagiarism/PlagiarismDashboard';

// Feature 14: Notifications
import NotificationsPage from './pages/notifications/NotificationsPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, roles }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg" /></div>;
    }

    if (!isAuthenticated) return <Navigate to="/login" replace />;

    if (roles && user && !roles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

// Exam Router to split Teacher/Student dashboards on the same route
const ExamsRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'STUDENT') {
        return <StudentExamListPage />;
    }
    return <ExamListPage />;
};

// Public Route Wrapper (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="flex-center" style={{ minHeight: '100vh' }}><div className="spinner spinner-lg" /></div>;
    }

    if (isAuthenticated) return <Navigate to="/dashboard" replace />;

    return children;
};

const App = () => {
    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                    }
                }}
            />
            <Routes>
                {/* Public Landing Page */}
                <Route path="/" element={<Landing />} />

                {/* Public auth routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                {/* Protected Dashboard Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    {/* Default dashboard route */}
                    <Route index element={<DashboardOverview />} />

                    {/* Feature: Users */}
                    <Route path="users" element={
                        <ProtectedRoute roles={['ADMIN']}>
                            <UserManagementPage />
                        </ProtectedRoute>
                    } />

                    {/* Feature 4: Question Bank */}
                    <Route path="questions" element={<ProtectedRoute roles={['ADMIN', 'EXAMINER']}><QuestionBankPage /></ProtectedRoute>} />
                    <Route path="questions/new" element={<ProtectedRoute roles={['ADMIN', 'EXAMINER']}><QuestionEditorPage /></ProtectedRoute>} />
                    <Route path="questions/edit/:id" element={<ProtectedRoute roles={['ADMIN', 'EXAMINER']}><QuestionEditorPage /></ProtectedRoute>} />

                    {/* Feature 5 / 6: Exams Router */}
                    <Route path="exams" element={<ExamsRouter />} />
                    <Route path="exams/new" element={<ProtectedRoute roles={['ADMIN', 'EXAMINER']}><ExamBuilderPage /></ProtectedRoute>} />
                    <Route path="exams/edit/:id" element={<ProtectedRoute roles={['ADMIN', 'EXAMINER']}><ExamBuilderPage /></ProtectedRoute>} />

                    <Route path="analytics" element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <AnalyticsDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="analytics/grading" element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <GradingPage />
                        </ProtectedRoute>
                    } />
                    <Route path="proctoring" element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <ProctoringDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="results" element={<MyResultsPage />} />
                    <Route path="settings" element={<div className="page-header"><h1 className="page-title">Settings</h1><p className="page-subtitle">Coming soon...</p></div>} />
                    <Route path="plagiarism" element={
                        <ProtectedRoute roles={['ADMIN', 'EXAMINER']}>
                            <PlagiarismDashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="notifications" element={<NotificationsPage />} />

                </Route>

                {/* Feature 6: Exam Player — fullscreen */}
                <Route path="/exam/:examId/take" element={
                    <ProtectedRoute>
                        <ExamPlayer />
                    </ProtectedRoute>
                } />

                {/* Feature 7: Result Page — fullscreen */}
                <Route path="/exam/:attemptId/result" element={
                    <ProtectedRoute>
                        <ResultPage />
                    </ProtectedRoute>
                } />

                {/* Error Routes */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </>
    );
};

export default App;
