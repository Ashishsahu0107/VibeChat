import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";
import useChatStore from "../store/useChatStore";
import useStatusStore from "../store/useStatusStore";
import toast from "react-hot-toast";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

let sharedAudioCtx = null;
let lastSoundPlayTime = 0;

export const playNotificationSound = (type = 'receive') => {
  try {
    const currentUser = useAuthStore.getState().authUser;
    if (currentUser?.settings?.soundEnabled === false) return;

    // Prevent duplicate sounds playing within 100ms
    const now = Date.now();
    if (now - lastSoundPlayTime < 100) return;
    lastSoundPlayTime = now;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Resume context if suspended (browser auto-play policy)
    if (sharedAudioCtx.state === 'suspended') {
      sharedAudioCtx.resume();
    }

    const oscillator = sharedAudioCtx.createOscillator();
    const gainNode = sharedAudioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(sharedAudioCtx.destination);
    
    if (type === 'receive') {
      // Two quick beeps for incoming
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(800, sharedAudioCtx.currentTime);
      oscillator.frequency.setValueAtTime(1200, sharedAudioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, sharedAudioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + 0.2);
      
      oscillator.start(sharedAudioCtx.currentTime);
      oscillator.stop(sharedAudioCtx.currentTime + 0.2);
    } else if (type === 'send') {
      // Single gentle pop/woosh for sent
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(300, sharedAudioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(100, sharedAudioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, sharedAudioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, sharedAudioCtx.currentTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + 0.15);
      
      oscillator.start(sharedAudioCtx.currentTime);
      oscillator.stop(sharedAudioCtx.currentTime + 0.15);
    }
  } catch (_) {
    // Ignore if browser blocks auto-play
  }
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authUser } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState({}); // { chatId: [{ userId, userName }] }

  // Call State
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [callChatId, setCallChatId] = useState(null);



  // Browser notification
  const showBrowserNotification = useCallback((title, body, icon) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body, icon: icon || "/favicon.ico" });
    }
  }, []);

  useEffect(() => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!authUser) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setSocketConnected(false);
        setOnlineUsers([]);
        setTypingUsers({});
      }
      return;
    }

    const socketUrl = window.location.origin.includes("localhost")
      ? `http://${window.location.hostname}:4500`
      : "/";

    const newSocket = io(socketUrl, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      newSocket.emit("setup", authUser._id);
    });

    newSocket.on("connected", () => {
      setSocketConnected(true);
    });

    newSocket.on("disconnect", () => {
      setSocketConnected(false);
    });

    newSocket.on("reconnect", () => {
      newSocket.emit("setup", authUser._id);
      setSocketConnected(true);
    });

    // ── Online Users ────────────────────────────────────────────────────────
    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    newSocket.on("user-offline", ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    // ── Message Received ────────────────────────────────────────────────────
    newSocket.on("message-received", (newMessage) => {
      const { selectedChat, addMessage, fetchChats, updateLatestMessage, markAsRead } = useChatStore.getState();
      const currentUser = useAuthStore.getState().authUser;

      updateLatestMessage(newMessage.chatId?._id || newMessage.chatId, newMessage);

      if (!selectedChat || selectedChat._id !== (newMessage.chatId?._id || newMessage.chatId)) {
        // Not in this chat — show notification
        fetchChats();
        
        const senderName = newMessage.sender?.fullName || "Someone";
        const msgPreview = newMessage.content?.substring(0, 50) || "Attachment";
        
        // Sound
        if (currentUser?.settings?.soundEnabled !== false && newMessage.sender?._id !== currentUser._id) {
          playNotificationSound('receive');
        }

        // Browser notification
        if (currentUser?.settings?.notifications !== false) {
          showBrowserNotification(
            `New message from ${senderName}`,
            msgPreview,
            newMessage.sender?.profilePic
          );
        }

        // Toast
        toast(`💬 ${senderName}: ${msgPreview}`, { duration: 3000 });
      } else {
        // Currently in this chat
        addMessage(newMessage);
        
        // Wait for fetchChats to finish before resetting the unread count locally and on backend
        fetchChats().then(() => {
          markAsRead(newMessage.chatId?._id || newMessage.chatId);
        });
        
        if (newMessage.sender?._id !== currentUser._id && currentUser?.settings?.soundEnabled !== false) {
          playNotificationSound('receive');
        }

        // Send read receipt
        newSocket.emit("message-read", {
          messageId: newMessage._id,
          chatId: selectedChat._id,
          userId: currentUser._id,
        });
      }
    });

    // ── Message Edited ──────────────────────────────────────────────────────
    newSocket.on("message-edited", (editedMessage) => {
      useChatStore.getState().updateEditedMessage(editedMessage);
    });

    // ── Message Deleted ─────────────────────────────────────────────────────
    newSocket.on("message-deleted", ({ messageId, forEveryone }) => {
      useChatStore.getState().handleMessageDeleted({ messageId, forEveryone });
    });

    // ── Message Reaction ────────────────────────────────────────────────────
    newSocket.on("message-reaction", (data) => {
      useChatStore.getState().handleReaction(data);
    });

    // ── Message Status ──────────────────────────────────────────────────────
    newSocket.on("message-status-updated", (data) => {
      useChatStore.getState().updateMessageStatus(data.messageId, data.status, data.userId);
    });

    // ── Bulk Read ───────────────────────────────────────────────────────────
    newSocket.on("messages-read", ({ chatId, userId }) => {
      const { messages } = useChatStore.getState();
      messages.forEach((m) => {
        if (m.chatId === chatId || m.chatId?._id === chatId) {
          useChatStore.getState().updateMessageStatus(m._id, "read", userId);
        }
      });
    });

    // ── Typing ──────────────────────────────────────────────────────────────
    newSocket.on("typing", ({ chatId, userId, userName }) => {
      setTypingUsers((prev) => {
        const chatTypers = prev[chatId] || [];
        if (chatTypers.some((t) => t.userId === userId)) return prev;
        return { ...prev, [chatId]: [...chatTypers, { userId, userName }] };
      });
    });

    newSocket.on("stop-typing", ({ chatId, userId }) => {
      setTypingUsers((prev) => ({
        ...prev,
        [chatId]: (prev[chatId] || []).filter((t) => t.userId !== userId),
      }));
    });

    // ── Group Events ────────────────────────────────────────────────────────
    newSocket.on("group-created", (group) => {
      useChatStore.getState().handleGroupCreated(group);
    });

    newSocket.on("group-updated", (updatedChat) => {
      useChatStore.getState().handleGroupUpdated(updatedChat);
    });

    newSocket.on("removed-from-group", ({ chatId }) => {
      useChatStore.getState().deleteChat(chatId);
      toast("You were removed from a group");
    });

    // ── Status Events ───────────────────────────────────────────────────────
    newSocket.on("new-status", (status) => {
      useStatusStore.getState().handleSocketNewStatus(status);
    });

    newSocket.on("status-viewed", (data) => {
      useStatusStore.getState().handleSocketStatusViewed(data);
    });

    newSocket.on("status-deleted", (statusId) => {
      // Just re-fetch for simplicity to remove deleted status from grouped view
      useStatusStore.getState().fetchStatuses();
    });

    // ── Calls ───────────────────────────────────────────────────────────────
    newSocket.on("call-incoming", (data) => {
      setReceivingCall(true);
      setCallerSignal(data.signal);
      setCallerId(data.from);
      setCallerName(data.name);
      setIsVideoCall(data.isVideoCall);
      setCallChatId(data.chatId);
      playNotificationSound();
    });

    return () => {
      newSocket.disconnect();
    };
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
        typingUsers,
        receivingCall,
        callerSignal,
        callerName,
        callerId,
        isVideoCall,
        callChatId,
        clearCall,
        playNotificationSound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
