import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear ghost session and redirect to login
      sessionStorage.removeItem("authUser");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
