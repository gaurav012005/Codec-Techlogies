import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLocation } from 'react-router-dom';
import {
    HiOutlineSearch,
    HiOutlineMoon,
    HiOutlineSun,
    HiOutlineChatAlt2,
    HiOutlineDownload,
    HiOutlineX,
} from 'react-icons/hi';
import NotificationBell from './NotificationBell';

const routeLabels = {
    '/dashboard': 'Overview',
    '/dashboard/users': 'User Management',
    '/dashboard/questions': 'Question Bank',
    '/dashboard/questions/new': 'Create Question',
    '/dashboard/exams': 'Exams',
    '/dashboard/exams/new': 'Create Exam',
    '/dashboard/analytics': 'Analytics',
    '/dashboard/analytics/grading': 'Manual Grading',
    '/dashboard/proctoring': 'Proctoring',
    '/dashboard/notifications': 'Notifications',
    '/dashboard/settings': 'Settings',
    '/dashboard/results': 'Results',
    '/dashboard/plagiarism': 'Plagiarism Detection',
};

// Mock messages
const MOCK_MESSAGES = [
    { id: 1, from: 'Prof. Priya Sharma', avatar: 'PS', message: 'Please review the grading for Data Structures Final.', time: '5m ago', unread: true },
    { id: 2, from: 'Dr. Amit Patel', avatar: 'AP', message: 'The plagiarism report for CS102 is ready.', time: '1h ago', unread: true },
    { id: 3, from: 'System', avatar: '⚙️', message: 'Backup completed successfully at 10:30 PM.', time: '3h ago', unread: false },
    { id: 4, from: 'Sneha Patel', avatar: 'SP', message: 'Can I get an extension for the assignment?', time: '5h ago', unread: false },
];

export default function Header({ collapsed }) {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();
    const [messagesOpen, setMessagesOpen] = useState(false);
    const [messages, setMessages] = useState(MOCK_MESSAGES);
    const messagesRef = useRef(null);

    const currentLabel = routeLabels[location.pathname] || 'Dashboard';
    const unreadMessages = messages.filter(m => m.unread).length;

    // Close messages panel on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (messagesRef.current && !messagesRef.current.contains(e.target)) {
                setMessagesOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkMessageRead = (id) => {
        setMessages(prev => prev.map(m => m.id === id ? { ...m, unread: false } : m));
    };

    // Export current page data as JSON
    const handleExport = () => {
        const exportData = {
            page: currentLabel,
            exportedAt: new Date().toISOString(),
            exportedBy: user?.name || 'Unknown',
            note: 'This is a demo export. Connect to real API for actual data.',
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentLabel.toLowerCase().replace(/\s+/g, '_')}_export_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <header className={`header ${collapsed ? 'collapsed' : ''}`}>
            <div className="header-left">
                <div className="header-breadcrumb">
                    <span>ExamForge</span>
                    <span className="header-breadcrumb-sep">/</span>
                    <span className="header-breadcrumb-current">{currentLabel}</span>
                </div>
            </div>

            <div className="header-search">
                <span className="header-search-icon"><HiOutlineSearch /></span>
                <input type="text" placeholder="Search anything..." />
                <span className="header-search-shortcut">⌘K</span>
            </div>

            <div className="header-right">
                {/* Export Button */}
                <button
                    className="header-icon-btn"
                    onClick={handleExport}
                    title="Export page data"
                >
                    <HiOutlineDownload />
                </button>

                {/* Dark / Light Mode Toggle */}
                <button
                    className="header-icon-btn"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    style={theme === 'light' ? { color: '#f59e0b' } : {}}
                >
                    {theme === 'dark' ? <HiOutlineMoon /> : <HiOutlineSun />}
                </button>

                {/* Messages Toggle */}
                <div ref={messagesRef} style={{ position: 'relative' }}>
                    <button
                        className="header-icon-btn"
                        onClick={() => setMessagesOpen(!messagesOpen)}
                        title="Messages"
                        style={{ position: 'relative' }}
                    >
                        <HiOutlineChatAlt2 />
                        {unreadMessages > 0 && (
                            <span style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #10b981, #059669)',
                                color: 'white',
                                fontSize: '0.6rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.4)',
                            }}>
                                {unreadMessages}
                            </span>
                        )}
                    </button>

                    {/* Messages Dropdown */}
                    {messagesOpen && (
                        <div className="notif-dropdown" style={{ width: 360 }}>
                            <div className="notif-dropdown-header">
                                <span className="notif-dropdown-title">
                                    💬 Messages
                                    {unreadMessages > 0 && (
                                        <span className="notif-unread-count">{unreadMessages} new</span>
                                    )}
                                </span>
                                <button
                                    className="notif-action-btn"
                                    onClick={() => setMessagesOpen(false)}
                                >
                                    <HiOutlineX />
                                </button>
                            </div>
                            <div className="notif-dropdown-list">
                                {messages.length === 0 ? (
                                    <div className="notif-empty">
                                        <span style={{ fontSize: '1.5rem' }}>💬</span>
                                        <span>No messages</span>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`notif-item ${msg.unread ? 'unread' : ''}`}
                                            onClick={() => handleMarkMessageRead(msg.id)}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            <span style={{
                                                width: 34,
                                                height: 34,
                                                borderRadius: 8,
                                                background: msg.from === 'System'
                                                    ? 'rgba(99, 102, 241, 0.12)'
                                                    : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                                color: msg.from === 'System' ? '#818cf8' : 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: msg.avatar.length > 2 ? '1.1rem' : '0.7rem',
                                                fontWeight: 700,
                                                flexShrink: 0,
                                            }}>
                                                {msg.avatar}
                                            </span>
                                            <div className="notif-content">
                                                <div className="notif-item-title">{msg.from}</div>
                                                <div className="notif-item-message">{msg.message}</div>
                                                <div className="notif-item-time">{msg.time}</div>
                                            </div>
                                            {msg.unread && <span className="notif-unread-dot" />}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <NotificationBell />
            </div>
        </header>
    );
}
