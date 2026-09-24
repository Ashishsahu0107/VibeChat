import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authUser } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);

  // Call State
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callChatId, setCallChatId] = useState(null);

  useEffect(() => {
    if (authUser) {
      // In production, you might not hardcode the port
      const newSocket = io(window.location.origin.includes('localhost') ? `http://${window.location.hostname}:4500` : '/');
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("setup", authUser._id);
      });

      newSocket.on("connected", () => {
        setSocketConnected(true);
      });

      newSocket.on("getOnlineUsers", (users) => {
        setOnlineUsers(users);
      });

      newSocket.on("call-incoming", (data) => {
        setReceivingCall(true);
        setCallerSignal(data.signal);
        setCallerId(data.from);
        setCallerName(data.name);
        setIsVideoCall(data.isVideoCall);
        setCallChatId(data.chatId);
      });

      newSocket.on("message-received", (newMessageReceived) => {
        const { selectedChat, addMessage, fetchChats } = useChatStore.getState();
        
        if (!selectedChat || selectedChat._id !== newMessageReceived.chatId._id) {
          // Notify/Unread bump
          fetchChats(); // Refresh chat list for latest message
        } else {
          // Actively chatting
          addMessage(newMessageReceived);
          fetchChats(); // Refresh chat list for latest message preview
          newSocket.emit("message-read", { 
            messageId: newMessageReceived._id, 
            chatId: selectedChat._id, 
            userId: authUser._id 
          });
        }
      });

      newSocket.on("message-status-updated", (data) => {
        useChatStore.getState().updateMessageStatus(data.messageId, data.status, data.userId);
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
      }
    }
  }, [authUser]);

  const clearCall = () => {
    setReceivingCall(false);
    setCallerSignal(null);
    setCallerId("");
    setCallerName("");
    setIsVideoCall(false);
    setCallChatId(null);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        socketConnected,
        onlineUsers,
        receivingCall,
        callerSignal,
        callerName,
        callerId,
        isVideoCall,
        callChatId,
        clearCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

