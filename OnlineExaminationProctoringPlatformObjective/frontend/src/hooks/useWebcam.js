// ============================================
// useWebcam — Custom hook for WebRTC webcam
// Feature 8: Basic WebRTC Proctoring
// ============================================
// Usage:
//   const { videoRef, stream, status, error, requestPermission, stopStream } = useWebcam();
//
// status: 'idle' | 'requesting' | 'granted' | 'denied' | 'error'

import { useState, useRef, useCallback, useEffect } from 'react';

export function useWebcam(options = {}) {
    const {
        width = 320,
        height = 240,
        facingMode = 'user',
        autoStart = false,
    } = options;

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [status, setStatus] = useState('idle'); // idle | requesting | granted | denied | error
    const [error, setError] = useState(null);

    const requestPermission = useCallback(async () => {
        setStatus('requesting');
        setError(null);

        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: { width, height, facingMode },
                audio: false,
            });

            streamRef.current = mediaStream;
            setStream(mediaStream);
            setStatus('granted');

            // Attach stream to video element if ready
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }

            return mediaStream;
        } catch (err) {
            const isDenied =
                err.name === 'NotAllowedError' ||
                err.name === 'PermissionDeniedError';

            setStatus(isDenied ? 'denied' : 'error');
            setError(isDenied
                ? 'Camera access was denied. Please allow camera access to proceed.'
                : `Camera error: ${err.message}`
            );
            return null;
        }
    }, [width, height, facingMode]);

    const stopStream = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setStream(null);
        setStatus('idle');
    }, []);

    // When video ref is ready and we have a stream, attach it
    const attachToVideo = useCallback((el) => {
        videoRef.current = el;
        if (el && streamRef.current) {
            el.srcObject = streamRef.current;
        }
    }, []);

    // Auto-start if requested
    useEffect(() => {
        if (autoStart) requestPermission();
        return () => stopStream();
    }, []); // eslint-disable-line

    // Check if browser supports getUserMedia
    const isSupported =
        typeof navigator !== 'undefined' &&
        !!navigator.mediaDevices?.getUserMedia;

    return {
        videoRef,
        attachToVideo,
        stream,
        status,
        error,
        isSupported,
        requestPermission,
        stopStream,
    };
}
