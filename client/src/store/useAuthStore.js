import { create } from 'zustand';

const useAuthStore = create((set) => ({
  authUser: JSON.parse(localStorage.getItem('authUser')) || null,

  setAuthUser: (user) => {
    if (user) {
      localStorage.setItem('authUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('authUser');
    }
    set({ authUser: user });
  },

  logout: async () => {
    try {
      // Assuming you have a config/api.js
      // await api.post("/auth/logout");
      localStorage.removeItem('authUser');
      set({ authUser: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
}));

export default useAuthStore;
