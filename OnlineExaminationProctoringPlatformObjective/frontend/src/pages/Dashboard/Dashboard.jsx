// ============================================
// Dashboard Page — Role-based redirect
// ============================================

import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className="dashboard-page">
            <div className="dashboard-container animate-fade-in">
                <div className="dashboard-header">
                    <div>
                        <h1 className="heading-lg">
                            Welcome back, <span className="text-gradient">{user?.name}</span> 👋
                        </h1>
                        <p className="text-muted" style={{ marginTop: '4px' }}>
                            Role: <span className="badge badge-primary">{user?.role}</span>
                        </p>
                    </div>
                    <button onClick={logout} className="btn btn-secondary">
                        Logout
                    </button>
                </div>

                <div className="dashboard-grid">
                    <div className="card">
                        <div className="stat-icon">📝</div>
                        <h3>Exams</h3>
                        <p className="stat-number text-gradient">0</p>
                        <p className="text-muted text-sm">Coming in Feature 5</p>
                    </div>

                    <div className="card">
                        <div className="stat-icon">📚</div>
                        <h3>Questions</h3>
                        <p className="stat-number text-gradient">0</p>
                        <p className="text-muted text-sm">Coming in Feature 4</p>
                    </div>

                    <div className="card">
                        <div className="stat-icon">👥</div>
                        <h3>Users</h3>
                        <p className="stat-number text-gradient">0</p>
                        <p className="text-muted text-sm">Coming in Feature 3</p>
                    </div>

                    <div className="card">
                        <div className="stat-icon">📊</div>
                        <h3>Analytics</h3>
                        <p className="stat-number text-gradient">—</p>
                        <p className="text-muted text-sm">Coming in Feature 12</p>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '24px' }}>
                    <h3 className="heading-md" style={{ marginBottom: '12px' }}>🔧 API Health Check</h3>
                    <p className="text-muted text-sm">
                        Visit <a href="/api/health" target="_blank" rel="noreferrer">/api/health</a> to confirm the backend is running.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
