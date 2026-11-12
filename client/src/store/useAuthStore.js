import { create } from "zustand";
import api from "../config/api";

const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(sessionStorage.getItem("authUser")) || null,
  isCheckingAuth: false,
  isLoggingIn: false,
  isRegistering: false,

  setAuthUser: (user) => {
    if (user) {
      sessionStorage.setItem("authUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("authUser");
    }
    set({ authUser: user });
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true });
    try {
      const res = await api.get("/auth/check");
      set({ authUser: res.data, isCheckingAuth: false });
      sessionStorage.setItem("authUser", JSON.stringify(res.data));
      return res.data;
    } catch (_) {
      set({ authUser: null, isCheckingAuth: false });
      sessionStorage.removeItem("authUser");
      return null;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (_) {}
    sessionStorage.removeItem("authUser");
    set({ authUser: null });
  },

  updateProfile: async (data) => {
    try {
      const res = await api.put("/users/profile", data);
      const updatedUser = res.data;
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
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
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
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
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
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
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
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
      sessionStorage.setItem("authUser", JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
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
