import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../components/icons/Icon';
import './DashboardLayout.css';

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'jobs', label: 'Jobs', path: '/dashboard/jobs' },
    { icon: 'candidates', label: 'Candidates', path: '/dashboard/candidates' },
    { icon: 'pipeline', label: 'Pipeline', path: '/dashboard/pipeline' },
    { icon: 'interviews', label: 'Interviews', path: '/dashboard/interviews' },
    { icon: 'insights', label: 'AI Insights', path: '/dashboard/ai-insights' },
    { icon: 'emails', label: 'Emails', path: '/dashboard/emails' },
    { icon: 'talentPool', label: 'Talent Pool', path: '/dashboard/talent-pool' },
    { icon: 'analytics', label: 'Analytics', path: '/dashboard/analytics' },
    { icon: 'candidates', label: 'Team', path: '/dashboard/team' },
    { icon: 'settings', label: 'Settings', path: '/dashboard/settings' },
];

interface DashboardLayoutProps {
    children: React.ReactNode;
    title?: string;
}

const DashboardLayout = ({ children, title = 'Dashboard' }: DashboardLayoutProps) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || '{"firstName":"Alex","lastName":"Rivera","role":"recruiter"}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <div className={`dashboard-layout ${sidebarCollapsed ? 'dashboard-layout--collapsed' : ''}`}>
            {/* Sidebar */}
            <aside className="sidebar" id="sidebar">
                <div className="sidebar__top">
                    <Link to="/dashboard" className="sidebar__logo">
                        <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                            <circle cx="16" cy="16" r="14" stroke="url(#sb-grad)" strokeWidth="2.5" fill="none" />
                            <path d="M10 16l4 4 8-8" stroke="url(#sb-grad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <defs>
                                <linearGradient id="sb-grad" x1="0" y1="0" x2="32" y2="32">
                                    <stop stopColor="#6c5ce7" /><stop offset="1" stopColor="#00cec9" />
                                </linearGradient>
                            </defs>
                        </svg>
                        {!sidebarCollapsed && (
                            <div className="sidebar__logo-text">
                                <span className="sidebar__logo-name">HireAI</span>
                                <span className="sidebar__logo-sub">Recruiter Command</span>
                            </div>
                        )}
                    </Link>
                </div>

                <nav className="sidebar__nav">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <span className="sidebar__item-icon"><Icon name={item.icon} size={18} /></span>
                                {!sidebarCollapsed && <span className="sidebar__item-label">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebar__bottom">
                    <div className="sidebar__user">
                        <div className="sidebar__user-avatar">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="sidebar__user-info">
                                <div className="sidebar__user-name">{user.firstName} {user.lastName}</div>
                                <div className="sidebar__user-role">{user.role?.replace('_', ' ')}</div>
                            </div>
                        )}
                    </div>
                    <button className="sidebar__logout" onClick={handleLogout} title="Logout">
                        <span><Icon name="logout" size={18} /></span>
                        {!sidebarCollapsed && <span>Logout</span>}
                    </button>
                </div>

                <button
                    className="sidebar__toggle"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    aria-label="Toggle sidebar"
                >
                    {sidebarCollapsed ? '→' : '←'}
                </button>
            </aside>

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="topbar" id="topbar">
                    <div className="topbar__left">
                        <span className="topbar__breadcrumb">Dashboard › <strong>{title}</strong></span>
                    </div>

                    <div className="topbar__center">
                        <div className="topbar__search">
                            <span className="topbar__search-icon"><Icon name="search" size={16} /></span>
                            <input
                                type="text"
                                className="topbar__search-input"
                                placeholder="Search candidates, jobs..."
                                id="global-search"
                            />
                            <kbd className="topbar__search-kbd">⌘K</kbd>
                        </div>
                    </div>

                    <div className="topbar__right">
                        <button
                            className="topbar__notif-btn"
                            onClick={() => setNotifOpen(!notifOpen)}
                            id="notif-btn"
                        >
                            <Icon name="notification" size={20} />
                            <span className="topbar__notif-badge">3</span>
                        </button>

                        <Link to="/dashboard/jobs/new" className="btn btn-primary btn-sm" id="new-job-btn">
                            + New Job
                        </Link>

                        <div className="topbar__user-avatar">
                            {user.firstName?.[0]}{user.lastName?.[0]}
                        </div>
                    </div>

                    {/* Notification dropdown */}
                    {notifOpen && (
                        <div className="topbar__notif-dropdown glass-elevated" id="notif-dropdown">
                            <div className="topbar__notif-header">
                                <h5>Notifications</h5>
                                <button className="btn btn-ghost btn-sm">Mark all read</button>
                            </div>
                            <div className="topbar__notif-list">
                                <div className="topbar__notif-item topbar__notif-item--unread">
                                    <span className="topbar__notif-dot"></span>
                                    <div>
                                        <p><strong>Sarah Jenkins</strong> scored 98% match for UX Lead</p>
                                        <span className="topbar__notif-time">2 min ago</span>
                                    </div>
                                </div>
                                <div className="topbar__notif-item topbar__notif-item--unread">
                                    <span className="topbar__notif-dot"></span>
                                    <div>
                                        <p>Interview with <strong>Jordan Lee</strong> starts in 30 minutes</p>
                                        <span className="topbar__notif-time">28 min ago</span>
                                    </div>
                                </div>
                                <div className="topbar__notif-item">
                                    <div>
                                        <p><strong>12 resumes</strong> auto-screened for Senior Backend Dev</p>
                                        <span className="topbar__notif-time">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </header>

                {/* Page Content */}
                <main className="dashboard-content" id="dashboard-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
