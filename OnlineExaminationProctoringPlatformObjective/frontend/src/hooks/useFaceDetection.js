// ============================================
// useFaceDetection — Feature 10
// Runs TinyFaceDetector on webcam video feed
// Detects: no face, single face, multiple faces
// ============================================
//
// Usage:
//   const { faceStatus, faceCount, isModelReady } = useFaceDetection({
//     videoRef,
//     enabled,
//     onNoFace,
//     onMultipleFaces,
//     intervalMs: 2000,
//   });
//
// faceStatus: 'loading' | 'ok' | 'no_face' | 'multiple' | 'error'

import { useState, useEffect, useRef, useCallback } from 'react';
import * as faceapi from '@vladmandic/face-api';

const MODEL_URL = '/models';
const DETECTION_INTERVAL_MS = 2000;

// Thresholds — consecutive frames before firing event
const NO_FACE_THRESHOLD = 2;    // 2 consecutive no-face frames (~4s)
const MULTI_FACE_THRESHOLD = 1; // 1 frame with multiple faces

let modelsLoaded = false;

async function loadModels() {
    if (modelsLoaded) return;
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    modelsLoaded = true;
}

export function useFaceDetection({
    videoRef,
    enabled = true,
    onNoFace,
    onMultipleFaces,
    onFaceOk,
    intervalMs = DETECTION_INTERVAL_MS,
} = {}) {
    const [faceStatus, setFaceStatus] = useState('loading'); // loading | ok | no_face | multiple | error
    const [faceCount, setFaceCount] = useState(0);
    const [isModelReady, setIsModelReady] = useState(false);

    const intervalRef = useRef(null);
    const noFaceCountRef = useRef(0);
    const multiFaceCountRef = useRef(0);
    const prevStatusRef = useRef('loading');

    // ── Load models ────────────────────────────────────────────────────────
    useEffect(() => {
        loadModels()
            .then(() => {
                setIsModelReady(true);
                setFaceStatus('ok');
            })
            .catch((err) => {
                console.error('[FaceDetect] Model load failed:', err);
                setFaceStatus('error');
            });
    }, []);

    // ── Detection loop ─────────────────────────────────────────────────────
    const runDetection = useCallback(async () => {
        const video = videoRef?.current;
        if (!video || video.readyState < 2 || !isModelReady) return;

        try {
            const detections = await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 160,  // fastest option
                    scoreThreshold: 0.4,
                })
            );

            const count = detections.length;
            setFaceCount(count);

            if (count === 0) {
                noFaceCountRef.current++;
                multiFaceCountRef.current = 0;

                if (noFaceCountRef.current >= NO_FACE_THRESHOLD) {
                    setFaceStatus('no_face');
                    if (prevStatusRef.current !== 'no_face') {
                        prevStatusRef.current = 'no_face';
                        onNoFace?.();
                    }
                }
            } else if (count > 1) {
                multiFaceCountRef.current++;
                noFaceCountRef.current = 0;

                if (multiFaceCountRef.current >= MULTI_FACE_THRESHOLD) {
                    setFaceStatus('multiple');
                    if (prevStatusRef.current !== 'multiple') {
                        prevStatusRef.current = 'multiple';
                        onMultipleFaces?.();
                    }
                }
            } else {
                // Exactly 1 face detected
                noFaceCountRef.current = 0;
                multiFaceCountRef.current = 0;

                if (prevStatusRef.current !== 'ok') {
                    prevStatusRef.current = 'ok';
                    setFaceStatus('ok');
                    onFaceOk?.();
                }
            }
        } catch (err) {
            // Suppress per-frame errors silently
            console.warn('[FaceDetect] Frame error:', err.message);
        }
    }, [videoRef, isModelReady, onNoFace, onMultipleFaces, onFaceOk]);

    // ── Start/stop detection loop ──────────────────────────────────────────
    useEffect(() => {
        if (!enabled || !isModelReady) return;

        intervalRef.current = setInterval(runDetection, intervalMs);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [enabled, isModelReady, runDetection, intervalMs]);

    return { faceStatus, faceCount, isModelReady };
}
