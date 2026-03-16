import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="app-layout">
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />
            <div className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
                <Header collapsed={sidebarCollapsed} />
                <div className="page-container">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
