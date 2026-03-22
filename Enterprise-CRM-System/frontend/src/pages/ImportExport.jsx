import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Upload, Download, Clock, FileText, Plus, X, ChevronDown,
    CheckCircle, AlertTriangle, Table, File, ArrowRight
} from 'lucide-react';

const ENTITIES = ['Lead', 'Contact', 'Company', 'Deal'];

const ImportExport = () => {
    const [activeTab, setActiveTab] = useState('import');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [importHistory, setImportHistory] = useState([]);

    // Import state
    const [importEntity, setImportEntity] = useState('Lead');
    const [importData, setImportData] = useState('');
    const [importResult, setImportResult] = useState(null);

    // Export state
    const [exportEntity, setExportEntity] = useState('Lead');
    const [exportFormat, setExportFormat] = useState('json');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/data/import/history');
            setImportHistory(data.data?.logs || []);
        } catch (err) { setError('Failed to load history'); }
        finally { setLoading(false); }
    };

    const handleImport = async () => {
        setError('');
        setImportResult(null);
        try {
            // Parse CSV text to JSON records
            const lines = importData.trim().split('\n');
            if (lines.length < 2) return setError('Need at least a header row and one data row');

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const records = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
                const record = {};
                headers.forEach((h, i) => { record[h] = values[i] || ''; });
                return record;
            });

            setLoading(true);
            const { data } = await api.post(`/data/import/${importEntity}`, {
                records,
                fileName: `${importEntity}_import_${Date.now()}.csv`,
            });

            setImportResult(data.data);
            setSuccess(`Imported ${data.data.successCount} of ${data.data.totalRecords} records`);
            setTimeout(() => setSuccess(''), 5000);
        } catch (err) {
            setError(err.response?.data?.message || 'Import failed');
        } finally { setLoading(false); }
    };

    const handleExport = async () => {
        setExporting(true);
        setError('');
        try {
            const { data } = await api.get(`/data/export/${exportEntity}`, {
                params: { format: exportFormat },
                responseType: exportFormat === 'csv' ? 'blob' : 'json',
            });

            if (exportFormat === 'csv') {
                const blob = new Blob([data], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${exportEntity}_export.csv`;
                a.click();
                URL.revokeObjectURL(url);
                setSuccess('Export downloaded!');
            } else {
                const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${exportEntity}_export.json`;
                a.click();
                URL.revokeObjectURL(url);
                setSuccess(`Exported ${data.count || data.data?.length || 0} records`);
            }
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) { setError('Export failed'); }
        finally { setExporting(false); }
    };

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Import / Export</h1>
                    <p className="page-subtitle">Import CSV data or export records to files</p>
                </div>
            </div>

            {success && <div className="alert alert-success"><CheckCircle size={16} />{success}</div>}
            {error && <div className="alert alert-error"><AlertTriangle size={16} />{error}</div>}

            <div className="report-tabs" style={{ marginBottom: 'var(--space-6)' }}>
                {[
                    { id: 'import', label: 'Import', icon: Upload },
                    { id: 'export', label: 'Export', icon: Download },
                    { id: 'history', label: 'History', icon: Clock },
                ].map(tab => (
                    <button key={tab.id} className={`report-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}>
                        <tab.icon size={16} />{tab.label}
                    </button>
                ))}
            </div>

            {/* ═══ Import Tab ═══ */}
            {activeTab === 'import' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Upload size={16} style={{ marginRight: 8, color: 'var(--primary-400)' }} />Import Data</h3>

                    <div className="form-group">
                        <label className="form-label">Entity Type</label>
                        <select className="form-input form-input-no-icon" value={importEntity}
                            onChange={e => setImportEntity(e.target.value)}>
                            {ENTITIES.map(e => <option key={e} value={e}>{e}s</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Paste CSV Data</label>
                        <textarea className="form-input form-input-no-icon" rows={12} value={importData}
                            onChange={e => setImportData(e.target.value)}
                            placeholder={`name,email,phone,company,source,status\nJohn Doe,john@example.com,+1234567890,Acme Inc,website,new\nJane Smith,jane@example.com,+0987654321,Tech Corp,referral,contacted`}
                            style={{ fontFamily: 'monospace', fontSize: 'var(--font-xs)', resize: 'vertical' }} />
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleImport} disabled={loading || !importData.trim()}>
                            {loading ? <><div className="spinner spinner-sm" /> Importing...</> : <><Upload size={16} /> Import</>}
                        </button>
                    </div>

                    {importResult && (
                        <div style={{ marginTop: 'var(--space-6)', padding: 'var(--space-4)', background: 'rgba(16, 185, 129, 0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                            <h4 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--font-sm)' }}>Import Results</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-4)' }}>
                                <div><div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700 }}>{importResult.totalRecords}</div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Total</div></div>
                                <div><div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--accent-emerald)' }}>{importResult.successCount}</div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Success</div></div>
                                <div><div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--error)' }}>{importResult.failureCount}</div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Failed</div></div>
                                <div><div style={{ fontSize: 'var(--font-2xl)', fontWeight: 700, color: 'var(--accent-amber)' }}>{importResult.duplicateCount}</div><div style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>Duplicates</div></div>
                            </div>
                            {importResult.errors?.length > 0 && (
                                <div style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-xs)' }}>
                                    <strong>Errors:</strong>
                                    {importResult.errors.map((err, i) => (
                                        <div key={i} style={{ color: 'var(--error)', marginTop: 4 }}>Row {err.row}: {err.message}</div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* ═══ Export Tab ═══ */}
            {activeTab === 'export' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Download size={16} style={{ marginRight: 8, color: 'var(--accent-emerald)' }} />Export Data</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                        <div className="form-group">
                            <label className="form-label">Entity Type</label>
                            <select className="form-input form-input-no-icon" value={exportEntity}
                                onChange={e => setExportEntity(e.target.value)}>
                                {ENTITIES.map(e => <option key={e} value={e}>{e}s</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Format</label>
                            <select className="form-input form-input-no-icon" value={exportFormat}
                                onChange={e => setExportFormat(e.target.value)}>
                                <option value="json">JSON</option>
                                <option value="csv">CSV</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
                        <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
                            {exporting ? <><div className="spinner spinner-sm" /> Exporting...</> : <><Download size={16} /> Export</>}
                        </button>
                    </div>
                </div>
            )}

            {/* ═══ History Tab ═══ */}
            {activeTab === 'history' && (
                <div className="report-chart-card" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
                    <h3 className="report-chart-title"><Clock size={16} style={{ marginRight: 8, color: 'var(--accent-amber)' }} />Import History</h3>
                    <div className="leaderboard-table">
                        <div className="at-risk-header">
                            <span>File</span><span>Entity</span><span>Records</span><span>Status</span><span>Date</span>
                        </div>
                        {importHistory.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No import history</div>}
                        {importHistory.map(log => (
                            <div key={log._id} className="at-risk-row">
                                <span className="at-risk-name">{log.fileName}</span>
                                <span className="at-risk-stage">{log.entity}</span>
                                <span>{log.successCount}/{log.totalRecords}</span>
                                <span>
                                    <span className={`probability-badge ${log.status === 'completed' ? 'hot' : log.status === 'processing' ? 'warm' : 'cold'}`}>
                                        {log.status}
                                    </span>
                                </span>
                                <span style={{ fontSize: 'var(--font-xs)', color: 'var(--text-muted)' }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImportExport;
