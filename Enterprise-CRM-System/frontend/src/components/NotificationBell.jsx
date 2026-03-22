import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';

const NotificationBell = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, []);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const fetchUnread = async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.data?.count || 0);
        } catch (err) { }
    };

    const fetchNotifications = async () => {
        try {
            const { data } = await api.get('/notifications', { params: { limit: 10 } });
            setNotifications(data.data?.notifications || []);
        } catch (err) { }
    };

    const handleOpen = () => {
        if (!isOpen) fetchNotifications();
        setIsOpen(!isOpen);
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) { }
    };

    const formatTime = (date) => {
        const diff = (Date.now() - new Date(date)) / 1000;
        if (diff < 60) return 'Now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
        return `${Math.floor(diff / 86400)}d`;
    };

    return (
        <div className="notif-bell-wrapper" ref={dropdownRef}>
            <button className="notif-bell-btn" onClick={handleOpen}>
                <Bell size={20} />
                {unreadCount > 0 && <span className="notif-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </button>

            {isOpen && (
                <div className="notif-dropdown">
                    <div className="notif-dropdown-header">
                        <span>Notifications</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => { setIsOpen(false); navigate('/notifications'); }}>
                            View all <ExternalLink size={12} />
                        </button>
                    </div>
                    <div className="notif-dropdown-list">
                        {notifications.length === 0 && (
                            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-xs)' }}>
                                No notifications
                            </div>
                        )}
                        {notifications.map(n => (
                            <div key={n._id} className={`notif-dropdown-item ${!n.isRead ? 'unread' : ''}`} onClick={() => markAsRead(n._id)}>
                                <div className="notif-dropdown-content">
                                    <div className="notif-dropdown-title">{n.title}</div>
                                    {n.message && <div className="notif-dropdown-msg">{n.message}</div>}
                                </div>
                                <span className="notif-dropdown-time">{formatTime(n.createdAt)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
