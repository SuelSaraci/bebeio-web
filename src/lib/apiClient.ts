import axios, { type AxiosRequestHeaders } from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

async function getIdToken(forceRefresh = false): Promise<string | null> {
  const { auth } = await import("./firebase");
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken(forceRefresh);
}

axiosInstance.interceptors.request.use(async (config) => {
  const token = await getIdToken(false);
  if (token) {
    if (!config.headers) config.headers = {} as AxiosRequestHeaders;
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _retry?: boolean })
      | undefined;
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      const token = await getIdToken(true);
      if (token) {
        if (!originalRequest.headers) {
          originalRequest.headers = {} as AxiosRequestHeaders;
        }
        (originalRequest.headers as Record<string, string>).Authorization =
          `Bearer ${token}`;
        return axiosInstance(originalRequest);
      }
    }
    return Promise.reject(error);
  },
);
