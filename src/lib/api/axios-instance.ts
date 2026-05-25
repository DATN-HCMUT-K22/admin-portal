import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { useAdminStore } from "@/stores/admin-store";

const baseURL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").replace(/\/+$/, "");

export const axiosInstance = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: Gắn Authorization header tự động
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const isAuthRequest = config.url?.includes("/auth/login") || config.url?.includes("/auth/register");
    const token = useAdminStore.getState().bearerToken;
    if (token && !config.headers.Authorization && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Xử lý Refresh Token khi gặp lỗi 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    // Chỉ retry nếu là lỗi 401 và chưa retry lần nào
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const { bearerToken, refreshToken, setSession, logout } = useAdminStore.getState();

      if (!refreshToken) {
        logout();
        return Promise.reject(error);
      }

      try {
        // Gọi API refresh (dùng axios gốc để tránh interceptor loop)
        const res = await axios.post(`${baseURL}/api/v1/auth/refresh`, {
          token: refreshToken,
        });

        // Backend response format: { code: 1000, data: { access_token, refresh_token, ... } }
        const loginData = res.data.data;
        const newAccessToken = loginData.access_token;
        const newRefreshToken = loginData.refresh_token;

        setSession({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken ?? refreshToken,
        });

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        logout();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
