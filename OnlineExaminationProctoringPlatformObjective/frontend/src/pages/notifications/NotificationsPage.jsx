// ============================================
// Notifications Page — Feature 14
// Full notification list + management
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    HiOutlineBell,
    HiOutlineCheck,
    HiOutlineTrash,
    HiOutlinePaperAirplane,
    HiOutlineFilter,
} from 'react-icons/hi';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './NotificationsPage.css';

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

const NOTIFICATION_TYPES = [
    'EXAM_ASSIGNED', 'EXAM_REMINDER', 'EXAM_STARTED', 'EXAM_ENDING_SOON',
    'RESULTS_PUBLISHED', 'FLAGGED_CHEATING', 'NEW_USER_REGISTERED',
    'PASSWORD_RESET', 'EXAM_SUBMITTED', 'GRADING_COMPLETE',
];

// Mock data for when API is not running
const MOCK_NOTIFICATIONS = [
    { id: '1', type: 'EXAM_ASSIGNED', title: 'New Exam Assigned', message: 'You have been assigned "Data Structures Final" exam. It starts on March 1st.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
    { id: '2', type: 'EXAM_REMINDER', title: 'Exam Reminder', message: 'Your "Web Development Midterm" exam starts in 2 hours.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: '3', type: 'RESULTS_PUBLISHED', title: 'Results Published', message: 'Results for "Operating Systems Quiz" are now available. Check your score!', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
    { id: '4', type: 'GRADING_COMPLETE', title: 'Grading Complete', message: 'Your short-answer responses for "Database Design" have been graded.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString() },
    { id: '5', type: 'EXAM_SUBMITTED', title: 'Exam Submitted', message: 'Your "Computer Networks" exam was auto-submitted due to time expiry.', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    { id: '6', type: 'FLAGGED_CHEATING', title: 'Proctoring Alert', message: 'Your "Algorithms Final" attempt was flagged for review. 3 tab switches detected.', read: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString() },
    { id: '7', type: 'EXAM_ENDING_SOON', title: 'Exam Ending Soon', message: '"Software Engineering Quiz" closes in 30 minutes. Submit before it ends!', read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
];

export default function NotificationsPage() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, unread, read
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    // Admin send notification dialog
    const [showSendDialog, setShowSendDialog] = useState(false);
    const [sendForm, setSendForm] = useState({ title: '', message: '', type: 'EXAM_ASSIGNED', targetRole: 'STUDENT' });
    const [sending, setSending] = useState(false);

    const hasToken = () => !!localStorage.getItem('accessToken');

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        if (!hasToken()) {
            // No JWT — use mock data directly
            let filtered = [...MOCK_NOTIFICATIONS];
            if (filter === 'unread') filtered = filtered.filter((n) => !n.read);
            if (filter === 'read') filtered = filtered.filter((n) => n.read);
            setNotifications(filtered);
            setPagination({ total: filtered.length, page: 1, limit: 15, totalPages: 1 });
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/notifications', {
                params: { page, limit: 15, unreadOnly: filter === 'unread' ? 'true' : 'false' },
            });
            setNotifications(data.data.notifications);
            setPagination(data.data.pagination);
        } catch {
            let filtered = [...MOCK_NOTIFICATIONS];
            if (filter === 'unread') filtered = filtered.filter((n) => !n.read);
            if (filter === 'read') filtered = filtered.filter((n) => n.read);
            setNotifications(filtered);
            setPagination({ total: filtered.length, page: 1, limit: 15, totalPages: 1 });
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

    const handleMarkRead = async (id) => {
        if (hasToken()) {
            try { await api.put(`/notifications/${id}/read`); } catch { /* silent */ }
        }
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    };

    const handleMarkAllRead = async () => {
        if (hasToken()) {
            try { await api.put('/notifications/read-all'); } catch { /* silent */ }
        }
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    const handleDelete = async (id) => {
        if (hasToken()) {
            try { await api.delete(`/notifications/${id}`); } catch { /* silent */ }
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const handleSendNotification = async () => {
        if (!sendForm.title || !sendForm.message) return;
        setSending(true);
        if (hasToken()) {
            try {
                await api.post('/notifications/send', {
                    type: sendForm.type,
                    title: sendForm.title,
                    message: sendForm.message,
                    targetRole: sendForm.targetRole,
                });
            } catch { /* silent */ }
        }
        setShowSendDialog(false);
        setSendForm({ title: '', message: '', type: 'EXAM_ASSIGNED', targetRole: 'STUDENT' });
        setSending(false);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        const now = Date.now();
        const diff = now - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins} minutes ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days} days ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const unreadCount = notifications.filter((n) => !n.read).length;
    const isAdmin = ['ADMIN', 'EXAMINER'].includes(user?.role);

    return (
        <div className="notifications-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <HiOutlineBell style={{ verticalAlign: 'middle', color: 'var(--primary-400)' }} />
                        {' '}Notifications
                    </h1>
                    <p className="page-subtitle">
                        {unreadCount > 0
                            ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}`
                            : 'You\'re all caught up!'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary" onClick={handleMarkAllRead}>
                            <HiOutlineCheck /> Mark all read
                        </button>
                    )}
                    {isAdmin && (
                        <button className="btn btn-primary" onClick={() => setShowSendDialog(true)}>
                            <HiOutlinePaperAirplane /> Send Notification
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="notif-filters">
                {['all', 'unread', 'read'].map((f) => (
                    <button
                        key={f}
                        className={`notif-filter-btn ${filter === f ? 'active' : ''}`}
                        onClick={() => { setFilter(f); setPage(1); }}
                    >
                        {f === 'all' ? 'All' : f === 'unread' ? '🔵 Unread' : '✅ Read'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="notif-list-container">
                {loading ? (
                    <div className="flex-center" style={{ minHeight: 200 }}>
                        <div className="spinner spinner-lg" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="notif-empty-state">
                        <span style={{ fontSize: '3rem' }}>🔕</span>
                        <h3>No notifications</h3>
                        <p>When something happens, you'll see it here.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {notifications.map((n, idx) => (
                            <motion.div
                                key={n.id}
                                className={`notif-list-item ${!n.read ? 'unread' : ''}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -100 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <div className="notif-list-icon">
                                    {NOTIFICATION_ICONS[n.type] || '📬'}
                                </div>
                                <div className="notif-list-content">
                                    <div className="notif-list-title">{n.title}</div>
                                    <div className="notif-list-message">{n.message}</div>
                                    <div className="notif-list-time">{formatDate(n.createdAt)}</div>
                                </div>
                                <div className="notif-list-actions">
                                    {!n.read && (
                                        <button
                                            className="notif-list-action-btn"
                                            onClick={() => handleMarkRead(n.id)}
                                            title="Mark as read"
                                        >
                                            <HiOutlineCheck />
                                        </button>
                                    )}
                                    <button
                                        className="notif-list-action-btn danger"
                                        onClick={() => handleDelete(n.id)}
                                        title="Delete"
                                    >
                                        <HiOutlineTrash />
                                    </button>
                                </div>
                                {!n.read && <div className="notif-list-unread-bar" />}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="notif-pagination">
                        <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-secondary btn-sm">
                            ← Previous
                        </button>
                        <span className="notif-page-info">
                            Page {page} of {pagination.totalPages}
                        </span>
                        <button disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)} className="btn btn-secondary btn-sm">
                            Next →
                        </button>
                    </div>
                )}
            </div>

            {/* Send Notification Dialog (Admin) */}
            {showSendDialog && (
                <div className="modal-overlay" onClick={() => setShowSendDialog(false)}>
                    <div className="notif-send-dialog" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">📣 Send Notification</h2>

                        <div className="form-group">
                            <label className="form-label">Notification Type</label>
                            <select
                                className="form-select"
                                value={sendForm.type}
                                onChange={(e) => setSendForm({ ...sendForm, type: e.target.value })}
                            >
                                {NOTIFICATION_TYPES.map((t) => (
                                    <option key={t} value={t}>{NOTIFICATION_ICONS[t]} {t.replace(/_/g, ' ')}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Target Audience</label>
                            <select
                                className="form-select"
                                value={sendForm.targetRole}
                                onChange={(e) => setSendForm({ ...sendForm, targetRole: e.target.value })}
                            >
                                <option value="STUDENT">All Students</option>
                                <option value="EXAMINER">All Examiners</option>
                                <option value="ADMIN">All Admins</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Notification title..."
                                value={sendForm.title}
                                onChange={(e) => setSendForm({ ...sendForm, title: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Message</label>
                            <textarea
                                className="form-input"
                                placeholder="Notification message..."
                                rows={4}
                                value={sendForm.message}
                                onChange={(e) => setSendForm({ ...sendForm, message: e.target.value })}
                            />
                        </div>

                        <div className="modal-actions">
                            <button className="btn btn-ghost" onClick={() => setShowSendDialog(false)}>
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSendNotification}
                                disabled={sending || !sendForm.title || !sendForm.message}
                            >
                                {sending ? 'Sending...' : '📤 Send Notification'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
