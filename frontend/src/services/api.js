import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const msg = err.response?.data?.error || err.message || "Request failed";
    return Promise.reject(new Error(msg));
  }
);

export const healthCheck = () => api.get("/health").then((r) => r.data);
export const predictLoan = (data) => api.post("/predict", data).then((r) => r.data);
export const getModelInfo = () => api.get("/model-info").then((r) => r.data);
export const getFeatureImportance = () => api.get("/feature-importance").then((r) => r.data);

export default api;
