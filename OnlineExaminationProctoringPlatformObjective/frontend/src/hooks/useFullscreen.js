// ============================================
// useFullscreen — Fullscreen enforcement hook
// Feature 9: Advanced Proctoring Events
// ============================================
// • Requests fullscreen on mount
// • Detects every exit and re-requests
// • Counts total exit events and reports them

import { useEffect, useRef, useCallback, useState } from 'react';

export function useFullscreen({ enabled = true, onExit } = {}) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [exitCount, setExitCount] = useState(0);
    const retryRef = useRef(null);

    const enterFullscreen = useCallback(async () => {
        if (!document.fullscreenEnabled) return false;
        try {
            await document.documentElement.requestFullscreen();
            return true;
        } catch {
            return false;
        }
    }, []);

    const exitFullscreen = useCallback(async () => {
        if (document.fullscreenElement) {
            try { await document.exitFullscreen(); } catch { }
        }
    }, []);

    useEffect(() => {
        if (!enabled) return;

        // Enter fullscreen on mount
        enterFullscreen();

        const handleChange = () => {
            const inFs = !!document.fullscreenElement;
            setIsFullscreen(inFs);

            if (!inFs) {
                // Exited fullscreen
                setExitCount((c) => c + 1);
                if (onExit) onExit();

                // Re-enter after 2s grace period
                clearTimeout(retryRef.current);
                retryRef.current = setTimeout(() => {
                    enterFullscreen();
                }, 2000);
            }
        };

        document.addEventListener('fullscreenchange', handleChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleChange);
            clearTimeout(retryRef.current);
            // Exit fullscreen on unmount
            exitFullscreen();
        };
    }, [enabled, enterFullscreen, exitFullscreen, onExit]);

    return { isFullscreen, exitCount, enterFullscreen, exitFullscreen };
}
