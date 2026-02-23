"use client";

import {createContext, ReactNode, startTransition, useContext, useEffect, useState} from "react";
import {io, Socket} from "socket.io-client";
import {useAppData} from "./AppContext";
import config from "../env";

interface SocketContextType {
  socket: Socket | null;
  onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  onlineUsers: [],
});

export const SocketProvider = ({children}: {children: ReactNode}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const {user} = useAppData();

  useEffect(() => {
    if (!user?._id) return;

    const newSocket = io(config.chat_service_base_url_api, {
      query: {userId: user._id},
    });

    newSocket.on("connect", () => {
      console.log("Client connected with id:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
    });

    startTransition(() => {
      setSocket(newSocket);
    });

    newSocket.on("getOnlineUser", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user?._id]);

  return <SocketContext.Provider value={{socket, onlineUsers}}>{children}</SocketContext.Provider>;
};

export const SocketData = () => useContext(SocketContext);
