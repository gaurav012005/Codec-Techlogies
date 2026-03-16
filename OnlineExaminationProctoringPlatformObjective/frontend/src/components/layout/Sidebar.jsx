import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineViewGrid,
    HiOutlineUsers,
    HiOutlineClipboardList,
    HiOutlineDocumentText,
    HiOutlineChartBar,
    HiOutlineCog,
    HiOutlineBell,
    HiOutlineShieldCheck,
    HiOutlineAcademicCap,
    HiOutlineLogout,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineLightningBolt,
    HiOutlineCollection,
    HiOutlinePencilAlt,
    HiOutlineShieldExclamation,
} from 'react-icons/hi';

const adminNav = [
    { section: 'Main' },
    { label: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
    { label: 'Users', path: '/dashboard/users', icon: HiOutlineUsers },
    { section: 'Exam Management' },
    { label: 'Question Bank', path: '/dashboard/questions', icon: HiOutlineCollection, badge: 'New' },
    { label: 'Exams', path: '/dashboard/exams', icon: HiOutlineClipboardList },
    { section: 'Monitoring' },
    { label: 'Proctoring', path: '/dashboard/proctoring', icon: HiOutlineShieldCheck },
    { label: 'Analytics', path: '/dashboard/analytics', icon: HiOutlineChartBar },
    { label: 'Grading', path: '/dashboard/analytics/grading', icon: HiOutlinePencilAlt, badge: 'New' },
    { label: 'Plagiarism', path: '/dashboard/plagiarism', icon: HiOutlineShieldExclamation, badge: 'New' },
    { section: 'System' },
    { label: 'Notifications', path: '/dashboard/notifications', icon: HiOutlineBell },
    { label: 'Settings', path: '/dashboard/settings', icon: HiOutlineCog },
];

const examinerNav = [
    { section: 'Main' },
    { label: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
    { section: 'Exam Management' },
    { label: 'Question Bank', path: '/dashboard/questions', icon: HiOutlineCollection, badge: 'New' },
    { label: 'Exams', path: '/dashboard/exams', icon: HiOutlineClipboardList },
    { label: 'Analytics', path: '/dashboard/analytics', icon: HiOutlineChartBar },
    { label: 'Grading', path: '/dashboard/analytics/grading', icon: HiOutlinePencilAlt, badge: 'New' },
    { label: 'Plagiarism', path: '/dashboard/plagiarism', icon: HiOutlineShieldExclamation, badge: 'New' },
    { section: 'System' },
    { label: 'Notifications', path: '/dashboard/notifications', icon: HiOutlineBell },
    { label: 'Settings', path: '/dashboard/settings', icon: HiOutlineCog },
];

const studentNav = [
    { section: 'Main' },
    { label: 'Dashboard', path: '/dashboard', icon: HiOutlineViewGrid },
    { label: 'My Exams', path: '/dashboard/exams', icon: HiOutlineClipboardList },
    { label: 'Results', path: '/dashboard/results', icon: HiOutlineDocumentText },
    { section: 'System' },
    { label: 'Notifications', path: '/dashboard/notifications', icon: HiOutlineBell },
    { label: 'Settings', path: '/dashboard/settings', icon: HiOutlineCog },
];

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getNavItems = () => {
        switch (user?.role) {
            case 'ADMIN': return adminNav;
            case 'EXAMINER': return examinerNav;
            default: return studentNav;
        }
    };

    const navItems = getNavItems();
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Brand */}
            <div className="sidebar-brand">
                <div className="sidebar-brand-icon">
                    <HiOutlineLightningBolt />
                </div>
                {!collapsed && (
                    <div className="sidebar-brand-text">
                        <span className="sidebar-brand-name">ExamForge</span>
                        <span className="sidebar-brand-subtitle">Proctoring Platform</span>
                    </div>
                )}
            </div>

            {/* Toggle */}
            <button className="sidebar-toggle" onClick={onToggle}>
                {collapsed ? <HiOutlineChevronRight /> : <HiOutlineChevronLeft />}
            </button>

            {/* Navigation */}
            <div className="sidebar-nav">
                {navItems.map((item, i) => {
                    if (item.section) {
                        return !collapsed ? (
                            <div key={`section-${i}`} className="sidebar-section-label">
                                {item.section}
                            </div>
                        ) : <div key={`section-${i}`} style={{ height: 8 }} />;
                    }

                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

                    return (
                        <div key={item.path} className={collapsed ? 'tooltip-wrapper' : ''}>
                            <NavLink
                                to={item.path}
                                className={`sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon"><Icon /></span>
                                {!collapsed && (
                                    <>
                                        <span>{item.label}</span>
                                        {item.badge && (
                                            <span className="sidebar-link-badge">{item.badge}</span>
                                        )}
                                    </>
                                )}
                            </NavLink>
                            {collapsed && (
                                <div className="tooltip-content">{item.label}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={logout}>
                    <div className="sidebar-avatar">{initials}</div>
                    {!collapsed && (
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.name}</div>
                            <div className="sidebar-user-role">{user?.role}</div>
                        </div>
                    )}
                    {!collapsed && (
                        <HiOutlineLogout style={{ marginLeft: 'auto', color: 'var(--text-tertiary)', fontSize: 16 }} />
                    )}
                </div>
            </div>
        </nav>
    );
}
