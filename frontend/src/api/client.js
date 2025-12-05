import axios from "axios";
// Base URL strategy:
// In local dev (npm run dev): set VITE_API_URL to http://localhost:8000/api
// In container (nginx proxy): VITE_API_URL="/api" and endpoints omit leading /api to avoid double prefix.
const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
export const apiClient = axios.create({
    baseURL,
    timeout: 8000
});
export const importCsv = async (file, provider, sync = false) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("provider", provider);
    formData.append("sync", sync.toString());
    const response = await apiClient.post("/databases/import-csv", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
    return response.data;
};
export const fetchPricing = async (excludeStopped = false) => {
    const params = new URLSearchParams();
    if (excludeStopped) {
        params.append("exclude_stopped", "true");
    }
    const response = await apiClient.get(`/pricing?${params.toString()}`);
    return response.data;
};
