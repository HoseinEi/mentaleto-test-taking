import api from "./api";

/**
 * GET /webhook/test-definition?testId&token
 *
 * Success (200):
 * { success: true, data: { definition, prefill } }
 *
 * Errors (by status code):
 * 401 invalid, 409 used, 410 expired, 404 not_found
 */
export async function fetchTestDefinition({ testId, token }) {
    if (!testId || !token) return { state: "error" };

    try {
        const res = await api.get(
            `/webhook/test-definition?testId=${encodeURIComponent(
                testId
            )}&token=${encodeURIComponent(token)}`
        );

        const definition = res?.data?.data?.definition;
        const prefill = res?.data?.data?.prefill;

        if (!definition) return { state: "error" };

        return { state: "ok", definition, prefill: prefill || {} };
    } catch (err) {
        if (!err.response) return { state: "error" };

        const status = err.response.status;
        if (status === 401) return { state: "invalid" };
        if (status === 409) return { state: "used" };
        if (status === 410) return { state: "expired" };
        if (status === 404) return { state: "not-found" };

        return { state: "error" };
    }
}