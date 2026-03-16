import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/icons/Icon';
import './EmailsPage.css';

const folders = [
    { name: 'Inbox', icon: 'emails', count: 0 },
    { name: 'Sent', icon: 'share', count: 0 },
    { name: 'Drafts', icon: 'jobs', count: 0 },
    { name: 'Templates', icon: 'star', count: 5 },
];

const TEMPLATES = [
    'Interview Confirmation',
    'Offer Letter',
    'Rejection (Kind)',
    'Follow-Up',
    'Onboarding Welcome',
];

const emailColors = ['#6c5ce7', '#00cec9', '#fdcb6e', '#fd79a8', '#00b894', '#e17055'];

interface SentEmail {
    id: string;
    to: string;
    subject: string;
    body: string;
    sentAt: string;
    previewUrl?: string;
    status: 'sent' | 'failed';
}

const EmailsPage = () => {
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [sentEmails, setSentEmails] = useState<SentEmail[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showCompose, setShowCompose] = useState(false);

    // Compose form
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [sending, setSending] = useState(false);
    const [sendStatus, setSendStatus] = useState<{ type: 'success' | 'error', msg: string, previewUrl?: string } | null>(null);

    // Load candidates for quick addressing
    const [candidates, setCandidates] = useState<any[]>([]);

    useEffect(() => {
        const fetchCandidates = async () => {
            const token = localStorage.getItem('token');
            try {
                const res = await fetch('/api/candidates', {
                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                });
                if (res.ok) {
                    const data = await res.json();
                    const list = data.candidates || (Array.isArray(data) ? data : []);
                    setCandidates(list);
                }
            } catch { /* ignore */ }
        };
        fetchCandidates();
    }, []);

    const handleSend = async () => {
        if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
            setSendStatus({ type: 'error', msg: 'Please fill in To, Subject, and Message fields.' });
            return;
        }
        setSending(true);
        setSendStatus(null);

        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/emails/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ to: composeTo, subject: composeSubject, body: composeBody }),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                const newEmail: SentEmail = {
                    id: data.messageId || Date.now().toString(),
                    to: composeTo,
                    subject: composeSubject,
                    body: composeBody,
                    sentAt: new Date().toLocaleString(),
                    previewUrl: data.previewUrl,
                    status: 'sent',
                };
                setSentEmails(prev => [newEmail, ...prev]);
                setSendStatus({
                    type: 'success',
                    msg: `✅ Email sent to ${composeTo}!` + (data.previewUrl ? ' (Test mode - click Preview to view it)' : ''),
                    previewUrl: data.previewUrl,
                });
                setComposeTo('');
                setComposeSubject('');
                setComposeBody('');
                setTimeout(() => { setShowCompose(false); setSendStatus(null); }, 3000);
            } else {
                setSendStatus({ type: 'error', msg: data.message || 'Failed to send email.' });
            }
        } catch (err) {
            setSendStatus({ type: 'error', msg: 'Network error. Please try again.' });
        } finally {
            setSending(false);
        }
    };

    const handleSendTemplate = async (template: string, to?: string) => {
        if (!to) {
            setComposeSubject(template);
            setShowCompose(true);
            return;
        }
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('/api/emails/send-template', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ to, template }),
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Template "${template}" sent to ${to}!${data.previewUrl ? `\n\nPreview: ${data.previewUrl}` : ''}`);
            } else {
                alert('Failed: ' + data.message);
            }
        } catch {
            alert('Network error');
        }
    };

    const displayEmails = activeFolder === 'Sent' ? sentEmails : [];
    const selectedEmail = sentEmails.find(e => e.id === selectedId);

    return (
        <DashboardLayout title="Emails">
            <div className="email-page">
                <div className="email-header">
                    <div>
                        <h2>Communication Center</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>Send real emails to candidates and team members</p>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowCompose(true)}>
                        <Icon name="emails" size={14} /> Compose
                    </button>
                </div>

                {/* Global send status banner */}
                {sendStatus && (
                    <div style={{
                        padding: '12px 20px', borderRadius: 8, marginBottom: 16,
                        background: sendStatus.type === 'success' ? '#00b89415' : '#ff4d6d15',
                        border: `1px solid ${sendStatus.type === 'success' ? '#00b894' : '#ff4d6d'}`,
                        color: sendStatus.type === 'success' ? '#00b894' : '#ff4d6d',
                        display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                        <span>{sendStatus.msg}</span>
                        {sendStatus.previewUrl && (
                            <a href={sendStatus.previewUrl} target="_blank" rel="noopener noreferrer"
                                style={{ background: '#6c5ce7', color: '#fff', padding: '4px 12px', borderRadius: 4, textDecoration: 'none', fontSize: 13 }}>
                                Preview Email →
                            </a>
                        )}
                    </div>
                )}

                <div className="email-layout">
                    {/* Sidebar */}
                    <div className="email-sidebar glass-card" style={{ padding: 16 }}>
                        <button className="btn btn-primary btn-sm email-compose-btn" onClick={() => setShowCompose(true)}>
                            + New Message
                        </button>
                        <div className="email-folders">
                            {folders.map(f => (
                                <button key={f.name} className={`email-folder ${activeFolder === f.name ? 'email-folder--active' : ''}`} onClick={() => setActiveFolder(f.name)}>
                                    <Icon name={f.icon} size={16} />
                                    {f.name}
                                    {f.name === 'Sent' && sentEmails.length > 0 && (
                                        <span className="email-folder__count">{sentEmails.length}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        <div className="email-templates">
                            <div className="email-templates__title">Quick Templates</div>
                            {TEMPLATES.map(t => (
                                <button key={t} className="email-template" onClick={() => {
                                    setComposeSubject(t);
                                    // Auto-fill template body
                                    const bodies: Record<string, string> = {
                                        'Interview Confirmation': 'Dear [Candidate Name],\n\nWe are pleased to confirm your upcoming interview. Please join us at the scheduled time.\n\nBest regards,\nHireAI Team',
                                        'Offer Letter': 'Dear [Candidate Name],\n\nWe are delighted to offer you the position. Please find the details below.\n\nBest regards,\nHireAI Team',
                                        'Rejection (Kind)': 'Dear [Candidate Name],\n\nThank you for your time and interest. After careful consideration, we have decided to move forward with another candidate.\n\nBest regards,\nHireAI Team',
                                        'Follow-Up': 'Dear [Candidate Name],\n\nThis is a follow-up regarding your application. We are still reviewing candidates and will be in touch shortly.\n\nBest regards,\nHireAI Team',
                                        'Onboarding Welcome': 'Dear [Candidate Name],\n\nCongratulations and welcome to the team! We are excited to have you on board.\n\nBest regards,\nHireAI Team',
                                    };
                                    setComposeBody(bodies[t] || '');
                                    setShowCompose(true);
                                }}>{t}</button>
                            ))}
                        </div>

                        {/* Quick send to candidates */}
                        {candidates.length > 0 && (
                            <div className="email-templates" style={{ marginTop: 16 }}>
                                <div className="email-templates__title">Quick Send to Candidates</div>
                                {candidates.slice(0, 5).map((c: any) => (
                                    <button key={c._id} className="email-template" onClick={() => {
                                        setComposeTo(c.email || '');
                                        setComposeBody(`Dear ${c.firstName},\n\n`);
                                        setShowCompose(true);
                                    }}>
                                        {c.firstName} {c.lastName}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Email List / Sent */}
                    <div className="glass-card" style={{ padding: 16 }}>
                        {activeFolder === 'Sent' ? (
                            <>
                                {sentEmails.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                                        <div style={{ fontSize: 40, marginBottom: 12 }}>📤</div>
                                        <p>No sent emails yet. Compose and send your first email!</p>
                                    </div>
                                ) : (
                                    <div className="email-list">
                                        {sentEmails.map((e, i) => (
                                            <div key={e.id} className={`email-item ${selectedId === e.id ? 'email-item--active' : ''}`} onClick={() => setSelectedId(e.id)}>
                                                <div className="email-item__avatar" style={{ background: `linear-gradient(135deg, ${emailColors[i % emailColors.length]}80, ${emailColors[i % emailColors.length]}40)` }}>
                                                    {e.to.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="email-item__content">
                                                    <div className="email-item__subject">
                                                        {e.subject}
                                                        <span className="email-item__tag" style={{ background: '#00b89420', color: '#00b894' }}>Sent</span>
                                                    </div>
                                                    <div className="email-item__preview">To: {e.to} — {e.body.substring(0, 60)}...</div>
                                                </div>
                                                <span className="email-item__time">{e.sentAt}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {selectedEmail && (
                                    <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border-subtle)' }}>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{selectedEmail.subject}</h3>
                                        <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginBottom: 16 }}>To: {selectedEmail.to} · {selectedEmail.sentAt}</p>
                                        <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{selectedEmail.body}</p>
                                        {selectedEmail.previewUrl && (
                                            <a href={selectedEmail.previewUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-block', marginTop: 12, background: '#6c5ce720', color: '#6c5ce7', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', fontSize: 13 }}>
                                                🔗 View in Email Client (Ethereal)
                                            </a>
                                        )}
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-tertiary)' }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>
                                    {activeFolder === 'Inbox' ? '📥' : activeFolder === 'Drafts' ? '📝' : '📁'}
                                </div>
                                <p style={{ fontWeight: 600, marginBottom: 8 }}>{activeFolder}</p>
                                <p style={{ fontSize: 14 }}>
                                    {activeFolder === 'Inbox'
                                        ? 'Incoming emails will appear here. Use Compose to send emails to candidates.'
                                        : `${activeFolder} is empty.`}
                                </p>
                                <button className="btn btn-primary btn-sm" style={{ marginTop: 16 }} onClick={() => setShowCompose(true)}>
                                    + Compose Email
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Compose Modal */}
                {showCompose && (
                    <div className="compose-overlay" onClick={() => setShowCompose(false)}>
                        <div className="compose-modal glass-card" onClick={e => e.stopPropagation()}>
                            <div className="compose-header">
                                <h3 style={{ fontSize: 16, margin: 0 }}>New Message</h3>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setShowCompose(false); setSendStatus(null); }}>✕</button>
                            </div>
                            <div className="compose-body">
                                <input
                                    className="input"
                                    placeholder="To: candidate@email.com"
                                    value={composeTo}
                                    onChange={e => setComposeTo(e.target.value)}
                                    list="candidate-emails"
                                />
                                <datalist id="candidate-emails">
                                    {candidates.map((c: any) => (
                                        <option key={c._id} value={c.email}>{c.firstName} {c.lastName}</option>
                                    ))}
                                </datalist>
                                <input
                                    className="input"
                                    placeholder="Subject"
                                    value={composeSubject}
                                    onChange={e => setComposeSubject(e.target.value)}
                                />
                                <textarea
                                    className="input"
                                    placeholder="Write your message here..."
                                    value={composeBody}
                                    onChange={e => setComposeBody(e.target.value)}
                                    rows={8}
                                />
                                {sendStatus && !sending && (
                                    <div style={{
                                        padding: '8px 12px', borderRadius: 6, fontSize: 13,
                                        background: sendStatus.type === 'success' ? '#00b89415' : '#ff4d6d15',
                                        border: `1px solid ${sendStatus.type === 'success' ? '#00b894' : '#ff4d6d'}`,
                                        color: sendStatus.type === 'success' ? '#00b894' : '#ff4d6d',
                                    }}>
                                        {sendStatus.msg}
                                        {sendStatus.previewUrl && (
                                            <a href={sendStatus.previewUrl} target="_blank" rel="noopener noreferrer"
                                                style={{ marginLeft: 10, color: '#6c5ce7', textDecoration: 'underline' }}>
                                                Preview →
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="compose-footer">
                                <button className="btn btn-ghost" onClick={() => { setShowCompose(false); setSendStatus(null); }}>Discard</button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSend}
                                    disabled={sending}
                                >
                                    {sending ? '⏳ Sending...' : <><Icon name="share" size={14} /> Send</>}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default EmailsPage;
