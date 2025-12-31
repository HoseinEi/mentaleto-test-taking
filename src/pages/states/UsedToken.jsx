import TelegramBotCta from "../../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../../config/app";

export default function UsedToken() {
    return (
        <div className="mt-4">
            <div className="alert alert-info">
                <h4>لینک قبلاً استفاده شده</h4>
                <p className="mb-3">
                    این لینک قبلاً برای شرکت در تست استفاده شده است.
                    برای شرکت مجدد، لطفاً از منوی اصلی ربات تلگرام{" "}
                    <strong>{TELEGRAM_BOT_HANDLE}</strong> تست را دوباره انتخاب کنید
                    تا لینک جدیدی برای شما ارسال شود.
                </p>

                <TelegramBotCta className="mt-3" />
                
            </div>
        </div>
    );
}
