import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";
import useAuthStore from "../store/useAuthStore";

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { authUser } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Call State
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [callerName, setCallerName] = useState("");
  const [callerId, setCallerId] = useState("");
  const [isVideoCall, setIsVideoCall] = useState(false);

  useEffect(() => {
    if (authUser) {
      const newSocket = io(`http://${window.location.hostname}:4500`);
      setSocket(newSocket);

      newSocket.on("connect", () => {
        newSocket.emit("join-room", authUser._id);
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
      });

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [authUser]);

  const clearCall = () => {
    setReceivingCall(false);
    setCallerSignal(null);
    setCallerId("");
    setCallerName("");
    setIsVideoCall(false);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        receivingCall,
        callerSignal,
        callerName,
        callerId,
        isVideoCall,
        clearCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
