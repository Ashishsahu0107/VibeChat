import React, { useState } from "react";
import userData  from "../../assets/dummData";

const RecentChat = () => {
  const [recentUser, setRecentUser] = useState(userData);

  return <>
    <div>
      <div> Recent chat </div>
      {
        userData.map((user,idx) => (
          <div key={idx}>{user.name}</div>
        ))  
      }
    </div>
  </>;
};

export default RecentChat;
