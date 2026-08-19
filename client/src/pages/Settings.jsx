import React, { useState, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import { FiCamera, FiSave, FiUser, FiPhone, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Settings = () => {
  const { authUser, updateProfile, updateProfileImage } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: authUser.fullName,
    phone: authUser.phone || "",
    password: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      return toast.error("Please select an image file");
    }

    const data = new FormData();
    data.append("image", file);

    setIsUploading(true);
    const res = await updateProfileImage(data);
    if (res.success) {
      toast.success("Profile image updated!");
    } else {
      toast.error(res.error);
    }
    setIsUploading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile(formData);
    if (res.success) {
      toast.success("Profile updated successfully!");
      setFormData(prev => ({ ...prev, password: "" }));
    } else {
      toast.error(res.error);
    }
    setIsUpdating(false);
  };

  return (
    <div className="container mx-auto max-w-4xl pt-24 px-4 pb-10 h-screen overflow-y-auto">
      <h1 className="text-3xl font-bold mb-8 text-center text-primary">Account Settings</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        
        {/* Profile Image Section */}
        <div className="md:col-span-1 flex flex-col items-center bg-base-200 p-6 rounded-3xl shadow-sm border border-base-300">
          <div className="relative mb-6">
            <div className="avatar">
              <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={authUser.profilePic || authUser.image || `https://ui-avatars.com/api/?name=${authUser.fullName}`} alt="Profile" />
              </div>
            </div>
            <button 
              onClick={() => fileInputRef.current.click()}
              disabled={isUploading}
              className="absolute bottom-0 right-0 btn btn-circle btn-primary btn-sm"
            >
              {isUploading ? <span className="loading loading-spinner loading-xs"></span> : <FiCamera size={16} />}
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <h2 className="text-xl font-bold">{authUser.fullName}</h2>
          <p className="text-base-content/60 text-sm">{authUser.email}</p>
        </div>

        {/* Update Form Section */}
        <div className="md:col-span-2 bg-base-200 p-8 rounded-3xl shadow-sm border border-base-300">
          <h3 className="text-2xl font-semibold mb-6">Personal Information</h3>
          
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FiUser className="text-primary"/> Full Name
                </span>
              </label>
              <input 
                type="text" 
                className="input input-bordered w-full bg-base-100" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FiPhone className="text-primary"/> Phone Number
                </span>
              </label>
              <input 
                type="tel" 
                className="input input-bordered w-full bg-base-100" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="Enter phone number"
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <FiLock className="text-primary"/> New Password (Optional)
                </span>
              </label>
              <input 
                type="password" 
                className="input input-bordered w-full bg-base-100" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Leave blank to keep current password"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full mt-4 rounded-xl flex items-center gap-2"
              disabled={isUpdating}
            >
              {isUpdating ? <span className="loading loading-spinner"></span> : <><FiSave size={18} /> Save Changes</>}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
