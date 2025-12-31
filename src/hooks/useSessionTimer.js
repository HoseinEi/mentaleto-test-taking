import { useEffect, useRef } from "react";

/**
 * Tracks both:
 * - wallTimeMs: from startedAt -> now (includes pauses, app closes, etc.)
 * - activeTimeMs: only when user is active (tab visible + not idle)
 *
 * Persists correctly across reload if you pass initialStartedAt + initialActiveTimeMs.
 */
export default function useSessionTimer({
    initialStartedAt,
    initialActiveTimeMs = 0,
    idleMs = 30_000,
} = {}) {
    const startedAtRef = useRef(initialStartedAt || new Date().toISOString());

    // Active timing
    const activeAccumRef = useRef(Number(initialActiveTimeMs) || 0);
    const activeRunningRef = useRef(false);
    const activeStartRef = useRef(null);

    const lastActivityRef = useRef(Date.now());
    const intervalRef = useRef(null);

    function pauseActive() {
        if (!activeRunningRef.current) return;
        const start = activeStartRef.current;
        if (typeof start === "number") {
            activeAccumRef.current += Date.now() - start;
        }
        activeRunningRef.current = false;
        activeStartRef.current = null;
    }

    function resumeActive() {
        if (activeRunningRef.current) return;
        activeRunningRef.current = true;
        activeStartRef.current = Date.now();
    }

    function markActivity() {
        lastActivityRef.current = Date.now();
        if (document.visibilityState === "visible") {
            resumeActive();
        }
    }

    useEffect(() => {
        // Start active timer immediately (user is on the page)
        if (document.visibilityState === "visible") {
            resumeActive();
        }

        const onVisibility = () => {
            if (document.visibilityState === "hidden") {
                pauseActive();
            } else {
                markActivity();
            }
        };

        window.addEventListener("visibilitychange", onVisibility);

        const activityEvents = [
            "mousemove",
            "mousedown",
            "keydown",
            "scroll",
            "touchstart",
            "touchmove",
        ];

        activityEvents.forEach((evt) =>
            window.addEventListener(evt, markActivity, { passive: true })
        );

        intervalRef.current = window.setInterval(() => {
            if (document.visibilityState !== "visible") return;

            const idleFor = Date.now() - lastActivityRef.current;
            if (idleFor > idleMs) {
                pauseActive();
            }
        }, 1000);

        return () => {
            pauseActive();
            window.removeEventListener("visibilitychange", onVisibility);
            activityEvents.forEach((evt) =>
                window.removeEventListener(evt, markActivity)
            );
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getSnapshot() {
        const startedAt = startedAtRef.current;

        const wallTimeMs = Date.now() - new Date(startedAt).getTime();

        let activeTimeMs = activeAccumRef.current;
        if (activeRunningRef.current && typeof activeStartRef.current === "number") {
            activeTimeMs += Date.now() - activeStartRef.current;
        }

        return { startedAt, wallTimeMs, activeTimeMs };
    }

    return { getSnapshot };
}