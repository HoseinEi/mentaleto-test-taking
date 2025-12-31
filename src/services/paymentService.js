import api from "./api";

function normalizeDiscountResponse(raw) {
    const data = raw || {};

    // Normalize finalPrice to number if present
    if (data.finalPrice != null) {
        const parsed = Number(data.finalPrice);
        if (!Number.isNaN(parsed)) {
            data.finalPrice = parsed;
        }
    }

    return data;
}

/**
 * /webhook/check-discount
 * Query params: code, testId, token
 * Success: { success: true, finalPrice: "80000" }
 * Error:   { success: false, message: string, finalPrice: "100000" }
 */
export async function checkDiscount({ code, testId, token }) {
    try {
        const res = await api.get(`/webhook/check-discount`, {
        // const res = await api.get(`/webhook-test/check-discount`, {
            params: { code, testId, token },
        });

        return normalizeDiscountResponse(res.data);
    } catch (err) {
        console.error("Failed to check discount", err);

        if (err.response && err.response.data) {
            // Normalize also when backend returns 4xx/5xx
            return normalizeDiscountResponse(err.response.data);
        }

        return {
            success: false,
            message: "خطا در بررسی کد تخفیف. لطفاً دوباره تلاش کنید.",
            finalPrice: null,
        };
    }
}

/**
 * /webhook/start-payment
 * Body: { testId, token, price }
 * Success: { success: true, url: string }
 * Error:   { success: false, message: string }
 */
export async function startPayment({ testId, token, price }) {
    try {
        const res = await api.post(`/webhook/start-payment`, {
        // const res = await api.post(`/webhook-test/start-payment`, {
            testId,
            token,
            price,
        });
        return res.data;
    } catch (err) {
        console.error("Failed to start payment", err);

        if (err.response && err.response.data) {
            return err.response.data;
        }

        return {
            success: false,
            message: "خطا در ایجاد تراکنش. لطفاً دوباره تلاش کنید.",
        };
    }
}

/**
 * /webhook/verify-payment
 * Body: { status, authority, token, testId }
 * Response: { success: boolean }
 */
export async function verifyPayment({ status, authority, token, testId }) {
    try {
        const res = await api.post(`/webhook/verify-payment`, {
        // const res = await api.post(`/webhook-test/verify-payment`, {
            status,
            authority,
            token,
            testId,
        });
        return res.data;
    } catch (err) {
        console.error("Failed to verify payment", err);

        if (err.response && err.response.data) {
            return err.response.data;
        }

        return {
            success: false,
            message: "خطا در بررسی وضعیت پرداخت. لطفاً دوباره تلاش کنید.",
        };
    }
}
