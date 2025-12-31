import api from "./api";

export async function validateToken(token) {
    if (!token) {
        return { state: "no-token" };
    }

    try {
        // const res = await api.get(`/webhook-test/validate-test-token?token=${encodeURIComponent(token)}`);
        const res = await api.get(`/webhook/validate-test-token?token=${encodeURIComponent(token)}`);

        // when valid we expect the backend to return success + data in res.data.data per our contract
        return { state: "valid", data: res.data.data };
    } catch (err) {
        if (!err.response) {
            return { state: "error" };
        }
        const status = err.response.status;
        if (status === 401) return { state: "invalid" };
        if (status === 409) return { state: "used" };
        if (status === 410) return { state: "expired" };
        // fallback
        return { state: "error" };
    }
}
