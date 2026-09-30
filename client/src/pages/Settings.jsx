import React, { useState, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import {
  FiCamera, FiSave, FiUser, FiPhone, FiLock, FiInfo, FiBell,
  FiEye, FiMoon, FiSun, FiMonitor, FiChevronRight, FiLogOut, FiArrowLeft,
} from 'react-icons/fi';
import { BsShieldCheck } from 'react-icons/bs';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import ImageCropper from '../components/ImageCropper';
import LogoutModal from '../components/LogoutModal';

const THEMES = [
  "light", "dark", "black", "claude", "corporate", "ghibli", "gourmet",
  "luxury", "mintlify", "pastel", "perplexity", "shadcn", "slack",
  "soft", "spotify", "valorant", "vscode",
];

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xs font-semibold text-base-content/50 uppercase tracking-wider mb-2 px-1">{title}</h3>
    <div className="bg-base-200/50 rounded-2xl overflow-hidden border border-base-300">{children}</div>
  </div>
);

const SettingRow = ({ icon, label, value, onClick, children, divider = true }) => (
  <div>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-base-200 transition-colors text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="text-primary text-lg shrink-0">{icon}</span>
      <span className="flex-1 font-medium text-sm">{label}</span>
      {value !== undefined && (
        <span className="text-sm text-base-content/50">{value}</span>
      )}
      {onClick && <FiChevronRight size={14} className="text-base-content/30 shrink-0" />}
      {children}
    </button>
    {divider && <div className="ml-12 border-b border-base-300/50" />}
  </div>
);

