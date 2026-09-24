import React from 'react';
import useAuthStore from '../../../store/useAuthStore';

const SettingsView = () => {
  const { authUser, logout } = useAuthStore();
  
  return (
    <div className="flex flex-col h-full w-full bg-base-100 border-r border-base-300 p-4">
      <h2 className="text-2xl font-bold mb-4">Settings</h2>
      <div className="flex flex-col items-center gap-2 mb-6">
        <div className="avatar"><div className="w-24 rounded-full ring ring-primary"><img src={authUser?.profilePic} /></div></div>
        <h3 className="text-xl font-bold">{authUser?.fullName}</h3>
        <p className="text-sm text-base-content/70">{authUser?.about}</p>
      </div>
      <button onClick={logout} className="btn btn-error w-full">Logout</button>
    </div>
  );
};
export default SettingsView;
