import React, { useMemo, useState } from "react";

/**
 * Generic question renderer for a test.
 *
 * Expected test shape:
 * {
 *   id: "belbin",
 *   title: "...",
 *   questions: [
 *     {
 *       id: "q1",
 *       text: "....",
 *       type: "single" | "multi",   // optional, default: "single"
 *       required: true | false,     // optional, default: true
 *       description: "optional helper text",
 *       options: [
 *         { id: "a", text: "..." },
 *         ...
 *       ]
 *     }
 *   ]
 * }
 *
 * Answers format passed to onSubmit / onChange:
 * {
 *   q1: "a",          // for single
 *   q2: ["a", "c"],   // for multi
 *   ...
 * }
 */
export default function TestQuestions({
    test,
    onSubmit,
    initialAnswers = {},
    onChange
}) {
    const questions = test?.questions || [];

    const [answers, setAnswers] = useState(initialAnswers);
    const [errors, setErrors] = useState({});

    const totalQuestions = questions.length;

    const answeredCount = useMemo(() => {
        return questions.filter((q) => {
            const value = answers[q.id];

            if (Array.isArray(value)) {
                return value.length > 0;
            }

            return value !== undefined && value !== null && String(value).trim() !== "";
        }).length;
    }, [answers, questions]);

    function getQuestionType(q) {
        // Default to "single" for backward compatibility
        return q.type === "multi" || q.type === "multi-choice" ? "multi" : "single";
    }

    function isRequired(q) {
        // Default required to true unless explicitly set to false
        return q.required !== false;
    }

    function updateAnswers(updater) {
        setAnswers((prev) => {
            const next = typeof updater === "function" ? updater(prev) : updater;

            if (onChange) {
                try {
                    onChange(next);
                } catch (e) {
                    // Swallow errors from external handlers to avoid breaking UI
                    console.error("onChange handler failed", e);
                }
            }

            return next;
        });
    }

    function handleChange(question, optionId) {
        const type = getQuestionType(question);

        updateAnswers((prev) => {
            const current = prev[question.id];
            let nextValue;

            if (type === "multi") {
                const currentArray = Array.isArray(current) ? current : [];
                if (currentArray.includes(optionId)) {
                    nextValue = currentArray.filter((x) => x !== optionId);
                } else {
                    nextValue = [...currentArray, optionId];
                }
            } else {
                // single
                nextValue = optionId;
            }

            const next = {
                ...prev,
                [question.id]: nextValue
            };

            return next;
        });

        // Clear existing error for this question
        if (errors[question.id]) {
            setErrors((prev) => {
                const copy = { ...prev };
                delete copy[question.id];
                return copy;
            });
        }
    }

    function validate() {
        const nextErrors = {};

        for (const q of questions) {
            if (!isRequired(q)) continue;

            const value = answers[q.id];

            if (Array.isArray(value)) {
                if (!value.length) {
                    nextErrors[q.id] = "پاسخ به این سؤال الزامی است.";
                }
            } else {
                if (value === undefined || value === null || String(value).trim() === "") {
                    nextErrors[q.id] = "پاسخ به این سؤال الزامی است.";
                }
            }
        }

        setErrors(nextErrors);

        if (Object.keys(nextErrors).length === 0) {
            return true;
        }

        // Scroll to first invalid question for better UX
        const firstInvalid = questions.find((q) => nextErrors[q.id]);
        if (firstInvalid) {
            const el = document.getElementById(`question-${firstInvalid.id}`);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }

        return false;
    }

    function handleSubmitClick() {
        const ok = validate();
        if (!ok) return;

        if (onSubmit) {
            onSubmit(answers);
        }
    }

    if (!questions.length) {
        return (
            <div className="alert alert-warning">
                سؤالی برای این تست تنظیم نشده است. لطفاً بعداً دوباره امتحان کنید.
            </div>
        );
    }

    const progressPercent =
        totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
        <div>
            {/* Progress */}
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1 small text-muted">
                    <span>
                        سؤالات پاسخ داده‌شده: {answeredCount} / {totalQuestions}
                    </span>
                    <span>{progressPercent}% تکمیل شده</span>
                </div>
                <div
                    className="progress"
                    role="progressbar"
                    aria-valuenow={answeredCount}
                    aria-valuemin={0}
                    aria-valuemax={totalQuestions}
                >
                    <div
                        className="progress-bar"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Questions */}
            {questions.map((q, index) => {
                const type = getQuestionType(q);
                const value = answers[q.id] ?? (type === "multi" ? [] : "");
                const hasError = !!errors[q.id];

                return (
                    <div
                        key={q.id}
                        id={`question-${q.id}`}
                        className={`card mb-3 ${hasError ? "border-danger" : ""}`}
                    >
                        <div className="card-body">
                            <h5 className="card-title">
                                <span className="badge bg-light text-muted ms-2">
                                    پرسش {index + 1}
                                </span>{" "}
                                {q.text}
                                {isRequired(q) && (
                                    <span className="text-danger me-1">*</span>
                                )}
                            </h5>

                            {q.description && (
                                <p className="card-text text-muted small mb-2">
                                    {q.description}
                                </p>
                            )}

                            <div className="mt-2">
                                {q.options &&
                                    q.options.map((opt) => {
                                        const isChecked =
                                            type === "multi"
                                                ? Array.isArray(value) &&
                                                value.includes(opt.id)
                                                : value === opt.id;

                                        return (
                                            <div
                                                className="form-check mb-1"
                                                key={opt.id}
                                            >
                                                <input
                                                    className="form-check-input"
                                                    type={
                                                        type === "multi"
                                                            ? "checkbox"
                                                            : "radio"
                                                    }
                                                    name={`q-${q.id}`}
                                                    id={`q-${q.id}-${opt.id}`}
                                                    checked={isChecked}
                                                    onChange={() =>
                                                        handleChange(q, opt.id)
                                                    }
                                                />
                                                <label
                                                    className="form-check-label"
                                                    htmlFor={`q-${q.id}-${opt.id}`}
                                                >
                                                    {opt.text}
                                                </label>
                                            </div>
                                        );
                                    })}
                            </div>

                            {hasError && (
                                <div className="alert alert-warning py-1 px-2 mt-2 small mb-0">
                                    {errors[q.id]}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Submit button */}
            <button
                type="button"
                className="btn btn-success w-100 mt-3"
                onClick={handleSubmitClick}
            >
                پایان تست و ادامه به پرداخت
            </button>
        </div>
    );
}
