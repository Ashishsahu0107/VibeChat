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
      // Assuming you have a config/api.js
      // await api.post("/auth/logout");
      sessionStorage.removeItem('authUser');
      set({ authUser: null });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
}));

export default useAuthStore;