const Settings = () => {
  const { authUser, updateProfile, updateProfileImage, changePassword, updateSettings, logout } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || '',
    phone: authUser?.phone || '',
    about: authUser?.about || '',
  });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('main'); // main | profile | password | notifications | privacy | theme
  const [selectedTheme, setSelectedTheme] = useState(
    authUser?.settings?.theme || localStorage.getItem('theme') || 'light'
  );
  const fileInputRef = useRef(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please select an image');
    if (file.size > 5 * 1024 * 1024) return toast.error('Image size must be 5 MB or less');
    
    const reader = new FileReader();
    reader.addEventListener('load', () => setCropImageSrc(reader.result));
    reader.readAsDataURL(file);
    e.target.value = ''; // reset
  };

  const handleCropComplete = async (croppedFile) => {
    setCropImageSrc(null);
    if (!croppedFile) return;
    const data = new FormData();
    data.append('image', croppedFile);
    setIsUploading(true);
    const res = await updateProfileImage(data);
    if (res.success) toast.success('Profile photo updated!');
    else toast.error(res.error);
    setIsUploading(false);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile(formData);
    if (res.success) toast.success('Profile updated!');
    else toast.error(res.error);
    setIsUpdating(false);
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (!passwords.current) return toast.error('Enter current password');
    if (passwords.new.length < 6) return toast.error('New password must be at least 6 characters');
    if (passwords.new !== passwords.confirm) return toast.error('Passwords do not match');
    setIsUpdating(true);
    const res = await changePassword(passwords.current, passwords.new);
    if (res.success) {
      toast.success('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
      setActiveSection('main');
    } else {
      toast.error(res.error);
    }
    setIsUpdating(false);
  };

  const handleThemeChange = async (theme) => {
    setSelectedTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    await updateSettings({ theme });
  };

  const handleToggleSetting = async (key) => {
    const current = authUser?.settings?.[key];
    await updateSettings({ [key]: !current });
    toast.success('Setting updated');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // ── Sub-screens ────────────────────────────────────────────────────────
  if (activeSection === 'profile') {
    return (
      <div className="h-screen overflow-y-auto bg-base-100">
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-base-200 rounded-full"><FiArrowLeft size={20} /></button>
          <h2 className="font-semibold">Edit Profile</h2>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Full Name</span></label>
              <input type="text" className="input input-bordered" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Phone Number</span></label>
              <input type="tel" className="input input-bordered" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">About</span></label>
              <textarea className="textarea textarea-bordered" value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} rows={3} placeholder="Tell people about yourself" maxLength={150} />
              <label className="label"><span className="label-text-alt text-right text-base-content/50">{formData.about.length}/150</span></label>
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isUpdating}>
              {isUpdating ? <span className="loading loading-spinner loading-sm" /> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (activeSection === 'password') {
    return (
      <div className="h-screen overflow-y-auto bg-base-100">
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-base-200 rounded-full"><FiArrowLeft size={20} /></button>
          <h2 className="font-semibold">Change Password</h2>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Current Password</span></label>
              <input type="password" className="input input-bordered" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">New Password</span></label>
              <input type="password" className="input input-bordered" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} minLength={6} required />
            </div>
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Confirm New Password</span></label>
              <input type="password" className="input input-bordered" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn btn-primary w-full" disabled={isUpdating}>
              {isUpdating ? <span className="loading loading-spinner loading-sm" /> : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (activeSection === 'theme') {
    return (
      <div className="h-screen overflow-y-auto bg-base-100">
        <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 bg-base-100 border-b border-base-300">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-base-200 rounded-full"><FiArrowLeft size={20} /></button>
          <h2 className="font-semibold">Appearance</h2>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-base-content/60 mb-4">Choose your preferred theme</p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${selectedTheme === theme ? 'border-primary bg-primary/10' : 'border-base-300 hover:border-primary/50 bg-base-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {theme === 'dark' || theme === 'black' ? <FiMoon size={14} /> : theme === 'light' ? <FiSun size={14} /> : <FiMonitor size={14} />}
                  <span className="font-medium text-sm capitalize">{theme}</span>
                  {selectedTheme === theme && <span className="ml-auto w-2 h-2 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Settings Screen ─────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto bg-base-100">
      {/* Profile Header */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-primary/20">
              <img
                src={authUser?.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || 'U')}&background=7c3aed&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary text-primary-content rounded-full flex items-center justify-center text-xs shadow-md"
            >
              {isUploading ? <span className="loading loading-spinner loading-xs" /> : <FiCamera size={12} />}
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base truncate">{authUser?.fullName}</h3>
            <p className="text-sm text-base-content/60 truncate">{authUser?.email}</p>
            <p className="text-xs text-base-content/50 mt-0.5 truncate">{authUser?.about}</p>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8">
        {/* Account */}
        <Section title="Account">
          <SettingRow icon={<FiUser />} label="Edit Profile" onClick={() => setActiveSection('profile')} />
          <SettingRow icon={<FiLock />} label="Change Password" onClick={() => setActiveSection('password')} divider={false} />
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow icon={<FiMoon />} label="Theme" value={selectedTheme} onClick={() => setActiveSection('theme')} divider={false} />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow
            icon={<FiBell />}
            label="Message Notifications"
            divider
          >
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={authUser?.settings?.notifications !== false}
              onChange={() => handleToggleSetting('notifications')}
            />
          </SettingRow>
          <SettingRow
            icon={<FiBell />}
            label="Sound"
            divider={false}
          >
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={authUser?.settings?.soundEnabled !== false}
              onChange={() => handleToggleSetting('soundEnabled')}
            />
          </SettingRow>
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <SettingRow
            icon={<FiEye />}
            label="Last Seen & Online"
            divider
          >
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={authUser?.settings?.lastSeenVisible !== false}
              onChange={() => handleToggleSetting('lastSeenVisible')}
            />
          </SettingRow>
          <SettingRow
            icon={<BsShieldCheck />}
            label="Read Receipts"
            divider={false}
          >
            <input
              type="checkbox"
              className="toggle toggle-primary toggle-sm"
              checked={authUser?.settings?.readReceipts !== false}
              onChange={() => handleToggleSetting('readReceipts')}
            />
          </SettingRow>
        </Section>

        {/* Account Info */}
        <Section title="Info">
          <SettingRow icon={<FiPhone />} label="Phone" value={authUser?.phone || 'Not set'} divider />
          <SettingRow icon={<FiInfo />} label="About" value={authUser?.about?.substring(0, 30) + (authUser?.about?.length > 30 ? '…' : '') || ''} divider={false} />
        </Section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3.5 bg-error/10 text-error rounded-2xl hover:bg-error/20 transition-colors border border-error/20"
        >
          <FiLogOut size={18} />
          <span className="font-semibold text-sm">Logout</span>
        </button>
      </div>
      {/* Modals & Portals */}
      {cropImageSrc && (
        <ImageCropper
          imageSrc={cropImageSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImageSrc(null)}
        />
      )}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default Settings;
