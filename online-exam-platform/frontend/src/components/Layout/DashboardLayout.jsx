// ============================================
// Dashboard Layout — Sidebar + Content Area
// ============================================

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiHome, HiUsers, HiCollection, HiClipboardList,
    HiChartPie, HiLogout, HiBell, HiCog,
} from 'react-icons/hi';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const { user, logout, isAdmin, isExaminer } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/dashboard', icon: <HiHome />, label: 'Dashboard', end: true },
        ...(isAdmin ? [{ to: '/dashboard/users', icon: <HiUsers />, label: 'Users' }] : []),
        ...(isAdmin || isExaminer
            ? [
                { to: '/dashboard/questions', icon: <HiCollection />, label: 'Questions' },
                { to: '/dashboard/exams', icon: <HiClipboardList />, label: 'Exams' },
            ]
            : []),
        { to: '/dashboard/analytics', icon: <HiChartPie />, label: 'Analytics' },
    ];

    return (
        <div className="dashboard-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text text-gradient">ExamGuard</span>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                            }
                        >
                            <span className="sidebar-link-icon">{item.icon}</span>
                            <span className="sidebar-link-label">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* User info at bottom */}
                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">
                            {user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role badge badge-primary">{user?.role}</div>
                        </div>
                    </div>
                    <button className="sidebar-logout" onClick={handleLogout} title="Logout">
                        <HiLogout />
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="dashboard-main">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;
