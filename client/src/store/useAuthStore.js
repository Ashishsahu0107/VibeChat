import { create } from 'zustand';

const useAuthStore = create((set) => ({
  authUser: JSON.parse(sessionStorage.getItem('authUser')) || null,

  setAuthUser: (user) => {
    if (user) {
      sessionStorage.setItem('authUser', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('authUser');
    }
    set({ authUser: user });
  },

  logout: async () => {
    try {
      sessionStorage.removeItem('authUser');
      set({ authUser: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  updateProfile: async (data) => {
    try {
      const api = (await import("../config/api")).default;
      const res = await api.put("/users/profile", data);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true };
    } catch (error) {
      console.error("Update profile failed:", error);
      return { success: false, error: error.response?.data?.error || "Error updating profile" };
    }
  },

  updateProfileImage: async (formData) => {
    try {
      const api = (await import("../config/api")).default;
      const res = await api.post("/users/profile/image", formData);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true };
    } catch (error) {
      console.error("Upload image failed:", error);
      return { success: false, error: error.response?.data?.error || "Error uploading image" };
    }
  }
}));

export default useAuthStore;
