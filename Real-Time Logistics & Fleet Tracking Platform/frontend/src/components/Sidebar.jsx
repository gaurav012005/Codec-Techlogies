import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
    { icon: 'dashboard', label: 'Dashboard', path: '/admin' },
    { icon: 'map', label: 'Live Map', path: '/admin/map' },
    { icon: 'commute', label: 'Fleet Management', path: '/admin/fleet' },
    { icon: 'group', label: 'Drivers', path: '/admin/drivers' },
    { icon: 'package_2', label: 'Deliveries', path: '/admin/deliveries' },
    { icon: 'bar_chart_4_bars', label: 'Analytics', path: '/admin/analytics' },
    { icon: 'settings', label: 'Settings', path: '/admin/settings' },
];

export default function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="sidebar-logo-inner">
                    <div className="sidebar-logo-icon">
                        <span className="material-symbols-outlined">local_shipping</span>
                    </div>
                    <div>
                        <div className="sidebar-logo-title">FleetTrack Pro</div>
                        <div className="sidebar-logo-subtitle">Command Center</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <a
                        key={item.path}
                        href="#"
                        className={
                            item.path === '/admin'
                                ? (location.pathname === '/admin' ? 'active' : '')
                                : (location.pathname.startsWith(item.path) ? 'active' : '')
                        }
                        onClick={(e) => {
                            e.preventDefault();
                            navigate(item.path);
                        }}
                    >
                        <span className="material-symbols-outlined">{item.icon}</span>
                        <span>{item.label}</span>
                    </a>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="sidebar-dispatch-btn">
                    <span className="material-symbols-outlined">add_circle</span>
                    New Dispatch
                </button>
                <div className="sidebar-user">
                    <div className="sidebar-user-avatar">{getInitials(user.name)}</div>
                    <div style={{ overflow: 'hidden' }}>
                        <div className="sidebar-user-name">{user.name || 'User'}</div>
                        <div className="sidebar-user-role">{user.role === 'admin' ? 'Senior Ops Manager' : 'Driver'}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
