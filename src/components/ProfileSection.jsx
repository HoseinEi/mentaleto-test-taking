import React from "react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

/**
 * Renders the "profile" section from the remote test definition.
 *
 * Value contract:
 * - profile: plain object { firstName, lastName, sex, job, education, birthDateJalali }
 * - birthDateJalali is stored as string "YYYY/MM/DD"
 */
export default function ProfileSection({ section, value, onChange, prefill = {} }) {
    const locked = new Set(section?.lockedFields || []);

    function setField(fieldId, fieldValue) {
        onChange({ ...value, [fieldId]: fieldValue });
    }

    function renderField(field) {
        const fieldId = field.id;
        const v =
            value?.[fieldId] ??
            (prefill && Object.prototype.hasOwnProperty.call(prefill, fieldId)
                ? prefill[fieldId]
                : "");

        const isLocked = locked.has(fieldId);

        if (field.type === "select") {
            return (
                <select
                    className="form-select"
                    value={v}
                    disabled={isLocked}
                    onChange={(e) => setField(fieldId, e.target.value)}
                >
                    <option value="">انتخاب کنید</option>
                    {(field.options || []).map((opt) => (
                        <option key={opt.id} value={opt.id}>
                            {opt.text}
                        </option>
                    ))}
                </select>
            );
        }

        if (field.type === "jalali-date") {
            return (
                <DatePicker
                    value={v || ""}
                    onChange={(dateObj) => {
                        if (!dateObj) {
                            setField(fieldId, "");
                            return;
                        }
                        // DatePicker returns DateObject after selecting
                        const formatted =
                            typeof dateObj?.format === "function"
                                ? dateObj.format("YYYY/MM/DD")
                                : String(dateObj);
                        setField(fieldId, formatted);
                    }}
                    format="YYYY/MM/DD"
                    calendar={persian}
                    locale={persian_fa}
                    calendarPosition="bottom-right"
                    inputClass="form-control"
                    placeholder="مثلاً ۱۳۷۸/۰۵/۱۲"
                    style={{ width: "100%" }}
                />
            );
        }

        return (
            <input
                className="form-control"
                type="text"
                value={v}
                disabled={isLocked}
                onChange={(e) => setField(fieldId, e.target.value)}
            />
        );
    }

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="h5 mb-2">{section.title}</h2>
                {section.description && (
                    <p className="text-muted small mb-3">{section.description}</p>
                )}

                <div className="row g-3">
                    {(section.fields || []).map((field) => (
                        <div key={field.id} className="col-12 col-md-6">
                            <label className="form-label">
                                {field.label}
                                {field.required && (
                                    <span className="text-danger"> *</span>
                                )}
                            </label>
                            {renderField(field)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}