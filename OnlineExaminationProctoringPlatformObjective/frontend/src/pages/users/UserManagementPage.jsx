import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    HiOutlinePlus, HiOutlineSearch, HiOutlineDotsVertical,
    HiOutlinePencil, HiOutlineTrash, HiOutlineBan, HiOutlineCheckCircle,
    HiOutlineUsers, HiOutlineShieldCheck, HiOutlineAcademicCap,
    HiOutlineKey, HiOutlineMail,
} from 'react-icons/hi';

const MOCK_USERS = [
    { id: '1', name: 'Dr. Rajesh Kumar', email: 'admin@examplatform.com', role: 'ADMIN', status: 'ACTIVE', exams: 12, created: '2026-01-15' },
    { id: '2', name: 'Prof. Priya Sharma', email: 'examiner@examplatform.com', role: 'EXAMINER', status: 'ACTIVE', exams: 8, created: '2026-01-20' },
    { id: '3', name: 'Amit Verma', email: 'amit@student.com', role: 'STUDENT', status: 'ACTIVE', exams: 5, created: '2026-02-01' },
    { id: '4', name: 'Sneha Patel', email: 'sneha@student.com', role: 'STUDENT', status: 'ACTIVE', exams: 3, created: '2026-02-05' },
    { id: '5', name: 'Rahul Singh', email: 'rahul@student.com', role: 'STUDENT', status: 'BLOCKED', exams: 4, created: '2026-02-08' },
    { id: '6', name: 'Dr. Anil Gupta', email: 'anil@examiner.com', role: 'EXAMINER', status: 'ACTIVE', exams: 6, created: '2026-02-10' },
    { id: '7', name: 'Meera Joshi', email: 'meera@student.com', role: 'STUDENT', status: 'ACTIVE', exams: 2, created: '2026-02-12' },
    { id: '8', name: 'Karan Malhotra', email: 'karan@student.com', role: 'STUDENT', status: 'ACTIVE', exams: 7, created: '2026-02-15' },
];

const roleConfig = {
    ADMIN: { label: 'Admin', badge: 'badge-danger', icon: '👑' },
    EXAMINER: { label: 'Examiner', badge: 'badge-primary', icon: '📝' },
    STUDENT: { label: 'Student', badge: 'badge-success', icon: '🎓' },
};

const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const item = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0 }
};

export default function UserManagementPage() {
    const [users, setUsers] = useState(MOCK_USERS);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [openDropdown, setOpenDropdown] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', role: 'STUDENT' });

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRole = !filterRole || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const handleToggleBlock = (id) => {
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } : u));
        setOpenDropdown(null);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            setUsers(prev => prev.filter(u => u.id !== id));
        }
        setOpenDropdown(null);
    };

    const handleSave = () => {
        if (editUser) {
            setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...formData } : u));
        } else {
            setUsers(prev => [...prev, { id: Date.now().toString(), ...formData, status: 'ACTIVE', exams: 0, created: new Date().toISOString().split('T')[0] }]);
        }
        setShowModal(false);
        setEditUser(null);
        setFormData({ name: '', email: '', role: 'STUDENT' });
    };

    const openEditModal = (user) => {
        setEditUser(user);
        setFormData({ name: user.name, email: user.email, role: user.role });
        setShowModal(true);
        setOpenDropdown(null);
    };

    return (
        <motion.div variants={container} initial="hidden" animate="show">
            <motion.div variants={item} className="page-header">
                <div className="page-header-left">
                    <h1 className="page-title">User Management</h1>
                    <p className="page-subtitle">{users.length} users · Manage roles and access</p>
                </div>
                <div className="page-header-actions">
                    <button className="btn btn-primary" onClick={() => { setEditUser(null); setFormData({ name: '', email: '', role: 'STUDENT' }); setShowModal(true); }}>
                        <HiOutlinePlus /> Add User
                    </button>
                </div>
            </motion.div>

            <motion.div variants={item} className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 'var(--space-6)' }}>
                <div className="stat-card primary" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{users.length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Total Users</div>
                </div>
                <div className="stat-card danger" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{users.filter(u => u.role === 'ADMIN').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Admins</div>
                </div>
                <div className="stat-card info" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{users.filter(u => u.role === 'EXAMINER').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Examiners</div>
                </div>
                <div className="stat-card success" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                    <div className="stat-card-value" style={{ fontSize: 'var(--font-xl)' }}>{users.filter(u => u.role === 'STUDENT').length}</div>
                    <div className="stat-card-label" style={{ fontSize: 'var(--font-xs)' }}>Students</div>
                </div>
            </motion.div>

            <motion.div variants={item} className="filter-bar">
                <div className="filter-search">
                    <span className="filter-search-icon"><HiOutlineSearch /></span>
                    <input type="text" placeholder="Search users..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <select className="filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                    <option value="">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="EXAMINER">Examiner</option>
                    <option value="STUDENT">Student</option>
                </select>
            </motion.div>

            <motion.div variants={item} className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Exams</th>
                                <th>Joined</th>
                                <th style={{ width: 50 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => {
                                const role = roleConfig[u.role];
                                const initials = u.name.split(' ').map(n => n[0]).join('');
                                return (
                                    <tr key={u.id}>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                                                <div style={{
                                                    width: 36, height: 36, borderRadius: 'var(--radius-full)',
                                                    background: 'linear-gradient(135deg, var(--primary-400), var(--success-400))',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 'var(--font-xs)', fontWeight: 700, color: 'white', flexShrink: 0,
                                                }}>
                                                    {initials}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                                                    <div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${role.badge}`}>
                                                {role.icon} {role.label}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
                                                <span className="badge-dot"></span>
                                                {u.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>{u.exams}</td>
                                        <td style={{ fontSize: 'var(--font-xs)', color: 'var(--text-tertiary)' }}>{u.created}</td>
                                        <td>
                                            <div style={{ position: 'relative' }}>
                                                <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setOpenDropdown(openDropdown === u.id ? null : u.id)}>
                                                    <HiOutlineDotsVertical />
                                                </button>
                                                {openDropdown === u.id && (
                                                    <div className="dropdown-menu" onClick={() => setOpenDropdown(null)}>
                                                        <button className="dropdown-item" onClick={() => openEditModal(u)}><HiOutlinePencil /> Edit</button>
                                                        <button className="dropdown-item" onClick={() => handleToggleBlock(u.id)}>
                                                            {u.status === 'BLOCKED' ? <><HiOutlineCheckCircle /> Unblock</> : <><HiOutlineBan /> Block</>}
                                                        </button>
                                                        <button className="dropdown-item"><HiOutlineKey /> Reset Password</button>
                                                        <button className="dropdown-item danger" onClick={() => handleDelete(u.id)}><HiOutlineTrash /> Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <motion.div className="modal" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">{editUser ? 'Edit User' : 'Add New User'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select className="form-input form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                                    <option value="STUDENT">Student</option>
                                    <option value="EXAMINER">Examiner</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSave}>{editUser ? 'Save Changes' : 'Create User'}</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
}
