import React from 'react';
import Settings from '../../../pages/Settings';

// Render the full Settings page inside the sidebar
const SettingsView = () => {
  return (
    <div className="h-full overflow-hidden">
      <Settings embedded={true} />
    </div>
  );
};

export default SettingsView;
