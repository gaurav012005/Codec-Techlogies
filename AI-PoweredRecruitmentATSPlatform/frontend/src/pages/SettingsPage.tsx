import { useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import Icon from '../components/icons/Icon';
import './SettingsPage.css';

const navItems = [
    { id: 'profile', label: 'Profile', icon: 'candidates' },
    { id: 'notifications', label: 'Notifications', icon: 'emails' },
    { id: 'integrations', label: 'Integrations', icon: 'share' },
    { id: 'team', label: 'Team & Roles', icon: 'candidates' },
    { id: 'pipeline', label: 'Pipeline Config', icon: 'pipeline' },
    { id: 'billing', label: 'Billing', icon: 'analytics' },
    { id: 'security', label: 'Security', icon: 'settings' },
];

const SettingsPage = () => {
    const [activeSection, setActiveSection] = useState('profile');
    const user = JSON.parse(localStorage.getItem('user') || '{"firstName":"Alex","lastName":"Rivera","email":"alex@hireai.com","role":"recruiter"}');
    const [firstName, setFirstName] = useState(user.firstName || 'Alex');
    const [lastName, setLastName] = useState(user.lastName || 'Rivera');
    const [email, setEmail] = useState(user.email || 'alex@hireai.com');
    const [company, setCompany] = useState('HireAI Inc.');
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        emailNotifs: true, slackNotifs: false, weeklyReport: true, aiAlerts: true,
        twoFactor: false, sessionTimeout: true,
    });

    const toggle = (key: string) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

    const handleSave = () => {
        const updatedUser = { ...user, firstName, lastName, email };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        alert('Settings saved!');
    };

    return (
        <DashboardLayout title="Settings">
            <div className="settings-page">
                <div className="settings-header">
                    <div>
                        <h2>Settings</h2>
                        <p className="text-muted" style={{ fontSize: '14px' }}>Manage your account and platform configuration</p>
                    </div>
                </div>

                <div className="settings-layout">
                    <div className="glass-card" style={{ padding: 14 }}>
                        <nav className="settings-nav">
                            {navItems.map(item => (
                                <button key={item.id} className={`settings-nav__item ${activeSection === item.id ? 'settings-nav__item--active' : ''}`} onClick={() => setActiveSection(item.id)}>
                                    <Icon name={item.icon} size={16} />
                                    {item.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="glass-card" style={{ padding: 24 }}>
                        {activeSection === 'profile' && (
                            <div className="settings-section">
                                <div>
                                    <div className="settings-section__title">Profile Settings</div>
                                    <div className="settings-section__desc">Update your personal information and preferences</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                                    <div className="settings-avatar">{firstName[0]}{lastName[0]}</div>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{firstName} {lastName}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{user.role}</div>
                                        <button className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}>Change Avatar</button>
                                    </div>
                                </div>
                                <div className="settings-form">
                                    <div className="settings-form__row">
                                        <div><label>First Name</label><input className="input" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
                                        <div><label>Last Name</label><input className="input" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
                                    </div>
                                    <div><label>Email</label><input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
                                    <div><label>Company</label><input className="input" value={company} onChange={e => setCompany(e.target.value)} /></div>
                                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                        <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                                        <button className="btn btn-secondary" onClick={() => { setFirstName(user.firstName); setLastName(user.lastName); setEmail(user.email || ''); }}>Reset</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeSection === 'notifications' && (
                            <div className="settings-section">
                                <div>
                                    <div className="settings-section__title">Notification Preferences</div>
                                    <div className="settings-section__desc">Control how and when you receive notifications</div>
                                </div>
                                <div className="settings-group">
                                    {[
                                        { key: 'emailNotifs', label: 'Email Notifications', desc: 'Receive email updates for new candidates and interview reminders' },
                                        { key: 'slackNotifs', label: 'Slack Integration', desc: 'Push notifications to your connected Slack workspace' },
                                        { key: 'weeklyReport', label: 'Weekly Digest', desc: 'Receive a weekly summary of hiring pipeline activity' },
                                        { key: 'aiAlerts', label: 'AI Alerts', desc: 'Get notified when AI detects high-match candidates' },
                                    ].map(item => (
                                        <div key={item.key} className="settings-row">
                                            <div className="settings-row__info">
                                                <div className="settings-row__label">{item.label}</div>
                                                <div className="settings-row__desc">{item.desc}</div>
                                            </div>
                                            <label className="toggle">
                                                <input type="checkbox" className="toggle__input" checked={toggles[item.key]} onChange={() => toggle(item.key)} />
                                                <span className="toggle__slider" />
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'integrations' && (
                            <div className="settings-section">
                                <div>
                                    <div className="settings-section__title">Integrations</div>
                                    <div className="settings-section__desc">Connect third-party tools to enhance your workflow</div>
                                </div>
                                <div className="settings-group">
                                    {[
                                        { name: 'Slack', desc: 'Team messaging and notifications', connected: false, color: '#6c5ce7' },
                                        { name: 'Google Calendar', desc: 'Sync interview schedules automatically', connected: true, color: '#00b894' },
                                        { name: 'LinkedIn Recruiter', desc: 'Import candidates and track outreach', connected: true, color: '#74b9ff' },
                                        { name: 'Zoom', desc: 'Auto-generate meeting links for interviews', connected: false, color: '#fdcb6e' },
                                        { name: 'GitHub', desc: 'Verify candidate code contributions', connected: false, color: '#e17055' },
                                    ].map(int => (
                                        <div key={int.name} className="settings-row">
                                            <div className="settings-row__info">
                                                <div className="settings-row__label">{int.name}</div>
                                                <div className="settings-row__desc">{int.desc}</div>
                                            </div>
                                            <button className={`btn btn-sm ${int.connected ? 'btn-secondary' : 'btn-primary'}`} onClick={() => alert(int.connected ? `${int.name} disconnected` : `${int.name} connected!`)}>
                                                {int.connected ? 'Disconnect' : 'Connect'}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeSection === 'security' && (
                            <div className="settings-section">
                                <div>
                                    <div className="settings-section__title">Security</div>
                                    <div className="settings-section__desc">Manage your account security and access</div>
                                </div>
                                <div className="settings-group">
                                    <div className="settings-row">
                                        <div className="settings-row__info">
                                            <div className="settings-row__label">Two-Factor Authentication</div>
                                            <div className="settings-row__desc">Add an extra layer of security to your account</div>
                                        </div>
                                        <label className="toggle">
                                            <input type="checkbox" className="toggle__input" checked={toggles.twoFactor} onChange={() => toggle('twoFactor')} />
                                            <span className="toggle__slider" />
                                        </label>
                                    </div>
                                    <div className="settings-row">
                                        <div className="settings-row__info">
                                            <div className="settings-row__label">Session Timeout</div>
                                            <div className="settings-row__desc">Automatically log out after 30 minutes of inactivity</div>
                                        </div>
                                        <label className="toggle">
                                            <input type="checkbox" className="toggle__input" checked={toggles.sessionTimeout} onChange={() => toggle('sessionTimeout')} />
                                            <span className="toggle__slider" />
                                        </label>
                                    </div>
                                    <div className="settings-row">
                                        <div className="settings-row__info">
                                            <div className="settings-row__label">Change Password</div>
                                            <div className="settings-row__desc">Update your account password</div>
                                        </div>
                                        <button className="btn btn-secondary btn-sm" onClick={() => alert('Password change modal coming soon')}>Update</button>
                                    </div>
                                </div>
                                <div className="settings-danger">
                                    <div className="settings-danger__title">Danger Zone</div>
                                    <div className="settings-danger__desc">Once you delete your account, there is no going back. Please be certain.</div>
                                    <button className="btn btn-sm" style={{ background: 'rgba(225,112,85,0.15)', color: '#e17055', border: '1px solid rgba(225,112,85,0.3)' }} onClick={() => alert('Account deletion requires admin approval')}>Delete Account</button>
                                </div>
                            </div>
                        )}

                        {['team', 'pipeline', 'billing'].includes(activeSection) && (
                            <div className="settings-section">
                                <div>
                                    <div className="settings-section__title">{navItems.find(n => n.id === activeSection)?.label}</div>
                                    <div className="settings-section__desc">This section is coming soon. Stay tuned for updates.</div>
                                </div>
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <Icon name="settings" size={48} color="var(--text-tertiary)" />
                                    <h4 style={{ marginTop: 12, color: 'var(--text-secondary)' }}>Coming Soon</h4>
                                    <p className="text-muted" style={{ fontSize: 13 }}>This feature is under development</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
