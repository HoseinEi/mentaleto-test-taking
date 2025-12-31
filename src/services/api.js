import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "https://n8n.mentaleto.ir",
    timeout: 15000,
});

export default api;