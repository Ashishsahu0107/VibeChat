import { create } from "zustand";
import api from "../config/api";

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const useAuthStore = create((set, get) => ({
  authUser: getStoredUser(),
  isCheckingAuth: true,
  isLoggingIn: false,
  isRegistering: false,

  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
      sessionStorage.setItem("authUser", JSON.stringify(user));
      if (user.token) {
        localStorage.setItem("token", user.token);
        sessionStorage.setItem("token", user.token);
      }
    } else {
      localStorage.removeItem("authUser");
      localStorage.removeItem("token");
      sessionStorage.removeItem("authUser");
      sessionStorage.removeItem("token");
    }
    set({ authUser: user });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get("/auth/check");
      const user = res.data;
      if (user) {
        get().setAuthUser(user);
        set({ isCheckingAuth: false });
        return user;
      }
    } catch (err) {
      // If unauthorized, clear stored user
      if (err.response?.status === 401) {
        get().setAuthUser(null);
      }
    } finally {
      set({ isCheckingAuth: false });
    }
    return null;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    get().setAuthUser(null);
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put("/users/profile", data);
      const updatedUser = res.data;
      get().setAuthUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update profile failed:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error updating profile",
      };
    }
  },

  updateProfileImage: async (formData) => {
    try {
      const res = await api.post("/users/profile/image", formData);
      const updatedUser = res.data;
      get().setAuthUser(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Upload image failed:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Error uploading image",
      };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      await api.put("/users/change-password", { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error changing password",
      };
    }
  },

  updateSettings: async (settings) => {
    try {
      const res = await api.put("/users/profile", { settings });
      const updatedUser = res.data;
      get().setAuthUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error updating settings",
      };
    }
  },

  blockUser: async (userId) => {
    try {
      const res = await api.post(`/users/block/${userId}`);
      const updatedUser = res.data;
      get().setAuthUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error blocking user",
      };
    }
  },

  unblockUser: async (userId) => {
    try {
      const res = await api.post(`/users/unblock/${userId}`);
      const updatedUser = res.data;
      get().setAuthUser(updatedUser);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Error unblocking user",
      };
    }
  },
}));

export default useAuthStore;
