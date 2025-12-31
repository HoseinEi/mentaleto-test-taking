import api from "./api";

export async function getPublicTestInfo(testName) {
    try {
        const res = await api.get(`/webhook/get-public-test-info?test=${testName}`);
        return res.data;
    } catch (err) {
        console.error("Failed to fetch test info", err);
        throw err;
    }
}

export async function startTestSession(token) {
    try {
        const res = await api.post(`/webhook/start-test`, { token });
        return res.data;
    } catch (err) {
        console.error("Failed to start test session", err);
        throw err;
    }
}
