import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import CommandPalette from '../components/CommandPalette';
import ThemeToggle from '../components/ThemeToggle';
import { Menu, X } from 'lucide-react';

const AppLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSidebarOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div className="app-layout">
            <Sidebar className={sidebarOpen ? 'open' : ''} />
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
            )}
            <main className="main-content">
                <div className="main-topbar">
                    <div className="topbar-search-hint" onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }))}>
                        <span className="topbar-search-text">Search...</span>
                        <kbd className="topbar-kbd">Ctrl+K</kbd>
                    </div>
                    <ThemeToggle />
                    <NotificationBell />
                </div>
                <div className="page-enter" key={location.pathname}>
                    <Outlet />
                </div>
            </main>
            <CommandPalette />

            {/* Mobile sidebar toggle */}
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
        </div>
    );
};

export default AppLayout;
