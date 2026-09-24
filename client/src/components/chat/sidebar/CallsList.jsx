import React from 'react';

const CallsList = () => {
  return (
    <div className="flex flex-col h-full w-full bg-base-100 border-r border-base-300 p-4">
      <h2 className="text-2xl font-bold mb-4">Calls</h2>
      <div className="flex-1 flex items-center justify-center text-base-content/50">
        <p>No recent calls</p>
      </div>
    </div>
  );
};
export default CallsList;
