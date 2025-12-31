import React from "react";
import {
    TELEGRAM_BOT_DEEPLINK_APP,
    TELEGRAM_BOT_DEEPLINK_WEB,
} from "../config/app";

export default function TelegramBotCta({
    buttonText = "باز کردن ربات تلگرام منتالتو",
    className = "",
}) {
    return (
        <div className={className}>
            <a
                href={TELEGRAM_BOT_DEEPLINK_APP}
                className="btn btn-outline-primary w-100 w-sm-auto"
                target="_blank"
                rel="noreferrer"
            >
                {buttonText}
            </a>
            <a
                href={TELEGRAM_BOT_DEEPLINK_WEB}
                className="d-block mt-2 small text-muted"
                target="_blank"
                rel="noreferrer"
            >
                اگر دکمه بالا کار نکرد، این لینک را باز کنید.
            </a>
        </div>
    );
}
