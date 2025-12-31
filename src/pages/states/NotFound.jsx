import React from "react";
import { Link } from "react-router-dom";

import TelegramBotCta from "../../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../../config/app";

export default function NotFound() {
    return (
        <div className="mt-5">
            <div className="text-center">
                <h1 className="display-6">صفحه پیدا نشد</h1>
                <p className="lead mt-3">
                    صفحه‌ای که دنبال می‌کنید وجود ندارد یا ممکن است آدرس آن اشتباه باشد.
                </p>

                <div className="mt-4">
                    <Link to="/" className="btn btn-primary me-2">
                        بازگشت به صفحه اصلی
                    </Link>
                    
                    <TelegramBotCta className="mt-3" />

                </div>

                <p className="text-muted mt-4 small">
                    اگر فکر می‌کنید این خطا اشتباه است، می‌توانید به پشتیبانی منتالتو
                    در تلگرام ({TELEGRAM_BOT_HANDLE}) پیام دهید.
                </p>
            </div>
        </div>
    );
}
