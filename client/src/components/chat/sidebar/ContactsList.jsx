import React, { useEffect, useState } from 'react';
import api from '../../../config/api';
import useChatStore from '../../../store/useChatStore';

const ContactsList = ({ onSelectChat }) => {
  const [contacts, setContacts] = useState([]);
  const accessChat = useChatStore(state => state.accessChat);

  useEffect(() => {
    api.get("/users").then(res => setContacts(res.data)).catch(console.error);
  }, []);

  const handleStartChat = async (userId) => {
    try {
      const chat = await accessChat(userId);
      onSelectChat(chat);
    } catch(err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-base-100 border-r border-base-300 p-4">
      <h2 className="text-2xl font-bold mb-4">Contacts</h2>
      <div className="flex-1 overflow-y-auto space-y-2">
        {contacts.map(c => (
          <div key={c._id} onClick={() => handleStartChat(c._id)} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer">
            <div className="avatar"><div className="w-10 rounded-full"><img src={c.profilePic} /></div></div>
            <div className="font-medium">{c.fullName}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ContactsList;
