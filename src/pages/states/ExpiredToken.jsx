import TelegramBotCta from "../../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../../config/app";

export default function ExpiredToken() {
    return (
        <div className="mt-4">
            <div className="alert alert-warning">
                <h4>لینک منقضی شده</h4>
                <p className="mb-2">
                    مدت اعتبار این لینک تمام شده است.
                </p>
                <p className="mb-3">
                    لطفاً از منوی اصلی ربات تلگرام{" "}
                    <strong>{TELEGRAM_BOT_HANDLE}</strong> تست را دوباره انتخاب کنید
                    تا لینک جدید برای شما ارسال شود.
                </p>

                <TelegramBotCta className="mt-2" />

            </div>
        </div>
    );
}
