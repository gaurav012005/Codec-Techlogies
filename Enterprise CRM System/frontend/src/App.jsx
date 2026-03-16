import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './layouts/AppLayout';

// Auth pages (loaded eagerly — needed immediately)
import Login from './pages/Login';
import Register from './pages/Register';

// Lazy-loaded pages (code split per route)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Leads = lazy(() => import('./pages/Leads'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Companies = lazy(() => import('./pages/Companies'));
const PipelinePage = lazy(() => import('./pages/Pipeline'));
const TasksPage = lazy(() => import('./pages/Tasks'));
const Reports = lazy(() => import('./pages/Reports'));
const EmailCenter = lazy(() => import('./pages/EmailCenter'));
const Notifications = lazy(() => import('./pages/Notifications'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const ImportExport = lazy(() => import('./pages/ImportExport'));
const Workflows = lazy(() => import('./pages/Workflows'));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '50vh' }}>
    <div className="spinner" style={{
      width: 36, height: 36,
      borderColor: 'rgba(99,102,241,0.2)',
      borderTopColor: 'var(--primary-400)',
      borderWidth: 3,
    }} />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Suspense fallback={<PageLoader />}><Dashboard /></Suspense>} />
            <Route path="/pipeline" element={<Suspense fallback={<PageLoader />}><PipelinePage /></Suspense>} />
            <Route path="/leads" element={<Suspense fallback={<PageLoader />}><Leads /></Suspense>} />
            <Route path="/deals" element={<Suspense fallback={<PageLoader />}><PipelinePage /></Suspense>} />
            <Route path="/contacts" element={<Suspense fallback={<PageLoader />}><Contacts /></Suspense>} />
            <Route path="/companies" element={<Suspense fallback={<PageLoader />}><Companies /></Suspense>} />
            <Route path="/tasks" element={<Suspense fallback={<PageLoader />}><TasksPage /></Suspense>} />
            <Route path="/email" element={<Suspense fallback={<PageLoader />}><EmailCenter /></Suspense>} />
            <Route path="/reports" element={<Suspense fallback={<PageLoader />}><Reports /></Suspense>} />
            <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
            <Route path="/import-export" element={<Suspense fallback={<PageLoader />}><ImportExport /></Suspense>} />
            <Route path="/admin" element={<Suspense fallback={<PageLoader />}><AdminPanel /></Suspense>} />
            <Route path="/workflows" element={<Suspense fallback={<PageLoader />}><Workflows /></Suspense>} />
            <Route path="/workflows/builder" element={<Suspense fallback={<PageLoader />}><WorkflowBuilder /></Suspense>} />
            <Route path="/workflows/builder/:id" element={<Suspense fallback={<PageLoader />}><WorkflowBuilder /></Suspense>} />
          </Route>

          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
