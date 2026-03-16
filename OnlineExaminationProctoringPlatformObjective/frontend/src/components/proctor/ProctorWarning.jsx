// ============================================
// ProctorWarning — Floating warning shown on
// detected proctoring violations
// Feature 8 & 9
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { HiExclamation } from 'react-icons/hi';
import './Webcam.css';

const MESSAGES = {
    TAB_SWITCH: '⚠️ Tab switch detected! This has been recorded.',
    FULLSCREEN_EXIT: '⚠️ Fullscreen exit detected! Please stay in fullscreen.',
    COPY_PASTE_ATTEMPT: '⚠️ Copy/Paste is disabled during this exam.',
    SCREENSHOT_ATTEMPT: '⚠️ Right-click is disabled during this exam.',
    FACE_NOT_DETECTED: '⚠️ Face not detected! Ensure you are in camera view.',
    MULTIPLE_FACES: '⚠️ Multiple faces detected! Only the candidate should be visible.',
};

export function ProctorWarningProvider({ children }) {
    const [warnings, setWarnings] = useState([]);

    const showWarning = useCallback((eventType) => {
        const msg = MESSAGES[eventType] || `⚠️ Proctoring violation: ${eventType}`;
        const id = Date.now();
        setWarnings((w) => [...w, { id, msg }]);
        setTimeout(() => {
            setWarnings((w) => w.filter((x) => x.id !== id));
        }, 3000);
    }, []);

    return (
        <>
            {children}
            <div style={{ position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)', zIndex: 300, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
                {warnings.map((w) => (
                    <div key={w.id} className="proctor-warning">
                        <HiExclamation />
                        {w.msg}
                    </div>
                ))}
            </div>
        </>
    );
}

// Hook to expose showWarning from child context
import { createContext, useContext } from 'react';
export const ProctorContext = createContext(null);
