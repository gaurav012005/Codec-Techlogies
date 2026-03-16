// ============================================
// Admin User Management Page
// ============================================

import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import {
    HiSearch, HiPlus, HiPencil, HiTrash, HiBan,
    HiCheck, HiKey, HiX, HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';
import './UserManagement.css';

const ROLES = ['ADMIN', 'EXAMINER', 'STUDENT'];

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create | edit | reset
    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'STUDENT' });

    const fetchUsers = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            if (statusFilter) params.status = statusFilter;

            const { data } = await api.get('/users', { params });
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, [search, roleFilter, statusFilter]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Open modals
    const openCreate = () => {
        setModalMode('create');
        setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
        setSelectedUser(null);
        setShowModal(true);
    };

    const openEdit = (user) => {
        setModalMode('edit');
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
        setSelectedUser(user);
        setShowModal(true);
    };

    const openResetPassword = (user) => {
        setModalMode('reset');
        setFormData({ ...formData, password: '' });
        setSelectedUser(user);
        setShowModal(true);
    };

    // Actions
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'create') {
                await api.post('/users', formData);
                toast.success('User created');
            } else if (modalMode === 'edit') {
                const { password, ...updateData } = formData;
                await api.put(`/users/${selectedUser.id}`, updateData);
                toast.success('User updated');
            } else if (modalMode === 'reset') {
                await api.post(`/users/${selectedUser.id}/reset-password`, { newPassword: formData.password });
                toast.success('Password reset');
            }
            setShowModal(false);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Action failed');
        }
    };

    const handleToggleBlock = async (user) => {
        try {
            const { data } = await api.patch(`/users/${user.id}/block`);
            toast.success(data.message);
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed');
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Deactivate user "${user.name}"?`)) return;
        try {
            await api.delete(`/users/${user.id}`);
            toast.success('User deactivated');
            fetchUsers(pagination.page);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed');
        }
    };

    const roleBadgeClass = (role) => {
        if (role === 'ADMIN') return 'badge-danger';
        if (role === 'EXAMINER') return 'badge-warning';
        return 'badge-primary';
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header flex-between">
                <div>
                    <h1>User Management</h1>
                    <p className="text-muted">{pagination.total} users total</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <HiPlus /> Add User
                </button>
            </div>

            {/* Filters */}
            <div className="filters-bar card">
                <div className="input-with-icon filter-search">
                    <HiSearch className="input-icon" />
                    <input
                        type="text"
                        className="input-field"
                        placeholder="Search by name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="input-field filter-select"
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                >
                    <option value="">All Roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <select
                    className="input-field filter-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>

            {/* Table */}
            <div className="table-container" style={{ marginTop: '20px' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" className="table-loading"><div className="spinner" /></td></tr>
                        ) : users.length === 0 ? (
                            <tr><td colSpan="6" className="table-empty">No users found</td></tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="user-cell-avatar">{u.name.charAt(0).toUpperCase()}</div>
                                            <span>{u.name}</span>
                                        </div>
                                    </td>
                                    <td>{u.email}</td>
                                    <td><span className={`badge ${roleBadgeClass(u.role)}`}>{u.role}</span></td>
                                    <td>
                                        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {u.isActive ? 'Active' : 'Blocked'}
                                        </span>
                                    </td>
                                    <td className="text-muted text-sm">
                                        {new Date(u.createdAt).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit">
                                                <HiPencil />
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => handleToggleBlock(u)}
                                                title={u.isActive ? 'Block' : 'Unblock'}
                                            >
                                                {u.isActive ? <HiBan /> : <HiCheck />}
                                            </button>
                                            <button className="btn btn-ghost btn-sm" onClick={() => openResetPassword(u)} title="Reset Password">
                                                <HiKey />
                                            </button>
                                            <button className="btn btn-ghost btn-sm action-delete" onClick={() => handleDelete(u)} title="Delete">
                                                <HiTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-secondary btn-sm"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchUsers(pagination.page - 1)}
                    >
                        <HiChevronLeft /> Prev
                    </button>
                    <span className="text-muted text-sm">
                        Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <button
                        className="btn btn-secondary btn-sm"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchUsers(pagination.page + 1)}
                    >
                        Next <HiChevronRight />
                    </button>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-card card-glass animate-fade-in" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="heading-md">
                                {modalMode === 'create' ? '➕ Create User' :
                                    modalMode === 'edit' ? '✏️ Edit User' : '🔑 Reset Password'}
                            </h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>
                                <HiX />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="modal-form">
                            {modalMode !== 'reset' && (
                                <>
                                    <div className="input-group">
                                        <label>Name</label>
                                        <input
                                            type="text"
                                            className="input-field"
                                            placeholder="Full Name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            className="input-field"
                                            placeholder="user@example.com"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Role</label>
                                        <select
                                            className="input-field"
                                            value={formData.role}
                                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        >
                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                </>
                            )}

                            {(modalMode === 'create' || modalMode === 'reset') && (
                                <div className="input-group">
                                    <label>{modalMode === 'reset' ? 'New Password' : 'Password'}</label>
                                    <input
                                        type="password"
                                        className="input-field"
                                        placeholder="Min 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}

                            <div className="modal-actions">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {modalMode === 'create' ? 'Create' : modalMode === 'edit' ? 'Save Changes' : 'Reset Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
