import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Bell, Check, CheckCheck, Trash2, Filter,
    Layers, Target, CheckSquare, Mail, Zap, AlertTriangle
} from 'lucide-react';

const CATEGORY_ICONS = {
    deals: Target,
    tasks: CheckSquare,
    emails: Mail,
    system: Zap,
    mentions: Bell,
};

const CATEGORY_COLORS = {
    deals: 'var(--primary-400)',
    tasks: 'var(--accent-amber)',
    emails: 'var(--accent-cyan)',
    system: 'var(--accent-violet)',
    mentions: 'var(--accent-emerald)',
};

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchNotifications(); }, [filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter === 'unread') params.isRead = 'false';
            else if (filter !== 'all') params.category = filter;

            const { data } = await api.get('/notifications', { params });
            setNotifications(data.data?.notifications || []);
            setUnreadCount(data.data?.unreadCount || 0);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { console.error(err); }
    };

    const markAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) { console.error(err); }
    };

    const deleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (err) { console.error(err); }
    };

    const formatTime = (date) => {
        const diff = (Date.now() - new Date(date)) / 1000;
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return new Date(date).toLocaleDateString();
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Notifications</h1>
                    <p className="page-subtitle">
                        {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button className="btn btn-ghost btn-sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
                        <CheckCheck size={16} /> Mark all read
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="report-tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'unread', label: 'Unread' },
                    { id: 'deals', label: 'Deals' },
                    { id: 'tasks', label: 'Tasks' },
                    { id: 'emails', label: 'Emails' },
                    { id: 'system', label: 'System' },
                ].map(f => (
                    <button key={f.id} className={`report-tab ${filter === f.id ? 'active' : ''}`}
                        onClick={() => setFilter(f.id)}>
                        {f.label}
                        {f.id === 'all' && unreadCount > 0 && (
                            <span className="notif-badge-inline">{unreadCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Notification List */}
            <div className="report-chart-card" style={{ padding: 0 }}>
                {loading ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
                ) : notifications.length === 0 ? (
                    <div style={{ padding: 60, textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Bell size={32} style={{ marginBottom: 12, opacity: 0.4 }} />
                        <p>No notifications</p>
                    </div>
                ) : (
                    notifications.map((n, i) => {
                        const Icon = CATEGORY_ICONS[n.category] || Bell;
                        const color = CATEGORY_COLORS[n.category] || 'var(--text-muted)';
                        return (
                            <div key={n._id}
                                className={`notif-item ${!n.isRead ? 'unread' : ''}`}
                                style={{ animationDelay: `${i * 0.03}s`, animation: 'fadeInUp 0.3s ease-out backwards' }}
                            >
                                <div className="notif-icon" style={{ color }}>
                                    <Icon size={18} />
                                </div>
                                <div className="notif-content">
                                    <div className="notif-title">{n.title}</div>
                                    {n.message && <div className="notif-message">{n.message}</div>}
                                    <div className="notif-time">{formatTime(n.createdAt)}</div>
                                </div>
                                <div className="notif-actions">
                                    {!n.isRead && (
                                        <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(n._id)} title="Mark as read">
                                            <Check size={14} />
                                        </button>
                                    )}
                                    <button className="btn btn-ghost btn-sm" onClick={() => deleteNotification(n._id)} title="Delete"
                                        style={{ color: 'var(--text-muted)' }}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Notifications;
