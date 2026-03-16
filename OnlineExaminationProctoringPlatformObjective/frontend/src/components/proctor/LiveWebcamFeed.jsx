// ============================================
// LiveWebcamFeed — Corner overlay during exam
// Feature 8 + 10: Live feed + Face Detection AI
// ============================================

import { useEffect, useRef, useState, useCallback } from 'react';
import { HiVideoCamera } from 'react-icons/hi';
import { useFaceDetection } from '../../hooks/useFaceDetection';
import './Webcam.css';

const POSITIONS = ['position-top-right', 'position-top-left', 'position-bottom-right'];

// Face status config
const FACE_STATUS_CONFIG = {
    loading: { border: 'rgba(129,140,248,0.5)', label: '⌛ Loading AI...', labelColor: '#818cf8' },
    ok: { border: 'rgba(16,185,129,0.6)', label: null, labelColor: '#10b981' },
    no_face: { border: 'rgba(244,63,94,0.8)', label: '⚠️ No Face', labelColor: '#f43f5e' },
    multiple: { border: 'rgba(236,72,153,0.8)', label: '⚠️ Multiple Faces', labelColor: '#ec4899' },
    error: { border: 'rgba(107,114,128,0.4)', label: null, labelColor: '#6b7280' },
};

export function LiveWebcamFeed({ stream, onCameraLost, onNoFace, onMultipleFaces, enabled = true }) {
    const videoRef = useRef(null);
    const [posIdx, setPosIdx] = useState(0);
    const [cameraLost, setCameraLost] = useState(false);

    // Attach stream to video element
    useEffect(() => {
        if (videoRef.current && stream) {
            videoRef.current.srcObject = stream;
        }
    }, [stream]);

    // Detect if stream tracks end
    useEffect(() => {
        if (!stream) return;
        const tracks = stream.getVideoTracks();
        tracks.forEach((track) => {
            track.addEventListener('ended', () => {
                setCameraLost(true);
                onCameraLost?.();
            });
        });
    }, [stream, onCameraLost]);

    // Feature 10: Face detection on the webcam feed
    const { faceStatus, faceCount, isModelReady } = useFaceDetection({
        videoRef,
        enabled: enabled && !!stream && !cameraLost,
        onNoFace,
        onMultipleFaces,
        onFaceOk: undefined,
        intervalMs: 2500,
    });

    const cyclePosition = useCallback((e) => {
        e.stopPropagation();
        setPosIdx((i) => (i + 1) % POSITIONS.length);
    }, []);

    const faceConfig = FACE_STATUS_CONFIG[faceStatus] || FACE_STATUS_CONFIG.ok;

    if (!stream || cameraLost) {
        return (
            <div className={`webcam-feed-corner ${POSITIONS[posIdx]}`}>
                <div className="webcam-feed-error">
                    <HiVideoCamera style={{ fontSize: '1.5rem' }} />
                    <span>Camera disconnected!</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`webcam-feed-corner ${POSITIONS[posIdx]}`}>
            <div
                className="webcam-feed-inner"
                style={{ borderColor: faceConfig.border }}
            >
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="webcam-feed-video"
                />

                {/* Face status indicator bar */}
                {faceStatus !== 'ok' && faceConfig.label && (
                    <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0,
                        background: faceConfig.labelColor + '22',
                        borderBottom: `2px solid ${faceConfig.labelColor}`,
                        padding: '4px 8px',
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: faceConfig.labelColor,
                        textAlign: 'center',
                        letterSpacing: '0.05em',
                        backdropFilter: 'blur(4px)',
                    }}>
                        {faceConfig.label}
                    </div>
                )}

                {/* Bottom bar: LIVE + face count */}
                <div className="webcam-feed-label">
                    <div className="webcam-live-badge">
                        <div className="webcam-live-dot" />
                        LIVE
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                        {isModelReady && (
                            <div style={{
                                fontSize: '0.55rem', fontWeight: 700,
                                color: faceStatus === 'ok' ? '#10b981'
                                    : faceStatus === 'no_face' ? '#f43f5e'
                                        : faceStatus === 'multiple' ? '#ec4899'
                                            : '#818cf8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.04em',
                            }}>
                                {faceStatus === 'ok' ? `✓ ${faceCount} face`
                                    : faceStatus === 'no_face' ? '✗ No face'
                                        : faceStatus === 'multiple' ? `⚠ ${faceCount} faces`
                                            : 'AI Active'}
                            </div>
                        )}
                        <div className="webcam-proctored-badge">Proctored</div>
                    </div>
                </div>

                {/* Hover controls */}
                <div className="webcam-feed-controls">
                    <button className="webcam-ctrl-btn" onClick={cyclePosition} title="Move camera">✥</button>
                </div>
            </div>
        </div>
    );
}
