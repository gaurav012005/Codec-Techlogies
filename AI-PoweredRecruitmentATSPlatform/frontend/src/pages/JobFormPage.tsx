import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './JobFormPage.css';

const JobFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
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
        status: 'draft',
    });

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

    const handleSubmit = async (e: React.FormEvent, saveStatus: string) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/jobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    status: saveStatus,
                    salary: { min: Number(form.salaryMin) || 0, max: Number(form.salaryMax) || 0, currency: 'USD' },
                    requirements: form.requirements.filter(Boolean),
                    responsibilities: form.responsibilities.filter(Boolean),
                    skills: form.skills.filter(Boolean),
                    benefits: form.benefits.filter(Boolean),
                }),
            });
            if (res.ok) navigate('/dashboard/jobs');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
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
        <DashboardLayout title="Create Job">
            <div className="job-form-page">
                <div className="job-form-page__header">
                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
                    <h2>Create New Job</h2>
                </div>

                <form className="job-form" onSubmit={e => handleSubmit(e, 'active')}>
                    <div className="jf-section glass-card">
                        <h4 className="jf-section__title">📝 Basic Information</h4>
                        <div className="jf-row">
                            <div className="jf-group jf-group--full">
                                <label className="jf-label">Job Title *</label>
                                <input className="input jf-input" placeholder="e.g. Senior Frontend Engineer" value={form.title} onChange={e => update('title', e.target.value)} required id="jf-title" />
                            </div>
                        </div>
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Department *</label>
                                <select className="input jf-input jf-select" value={form.department} onChange={e => update('department', e.target.value)} required id="jf-dept">
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
                                <input className="input jf-input" placeholder="e.g. San Francisco, CA" value={form.location} onChange={e => update('location', e.target.value)} required id="jf-location" />
                            </div>
                        </div>
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Employment Type</label>
                                <select className="input jf-input jf-select" value={form.type} onChange={e => update('type', e.target.value)} id="jf-type">
                                    <option value="full-time">Full-Time</option>
                                    <option value="part-time">Part-Time</option>
                                    <option value="contract">Contract</option>
                                    <option value="internship">Internship</option>
                                    <option value="remote">Remote</option>
                                </select>
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Experience Level</label>
                                <select className="input jf-input jf-select" value={form.experience} onChange={e => update('experience', e.target.value)} id="jf-exp">
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
                                <input className="input jf-input" type="number" placeholder="e.g. 80000" value={form.salaryMin} onChange={e => update('salaryMin', e.target.value)} id="jf-salary-min" />
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Salary Range (Max)</label>
                                <input className="input jf-input" type="number" placeholder="e.g. 150000" value={form.salaryMax} onChange={e => update('salaryMax', e.target.value)} id="jf-salary-max" />
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Closing Date</label>
                                <input className="input jf-input" type="date" value={form.closingDate} onChange={e => update('closingDate', e.target.value)} id="jf-closing" />
                            </div>
                        </div>
                    </div>

                    <div className="jf-section glass-card">
                        <h4 className="jf-section__title">📋 Job Description</h4>
                        <div className="jf-group">
                            <label className="jf-label">Description *</label>
                            <textarea className="input jf-input jf-textarea" rows={6} placeholder="Describe the role, team, and what makes this position exciting..." value={form.description} onChange={e => update('description', e.target.value)} required id="jf-description" />
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
                        <button type="button" className="btn btn-secondary" onClick={e => handleSubmit(e as any, 'draft')} disabled={loading}>
                            Save as Draft
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading} id="jf-publish">
                            {loading ? '...' : '🚀 Publish Job'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default JobFormPage;
