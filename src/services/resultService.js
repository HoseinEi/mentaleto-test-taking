import api from "./api";

/**
 * /webhook/submit-answers
 * Body: { token, answers, ... }
 * Success: { success: true, message: "Answers saved" }
 * Error:   { success: false, message: string }
 */
export async function submitAnswers(payload) {
    try {
        const res = await api.post(`/webhook/submit-answers`, payload);
        // const res = await api.post(`/webhook-test/submit-answers`, payload);
        return res.data;
    } catch (err) {
        console.error("Failed to submit answers", err);

        if (err.response && err.response.data) {
            return err.response.data;
        }

        return {
            success: false,
            error: "network_error",
            message: "مشکلی در ارتباط با سرور پیش آمد. لطفاً دوباره تلاش کنید.",
        };
    }
}

// Currently unused, and n8n doesn't implement this yet.
// Kept for future FastAPI / real backend integration.
export async function getReport(sessionId) {
    try {
        const res = await api.get(`/webhook/get-report?session=${sessionId}`);
        return res.data;
    } catch (err) {
        console.error("Failed to get report", err);
        throw err;
    }
}
