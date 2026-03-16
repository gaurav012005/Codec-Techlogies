import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Zap, LayoutDashboard, Users, UserCircle, Building2,
    Kanban, ListTodo, BarChart3, Mail, Bell, Settings,
    Import, LogOut, Search, GitBranch
} from 'lucide-react';

const navSections = [
    {
        title: 'Overview',
        items: [
            { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ],
    },
    {
        title: 'Sales',
        items: [
            { to: '/pipeline', label: 'Pipeline', icon: Kanban },
            { to: '/leads', label: 'Leads', icon: Users },
            { to: '/deals', label: 'Deals', icon: BarChart3 },
        ],
    },
    {
        title: 'Relationships',
        items: [
            { to: '/contacts', label: 'Contacts', icon: UserCircle },
            { to: '/companies', label: 'Companies', icon: Building2 },
        ],
    },
    {
        title: 'Productivity',
        items: [
            { to: '/tasks', label: 'Tasks', icon: ListTodo },
            { to: '/email', label: 'Email', icon: Mail },
            { to: '/workflows', label: 'Workflows', icon: GitBranch },
        ],
    },
    {
        title: 'Insights',
        items: [
            { to: '/reports', label: 'Reports', icon: BarChart3 },
            { to: '/notifications', label: 'Notifications', icon: Bell },
        ],
    },
    {
        title: 'System',
        items: [
            { to: '/import-export', label: 'Import/Export', icon: Import },
            { to: '/admin', label: 'Admin Panel', icon: Settings },
        ],
    },
];

const Sidebar = ({ className = '' }) => {
    const { user, organization, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const formatRole = (role) => {
        if (!role) return '';
        return role.replace(/_/g, ' ');
    };

    return (
        <aside className={`sidebar ${className}`}>
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <Zap size={20} />
                </div>
                <div className="sidebar-brand">
                    <span className="sidebar-brand-name">CodeCRM</span>
                    <span className="sidebar-brand-org">{organization?.name || 'Enterprise'}</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                {/* Quick search button */}
                <button
                    className="sidebar-link"
                    style={{ width: '100%', border: '1px dashed var(--border-color)', marginBottom: 'var(--space-4)' }}
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}
                >
                    <Search size={18} />
                    <span>Quick Search</span>
                    <kbd style={{
                        marginLeft: 'auto', fontSize: '0.65rem',
                        padding: '2px 6px', background: 'var(--bg-tertiary)',
                        borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                    }}>
                        Ctrl+K
                    </kbd>
                </button>

                {navSections.map((section) => (
                    <div key={section.title}>
                        <div className="sidebar-section-title">{section.title}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon size={18} />
                                <span>{item.label}</span>
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
                    <div className="sidebar-avatar">
                        {getInitials(user?.name)}
                    </div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name}</div>
                        <div className="sidebar-user-role">{formatRole(user?.role)}</div>
                    </div>
                    <LogOut size={16} style={{ color: 'var(--text-muted)' }} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
