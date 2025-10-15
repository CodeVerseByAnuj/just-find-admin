import axios from "axios";
import { handleApiError } from "@/utils/errors/handleApiError";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001",
  timeout: 10000,
  withCredentials: true,
});

// Extend axios config so TS knows about our custom flag
declare module "axios" {
  export interface AxiosRequestConfig {
    skipErrorToast?: boolean;
  }
}

// Request Interceptor: add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: global errors, unless silenced
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const skipToast = error?.config?.skipErrorToast;
    if (!skipToast) {
      handleApiError(error); // only scream if not silenced
    }
    return Promise.reject(error);
  }
);

export default api;
