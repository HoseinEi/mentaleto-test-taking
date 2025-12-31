import TelegramBotCta from "../../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../../config/app";

export default function NoToken() {
    return (
        <div className="mt-4">
            <div className="alert alert-warning">
                <h4>برای شروع تست</h4>
                <p className="mb-3">
                    برای دریافت لینک اختصاصی و شروع تست، لطفاً ابتدا از طریق ربات تلگرام منتالتو{" "}
                    <strong>{TELEGRAM_BOT_HANDLE}</strong> ثبت‌نام کنید تا لینک اختصاصی تست برای شما ارسال شود.
                </p>

                <TelegramBotCta className="mt-3" />
                
            </div>
        </div>
    );
}
