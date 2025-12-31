import React from "react";

import { formatPrice } from "../utils/format";
import TelegramBotCta from "./TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../config/app";

export default function PublicTestInfo({ test }) {
    if (!test) {
        return (
            <div className="alert alert-danger mt-4">
                اطلاعات این تست در دسترس نیست.
            </div>
        );
    }

    return (
        <div className="mt-4">
            <h2 className="h4 mb-2">اطلاعات تست {test.title}</h2>
            {test.description && (
                <p className="text-muted mb-3" style={{ whiteSpace: "pre-line" }}>
                    {test.description}
                </p>
            )}
            <div className="alert alert-info mb-0">
                <strong>هزینه تست:</strong> {formatPrice(test.price)} تومان
            </div>

            {/* Telegram CTA is commented out for now; you can re-enable later
            <p className="mt-4">
                برای شرکت در این تست، لطفاً از طریق ربات تلگرام منتالتو{" "}
                <strong>{TELEGRAM_BOT_HANDLE}</strong> ثبت‌نام کنید تا لینک شرکت
                در تست برای شما ارسال شود.
            </p>

            <TelegramBotCta className="mt-3" />
            */}
        </div>
    );
}
