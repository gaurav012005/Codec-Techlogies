// ============================================
// useProctor — Proctoring event detection hook
// Feature 8 & 9
// ============================================
// Detects:
//   • Tab switches (visibilitychange)
//   • Fullscreen exit
//   • Copy/Paste attempts
//   • Right-click (screenshot prevention)
//
// Buffers events locally, flushes to server
// every 30 seconds or on submit.

import { useEffect, useRef, useCallback } from 'react';

const FLUSH_INTERVAL_MS = 30_000;

export function useProctor({ attemptId, enabled = true, onEvent } = {}) {
    const eventBufferRef = useRef([]);
    const flushTimerRef = useRef(null);

    const addEvent = useCallback((eventType, riskLevel = 'MEDIUM', details = {}) => {
        const event = {
            attemptId,
            eventType,
            riskLevel,
            details: { ...details, timestamp: new Date().toISOString() },
        };

        eventBufferRef.current.push(event);

        // Notify parent (UI warnings)
        if (onEvent) onEvent(event);

        console.log(`[Proctor] Event: ${eventType} (${riskLevel})`, details);
    }, [attemptId, onEvent]);

    // ── Flush buffer to server ─────────────────────────────────────────────
    const flushEvents = useCallback(async (force = false) => {
        const events = eventBufferRef.current;
        if (events.length === 0) return;

        eventBufferRef.current = [];

        try {
            const token = localStorage.getItem('accessToken');
            await fetch('/api/proctor/log/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify({ events }),
            });
        } catch (err) {
            // On failure, re-queue events so they aren't lost
            if (!force) {
                eventBufferRef.current = [...events, ...eventBufferRef.current];
            }
            console.warn('[Proctor] Failed to flush events:', err.message);
        }
    }, []);

    // ── Tab switch detection ───────────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !attemptId) return;

        const handleVisibility = () => {
            if (document.hidden) {
                addEvent('TAB_SWITCH', 'HIGH', { activeTab: document.title });
            }
        };
        document.addEventListener('visibilitychange', handleVisibility);
        return () => document.removeEventListener('visibilitychange', handleVisibility);
    }, [enabled, attemptId, addEvent]);

    // ── Fullscreen exit detection ──────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !attemptId) return;

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                addEvent('FULLSCREEN_EXIT', 'MEDIUM');
            }
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, [enabled, attemptId, addEvent]);

    // ── Copy/Paste detection ───────────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !attemptId) return;

        const handleCopy = (e) => {
            e.preventDefault();
            addEvent('COPY_PASTE_ATTEMPT', 'LOW', { action: 'copy' });
        };
        const handlePaste = (e) => {
            e.preventDefault();
            addEvent('COPY_PASTE_ATTEMPT', 'LOW', { action: 'paste' });
        };
        const handleContextMenu = (e) => {
            e.preventDefault();
            addEvent('SCREENSHOT_ATTEMPT', 'LOW', { action: 'right_click' });
        };

        document.addEventListener('copy', handleCopy);
        document.addEventListener('paste', handlePaste);
        document.addEventListener('contextmenu', handleContextMenu);

        return () => {
            document.removeEventListener('copy', handleCopy);
            document.removeEventListener('paste', handlePaste);
            document.removeEventListener('contextmenu', handleContextMenu);
        };
    }, [enabled, attemptId, addEvent]);

    // ── Auto-flush timer ───────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !attemptId) return;

        flushTimerRef.current = setInterval(() => flushEvents(), FLUSH_INTERVAL_MS);
        return () => {
            clearInterval(flushTimerRef.current);
        };
    }, [enabled, attemptId, flushEvents]);

    // ── Flush on unload ────────────────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !attemptId) return;

        const handleUnload = () => {
            // Use sendBeacon for reliable delivery on page close
            const events = eventBufferRef.current;
            if (events.length === 0) return;
            const token = localStorage.getItem('accessToken');
            const blob = new Blob([JSON.stringify({ events })], { type: 'application/json' });
            navigator.sendBeacon(
                '/api/proctor/log/batch',
                blob
            );
        };

        window.addEventListener('beforeunload', handleUnload);
        return () => window.removeEventListener('beforeunload', handleUnload);
    }, [enabled, attemptId]);

    return {
        addEvent,
        flushEvents,
        getBufferedCount: () => eventBufferRef.current.length,
    };
}
