// ============================================
// WebcamGate — Permission request screen
// Feature 8: shown BEFORE exam starts
// ============================================

import { useEffect, useRef } from 'react';
import { HiVideoCamera, HiShieldCheck, HiEye, HiLockClosed, HiRefresh } from 'react-icons/hi';
import { useWebcam } from '../../hooks/useWebcam';
import './Webcam.css';

export function WebcamGate({ onGranted, examTitle }) {
    const { videoRef, attachToVideo, status, error, isSupported, requestPermission } = useWebcam();

    useEffect(() => {
        if (status === 'granted') {
            // Wait a beat so the user sees the live preview
            const t = setTimeout(() => onGranted(), 1200);
            return () => clearTimeout(t);
        }
    }, [status, onGranted]);

    const requirements = [
        { icon: '📷', label: 'Webcam access required throughout the exam' },
        { icon: '💡', label: 'Ensure good lighting so your face is clearly visible' },
        { icon: '🚫', label: 'No tab switching — triggers a proctoring flag' },
        { icon: '🖥️', label: 'Fullscreen mode will be requested' },
        { icon: '🔒', label: 'Your session is secured and monitored' },
    ];

    if (!isSupported) {
        return (
            <div className="webcam-gate">
                <div className="webcam-gate-card">
                    <div className="webcam-gate-icon">⚠️</div>
                    <h2 className="webcam-gate-title">Camera Not Supported</h2>
                    <p className="webcam-gate-subtitle">
                        Your browser does not support webcam access. Please use a modern browser
                        (Chrome, Firefox, Edge) to take this proctored exam.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="webcam-gate">
            <div className="webcam-gate-card">
                {/* Header */}
                <div className="webcam-gate-icon">
                    {status === 'granted' ? '✅' : '📷'}
                </div>
                <h2 className="webcam-gate-title">
                    {status === 'idle' && 'Webcam Access Required'}
                    {status === 'requesting' && 'Requesting Permission...'}
                    {status === 'granted' && 'Camera Ready!'}
                    {status === 'denied' && 'Camera Access Denied'}
                    {status === 'error' && 'Camera Error'}
                </h2>
                <p className="webcam-gate-subtitle">
                    {status === 'idle' && `"${examTitle}" is proctored. Your webcam feed will be monitored throughout the exam.`}
                    {status === 'requesting' && 'Please allow camera access in your browser prompt.'}
                    {status === 'granted' && 'Camera feed looks good. Starting exam in a moment...'}
                    {(status === 'denied' || status === 'error') && 'Camera access is required for this proctored exam.'}
                </p>

                {/* Live preview */}
                <div className="webcam-preview-box">
                    {status === 'granted' ? (
                        <>
                            <video
                                ref={attachToVideo}
                                autoPlay
                                muted
                                playsInline
                                className="webcam-preview-video"
                            />
                            <div className="webcam-status-dot" />
                        </>
                    ) : (
                        <div className="webcam-preview-placeholder">
                            <HiVideoCamera className="webcam-preview-icon" />
                            <span>
                                {status === 'requesting' ? 'Waiting...' : 'Camera preview'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Error */}
                {error && (
                    <div className="webcam-error">
                        ⚠️ {error}
                    </div>
                )}

                {/* Requesting spinner */}
                {status === 'requesting' && (
                    <div className="webcam-spinner-box">
                        <div className="spinner" />
                        <span>Check your browser's address bar for the permission prompt</span>
                    </div>
                )}

                {/* Requirements */}
                {status === 'idle' && (
                    <div className="webcam-requirements">
                        {requirements.map((r) => (
                            <div key={r.label} className="webcam-req-item">
                                <span className="webcam-req-icon">{r.icon}</span>
                                <span>{r.label}</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                {(status === 'idle') && (
                    <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={requestPermission}>
                        <HiVideoCamera style={{ marginRight: 8 }} />
                        Allow Camera &amp; Start Exam
                    </button>
                )}

                {(status === 'denied' || status === 'error') && (
                    <button className="btn btn-primary" style={{ width: '100%' }} onClick={requestPermission}>
                        <HiRefresh style={{ marginRight: 8 }} />
                        Try Again
                    </button>
                )}

                {status === 'denied' && (
                    <p style={{ marginTop: 12, fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                        To fix: click the 🔒 lock icon in your browser's address bar → Camera → Allow → refresh and try again.
                    </p>
                )}
            </div>
        </div>
    );
}
