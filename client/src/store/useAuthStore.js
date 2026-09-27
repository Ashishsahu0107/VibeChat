import { create } from 'zustand';

const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(sessionStorage.getItem('authUser')) || null,
  isCheckingAuth: false,

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
      const api = (await import('../config/api')).default;
      await api.post('/auth/logout');
    } catch (_) {}
    sessionStorage.removeItem('authUser');
    set({ authUser: null });
  },

  updateProfile: async (data) => {
    try {
      const api = (await import('../config/api')).default;
      const res = await api.put('/users/profile', data);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Update profile failed:', error);
      return { success: false, error: error.response?.data?.error || 'Error updating profile' };
    }
  },

  updateProfileImage: async (formData) => {
    try {
      const api = (await import('../config/api')).default;
      const res = await api.post('/users/profile/image', formData);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Upload image failed:', error);
      return { success: false, error: error.response?.data?.error || 'Error uploading image' };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const api = (await import('../config/api')).default;
      await api.put('/users/change-password', { currentPassword, newPassword });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error changing password' };
    }
  },

  updateSettings: async (settings) => {
    try {
      const api = (await import('../config/api')).default;
      const res = await api.put('/users/profile', { settings });
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error updating settings' };
    }
  },

  blockUser: async (userId) => {
    try {
      const api = (await import('../config/api')).default;
      const res = await api.post(`/users/block/${userId}`);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error blocking user' };
    }
  },

  unblockUser: async (userId) => {
    try {
      const api = (await import('../config/api')).default;
      const res = await api.post(`/users/unblock/${userId}`);
      const updatedUser = res.data;
      sessionStorage.setItem('authUser', JSON.stringify(updatedUser));
      set({ authUser: updatedUser });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error unblocking user' };
    }
  },
}));

export default useAuthStore;
