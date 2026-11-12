import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 30000, // 30s timeout
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthAction = url.includes("/auth/login") || url.includes("/auth/register");
      
      // Only clear and redirect if this was an authenticated route, not an active login/register attempt
      if (!isAuthAction) {
        sessionStorage.removeItem("authUser");
        const protectedRoutes = ["/chat", "/settings"];
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
