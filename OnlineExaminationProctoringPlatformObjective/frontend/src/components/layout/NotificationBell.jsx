// ============================================
// Notification Bell Dropdown — Feature 14
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineExternalLink,
} from 'react-icons/hi';
import api from '../../services/api';

const NOTIFICATION_ICONS = {
    EXAM_ASSIGNED: '📋',
    EXAM_REMINDER: '⏰',
    EXAM_STARTED: '🟢',
    EXAM_ENDING_SOON: '⚡',
    RESULTS_PUBLISHED: '📊',
    FLAGGED_CHEATING: '🚩',
    NEW_USER_REGISTERED: '👤',
    PASSWORD_RESET: '🔑',
    EXAM_SUBMITTED: '✅',
    GRADING_COMPLETE: '📝',
};

// Mock notifications for when API is not connected
const MOCK_NOTIFICATIONS = [
    { id: 'mock-1', type: 'EXAM_ASSIGNED', title: 'New Exam Available', message: 'Data Structures Final has been assigned to you.', read: false, createdAt: new Date(Date.now() - 60000 * 5).toISOString() },
    { id: 'mock-2', type: 'RESULTS_PUBLISHED', title: 'Results Published', message: 'Web Dev Midterm results are now available.', read: false, createdAt: new Date(Date.now() - 60000 * 60).toISOString() },
    { id: 'mock-3', type: 'EXAM_REMINDER', title: 'Exam Tomorrow', message: 'You have an exam scheduled for tomorrow at 10 AM.', read: true, createdAt: new Date(Date.now() - 60000 * 180).toISOString() },
];

export default function NotificationBell() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [unread, setUnread] = useState(2);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const socketRef = useRef(null);
    const hasFetchedRef = useRef(false);

    // Check if user has a real JWT token
    const hasToken = () => !!localStorage.getItem('accessToken');

    // Fetch unread count — only if user has a real token
    const fetchUnread = useCallback(async () => {
        if (!hasToken()) return; // Skip if no real auth token
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnread(data.data.unreadCount);
        } catch {
            // silent fail — mock data is already set
        }
    }, []);

    // Fetch recent notifications — only if user has a real token
    const fetchNotifications = useCallback(async () => {
        if (!hasToken()) return; // Skip if no real auth token
        setLoading(true);
        try {
            const { data } = await api.get('/notifications', { params: { limit: 8 } });
            setNotifications(data.data.notifications);
        } catch {
            // Keep mock data
        } finally {
            setLoading(false);
        }
    }, []);

    // Initialize Socket.IO — only once, only if real token exists
    useEffect(() => {
        if (!user?.id) return;
        if (!hasToken()) return; // Skip socket if using mock auth

        // Only fetch once on mount
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchUnread();
        }

        // Try to connect Socket.IO via dynamic import
        let cancelled = false;
        import('socket.io-client').then(({ io: socketIOClient }) => {
            if (cancelled) return;
            const socket = socketIOClient(
                import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
                { withCredentials: true, transports: ['websocket', 'polling'] }
            );

            socket.on('connect', () => {
                socket.emit('join', user.id);
            });

            socket.on('notification', (notif) => {
                setNotifications((prev) => [notif, ...prev].slice(0, 8));
                setUnread((prev) => prev + 1);
            });

            socketRef.current = socket;
        }).catch(() => {
            // Socket.IO not available
        });

        return () => {
            cancelled = true;
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

    // Open dropdown → load notifications
    useEffect(() => {
        if (open) fetchNotifications();
    }, [open, fetchNotifications]);

    // Click outside → close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Mark single as read
    const handleMarkRead = async (id) => {
        // Update UI immediately
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnread((prev) => Math.max(0, prev - 1));
        // API call only if real token
        if (hasToken()) {
            try { await api.put(`/notifications/${id}/read`); } catch { /* silent */ }
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnread(0);
        if (hasToken()) {
            try { await api.put('/notifications/read-all'); } catch { /* silent */ }
        }
    };

    // Time ago formatter
    const timeAgo = (dateStr) => {
        if (!dateStr) return '';
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    };

    return (
        <div className="notif-bell-wrapper" ref={dropdownRef}>
            <button
                className="header-icon-btn"
                onClick={() => setOpen(!open)}
                style={{ position: 'relative' }}
            >
                <HiOutlineBell />
                {unread > 0 && (
                    <span className="notif-badge">{unread > 99 ? '99+' : unread}</span>
                )}
            </button>

            {open && (
                <div className="notif-dropdown">
                    {/* Header */}
                    <div className="notif-dropdown-header">
                        <span className="notif-dropdown-title">
                            Notifications
                            {unread > 0 && (
                                <span className="notif-unread-count">{unread} new</span>
                            )}
                        </span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            {unread > 0 && (
                                <button className="notif-action-btn" onClick={handleMarkAllRead} title="Mark all as read">
                                    <HiOutlineCheck /> Read all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* List */}
                    <div className="notif-dropdown-list">
                        {loading ? (
                            <div className="notif-empty">
                                <div className="spinner spinner-sm" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notif-empty">
                                <span style={{ fontSize: '1.5rem' }}>🔕</span>
                                <span>No notifications yet</span>
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`notif-item ${!n.read ? 'unread' : ''}`}
                                    onClick={() => {
                                        if (!n.read) handleMarkRead(n.id);
                                    }}
                                >
                                    <span className="notif-icon">
                                        {NOTIFICATION_ICONS[n.type] || '📬'}
                                    </span>
                                    <div className="notif-content">
                                        <div className="notif-item-title">{n.title}</div>
                                        <div className="notif-item-message">{n.message}</div>
                                        <div className="notif-item-time">{timeAgo(n.createdAt)}</div>
                                    </div>
                                    {!n.read && <span className="notif-unread-dot" />}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="notif-dropdown-footer">
                        <button
                            className="notif-view-all"
                            onClick={() => {
                                setOpen(false);
                                navigate('/dashboard/notifications');
                            }}
                        >
                            View all notifications <HiOutlineExternalLink />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
