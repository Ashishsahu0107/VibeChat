import { create } from "zustand";
import api from "../config/api";
import toast from "react-hot-toast";
import useAuthStore from "./useAuthStore";

const useStatusStore = create((set, get) => ({
  statuses: [],
  myStatuses: [],
  isFetching: false,
  isCreating: false,

  fetchStatuses: async () => {
    set({ isFetching: true });
    try {
      const res = await api.get("/status");
      const authUser = useAuthStore.getState().authUser;
      
      const allStatuses = res.data;
      const myStatuses = allStatuses.filter(s => s.sender._id === authUser._id);
      const otherStatuses = allStatuses.filter(s => s.sender._id !== authUser._id);

      set({ 
        statuses: otherStatuses,
        myStatuses,
      });
    } catch (error) {
      console.error("Error fetching statuses:", error);
    } finally {
      set({ isFetching: false });
    }
  },

  createStatus: async (statusData) => {
    set({ isCreating: true });
    try {
      const res = await api.post("/status", statusData);
      set((state) => ({
        myStatuses: [...state.myStatuses, res.data]
      }));
      toast.success("Status posted!");
    } catch (error) {
      console.error("Error posting status:", error);
      toast.error(error.response?.data?.message || "Failed to post status");
      throw error;
    } finally {
      set({ isCreating: false });
    }
  },

  viewStatus: async (statusId) => {
    try {
      const res = await api.post(`/status/${statusId}/view`);
      const authUser = useAuthStore.getState().authUser;

      // Update locally
      set((state) => ({
        statuses: state.statuses.map(s => {
          if (s._id === statusId) {
            const hasViewed = s.viewers.some(v => v.user._id === authUser._id || v.user === authUser._id);
            if (!hasViewed) {
              return {
                ...s,
                viewers: [...s.viewers, { user: { _id: authUser._id, fullName: authUser.fullName, profilePic: authUser.profilePic }, viewedAt: new Date() }]
              };
            }
          }
          return s;
        })
      }));
    } catch (error) {
      console.error("Error viewing status:", error);
    }
  },

  deleteStatus: async (statusId) => {
    try {
      await api.delete(`/status/${statusId}`);
      set((state) => ({
        myStatuses: state.myStatuses.filter(s => s._id !== statusId)
      }));
      toast.success("Status deleted");
    } catch (error) {
      console.error("Error deleting status:", error);
      toast.error("Failed to delete status");
    }
  },

  handleSocketNewStatus: (newStatus) => {
    const authUser = useAuthStore.getState().authUser;
    if (newStatus.sender._id === authUser._id) return; // Ignore own, handled in create
    
    // Simplistic: just fetch all again or append
    get().fetchStatuses();
  },

  handleSocketStatusViewed: (data) => {
    const { statusId, viewer } = data;
    set((state) => ({
      myStatuses: state.myStatuses.map(s => {
        if (s._id === statusId) {
          const exists = s.viewers.some(v => v.user._id === viewer._id);
          if (!exists) {
            return {
              ...s,
              viewers: [...s.viewers, { user: viewer, viewedAt: new Date() }]
            };
          }
        }
        return s;
      })
    }));
  }
}));

export default useStatusStore;
