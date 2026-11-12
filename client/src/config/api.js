import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 30000,
});

// Request Interceptor: Attach JWT Bearer Token if present in storage
api.interceptors.request.use(
  (config) => {
    let token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      try {
        const stored = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
        if (stored) {
          const parsed = JSON.parse(stored);
          token = parsed?.token;
        }
      } catch (_) {}
    }
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Handle 401s without disrupting login/register or public views
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthAction =
        url.includes("/auth/login") ||
        url.includes("/auth/register") ||
        url.includes("/auth/forgot-password") ||
        url.includes("/auth/reset-password");

      // Don't auto-redirect if this is a login/register submission error (show error toast instead)
      if (!isAuthAction) {
        localStorage.removeItem("authUser");
        localStorage.removeItem("token");
        sessionStorage.removeItem("authUser");
        sessionStorage.removeItem("token");

        // Only redirect to /login if currently on a protected private route
        const protectedRoutes = ["/chat", "/settings", "/profile", "/status", "/media-viewer", "/message"];
        const currentPath = window.location.pathname;
        if (protectedRoutes.some((route) => currentPath.startsWith(route))) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
