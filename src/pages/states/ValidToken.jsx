import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ErrorMessage from "../../components/ErrorMessage";
import Loading from "../../components/Loading";
import ProfileSection from "../../components/ProfileSection";
import BelbinAllocationBlock from "../../components/BelbinAllocationBlock";
import useSessionTimer from "../../hooks/useSessionTimer";
import { submitAnswers } from "../../services/resultService";
import TestQuestions from "../../components/TestQuestions";

/**
 * Props are provided by TestPage:
 * - data: user info from n8n (name, family, mobile, chat_id, ...)
 * - test: test config from src/tests
 * - token: test_token from URL (query)
 * - definition/prefill: for remote tests (e.g. Belbin)
 */
export default function ValidToken({ data, test, token, definition, prefill }) {
    const navigate = useNavigate();

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Stable storage key based on test + token
    const storageKey = useMemo(() => {
        if (!test || !token) return null;
        return `mentaleto_session_${test.id}_${token}`;
    }, [test, token]);

    // Load initial session from localStorage (if any)
    const initialSession = useMemo(() => {
        if (!storageKey || typeof window === "undefined") return null;
        try {
            const raw = window.localStorage.getItem(storageKey);
            if (!raw) return null;
            const parsed = JSON.parse(raw);
            if (!parsed || typeof parsed !== "object") return null;
            return parsed;
        } catch (e) {
            console.error("Failed to load saved session", e);
            return null;
        }
    }, [storageKey]);

    const initialStartedAt = initialSession?.meta?.startedAt;
    const initialActiveTimeMs = initialSession?.meta?.activeTimeMs || 0;

    const timer = useSessionTimer({
        initialStartedAt,
        initialActiveTimeMs,
    });

    // ---- Remote Belbin engine state ----
    const isRemoteBelbin = test?.definitionSource === "remote";

    const profileSection = useMemo(() => {
        if (!isRemoteBelbin) return null;
        return (definition?.sections || []).find((s) => s.type === "profile") || null;
    }, [definition, isRemoteBelbin]);

    const belbinSection = useMemo(() => {
        if (!isRemoteBelbin) return null;
        return (
            (definition?.sections || []).find((s) => s.type === "belbin_allocation") ||
            null
        );
    }, [definition, isRemoteBelbin]);

    // Build steps: profile + each belbin block
    const steps = useMemo(() => {
        if (!isRemoteBelbin || !profileSection || !belbinSection) return [];
        const blocks = belbinSection.blocks || [];
        return [
            { type: "profile", section: profileSection },
            ...blocks.map((b) => ({ type: "belbin-block", block: b, rules: belbinSection.rules })),
        ];
    }, [isRemoteBelbin, profileSection, belbinSection]);

    function buildEmptyBelbinState(block) {
        const selected = {};
        const scores = {};
        (block.items || []).forEach((it) => {
            selected[it.id] = false;
            scores[it.id] = 0;
        });
        return { selected, scores };
    }

    const [session, setSession] = useState(() => {
        // If we already have saved session, use it.
        if (initialSession) return initialSession;

        // Remote (Belbin): create V2 session envelope
        if (isRemoteBelbin) {
            const startedAt = new Date().toISOString();

            const baseProfile = {
                firstName: prefill?.firstName || data?.name || "",
                lastName: prefill?.lastName || data?.family || "",
                sex: "",
                job: "",
                education: "",
                birthDateJalali: "",
            };

            const belbinBlocks = {};
            (belbinSection?.blocks || []).forEach((b) => {
                belbinBlocks[b.id] = buildEmptyBelbinState(b);
            });

            return {
                version: 2,
                testId: test?.id || "",
                meta: { startedAt, activeTimeMs: 0 },
                profile: baseProfile,
                belbin: belbinBlocks,
                responses: {},
            };
        }

        // Local (MBTI sample): keep legacy answers shape
        return {
            version: 1,
            answers: {},
        };
    });

    const [stepIndex, setStepIndex] = useState(() => {
        // If saved session had stepIndex, use it
        const saved = initialSession?.ui?.stepIndex;
        return typeof saved === "number" ? saved : 0;
    });

    const [showValidation, setShowValidation] = useState(false);

    // Autosave (session + UI position + timer snapshot)
    useEffect(() => {
        if (!storageKey || typeof window === "undefined") return;

        try {
            const snap = timer.getSnapshot();
            const toSave = {
                ...session,
                meta: {
                    ...(session.meta || {}),
                    startedAt: snap.startedAt,
                    activeTimeMs: snap.activeTimeMs,
                },
                ui: { stepIndex },
            };
            window.localStorage.setItem(storageKey, JSON.stringify(toSave));
        } catch (e) {
            console.error("Failed to save session to localStorage", e);
        }
    }, [session, stepIndex, storageKey, timer]);

    function updateProfile(nextProfile) {
        setSession((prev) => ({ ...prev, profile: nextProfile }));
    }

    function updateBelbinBlock(blockId, nextBlockState) {
        setSession((prev) => ({
            ...prev,
            belbin: { ...(prev.belbin || {}), [blockId]: nextBlockState },
        }));
    }

    function validateProfile(section, profile) {
        if (!section?.fields) return true;

        for (const field of section.fields) {
            if (!field.required) continue;
            const v = profile?.[field.id];

            if (v === null || v === undefined || String(v).trim() === "") {
                return false;
            }
        }
        return true;
    }

    function sumScores(scores = {}) {
        return Object.values(scores).reduce((acc, n) => acc + (Number(n) || 0), 0);
    }

    function validateBelbinBlock(rules, blockState) {
        const total = rules?.sum ?? 10;
        const requireSelection = !!rules?.requireSelection;

        const selected = blockState?.selected || {};
        const scores = blockState?.scores || {};

        if (requireSelection && !Object.values(selected).some((v) => v === true)) {
            return false;
        }

        return sumScores(scores) === total;
    }

    function canGoNext() {
        if (!isRemoteBelbin) return true;

        const step = steps[stepIndex];
        if (!step) return false;

        if (step.type === "profile") {
            return validateProfile(step.section, session.profile);
        }
        if (step.type === "belbin-block") {
            const blockState = session?.belbin?.[step.block.id];
            return validateBelbinBlock(step.rules, blockState);
        }

        return true;
    }

    function goNext() {
        if (!canGoNext()) {
            setShowValidation(true);
            return;
        }
        setShowValidation(false);
        setStepIndex((i) => Math.min(i + 1, steps.length - 1));
    }

    function goPrev() {
        setShowValidation(false);
        setStepIndex((i) => Math.max(i - 1, 0));
    }

    async function handleSubmitRemote() {
        if (submitting) return;

        // Validate all steps before submit
        if (!validateProfile(profileSection, session.profile)) {
            setShowValidation(true);
            setStepIndex(0);
            return;
        }

        for (const step of steps) {
            if (step.type !== "belbin-block") continue;
            const st = session?.belbin?.[step.block.id];
            if (!validateBelbinBlock(step.rules, st)) {
                setShowValidation(true);
                setStepIndex(steps.findIndex((s) => s.type === "belbin-block" && s.block.id === step.block.id));
                return;
            }
        }

        setSubmitting(true);
        setError(null);

        try {
            const snap = timer.getSnapshot();

            // Convert to compact payload for backend storage
            const belbinScores = {};
            Object.entries(session.belbin || {}).forEach(([blockId, blockState]) => {
                belbinScores[blockId] = { ...(blockState?.scores || {}) };
            });

            const answers = {
                version: 2,
                profile: session.profile,
                BELBIN_9_INDIVIDUAL: belbinScores,
                responses: session.responses || {},
                meta: {
                    startedAt: snap.startedAt,
                    submittedAt: new Date().toISOString(),
                    wallTimeMs: snap.wallTimeMs,
                    activeTimeMs: snap.activeTimeMs,
                },
            };

            const payload = { testId: test.id, token, answers };

            const res = await submitAnswers(payload);

            if (!res || res.success === false) {
                setError(
                    res?.message ||
                    "ارسال پاسخ‌ها با خطا مواجه شد. لطفاً دوباره تلاش کنید."
                );
                setSubmitting(false);
                return;
            }

            // Clear saved session after successful submit
            if (storageKey && typeof window !== "undefined") {
                try {
                    window.localStorage.removeItem(storageKey);
                } catch (e) {
                    console.error("Failed to clear saved session", e);
                }
            }

            navigate(`/test/${test.id}/prepay?token=${encodeURIComponent(token)}`);
        } catch (e) {
            console.error("Failed to submit answers", e);
            setError("ارسال پاسخ‌ها با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
            setSubmitting(false);
        }
    }

    // Legacy submit path (local tests)
    async function handleSubmitLegacy(answers) {
        if (submitting) return;

        setSubmitting(true);
        setError(null);

        try {
            const payload = {
                testId: test.id,
                token,
                answers,
            };

            const res = await submitAnswers(payload);

            if (!res || res.success === false) {
                setError(
                    res?.message ||
                    "ارسال پاسخ‌ها با خطا مواجه شد. لطفاً دوباره تلاش کنید."
                );
                setSubmitting(false);
                return;
            }

            if (storageKey && typeof window !== "undefined") {
                try {
                    window.localStorage.removeItem(storageKey);
                } catch (e) {
                    console.error("Failed to clear saved answers", e);
                }
            }

            navigate(`/test/${test.id}/prepay?token=${encodeURIComponent(token)}`);
        } catch (e) {
            console.error("Failed to submit answers", e);
            setError("ارسال پاسخ‌ها با خطا مواجه شد. لطفاً دوباره تلاش کنید.");
            setSubmitting(false);
        }
    }

    // ---------- UI ----------
    if (isRemoteBelbin) {
        if (!definition || !profileSection || !belbinSection) {
            return (
                <div className="container my-4">
                    <Loading />
                </div>
            );
        }

        const step = steps[stepIndex];
        const totalSteps = steps.length;
        const progress = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;

        return (
            <div className="container my-4">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-10">
                        <div className="card mb-4">
                            <div className="card-body">
                                <h1 className="h4 mb-2">{definition.title || test.title}</h1>

                                {data && (
                                    <p className="mb-1">
                                        <strong>نام شما:</strong>{" "}
                                        {data.name} {data.family}
                                    </p>
                                )}

                                {definition.description && (
                                    <p className="text-muted small mb-0" style={{ whiteSpace: "pre-line" }}>
                                        {definition.description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="progress mb-3" style={{ height: 10 }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progress}%` }}
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div className="text-muted small">
                                مرحله {stepIndex + 1} از {totalSteps}
                            </div>
                            {step?.type === "belbin-block" && (
                                <div className="text-muted small">{step.block.title}</div>
                            )}
                        </div>

                        {error && (
                            <ErrorMessage title="خطا" text={error} />
                        )}

                        {step?.type === "profile" && (
                            <ProfileSection
                                section={profileSection}
                                value={session.profile}
                                prefill={prefill}
                                onChange={updateProfile}
                            />
                        )}

                        {step?.type === "belbin-block" && (
                            <BelbinAllocationBlock
                                block={step.block}
                                rules={step.rules}
                                state={session?.belbin?.[step.block.id]}
                                onChange={(nextState) => updateBelbinBlock(step.block.id, nextState)}
                                showValidation={showValidation}
                            />
                        )}

                        <div className="d-flex justify-content-between mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={goPrev}
                                disabled={stepIndex === 0 || submitting}
                            >
                                قبلی
                            </button>

                            {stepIndex < steps.length - 1 ? (
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={goNext}
                                    disabled={submitting}
                                >
                                    بعدی
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="btn btn-success"
                                    onClick={handleSubmitRemote}
                                    disabled={submitting}
                                >
                                    ارسال پاسخ‌ها و ادامه پرداخت
                                </button>
                            )}
                        </div>

                        {showValidation && step?.type === "profile" && !validateProfile(profileSection, session.profile) && (
                            <div className="alert alert-warning mt-3">
                                لطفاً همه اطلاعات فردی را کامل کنید.
                            </div>
                        )}

                        {submitting && (
                            <div className="text-center text-muted small mt-3">
                                در حال ارسال پاسخ‌ها...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Local tests (MBTI sample) - keep old behavior

    return (
        <div className="my-4">
            <div className="row justify-content-center">
                <div className="col-12 col-lg-10">
                    {/* Header card */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h1 className="h4 mb-3">{test.title}</h1>

                            {data && (
                                <p className="mb-1">
                                    <strong>نام شما:</strong>{" "}
                                    {data.name} {data.family}
                                </p>
                            )}

                            {test.description && (
                                <p className="text-muted small mb-0">
                                    {test.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Error message */}
                    {error && (
                        <ErrorMessage title="خطا" text={error} />
                    )}

                    <TestQuestions
                        test={test}
                        onSubmit={handleSubmitLegacy}
                        initialAnswers={initialSession?.answers || {}}
                        onChange={(answers) => {
                            // legacy autosave
                            if (!storageKey || typeof window === "undefined") return;
                            try {
                                window.localStorage.setItem(
                                    storageKey,
                                    JSON.stringify({ version: 1, answers })
                                );
                            } catch (e) {
                                console.error("Failed to save answers", e);
                            }
                        }}
                    />

                    {submitting && (
                        <div className="text-center text-muted small mt-3">
                            در حال ارسال پاسخ‌ها...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
