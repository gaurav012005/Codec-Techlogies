import { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import './InterviewsPage.css';

interface Interview {
    id: string;
    candidate: { name: string; avatar: string; headline: string };
    job: { title: string; department: string };
    scheduledAt: string;
    duration: number;
    type: string;
    status: string;
    interviewers: { name: string; role: string }[];
    meetingLink?: string;
}

const typeConfig: Record<string, { icon: string; color: string }> = {
    phone: { icon: '📞', color: '#74b9ff' },
    video: { icon: '🎥', color: '#6c5ce7' },
    onsite: { icon: '🏢', color: '#00cec9' },
    technical: { icon: '💻', color: '#fd79a8' },
    panel: { icon: '👥', color: '#fdcb6e' },
    culture: { icon: '🤝', color: '#00b894' },
};

const statusConfig: Record<string, { label: string; color: string }> = {
    scheduled: { label: 'Scheduled', color: '#74b9ff' },
    confirmed: { label: 'Confirmed', color: '#00b894' },
    in_progress: { label: 'In Progress', color: '#fdcb6e' },
    completed: { label: 'Completed', color: '#636e72' },
    cancelled: { label: 'Cancelled', color: '#e17055' },
    no_show: { label: 'No Show', color: '#d63031' },
};



const InterviewsPage = () => {
    const [view, setView] = useState<'list' | 'calendar'>('list');
    const [filter, setFilter] = useState('upcoming');
    const [showModal, setShowModal] = useState(false);
    const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);

    const [interviews, setInterviews] = useState<Interview[]>([]);
    const [candidates, setCandidates] = useState<any[]>([]);
    const [jobs, setJobs] = useState<any[]>([]);

    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newDuration, setNewDuration] = useState('60');
    const [newType, setNewType] = useState('video');
    const [newMeetingLink, setNewMeetingLink] = useState('');
    const [newNotes, setNewNotes] = useState('');
    const [newCandidate, setNewCandidate] = useState('');
    const [newJob, setNewJob] = useState('');

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Fetch interviews
            const intvRes = await fetch('/api/interviews', { headers });
            if (intvRes.ok) {
                const data = await intvRes.json();
                if (data.interviews && data.interviews.length > 0) {
                    const mappedInterviews = data.interviews.map((i: any) => ({
                        ...i,
                        id: i._id,
                        candidate: {
                            ...i.candidate,
                            name: i.candidate?.firstName ? `${i.candidate.firstName} ${i.candidate.lastName}` : 'Unknown Candidate',
                            avatar: i.candidate?.firstName ? `${i.candidate.firstName[0]}${i.candidate.lastName[0]}` : 'U',
                            headline: i.candidate?.headline || ''
                        },
                        job: {
                            ...i.job,
                            title: i.job?.title || 'Unknown Role',
                            department: i.job?.department || ''
                        },
                        interviewers: i.interviewers || []
                    }));
                    setInterviews(mappedInterviews);
                } else {
                    setInterviews([]);
                }
            }

            // Fetch candidates
            const candRes = await fetch('/api/candidates', { headers });
            if (candRes.ok) {
                const data = await candRes.json();
                if (data.candidates && data.candidates.length > 0) {
                    const apiCands = data.candidates.map((c: any) => ({ ...c, _id: c._id || c.id }));
                    setCandidates(apiCands);
                    if (apiCands.length > 0) setNewCandidate(apiCands[0]._id);
                } else {
                    setCandidates([]);
                }
            }

            // Fetch jobs
            const jobRes = await fetch('/api/jobs', { headers });
            if (jobRes.ok) {
                const data = await jobRes.json();
                if (data.jobs && data.jobs.length > 0) {
                    const apiJobs = data.jobs.map((j: any) => ({ ...j, _id: j._id || j.id }));
                    setJobs(apiJobs);
                    if (apiJobs.length > 0) setNewJob(apiJobs[0]._id);
                } else {
                    setJobs([]);
                }
            }
        } catch (err) {
            console.log('Error fetching data', err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSchedule = async () => {
        if (!newDate || !newTime || !newCandidate || !newJob) {
            alert('Please fill out Date, Time, Candidate, and Position.');
            return;
        }
        const scheduledAt = new Date(`${newDate}T${newTime}`);
        try {
            const token = localStorage.getItem('token');
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch('/api/interviews', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    candidate: newCandidate,
                    job: newJob,
                    scheduledAt: scheduledAt.toISOString(),
                    duration: parseInt(newDuration),
                    type: newType,
                    meetingLink: newMeetingLink,
                    notes: newNotes,
                })
            });

            if (res.ok) {
                alert('Interview Scheduled!');
                setShowModal(false);
                fetchData(); // Refresh list to show newly created item
            } else {
                const data = await res.json();
                alert(`Error: ${data.message || 'Failed to schedule'}`);
            }
        } catch (err) {
            alert('Server error');
        }
    };

    const now = new Date();
    const filtered = interviews
        .filter(i => {
            if (filter === 'upcoming') return new Date(i.scheduledAt) >= now && i.status !== 'completed' && i.status !== 'cancelled';
            if (filter === 'today') { const d = new Date(i.scheduledAt); return d.toDateString() === now.toDateString(); }
            if (filter === 'completed') return i.status === 'completed';
            return true;
        })
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

    const formatTime = (d: string) => new Date(d).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const formatFull = (d: string) => new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Group by date for list view
    const grouped = filtered.reduce<Record<string, Interview[]>>((acc, i) => {
        const key = new Date(i.scheduledAt).toDateString();
        (acc[key] = acc[key] || []).push(i);
        return acc;
    }, {});

    // Calendar helpers
    const [calMonth, setCalMonth] = useState(now.getMonth());
    const [calYear, setCalYear] = useState(now.getFullYear());
    const calDaysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const calFirstDay = new Date(calYear, calMonth, 1).getDay();
    const calDays = Array.from({ length: calDaysInMonth }, (_, i) => i + 1);
    const calMonthName = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const getInterviewsForDay = (day: number) => {
        return interviews.filter(i => {
            const d = new Date(i.scheduledAt);
            return d.getDate() === day && d.getMonth() === calMonth && d.getFullYear() === calYear;
        });
    };

    return (
        <DashboardLayout title="Interviews">
            <div className="intv-page">
                {/* Header */}
                <div className="intv-header">
                    <div>
                        <h2>Interview Schedule</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>{interviews.filter(i => new Date(i.scheduledAt) >= now).length} upcoming interviews</p>
                    </div>
                    <div className="intv-header__actions">
                        <div className="intv-view-toggle">
                            <button className={`ivt-btn ${view === 'list' ? 'ivt-btn--active' : ''}`} onClick={() => setView('list')}>☰ List</button>
                            <button className={`ivt-btn ${view === 'calendar' ? 'ivt-btn--active' : ''}`} onClick={() => setView('calendar')}>📅 Calendar</button>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setShowModal(true)} id="schedule-btn">+ Schedule Interview</button>
                    </div>
                </div>

                {/* Stats */}
                <div className="intv-stats">
                    <div className="intv-stat-card">
                        <span className="intv-stat__num" style={{ color: '#6c5ce7' }}>{interviews.filter(i => new Date(i.scheduledAt).toDateString() === now.toDateString()).length}</span>
                        <span className="intv-stat__label">Today</span>
                    </div>
                    <div className="intv-stat-card">
                        <span className="intv-stat__num" style={{ color: '#00cec9' }}>{interviews.filter(i => new Date(i.scheduledAt) >= now && i.status !== 'completed').length}</span>
                        <span className="intv-stat__label">Upcoming</span>
                    </div>
                    <div className="intv-stat-card">
                        <span className="intv-stat__num" style={{ color: '#00b894' }}>{interviews.filter(i => i.status === 'confirmed').length}</span>
                        <span className="intv-stat__label">Confirmed</span>
                    </div>
                    <div className="intv-stat-card">
                        <span className="intv-stat__num" style={{ color: '#636e72' }}>{interviews.filter(i => i.status === 'completed').length}</span>
                        <span className="intv-stat__label">Completed</span>
                    </div>
                </div>

                {view === 'list' ? (
                    <>
                        {/* Filter Tabs */}
                        <div className="intv-tabs">
                            {['upcoming', 'today', 'completed', 'all'].map(f => (
                                <button key={f} className={`intv-tab ${filter === f ? 'intv-tab--active' : ''}`} onClick={() => setFilter(f)}>
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>

                        {/* Grouped List */}
                        <div className="intv-list">
                            {Object.entries(grouped).map(([dateStr, interviews]) => (
                                <div key={dateStr} className="intv-day-group">
                                    <div className="intv-day-header">
                                        <span className="intv-day-header__date">{formatFull(interviews[0].scheduledAt)}</span>
                                        <span className="intv-day-header__count">{interviews.length} interview{interviews.length > 1 ? 's' : ''}</span>
                                    </div>
                                    {interviews.map(intv => (
                                        <div key={intv.id} className="intv-card glass-card" onClick={() => setSelectedInterview(intv)} id={`intv-${intv.id}`}>
                                            <div className="intv-card__time-col">
                                                <span className="intv-card__time">{formatTime(intv.scheduledAt)}</span>
                                                <span className="intv-card__duration">{intv.duration}min</span>
                                            </div>

                                            <div className="intv-card__type" style={{ background: `${typeConfig[intv.type]?.color}15`, color: typeConfig[intv.type]?.color }}>
                                                <span>{typeConfig[intv.type]?.icon}</span>
                                                <span>{intv.type}</span>
                                            </div>

                                            <div className="intv-card__candidate">
                                                <div className="intv-card__avatar">{intv.candidate.avatar}</div>
                                                <div>
                                                    <div className="intv-card__name">{intv.candidate.name}</div>
                                                    <div className="intv-card__headline">{intv.candidate.headline}</div>
                                                </div>
                                            </div>

                                            <div className="intv-card__job">
                                                <span className="intv-card__job-title">{intv.job.title}</span>
                                                <span className="intv-card__dept">{intv.job.department}</span>
                                            </div>

                                            <div className="intv-card__interviewers">
                                                {intv.interviewers.slice(0, 2).map((iv, i) => (
                                                    <span key={i} className="intv-card__interviewer-chip">{iv.name.split(' ').map(n => n[0]).join('')}</span>
                                                ))}
                                                {intv.interviewers.length > 2 && <span className="intv-card__interviewer-chip intv-card__interviewer-more">+{intv.interviewers.length - 2}</span>}
                                            </div>

                                            <div className="intv-card__status">
                                                <span className="intv-status-badge" style={{ background: `${statusConfig[intv.status]?.color}20`, color: statusConfig[intv.status]?.color }}>
                                                    {statusConfig[intv.status]?.label}
                                                </span>
                                            </div>

                                            <div className="intv-card__actions">
                                                {intv.meetingLink && intv.status !== 'completed' && (
                                                    <button className="btn btn-primary btn-sm" onClick={e => { e.stopPropagation(); alert(`Launching meeting: ${intv.meetingLink}`); }}>Join</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {filtered.length === 0 && (
                                <div className="intv-empty">
                                    <p style={{ fontSize: '40px', marginBottom: '12px' }}>📅</p>
                                    <h4>No interviews found</h4>
                                    <p className="text-muted">Try a different filter or schedule a new interview.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    /* Calendar View */
                    <div className="intv-calendar glass-card">
                        <div className="intv-cal-header">
                            <button className="btn btn-ghost btn-sm" onClick={() => { if (calMonth === 0) { setCalMonth(11); setCalYear(calYear - 1); } else setCalMonth(calMonth - 1); }}>←</button>
                            <h4>{calMonthName}</h4>
                            <button className="btn btn-ghost btn-sm" onClick={() => { if (calMonth === 11) { setCalMonth(0); setCalYear(calYear + 1); } else setCalMonth(calMonth + 1); }}>→</button>
                        </div>

                        <div className="intv-cal-grid">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="intv-cal-day-label">{d}</div>
                            ))}
                            {Array.from({ length: calFirstDay }).map((_, i) => <div key={`empty-${i}`} className="intv-cal-cell intv-cal-cell--empty"></div>)}
                            {calDays.map(day => {
                                const dayInterviews = getInterviewsForDay(day);
                                const isToday = day === now.getDate() && calMonth === now.getMonth() && calYear === now.getFullYear();
                                return (
                                    <div key={day} className={`intv-cal-cell ${isToday ? 'intv-cal-cell--today' : ''} ${dayInterviews.length ? 'intv-cal-cell--has-events' : ''}`}>
                                        <span className="intv-cal-cell__num">{day}</span>
                                        <div className="intv-cal-cell__events">
                                            {dayInterviews.slice(0, 3).map((intv, i) => (
                                                <div key={i} className="intv-cal-event" style={{ background: `${typeConfig[intv.type]?.color}20`, borderLeft: `3px solid ${typeConfig[intv.type]?.color}` }}
                                                    onClick={() => setSelectedInterview(intv)}>
                                                    <span className="intv-cal-event__time">{formatTime(intv.scheduledAt)}</span>
                                                    <span className="intv-cal-event__name">{intv.candidate.name.split(' ')[0]}</span>
                                                </div>
                                            ))}
                                            {dayInterviews.length > 3 && <span className="intv-cal-more">+{dayInterviews.length - 3} more</span>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {selectedInterview && (
                    <div className="intv-modal-overlay" onClick={() => setSelectedInterview(null)}>
                        <div className="intv-modal glass-card" onClick={e => e.stopPropagation()}>
                            <div className="intv-modal__header">
                                <h3>Interview Details</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedInterview(null)}>✕</button>
                            </div>
                            <div className="intv-modal__body">
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Candidate</span>
                                    <div className="intv-modal__val">
                                        <div className="intv-card__avatar" style={{ width: 32, height: 32, fontSize: 11 }}>{selectedInterview.candidate.avatar}</div>
                                        <div><strong>{selectedInterview.candidate.name}</strong><br /><span className="text-muted">{selectedInterview.candidate.headline}</span></div>
                                    </div>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Position</span>
                                    <span>{selectedInterview.job.title} · {selectedInterview.job.department}</span>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Date & Time</span>
                                    <span>{formatDate(selectedInterview.scheduledAt)} at {formatTime(selectedInterview.scheduledAt)}</span>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Duration</span>
                                    <span>{selectedInterview.duration} minutes</span>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Type</span>
                                    <span className="intv-card__type" style={{ background: `${typeConfig[selectedInterview.type]?.color}15`, color: typeConfig[selectedInterview.type]?.color, display: 'inline-flex' }}>
                                        {typeConfig[selectedInterview.type]?.icon} {selectedInterview.type}
                                    </span>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Status</span>
                                    <span className="intv-status-badge" style={{ background: `${statusConfig[selectedInterview.status]?.color}20`, color: statusConfig[selectedInterview.status]?.color }}>
                                        {statusConfig[selectedInterview.status]?.label}
                                    </span>
                                </div>
                                <div className="intv-modal__row">
                                    <span className="intv-modal__label">Interviewers</span>
                                    <div className="intv-modal__interviewers">
                                        {selectedInterview.interviewers.map((iv, i) => (
                                            <div key={i} className="intv-modal__interviewer">
                                                <strong>{iv.name}</strong>
                                                <span className="text-muted"> · {iv.role}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="intv-modal__footer">
                                {selectedInterview.meetingLink && selectedInterview.status !== 'completed' && (
                                    <button className="btn btn-primary" onClick={() => alert(`Launching meeting: ${selectedInterview.meetingLink}`)}>🎥 Join Meeting</button>
                                )}
                                <button className="btn btn-secondary" onClick={() => alert('Reschedule flow coming soon.')}>✏️ Reschedule</button>
                                <button className="btn btn-ghost" style={{ color: '#e17055' }} onClick={() => { alert('Interview Cancelled!'); setSelectedInterview(null); }}>Cancel Interview</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Schedule Modal */}
                {showModal && (
                    <div className="intv-modal-overlay" onClick={() => setShowModal(false)}>
                        <div className="intv-modal glass-card" onClick={e => e.stopPropagation()}>
                            <div className="intv-modal__header">
                                <h3>Schedule Interview</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}>✕</button>
                            </div>
                            <div className="intv-modal__body">
                                <div className="intv-form-group">
                                    <label>Candidate</label>
                                    <select className="input" value={newCandidate} onChange={e => setNewCandidate(e.target.value)}>
                                        <option value="">Select Candidate...</option>
                                        {candidates.map(c => (
                                            <option key={c._id} value={c._id}>{c.firstName} {c.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="intv-form-group">
                                    <label>Position</label>
                                    <select className="input" value={newJob} onChange={e => setNewJob(e.target.value)}>
                                        <option value="">Select Position...</option>
                                        {jobs.map(j => (
                                            <option key={j._id} value={j._id}>{j.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="intv-form-row">
                                    <div className="intv-form-group">
                                        <label>Date</label>
                                        <input type="date" className="input" value={newDate} onChange={e => setNewDate(e.target.value)} />
                                    </div>
                                    <div className="intv-form-group">
                                        <label>Time</label>
                                        <input type="time" className="input" value={newTime} onChange={e => setNewTime(e.target.value)} />
                                    </div>
                                    <div className="intv-form-group">
                                        <label>Duration</label>
                                        <select className="input" value={newDuration} onChange={e => setNewDuration(e.target.value)}>
                                            <option value="30">30 min</option>
                                            <option value="45">45 min</option>
                                            <option value="60">60 min</option>
                                            <option value="90">90 min</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="intv-form-group">
                                    <label>Interview Type</label>
                                    <div className="intv-type-grid">
                                        {Object.entries(typeConfig).map(([key, cfg]) => (
                                            <button key={key} className={`intv-type-btn ${newType === key ? 'active' : ''}`} type="button" onClick={() => setNewType(key)} style={newType === key ? { borderColor: cfg.color, background: `${cfg.color}15` } : {}}>
                                                <span>{cfg.icon}</span><span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="intv-form-group">
                                    <label>Meeting Link</label>
                                    <input type="url" className="input" placeholder="https://meet.google.com/..." value={newMeetingLink} onChange={e => setNewMeetingLink(e.target.value)} />
                                </div>
                                <div className="intv-form-group">
                                    <label>Notes</label>
                                    <textarea className="input" rows={3} placeholder="Any preparation notes for the interview..." value={newNotes} onChange={e => setNewNotes(e.target.value)}></textarea>
                                </div>
                            </div>
                            <div className="intv-modal__footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSchedule}>📅 Schedule Interview</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default InterviewsPage;
