import TelegramBotCta from "../../components/TelegramBotCta";
import { TELEGRAM_BOT_HANDLE } from "../../config/app";

export default function InvalidToken() {
    return (
        <div className="mt-4">
            <div className="alert alert-danger">
                <h4>لینک نامعتبر</h4>
                <p className="mb-2">
                    این لینک معتبر نیست یا اطلاعات آن ناقص است.
                </p>
                <p className="mb-3">
                    لطفاً فقط از لینکی استفاده کنید که مستقیماً از ربات تلگرام{" "}
                    <strong>{TELEGRAM_BOT_HANDLE}</strong> دریافت کرده‌اید استفاده کنید.
                    در صورت بروز مشکل، می‌توانید از طریق همان ربات با ما در تماس باشید.
                </p>

                <TelegramBotCta className="mt-2" />
                
            </div>
        </div>
    );
}
