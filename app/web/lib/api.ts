import axios from "axios";
import { getSession } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Attach JWT token from NextAuth session
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Typed API calls ───────────────────────────────────────────

export const predictSingle = (data: Record<string, number>) =>
  api.post("/predict", data).then((r) => r.data);

export const predictBatch = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/predict/batch", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120000, // 2 min for large files
  }).then((r) => r.data);
};

export const getBatchJob = (jobId: number) =>
  api.get(`/predict/batch/${jobId}`).then((r) => r.data);

export const getHistory = (params?: { page?: number; method?: string; risk_level?: string }) =>
  api.get("/history/predictions", { params }).then((r) => r.data);

export const deleteHistory = (id: number) =>
  api.delete(`/history/predictions/${id}`).then((r) => r.data);

export const getBatchHistory = (params?: { page?: number }) =>
  api.get("/history/batches", { params }).then((r) => r.data);

export const getDashboardSummary = () =>
  api.get("/analytics/summary").then((r) => r.data);

export const getBatchAnalytics = (jobId: number) =>
  api.get(`/analytics/batch/${jobId}`).then((r) => r.data);

export const explainShap = (data: Record<string, number>) =>
  api.post("/explain/shap", data).then((r) => r.data);

export const getGlobalImportance = () =>
  api.get("/explain/global").then((r) => r.data);

// ── Authenticated file downloads ────────────────────────────────
// These export routes require a Bearer token, which a plain <a href>
// link can never send (browsers don't attach custom headers to normal
// navigation). So we fetch as a blob through the authed `api` instance
// instead, then trigger the save client-side.
function triggerBlobDownload(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export const downloadSinglePdf = async (predictionId: number) => {
  const res = await api.get(`/export/report/${predictionId}/pdf`, { responseType: "blob" });
  triggerBlobDownload(res.data, `diabetes_risk_report_${predictionId}.pdf`);
};

export const downloadBatchCsv = async (
  jobId: number,
  filter: "high" | "moderate" | "low" | "all"
) => {
  const res = await api.get(`/export/batch/${jobId}/${filter}`, { responseType: "blob" });
  triggerBlobDownload(res.data, `diabetes_risk_${filter}_${jobId}.csv`);
};

export const downloadBatchPdf = async (jobId: number) => {
  const res = await api.get(`/export/batch/${jobId}/summary/pdf`, { responseType: "blob" });
  triggerBlobDownload(res.data, `batch_summary_${jobId}.pdf`);
};

export const emailPrediction = (predictionId: number, email: string) =>
  api.post(`/export/report/${predictionId}/email`, { email }).then((r) => r.data);

export const healthCheck = () =>
  api.get("/health").then((r) => r.data);
