import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import tests from "../tests";
import Loading from "../components/Loading";
import { checkDiscount, startPayment } from "../services/paymentService";
import { isZarinpalSandbox } from "../config/payment";
import { formatPrice } from "../utils/format";

export default function PrePayPage() {
    const { testId } = useParams();
    const [params] = useSearchParams();
    const token = params.get("token");

    const [loading, setLoading] = useState(true);
    const [price, setPrice] = useState(null);
    const [discount, setDiscount] = useState("");
    const [finalPrice, setFinalPrice] = useState(null);

    // User-visible feedback
    const [feedback, setFeedback] = useState(null);
    const [error, setError] = useState(null);

    // Only the successfully applied code will be shown in the summary
    const [appliedCode, setAppliedCode] = useState("");

    const test = tests[testId];

    useEffect(() => {
        if (!test || !token) {
            setError("دسترسی نامعتبر است. لطفاً دوباره از طریق ربات وارد شوید.");
            setLoading(false);
            return;
        }

        setPrice(test.price);
        setFinalPrice(test.price);
        setLoading(false);
    }, [testId, test, token]);

    async function applyDiscount() {
        if (!discount.trim()) {
            return;
        }

        setLoading(true);
        setError(null);
        setFeedback(null);

        const res = await checkDiscount({ code: discount, testId, token });

        // Normalize final price coming from backend (even on error)
        if (res.finalPrice != null) {
            const value = Number(res.finalPrice);
            if (!Number.isNaN(value) && value > 0) {
                setFinalPrice(value);
            }
        }

        if (!res.success) {
            // Detect the specific backend message and replace with Persian
            const backendMsg = (res.message || "").toString().toLowerCase();
            const isInvalidCode =
                backendMsg.includes("invalid discount code") ||
                backendMsg.includes("invalid code");

            setFeedback({
                type: "danger",
                message: isInvalidCode
                    ? "کد تخفیف نامعتبر است. مبلغ پرداخت تغییری نکرده است."
                    : res.message ||
                    "خطا در بررسی کد تخفیف. لطفاً دوباره تلاش کنید.",
            });

            // Do not show the code in the summary if it is invalid
            if (isInvalidCode) {
                setAppliedCode("");
            }

            setLoading(false);
            return;
        }

        // Success path
        const value = Number(res.finalPrice);
        if (!Number.isNaN(value) && value > 0) {
            setFinalPrice(value);
        }

        setAppliedCode(discount.trim().toUpperCase());

        setFeedback({
            type: "success",
            message: "کد تخفیف با موفقیت اعمال شد.",
        });

        setLoading(false);
    }

    async function handlePay() {
        setError(null);
        setFeedback(null);

        const value = Number(finalPrice);

        if (!finalPrice || Number.isNaN(value) || value <= 0) {
            setError(
                "مبلغ پرداخت معتبر نیست. لطفاً صفحه را دوباره باز کنید یا دوباره از طریق ربات وارد شوید."
            );
            return;
        }

        setLoading(true);

        const res = await startPayment({ testId, token, price: value });

        if (!res.success || !res.url) {
            setError(
                res.message || "خطا در ایجاد تراکنش. لطفاً دوباره تلاش کنید."
            );
            setLoading(false);
            return;
        }

        window.location.href = res.url;
    }

    if (loading) return <Loading />;

    if (!test) {
        return (
            <div className="mt-4">
                <h3>تست یافت نشد</h3>
            </div>
        );
    }

    const formattedBasePrice = formatPrice(price);
    const formattedFinalPrice = formatPrice(finalPrice);

    return (
        <div className="mt-4">
            <Helmet>
                <title>پرداخت تست {test.title} — منتالتو</title>
                <meta
                    name="description"
                    content={`پرداخت آنلاین برای تست ${test.title} در منتالتو`}
                />
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>

            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
                <h2 className="mb-0">پرداخت تست {test.title}</h2>

                {isZarinpalSandbox && (
                    <span className="badge bg-warning text-dark align-self-md-center">
                        پرداخت در حالت تست انجام می‌شود و هیچ مبلغی از حساب شما
                        کسر نخواهد شد.
                    </span>
                )}
            </div>

            <div className="row mt-4">
                <div className="col-12 col-lg-7 mb-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <p className="mb-1">
                                <strong>قیمت تست:</strong>{" "}
                                {formattedBasePrice} تومان
                            </p>

                            <small className="text-muted">
                                این مبلغ قبل از اعمال هرگونه تخفیف است.
                            </small>

                            <div className="mt-4">
                                <label className="form-label">
                                    کد تخفیف (در صورت داشتن):
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={discount}
                                    onChange={(e) =>
                                        setDiscount(e.target.value)
                                    }
                                    placeholder="کد تخفیف را وارد کنید"
                                    dir="ltr"
                                />

                                <button
                                    className="btn btn-secondary mt-2 w-100"
                                    onClick={applyDiscount}
                                    disabled={loading}
                                >
                                    اعمال کد تخفیف
                                </button>
                            </div>

                            {feedback && (
                                <div
                                    className={`alert alert-${feedback.type} mt-3`}
                                    role="alert"
                                >
                                    {feedback.message}
                                </div>
                            )}

                            {error && (
                                <div className="alert alert-danger mt-3">
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn btn-success mt-4 w-100"
                                onClick={handlePay}
                                disabled={loading}
                            >
                                پرداخت و ادامه
                            </button>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-5">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-3">
                                خلاصه سفارش شما
                            </h5>

                            <ul className="list-unstyled mb-0">
                                <li className="d-flex justify-content-between">
                                    <span>نام تست</span>
                                    <span>{test.title}</span>
                                </li>

                                <li className="d-flex justify-content-between mt-2">
                                    <span>قیمت اولیه</span>
                                    <span>
                                        {formattedBasePrice} تومان
                                    </span>
                                </li>

                                {appliedCode && (
                                    <li className="d-flex justify-content-between mt-2">
                                        <span>کد تخفیف</span>
                                        <span>{appliedCode}</span>
                                    </li>
                                )}

                                <li className="d-flex justify-content-between mt-3 border-top pt-3">
                                    <span className="fw-bold">
                                        مبلغ قابل پرداخت
                                    </span>
                                    <span className="fw-bold text-success">
                                        {formattedFinalPrice} تومان
                                    </span>
                                </li>
                            </ul>

                            <p
                                className="text-muted mt-3 mb-0"
                                style={{ fontSize: "0.9rem" }}
                            >
                                با زدن دکمه پرداخت، به درگاه امن زرین‌پال منتقل
                                می‌شوید. پس از تکمیل پرداخت، نتیجه تست از طریق
                                ربات تلگرام منتالتو برای شما ارسال می‌شود.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
