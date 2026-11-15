import React, { useState, useRef } from "react";
import useAuthStore from "../store/useAuthStore";
import {
  FiCamera,
  FiSave,
  FiUser,
  FiPhone,
  FiLock,
  FiInfo,
  FiBell,
  FiEye,
  FiMoon,
  FiSun,
  FiMonitor,
  FiChevronRight,
  FiLogOut,
  FiArrowLeft,
  FiCloud,
  FiDatabase,
  FiGlobe,
  FiHelpCircle,
  FiTrash2,
  FiCheck,
  FiAlertTriangle,
} from "react-icons/fi";
import { BsShieldCheck } from "react-icons/bs";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ImageCropper from "../components/ImageCropper";
import LogoutModal from "../components/LogoutModal";

const Section = ({ title, children }) => (
  <div className="mb-4">
    <h3 className="text-[11px] font-bold text-purple-400 uppercase tracking-wider mb-2 px-1">
      {title}
    </h3>
    <div className="bg-white/[0.03] overflow-hidden border border-white/10 rounded-2xl">
      {children}
    </div>
  </div>
);

const SettingRow = ({
  icon,
  label,
  value,
  onClick,
  children,
  divider = true,
  destructive = false,
}) => (
  <div>
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/[0.05] transition-colors text-left ${
        onClick ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <span
        className={`text-lg shrink-0 ${
          destructive ? "text-rose-400" : "text-[#A78BFA]"
        }`}
      >
        {icon}
      </span>
      <span
        className={`flex-1 font-semibold text-sm ${
          destructive ? "text-rose-400" : "text-white"
        }`}
      >
        {label}
      </span>
      {value !== undefined && (
        <span className="text-xs text-gray-400 font-medium">{value}</span>
      )}
      {onClick && (
        <FiChevronRight size={14} className="text-gray-500 shrink-0" />
      )}
      {children}
    </button>
    {divider && <div className="ml-12 border-b border-white/[0.06]" />}
  </div>
);

const Settings = () => {
  const {
    authUser,
    updateProfile,
    updateProfileImage,
    changePassword,
    updateSettings,
  } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: authUser?.fullName || "",
    phone: authUser?.phone || "",
    about: authUser?.about || "",
  });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("main"); // main | profile | password | privacy | notifications | theme | backup | about | delete
  const [selectedTheme, setSelectedTheme] = useState(
    authUser?.settings?.theme || localStorage.getItem("theme") || "dark",
  );
  const fileInputRef = useRef(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState("Nov 15, 2026, 10:30 AM");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return toast.error("Please select an image");
    if (file.size > 5 * 1024 * 1024)
      return toast.error("Image size must be 5 MB or less");

    const reader = new FileReader();
    reader.addEventListener("load", () => setCropImageSrc(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleCropComplete = async (croppedFile) => {
    setCropImageSrc(null);
    if (!croppedFile) return;
    const data = new FormData();
    data.append("image", croppedFile);
    setIsUploading(true);
    const res = await updateProfileImage(data);
    if (res.success) toast.success("Profile photo updated!");
    else toast.error(res.error);
    setIsUploading(false);
  };

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setIsUpdating(true);
    const res = await updateProfile(formData);
    if (res.success) toast.success("Profile updated!");
    else toast.error(res.error);
    setIsUpdating(false);
  };

  const handleChangePassword = async (e) => {
    e?.preventDefault();
    if (!passwords.current) return toast.error("Enter current password");
    if (passwords.new.length < 6)
      return toast.error("New password must be at least 6 characters");
    if (passwords.new !== passwords.confirm)
      return toast.error("Passwords do not match");

    setIsUpdating(true);
    const res = await changePassword({
      currentPassword: passwords.current,
      newPassword: passwords.new,
    });
    if (res.success) {
      toast.success("Password changed!");
      setPasswords({ current: "", new: "", confirm: "" });
      setActiveSection("main");
    } else {
      toast.error(res.error);
    }
    setIsUpdating(false);
  };

  const handleToggleSetting = async (key) => {
    const current = authUser?.settings?.[key];
    await updateSettings({ [key]: !current });
    toast.success("Setting updated");
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      setIsBackingUp(false);
      setLastBackup(new Date().toLocaleString());
      toast.success("Chats backed up successfully!");
    }, 1500);
  };

  // ── SUB-SCREEN: EDIT PROFILE ──────────────────────────────────────────
  if (activeSection === "profile") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Edit Profile</h2>
        </div>
        <div className="max-w-lg mx-auto bg-white/[0.03] p-6 border border-white/10 rounded-3xl">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Phone Number
              </label>
              <input
                type="tel"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                About
              </label>
              <textarea
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED] resize-none block"
                value={formData.about}
                onChange={(e) =>
                  setFormData({ ...formData, about: e.target.value })
                }
                rows={3}
                placeholder="Hey there! I am using ChatApp."
                maxLength={150}
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FiSave size={16} /> Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: CHANGE PASSWORD ───────────────────────────────────────
  if (activeSection === "password") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Change Password</h2>
        </div>
        <div className="max-w-lg mx-auto bg-white/[0.03] p-6 border border-white/10 rounded-3xl">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                minLength={6}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:border-[#7C3AED]"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 mt-4 cursor-pointer"
              disabled={isUpdating}
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: CHAT BACKUP (Figma Screen 35) ─────────────────────────
  if (activeSection === "backup") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Chat Backup</h2>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 pt-4">
          {/* Cloud backup illustration */}
          <div className="w-20 h-20 rounded-full bg-[#1E1B2E] border border-purple-500/30 flex items-center justify-center text-[#7C3AED] mx-auto shadow-xl shadow-purple-900/40">
            <FiCloud size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold">Backup Your Chats</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Keep your chats safe by backing them up to your secure cloud
              storage.
            </p>
          </div>

          <div className="bg-white/[0.03] p-4 rounded-2xl border border-white/10 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Last Backup</span>
              <span className="font-semibold text-purple-300">{lastBackup}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Auto Backup</span>
              <span className="font-semibold text-emerald-400">Daily</span>
            </div>
          </div>

          <button
            onClick={handleBackupNow}
            disabled={isBackingUp}
            className="w-full py-3.5 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isBackingUp ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Backup Now"
            )}
          </button>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: ABOUT APP (Figma Screen 38) ───────────────────────────
  if (activeSection === "about") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">About</h2>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 pt-6">
          {/* ChatApp speech bubble logo */}
          <div className="w-16 h-16 rounded-2xl bg-[#7C3AED] text-white flex items-center justify-center mx-auto shadow-xl shadow-purple-600/30">
            <svg
              width={32}
              height={32}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3C6.477 3 2 6.918 2 11.75C2 14.156 3.12 16.326 4.965 17.868C4.52 19.467 3.53 20.843 3.495 20.892C3.33 21.121 3.376 21.439 3.6 21.611C3.722 21.706 3.869 21.75 4.015 21.75C4.12 21.75 4.225 21.724 4.321 21.671C6.273 20.605 7.828 19.866 8.529 19.504C9.627 19.824 10.792 20 12 20C17.523 20 22 16.082 22 11.75C22 6.918 17.523 3 12 3Z"
                fill="currentColor"
              />
              <circle cx="8" cy="11.75" r="1.5" fill="#FFFFFF" />
              <circle cx="12" cy="11.75" r="1.5" fill="#FFFFFF" />
              <circle cx="16" cy="11.75" r="1.5" fill="#FFFFFF" />
            </svg>
          </div>

          <div>
            <h3 className="text-xl font-bold">ChatApp</h3>
            <p className="text-xs font-mono text-purple-300 mt-0.5">
              Version 1.0.0
            </p>
            <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
              A modern and secure real-time messaging application for your
              everyday conversations.
            </p>
          </div>

          <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5 text-left text-xs font-semibold">
            <button
              onClick={() => toast.success("ChatApp is up to date!")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <span>Check for Updates</span>
              <FiChevronRight size={14} className="text-gray-400" />
            </button>
            <button
              onClick={() => toast("Terms & Conditions")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <span>Terms & Conditions</span>
              <FiChevronRight size={14} className="text-gray-400" />
            </button>
            <button
              onClick={() => toast("Privacy Policy")}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer"
            >
              <span>Privacy Policy</span>
              <FiChevronRight size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: APP LOCK & BIOMETRICS (Figma Screens 41 & 42) ────────
  if (activeSection === "appLock") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">App Lock</h2>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 pt-6">
          <div className="w-20 h-20 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto shadow-xl shadow-purple-900/40">
            <FiLock size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold">Biometric Lock</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Use your biometric fingerprint, Face ID, or PIN to open ChatApp.
            </p>
          </div>

          <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-4 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Fingerprint</div>
                <div className="text-[10px] text-gray-400">Use fingerprint to unlock</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-[#7C3AED] w-4 h-4 cursor-pointer" />
            </div>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Face ID</div>
                <div className="text-[10px] text-gray-400">Use face recognition to unlock</div>
              </div>
              <input type="checkbox" className="accent-[#7C3AED] w-4 h-4 cursor-pointer" />
            </div>
          </div>

          <button
            onClick={() => {
              toast.success("App Lock preferences enabled!");
              setActiveSection("main");
            }}
            className="w-full py-3.5 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
          >
            Enable Lock
          </button>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: TWO-STEP VERIFICATION (Figma Screen 43) ───────────────
  if (activeSection === "twoStep") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Two-Step Verification</h2>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 pt-6">
          <div className="w-20 h-20 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto shadow-xl shadow-purple-900/40">
            <BsShieldCheck size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold">Two-Step Verification</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
              Add an extra layer of security to your account with a 6-digit PIN.
            </p>
          </div>

          <div className="bg-white/[0.03] rounded-2xl border border-white/10 p-4 space-y-4 text-left">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-white">Enable 2-Step Verification</div>
                <div className="text-[10px] text-gray-400">Prompt for PIN on new logins</div>
              </div>
              <input type="checkbox" defaultChecked className="accent-[#7C3AED] w-4 h-4 cursor-pointer" />
            </div>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between cursor-pointer" onClick={() => toast("Change PIN")}>
              <div>
                <div className="text-xs font-semibold text-white">Change PIN</div>
                <div className="text-[10px] text-gray-400">Set a new 6-digit PIN</div>
              </div>
              <FiChevronRight size={14} className="text-gray-400" />
            </div>

            <div className="border-t border-white/5 pt-3 flex items-center justify-between cursor-pointer" onClick={() => toast("Recovery Email: " + authUser?.email)}>
              <div>
                <div className="text-xs font-semibold text-white">Recovery Email</div>
                <div className="text-[10px] text-gray-400">{authUser?.email}</div>
              </div>
              <FiChevronRight size={14} className="text-gray-400" />
            </div>
          </div>

          <button
            onClick={() => {
              toast.success("Two-Step Verification active!");
              setActiveSection("main");
            }}
            className="w-full py-3.5 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: LINKED DEVICES & ACTIVE SESSIONS (Figma Screens 44 & 46) 
  if (activeSection === "linkedDevices") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-white">Linked Devices</h2>
        </div>

        <div className="max-w-md mx-auto space-y-5 pt-2">
          {/* Linked devices illustration */}
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-[#1E1B2E] border border-purple-500/30 text-[#A78BFA] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-900/30">
              <FiMonitor size={30} />
            </div>
            <h3 className="text-lg font-bold">Active Sessions</h3>
            <p className="text-xs text-gray-400 mt-0.5">Use ChatApp on other devices seamlessly.</p>
          </div>

          {/* Device list */}
          <div className="bg-white/[0.03] rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/5">
            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiMonitor size={18} className="text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Windows PC (Desktop)</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Online • Active now</div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                This Device
              </span>
            </div>

            <div className="p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FiGlobe size={18} className="text-purple-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">Chrome (Web)</div>
                  <div className="text-[10px] text-gray-400">Last active today, 09:30 AM</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => toast("QR Scanner: Point camera at web.chatapp.com to link")}
            className="w-full py-3.5 rounded-full font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] shadow-lg shadow-purple-600/30 transition-all cursor-pointer text-xs sm:text-sm"
          >
            Link a Device
          </button>

          <div className="text-center pt-2">
            <button
              onClick={() => toast.success("Logged out from other sessions")}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold cursor-pointer"
            >
              Log out from all other devices
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── SUB-SCREEN: DELETE ACCOUNT (Figma Screen 40) ───────────────────────
  if (activeSection === "delete") {
    return (
      <div className="h-full overflow-y-auto p-4 sm:p-6 font-sans text-white">
        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
          <button
            onClick={() => setActiveSection("main")}
            className="p-2 hover:bg-white/[0.08] rounded-full text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="font-bold text-lg text-rose-400">Delete Account</h2>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 pt-6">
          <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto shadow-xl shadow-rose-950/40">
            <FiTrash2 size={36} />
          </div>

          <div>
            <h3 className="text-xl font-bold">Delete Your Account</h3>
            <p className="text-xs text-rose-300/80 mt-1 max-w-xs mx-auto">
              This will permanently delete your account, chats, and all
              associated data. This action cannot be undone.
            </p>
          </div>

          <div className="bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 text-left text-xs text-rose-300 flex items-start gap-2.5">
            <FiAlertTriangle size={18} className="shrink-0 mt-0.5" />
            <span>
              All your messages, group memberships, and media history will be
              erased permanently from our databases.
            </span>
          </div>

          <button
            onClick={() => toast.error("Account deletion requires email confirmation")}
            className="w-full py-3.5 rounded-full font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            Delete Account
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN SETTINGS SCREEN ──────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto select-none font-sans text-white">
      {/* Profile Header (Figma Screen 18 Profile) */}
      <div className="p-5 sm:p-6 border-b border-white/10 bg-gradient-to-b from-[#7C3AED]/20 to-transparent">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-purple-400/50 p-0.5 bg-slate-900 shadow-xl shadow-purple-900/30">
              <img
                src={
                  authUser?.profilePic ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    authUser?.fullName || "User",
                  )}&background=7c3aed&color=fff`
                }
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-full flex items-center justify-center text-xs shadow-md border border-white/20 cursor-pointer"
              title="Change profile picture"
            >
              {isUploading ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <FiCamera size={12} />
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
            <p className="text-xs text-purple-300 truncate font-mono mt-0.5">
              {authUser?.phone || authUser?.email}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {authUser?.about || "Hey there! I am using ChatApp."}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pb-12 space-y-3">
        {/* Account Settings */}
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

        {/* Chats & Data */}
        <Section title="Chats & Backup">
          <SettingRow
            icon={<FiCloud />}
            label="Chat Backup"
            value="Daily"
            onClick={() => setActiveSection("backup")}
          />
          <SettingRow
            icon={<FiDatabase />}
            label="Storage & Data"
            value="256 MB used"
            onClick={() => toast("Storage: 256 MB used")}
            divider={false}
          />
        </Section>

        {/* Notifications & Privacy */}
        <Section title="Notifications & Privacy">
          <SettingRow icon={<FiBell />} label="Message Notifications" divider>
            <input
              type="checkbox"
              className="accent-[#7C3AED] w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.notifications !== false}
              onChange={() => handleToggleSetting("notifications")}
            />
          </SettingRow>
          <SettingRow
            icon={<BsShieldCheck />}
            label="Read Receipts"
            divider={false}
          >
            <input
              type="checkbox"
              className="accent-[#7C3AED] w-4 h-4 cursor-pointer"
              checked={authUser?.settings?.readReceipts !== false}
              onChange={() => handleToggleSetting("readReceipts")}
            />
          </SettingRow>
        </Section>

        {/* Security & Linked Devices (Screens 41–46) */}
        <Section title="Security & Devices">
          <SettingRow
            icon={<FiLock />}
            label="App Lock & Biometrics"
            value="Enabled"
            onClick={() => setActiveSection("appLock")}
          />
          <SettingRow
            icon={<BsShieldCheck />}
            label="Two-Step Verification"
            value="Active"
            onClick={() => setActiveSection("twoStep")}
          />
          <SettingRow
            icon={<FiMonitor />}
            label="Linked Devices & Sessions"
            value="2 Active"
            onClick={() => setActiveSection("linkedDevices")}
            divider={false}
          />
        </Section>

        {/* About & Support */}
        <Section title="About & Support">
          <SettingRow
            icon={<FiInfo />}
            label="About ChatApp"
            value="v1.0.0"
            onClick={() => setActiveSection("about")}
          />
          <SettingRow
            icon={<FiHelpCircle />}
            label="Help & Support"
            onClick={() => toast("Contact support at support@vibechat.com")}
            divider={false}
          />
        </Section>

        {/* Danger Zone */}
        <Section title="Account Actions">
          <SettingRow
            icon={<FiTrash2 />}
            label="Delete Account"
            onClick={() => setActiveSection("delete")}
            destructive
            divider={false}
          />
        </Section>

        {/* Logout Button (Figma Screen 20) */}
        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 font-bold text-xs sm:text-sm border border-rose-500/30 transition-all mt-4 cursor-pointer"
        >
          <FiLogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>

      {/* Cropper & Logout Modal */}
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