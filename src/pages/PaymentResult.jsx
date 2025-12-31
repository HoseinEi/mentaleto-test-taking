import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import Loading from "../components/Loading";
import { verifyPayment } from "../services/paymentService";
import { isZarinpalSandbox } from "../config/payment";

import TelegramBotCta from "../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../config/app";

export default function PaymentResult() {
    const [params] = useSearchParams();
    const [state, setState] = useState("loading");
    const [errorMessage, setErrorMessage] = useState("");

    const status = params.get("Status"); // from Zarinpal
    const authority = params.get("Authority"); // from Zarinpal
    const token = params.get("token"); // from our callbackUrl
    const testId = params.get("testId"); // from our callbackUrl

    useEffect(() => {
        // Basic validation of query params
        if (!status || !authority || !token || !testId) {
            setState("invalid");
            return;
        }

        async function run() {
            try {
                const res = await verifyPayment({ status, authority, token, testId });

                if (res && res.success) {
                    setState("success");
                } else {
                    if (status !== "OK") {
                        // User canceled or payment not completed in gateway
                        setState("canceled");
                    } else {
                        // Gateway says OK but backend verification failed
                        setState("failed");
                        if (res && res.message) {
                            setErrorMessage(res.message);
                        }
                    }
                }
            } catch (err) {
                console.error("Payment verification error:", err);
                setState("error");
            }
        }

        run();
    }, [status, authority, token, testId]);

    if (state === "loading") {
        return <Loading />;
    }

    const title = (() => {
        switch (state) {
            case "success":
                return "نتیجه پرداخت موفق — منتالتو";
            case "canceled":
                return "پرداخت لغو شد — منتالتو";
            case "failed":
            case "error":
                return "خطا در پرداخت — منتالتو";
            case "invalid":
                return "لینک نامعتبر — منتالتو";
            default:
                return "نتیجه پرداخت — منتالتو";
        }
    })();

    return (
        <div className="my-4">
            <Helmet>
                <title>{title}</title>
                <meta
                    name="description"
                    content="نتیجه پرداخت تست‌های روان‌شناختی منتالتو"
                />
                {/* Result pages are not useful for SEO */}
                <meta name="robots" content="noindex,nofollow" />
            </Helmet>

            <div className="row justify-content-center">
                <div className="col-12 col-md-10 col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body text-center">
                            {/* Sandbox badge */}
                            {isZarinpalSandbox && (
                                <div className="alert alert-info py-2 mb-3">
                                    <strong>حالت تست پرداخت فعال است.</strong>{" "}
                                    این تراکنش فقط برای آزمایش است و هیچ مبلغ واقعی از حساب
                                    شما کسر نمی‌شود.
                                </div>
                            )}

                            {state === "success" && (
                                <>
                                    <h3 className="text-success mb-3">پرداخت موفق</h3>
                                    <p className="mb-2">
                                        پرداخت شما با موفقیت انجام شد.
                                    </p>
                                    <p className="mb-0">
                                        نتیجه تست به‌صورت فایل PDF از طریق{" "}
                                        <strong className="text-primary">
                                            ربات تلگرام منتالتو ({TELEGRAM_BOT_HANDLE})
                                        </strong>{" "}
                                        برای شما ارسال می‌شود. چند لحظه دیگر تلگرام خود را
                                        بررسی کنید.
                                    </p>
                                </>
                            )}

                            {state === "canceled" && (
                                <>
                                    <h3 className="text-warning mb-3">پرداخت لغو شد</h3>
                                    <p className="mb-2">
                                        پرداخت در درگاه بانکی تکمیل نشد یا توسط شما لغو شد.
                                    </p>
                                    <p className="mb-0">
                                        اگر هنوز مایل به انجام تست هستید، به{" "}
                                        <strong>{TELEGRAM_BOT_HANDLE}</strong> برگردید و از
                                        طریق منوی اصلی دوباره پرداخت را انجام دهید.
                                    </p>
                                </>
                            )}

                            {state === "failed" && (
                                <>
                                    <h3 className="text-danger mb-3">خطا در تأیید پرداخت</h3>
                                    <p className="mb-2">
                                        پرداخت در درگاه انجام شده، اما تأیید نهایی آن با خطا
                                        مواجه شد.
                                    </p>
                                    <p className="mb-2">
                                        در صورت برداشت وجه، معمولاً مبلغ طی چند ساعت تا
                                        حداکثر ۷۲ ساعت کاری به‌صورت خودکار توسط بانک برگردانده
                                        می‌شود.
                                    </p>
                                    {errorMessage && (
                                        <p className="text-muted small mb-2">
                                            توضیحات سیستم: {errorMessage}
                                        </p>
                                    )}
                                    <p className="mb-0">
                                        در صورت نیاز می‌توانید با ارسال پیام به{" "}
                                        <strong>{TELEGRAM_BOT_HANDLE}</strong> وضعیت را
                                        پیگیری کنید.
                                    </p>
                                </>
                            )}

                            {state === "invalid" && (
                                <>
                                    <h3 className="text-danger mb-3">لینک نامعتبر</h3>
                                    <p className="mb-2">
                                        اطلاعات این صفحه کامل نیست یا لینک شما معتبر نیست.
                                    </p>
                                    <p className="mb-0">
                                        لطفاً فقط از طریق پیام‌هایی که از{" "}
                                        <strong>{TELEGRAM_BOT_HANDLE}</strong> دریافت
                                        می‌کنید وارد صفحه پرداخت شوید. اگر مشکل ادامه داشت،
                                        از طریق همان ربات با ما در ارتباط باشید.
                                    </p>
                                </>
                            )}

                            {state === "error" && (
                                <>
                                    <h3 className="text-danger mb-3">خطای غیرمنتظره</h3>
                                    <p className="mb-2">
                                        در پردازش نتیجه پرداخت خطایی رخ داد.
                                    </p>
                                    <p className="mb-0">
                                        لطفاً بعداً دوباره تلاش کنید یا از طریق{" "}
                                        <strong>{TELEGRAM_BOT_HANDLE}</strong> مشکل را
                                        گزارش کنید.
                                    </p>
                                </>
                            )}

                            {/* Telegram CTA (shown for all non-loading states) */}
                            <TelegramBotCta className="mt-4" />

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
