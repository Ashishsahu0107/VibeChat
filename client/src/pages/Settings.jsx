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
  "dark", "luxury", "black", "spotify", "valorant", "vscode",
  "light", "corporate", "mintlify", "shadcn", "slack",
];

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-2 px-1">{title}</h3>
    <div className="glass-card overflow-hidden border border-white/10 rounded-2xl">{children}</div>
  </div>
);

const SettingRow = ({ icon, label, value, onClick, children, divider = true }) => (
  <div>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <span className="text-cyan-400 text-lg shrink-0">{icon}</span>
      <span className="flex-1 font-semibold text-sm text-slate-100">{label}</span>
      {value !== undefined && (
        <span className="text-xs text-slate-400 font-medium">{value}</span>
      )}
      {onClick && <FiChevronRight size={14} className="text-slate-500 shrink-0" />}
      {children}
    </button>
    {divider && <div className="ml-12 border-b border-white/[0.06]" />}
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
    authUser?.settings?.theme || localStorage.getItem('theme') || 'dark'
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
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-white/[0.08] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer">
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Edit Profile</h2>
        </div>
        <div className="max-w-lg mx-auto glass-card p-6 border border-white/10">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">Full Name</label>
              <input type="text" className="glass-input w-full px-3.5 py-2.5 text-sm" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">Phone Number</label>
              <input type="tel" className="glass-input w-full px-3.5 py-2.5 text-sm" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="Enter phone number" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">About</label>
              <textarea className="glass-input w-full px-3.5 py-2.5 text-sm resize-none block" value={formData.about} onChange={(e) => setFormData({ ...formData, about: e.target.value })} rows={3} placeholder="Tell people about yourself" maxLength={150} />
              <div className="text-right text-[11px] text-slate-400">
                {formData.about.length}/150
              </div>
            </div>
            <button type="submit" className="btn-glow w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2" disabled={isUpdating}>
              {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave size={16} /> Save Changes</>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (activeSection === 'password') {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-white/[0.08] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer">
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Change Password</h2>
        </div>
        <div className="max-w-lg mx-auto glass-card p-6 border border-white/10">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">Current Password</label>
              <input type="password" className="glass-input w-full px-3.5 py-2.5 text-sm" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">New Password</label>
              <input type="password" className="glass-input w-full px-3.5 py-2.5 text-sm" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} minLength={6} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider block">Confirm New Password</label>
              <input type="password" className="glass-input w-full px-3.5 py-2.5 text-sm" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn-glow w-full py-3 text-sm font-semibold flex items-center justify-center gap-2 mt-2" disabled={isUpdating}>
              {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (activeSection === 'theme') {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button onClick={() => setActiveSection('main')} className="p-2 hover:bg-white/[0.08] rounded-xl text-slate-300 hover:text-white transition-colors cursor-pointer">
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Appearance</h2>
        </div>
        <div className="max-w-lg mx-auto">
          <p className="text-xs text-slate-400 mb-4 font-medium uppercase tracking-wider">
            Choose your preferred interface theme
          </p>
          <div className="grid grid-cols-2 gap-3">
            {THEMES.map((theme) => {
              const isSelected = selectedTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                    isSelected 
                      ? "border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-white shadow-lg shadow-cyan-500/15" 
                      : "border-white/10 hover:border-white/25 bg-white/[0.03] text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {theme === "dark" || theme === "black" ? (
                      <FiMoon size={15} className="text-cyan-400" />
                    ) : theme === "light" ? (
                      <FiSun size={15} className="text-amber-400" />
                    ) : (
                      <FiMonitor size={15} className="text-purple-400" />
                    )}
                    <span className="font-semibold text-xs capitalize">
                      {theme}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Settings Screen ─────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto select-none">
      {/* Profile Header */}
      <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400/40 p-0.5 bg-slate-900 shadow-xl shadow-cyan-500/20">
              <img
                src={
                  authUser?.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(authUser?.fullName || "U")}&background=7c3aed&color=fff`
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-xl"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-gradient-to-tr from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center text-xs shadow-lg border border-white/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="Upload profile picture"
            >
              {isUploading ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCamera size={13} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-white truncate">
              {authUser?.fullName}
            </h3>
            <p className="text-xs text-cyan-400/90 truncate font-mono mt-0.5">
              {authUser?.email}
            </p>
            <p className="text-xs text-slate-400 mt-1 truncate">
              {authUser?.about || "No status set"}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-12 space-y-2">
        {/* Account */}
        <Section title="Account">
          <SettingRow
            icon={<FiUser />}
            label="Edit Profile"
            onClick={() => setActiveSection("profile")}
          />
          <SettingRow
            icon={<FiLock />}
            label="Change Password"
            onClick={() => setActiveSection("password")}
            divider={false}
          />
        </Section>

        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow
            icon={<FiMoon />}
            label="Theme"
            value={selectedTheme}
            onClick={() => setActiveSection("theme")}
            divider={false}
          />
        </Section>

        {/* Notifications */}
        <Section title="Notifications">
          <SettingRow icon={<FiBell />} label="Message Notifications" divider>
            <input
              type="checkbox"
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.notifications !== false}
              onChange={() => handleToggleSetting("notifications")}
            />
          </SettingRow>
          <SettingRow icon={<FiBell />} label="Sound Alerts" divider={false}>
            <input
              type="checkbox"
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.soundEnabled !== false}
              onChange={() => handleToggleSetting("soundEnabled")}
            />
          </SettingRow>
        </Section>

        {/* Privacy */}
        <Section title="Privacy">
          <SettingRow icon={<FiEye />} label="Last Seen & Online" divider>
            <input
              type="checkbox"
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.lastSeenVisible !== false}
              onChange={() => handleToggleSetting("lastSeenVisible")}
            />
          </SettingRow>
          <SettingRow
            icon={<BsShieldCheck />}
            label="Read Receipts"
            divider={false}
          >
            <input
              type="checkbox"
              className="accent-cyan-400 w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.readReceipts !== false}
              onChange={() => handleToggleSetting("readReceipts")}
            />
          </SettingRow>
        </Section>

        {/* Account Info */}
        <Section title="Info">
          <SettingRow
            icon={<FiPhone />}
            label="Phone"
            value={authUser?.phone || "Not set"}
            divider
          />
          <SettingRow
            icon={<FiInfo />}
            label="About"
            value={
              authUser?.about?.substring(0, 30) +
                (authUser?.about?.length > 30 ? "…" : "") || "Hey there! I am using VibeChat."
            }
            divider={false}
          />
        </Section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-semibold text-sm border border-rose-500/25 transition-all mt-4 cursor-pointer active:scale-98"
        >
          <FiLogOut size={16} />
          <span>Sign Out</span>
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
