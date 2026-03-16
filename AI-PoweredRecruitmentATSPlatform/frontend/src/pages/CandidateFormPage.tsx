import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import './JobFormPage.css'; // Reuse JobForm css since structure is similar

const CandidateFormPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        headline: '',
        location: '',
        source: 'direct',
        summary: '',
        skills: [{ name: '', level: 'intermediate' }],
        tags: [''],
    });

    const update = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

    const updateSkill = (index: number, field: string, value: string) => {
        setForm(p => {
            const list = [...p.skills];
            list[index] = { ...list[index], [field]: value };
            return { ...p, skills: list };
        });
    };

    const addSkill = () => setForm(p => ({ ...p, skills: [...p.skills, { name: '', level: 'intermediate' }] }));
    const removeSkill = (index: number) => setForm(p => ({ ...p, skills: p.skills.filter((_, i) => i !== index) }));

    const updateTag = (index: number, value: string) => {
        setForm(p => {
            const list = [...p.tags];
            list[index] = value;
            return { ...p, tags: list };
        });
    };

    const addTag = () => setForm(p => ({ ...p, tags: [...p.tags, ''] }));
    const removeTag = (index: number) => setForm(p => ({ ...p, tags: p.tags.filter((_, i) => i !== index) }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/candidates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    ...form,
                    skills: form.skills.filter(s => s.name.trim() !== ''),
                    tags: form.tags.filter(Boolean),
                }),
            });
            if (res.ok) navigate('/dashboard/candidates');
            else {
                const data = await res.json();
                alert(data.message || 'Failed to add candidate');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Add Candidate">
            <div className="job-form-page">
                <div className="job-form-page__header">
                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>← Back</button>
                    <h2>Add New Candidate</h2>
                </div>

                <form className="job-form" onSubmit={handleSubmit}>
                    <div className="jf-section glass-card">
                        <h4 className="jf-section__title">📝 Basic Information</h4>
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">First Name *</label>
                                <input className="input jf-input" placeholder="Sarah" value={form.firstName} onChange={e => update('firstName', e.target.value)} required />
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Last Name *</label>
                                <input className="input jf-input" placeholder="Jenkins" value={form.lastName} onChange={e => update('lastName', e.target.value)} required />
                            </div>
                        </div>
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Email *</label>
                                <input className="input jf-input" type="email" placeholder="sarah@example.com" value={form.email} onChange={e => update('email', e.target.value)} required />
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Phone</label>
                                <input className="input jf-input" type="text" placeholder="+1..." value={form.phone} onChange={e => update('phone', e.target.value)} />
                            </div>
                        </div>
                        <div className="jf-row">
                            <div className="jf-group">
                                <label className="jf-label">Current Headline *</label>
                                <input className="input jf-input" placeholder="e.g. Senior UX Designer" value={form.headline} onChange={e => update('headline', e.target.value)} required />
                            </div>
                            <div className="jf-group">
                                <label className="jf-label">Location *</label>
                                <input className="input jf-input" placeholder="e.g. San Francisco, CA" value={form.location} onChange={e => update('location', e.target.value)} required />
                            </div>
                        </div>
                        <div className="jf-row">
                            <div className="jf-group jf-group--full">
                                <label className="jf-label">Source</label>
                                <select className="input jf-input jf-select" value={form.source} onChange={e => update('source', e.target.value)}>
                                    <option value="direct">Direct Application</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="referral">Internal Referral</option>
                                    <option value="indeed">Indeed</option>
                                    <option value="agency">Recruiting Agency</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="jf-section glass-card">
                        <h4 className="jf-section__title">📋 Professional Summary</h4>
                        <div className="jf-group">
                            <label className="jf-label">Summary</label>
                            <textarea className="input jf-input jf-textarea" rows={4} placeholder="Brief background of the candidate..." value={form.summary} onChange={e => update('summary', e.target.value)} />
                        </div>
                    </div>

                    <div className="jf-section glass-card">
                        <h4 className="jf-section__title">🛠️ Skills & Tags</h4>

                        <div className="jf-group">
                            <label className="jf-label">Skills</label>
                            {form.skills.map((skill, i) => (
                                <div key={i} className="jf-list-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '8px', marginBottom: '8px' }}>
                                    <input
                                        className="input jf-input"
                                        value={skill.name}
                                        placeholder="Skill (e.g. React)"
                                        onChange={e => updateSkill(i, 'name', e.target.value)}
                                    />
                                    <select
                                        className="input jf-input jf-select"
                                        value={skill.level}
                                        onChange={e => updateSkill(i, 'level', e.target.value)}
                                    >
                                        <option value="beginner">Beginner</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="expert">Expert</option>
                                    </select>
                                    {form.skills.length > 1 && (
                                        <button type="button" className="jf-list-remove" onClick={() => removeSkill(i)}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="jf-list-add" onClick={addSkill}>+ Add Skill</button>
                        </div>

                        <div className="jf-group" style={{ marginTop: '24px' }}>
                            <label className="jf-label">Tags</label>
                            {form.tags.map((tag, i) => (
                                <div key={i} className="jf-list-row" style={{ marginBottom: '8px' }}>
                                    <input
                                        className="input jf-input"
                                        value={tag}
                                        placeholder="Tag (e.g. Top Talent)"
                                        onChange={e => updateTag(i, e.target.value)}
                                    />
                                    {form.tags.length > 1 && (
                                        <button type="button" className="jf-list-remove" onClick={() => removeTag(i)}>✕</button>
                                    )}
                                </div>
                            ))}
                            <button type="button" className="jf-list-add" onClick={addTag}>+ Add Tag</button>
                        </div>
                    </div>

                    <div className="jf-actions" style={{ justifyContent: 'flex-end' }}>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : '💾 Save Candidate'}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default CandidateFormPage;
