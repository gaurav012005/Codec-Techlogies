// ============================================
// Dashboard Home — Stats Overview
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import './Dashboard.css';

const DashboardHome = () => {
    const { user, isAdmin, isExaminer, isStudent } = useAuth();
    const [stats, setStats] = useState({ users: 0, questions: 0, exams: 0 });

    useEffect(() => {
        if (isAdmin) {
            api.get('/users?limit=1').then(r => setStats(s => ({ ...s, users: r.data.pagination?.total || 0 }))).catch(() => { });
        }
    }, [isAdmin]);

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1>Welcome back, <span className="text-gradient">{user?.name}</span> 👋</h1>
                <p>Here's your overview for today</p>
            </div>

            <div className="dashboard-grid">
                {isAdmin && (
                    <div className="card stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-info">
                            <p className="stat-label text-muted">Total Users</p>
                            <p className="stat-number text-gradient">{stats.users}</p>
                        </div>
                    </div>
                )}

                <div className="card stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                        <p className="stat-label text-muted">Exams</p>
                        <p className="stat-number text-gradient">0</p>
                        <p className="text-muted text-xs">Coming in Feature 5</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-info">
                        <p className="stat-label text-muted">Questions</p>
                        <p className="stat-number text-gradient">0</p>
                        <p className="text-muted text-xs">Coming in Feature 4</p>
                    </div>
                </div>

                <div className="card stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-info">
                        <p className="stat-label text-muted">Analytics</p>
                        <p className="stat-number text-gradient">—</p>
                        <p className="text-muted text-xs">Coming in Feature 12</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginTop: '24px' }}>
                <h3 className="heading-md" style={{ marginBottom: '8px' }}>🔧 System Status</h3>
                <p className="text-muted text-sm">
                    Backend API: <span className="badge badge-success">Online</span>{' '}
                    | Role: <span className="badge badge-primary">{user?.role}</span>
                </p>
            </div>
        </div>
    );
};

export default DashboardHome;
