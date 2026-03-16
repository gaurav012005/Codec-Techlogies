import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './JobFormPage.css';

const JobEditPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [form, setForm] = useState({
        title: '',
        department: '',
        location: '',
        type: 'full-time',
        experience: 'mid',
        salaryMin: '',
        salaryMax: '',
        description: '',
        requirements: [''],
        responsibilities: [''],
        skills: [''],
        benefits: [''],
        closingDate: '',
        status: 'active',
    });

    // Fetch existing job data
    useEffect(() => {
        const fetchJob = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await fetch(`/api/jobs/${id}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    const job = data.job;
                    if (job) {
                        setForm({
                            title: job.title || '',
                            department: job.department || '',
                            location: job.location || '',
                            type: job.type || 'full-time',
                            experience: job.experience || 'mid',
                            salaryMin: job.salary?.min?.toString() || '',
                            salaryMax: job.salary?.max?.toString() || '',
                            description: job.description || '',
                            requirements: job.requirements?.length ? job.requirements : [''],
                            responsibilities: job.responsibilities?.length ? job.responsibilities : [''],
                            skills: job.skills?.length ? job.skills : [''],
                            benefits: job.benefits?.length ? job.benefits : [''],
                            closingDate: job.closingDate ? job.closingDate.split('T')[0] : '',
                            status: job.status || 'active',
                        });
                    }
                }
            } catch (err) {
                console.error('Error fetching job:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchJob();
    }, [id]);

    const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

    const updateList = (field: string, index: number, value: string) => {
        setForm(p => {
            const list = [...(p[field as keyof typeof p] as string[])];
            list[index] = value;
            return { ...p, [field]: list };
        });
    };

    const addListItem = (field: string) => {
        setForm(p => ({ ...p, [field]: [...(p[field as keyof typeof p] as string[]), ''] }));
    };

    const removeListItem = (field: string, index: number) => {
        setForm(p => {
            const list = [...(p[field as keyof typeof p] as string[])].filter((_, i) => i !== index);
            return { ...p, [field]: list.length ? list : [''] };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`/api/jobs/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'USD' },
                    requirements: form.requirements.filter(Boolean),
                    responsibilities: form.responsibilities.filter(Boolean),
                    skills: form.skills.filter(Boolean),
                    benefits: form.benefits.filter(Boolean),
                }),
            });
            if (res.ok) {
                setToast({ msg: '✅ Job updated successfully!', type: 'success' });
                setTimeout(() => navigate(`/dashboard/jobs/${id}`), 1500);
            } else {
                const data = await res.json();
                setToast({ msg: data.message || 'Failed to update', type: 'error' });
            }
        } catch {
            setToast({ msg: 'Network error', type: 'error' });
        } finally {
            setSaving(false);
        }
    };

    const renderListField = (field: string, label: string, placeholder: string) => {
        const list = form[field as keyof typeof form] as string[];
        return (
            <div className="jf-group">
                <label className="jf-label">{label}</label>
                {list.map((item, i) => (
                    <div key={i} className="jf-list-row">
                        <input
                            className="input jf-input"
                            value={item}
                            placeholder={`${placeholder} ${i + 1}`}
                            onChange={e => updateList(field, i, e.target.value)}
                        />
                        {list.length > 1 && (
                            <button type="button" className="jf-list-remove" onClick={() => removeListItem(field, i)}>✕</button>
                        )}
                    </div>
                ))}
                <button type="button" className="jf-list-add" onClick={() => addListItem(field)}>
                    + Add {label.replace(/s$/, '')}
                </button>
            </div>
        );
    };

    return (
        <DashboardLayout title="Edit Job">
            {toast && (
                <div style={{
                    position: 'fixed', top: 24, right: 24, zIndex: 9999,
                    padding: '12px 24px', borderRadius: 10,
                    background: toast.type === 'success' ? '#00b894' : '#e17055',
                    color: '#fff', fontWeight: 600, fontSize: 14,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}>{toast.msg}</div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                    <p style={{ fontSize: 36, marginBottom: 12 }}>⏳</p>
                    <h4>Loading job data...</h4>
                </div>
            ) : (
                <div className="job-form-page">
                    <div className="job-form-page__header">
                        <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
                        <h2>Edit Job: {form.title}</h2>
                    </div>

                    <form className="job-form" onSubmit={handleSubmit}>
                        <div className="jf-section glass-card">
                            <h4 className="jf-section__title">📝 Basic Information</h4>
                            <div className="jf-row">
                                <div className="jf-group jf-group--full">
                                    <label className="jf-label">Job Title *</label>
                                    <input className="input jf-input" placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={e => update('title', e.target.value)} required />
                                </div>
                            </div>
                            <div className="jf-row">
                                <div className="jf-group">
                                    <label className="jf-label">Department *</label>
                                    <select className="input jf-input jf-select" value={form.department} onChange={e => update('department', e.target.value)} required>
                                        <option value="">Select...</option>
                                        <option>Engineering</option>
                                        <option>Design</option>
                                        <option>Product</option>
                                        <option>Marketing</option>
                                        <option>Sales</option>
                                        <option>HR</option>
                                        <option>Data</option>
                                        <option>Operations</option>
                                    </select>
                                </div>
                                <div className="jf-group">
                                    <label className="jf-label">Location *</label>
                                    <input className="input jf-input" placeholder="e.g. San Francisco, CA" value={form.location} onChange={e => update('location', e.target.value)} required />
                                </div>
                            </div>
                            <div className="jf-row">
                                <div className="jf-group">
                                    <label className="jf-label">Employment Type</label>
                                    <select className="input jf-input jf-select" value={form.type} onChange={e => update('type', e.target.value)}>
                                        <option value="full-time">Full-Time</option>
                                        <option value="part-time">Part-Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                        <option value="remote">Remote</option>
                                    </select>
                                </div>
                                <div className="jf-group">
                                    <label className="jf-label">Experience Level</label>
                                    <select className="input jf-input jf-select" value={form.experience} onChange={e => update('experience', e.target.value)}>
                                        <option value="entry">Entry Level</option>
                                        <option value="mid">Mid Level</option>
                                        <option value="senior">Senior</option>
                                        <option value="lead">Lead</option>
                                        <option value="director">Director</option>
                                    </select>
                                </div>
                            </div>
                            <div className="jf-row">
                                <div className="jf-group">
                                    <label className="jf-label">Salary Range (Min)</label>
                                    <input className="input jf-input" type="number" placeholder="e.g. 80000" value={form.salaryMin} onChange={e => update('salaryMin', e.target.value)} />
                                </div>
                                <div className="jf-group">
                                    <label className="jf-label">Salary Range (Max)</label>
                                    <input className="input jf-input" type="number" placeholder="e.g. 150000" value={form.salaryMax} onChange={e => update('salaryMax', e.target.value)} />
                                </div>
                                <div className="jf-group">
                                    <label className="jf-label">Closing Date</label>
                                    <input className="input jf-input" type="date" value={form.closingDate} onChange={e => update('closingDate', e.target.value)} />
                                </div>
                            </div>
                            <div className="jf-row">
                                <div className="jf-group">
                                    <label className="jf-label">Status</label>
                                    <select className="input jf-input jf-select" value={form.status} onChange={e => update('status', e.target.value)}>
                                        <option value="active">Active</option>
                                        <option value="draft">Draft</option>
                                        <option value="paused">Paused</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="jf-section glass-card">
                            <h4 className="jf-section__title">📋 Job Description</h4>
                            <div className="jf-group">
                                <label className="jf-label">Description *</label>
                                <textarea className="input jf-input jf-textarea" rows={6} placeholder="Describe the role..." value={form.description} onChange={e => update('description', e.target.value)} required />
                            </div>
                        </div>

                        <div className="jf-section glass-card">
                            <h4 className="jf-section__title">🎯 Details</h4>
                            {renderListField('requirements', 'Requirements', 'Requirement')}
                            {renderListField('responsibilities', 'Responsibilities', 'Responsibility')}
                            {renderListField('skills', 'Skills', 'Skill')}
                            {renderListField('benefits', 'Benefits', 'Benefit')}
                        </div>

                        <div className="jf-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? '⏳ Saving...' : '💾 Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </DashboardLayout>
    );
};

export default JobEditPage;
