import React, { useMemo } from "react";

function sumScores(scores = {}) {
    return Object.values(scores).reduce((acc, n) => acc + (Number(n) || 0), 0);
}

/**
 * One Belbin block (one of the 7 sections).
 *
 * state shape:
 * {
 *   selected: { [itemId]: boolean },
 *   scores: { [itemId]: number }
 * }
 */
export default function BelbinAllocationBlock({
    block,
    rules,
    state,
    onChange,
    showValidation = false,
}) {
    const selected = state?.selected || {};
    const scores = state?.scores || {};

    const total = rules?.sum ?? 10;
    const min = rules?.min ?? 0;
    const max = rules?.max ?? total;

    const currentSum = useMemo(() => sumScores(scores), [scores]);
    const remaining = total - currentSum;

    const isValid =
        currentSum === total &&
        (!rules?.requireSelection ||
            Object.values(selected).some((v) => v === true));

    function setSelected(itemId, next) {
        const nextSelected = { ...selected, [itemId]: next };

        // If unselecting -> force score to 0
        const nextScores = { ...scores };
        if (!next) nextScores[itemId] = 0;

        onChange({ selected: nextSelected, scores: nextScores });
    }

    function inc(itemId) {
        if (!selected[itemId]) return;
        const cur = Number(scores[itemId]) || 0;
        if (cur >= max) return;
        if (remaining <= 0) return;

        onChange({
            selected: { ...selected },
            scores: { ...scores, [itemId]: cur + 1 },
        });
    }

    function dec(itemId) {
        if (!selected[itemId]) return;
        const cur = Number(scores[itemId]) || 0;
        if (cur <= min) return;

        onChange({
            selected: { ...selected },
            scores: { ...scores, [itemId]: cur - 1 },
        });
    }

    return (
        <div className="card">
            <div className="card-body">
                <div className="d-flex align-items-start justify-content-between gap-3">
                    <div>
                        <h2 className="h5 mb-1">{block.title}</h2>
                        {block.stem && <p className="mb-0">{block.stem}</p>}
                    </div>

                    <div className="text-end">
                        <div className="small text-muted">باقی‌مانده</div>
                        <div className={"fw-bold " + (remaining === 0 ? "text-success" : (remaining < 0 ? "text-danger" : ""))}>
                            {remaining}
                        </div>
                    </div>
                </div>

                <div className="progress my-3" style={{ height: 10 }}>
                    <div
                        className="progress-bar"
                        role="progressbar"
                        style={{ width: `${Math.min(100, Math.max(0, (currentSum / total) * 100))}%` }}
                        aria-valuenow={currentSum}
                        aria-valuemin={0}
                        aria-valuemax={total}
                    />
                </div>

                {(block.items || []).map((item) => {
                    const checked = !!selected[item.id];
                    const value = Number(scores[item.id]) || 0;

                    return (
                        <div
                            key={item.id}
                            className="d-flex align-items-start justify-content-between gap-2 border-top py-2"
                        >
                            <div className="form-check" style={{ flex: 1 }}>
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={item.id}
                                    checked={checked}
                                    onChange={(e) =>
                                        setSelected(item.id, e.target.checked)
                                    }
                                />
                                <label className="form-check-label" htmlFor={item.id}>
                                    {item.text}
                                </label>
                            </div>

                            <div className="d-flex align-items-center gap-2">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={!checked || value <= min}
                                    onClick={() => dec(item.id)}
                                >
                                    −
                                </button>

                                <div
                                    className="text-center"
                                    style={{ width: 36, userSelect: "none" }}
                                >
                                    {value}
                                </div>

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm"
                                    disabled={!checked || remaining <= 0 || value >= max}
                                    onClick={() => inc(item.id)}
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}

                {showValidation && !isValid && (
                    <div className="alert alert-warning mt-3 mb-0">
                        {rules?.requireSelection &&
                            !Object.values(selected).some((v) => v === true)
                            ? "لطفاً حداقل یک گزینه را انتخاب کنید و ۱۰ امتیاز را بین گزینه‌های انتخاب‌شده تقسیم کنید."
                            : "مجموع امتیازها باید دقیقاً ۱۰ باشد."}
                    </div>
                )}
            </div>
        </div>
    );
}