/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {getChatUsers, profile} from "../service/auth/auth.service";
import toast, {Toaster} from "react-hot-toast";
import {getUserChats} from "../service/chats/chat.service";
import {Chats, User} from "../types";

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
  logoutUser: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchChats: () => Promise<void>;
  chats: Chats[] | null;
  users: User[] | null;
  setChats: React.Dispatch<React.SetStateAction<Chats[] | null>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}: {children: ReactNode}) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [chats, setChats] = useState<Chats[] | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  async function logoutUser() {
    Cookies.remove("chat-app-token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged Out");
  }

  async function fetchChats() {
    const token = Cookies.get("chat-app-token");
    try {
      const data = await getUserChats(token as string);
      setChats(data);
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async function fetchUser() {
    try {
      const token = Cookies.get("chat-app-token");
      const data = await profile(token as string);

      setUser(data);
    } catch (error: any) {
      console.log(error.message);
    }
  }

  async function fetchUsers() {
    try {
      const token = Cookies.get("chat-app-token");
      const data = await getChatUsers(token as string);

      setUsers(data);
    } catch (error: any) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    const run = async () => {
      try {
        const token = Cookies.get("chat-app-token");
        if (!token) {
          setLoading(false);
          return;
        }

        // batch updates safely
        // startTransition(async () => {}); remove below
        await fetchUser();
        setIsAuth(true);
        setLoading(false);
        await fetchUsers();
        await fetchChats();
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    };

    run();
  }, []);

  return (
    <AppContext.Provider value={{user, setUser, isAuth, setIsAuth, loading, logoutUser, fetchChats, fetchUsers, users, chats, setChats}}>
      {children}
      <Toaster />
    </AppContext.Provider>
  );
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  // if (!context) throw new Error("useAppdata must be used within AppProvider");

  if (!context) {
    return {
      user: null,
      loading: false,
      isAuth: false,
      setUser: () => {},
      setIsAuth: () => {},
      logoutUser: async () => {},
      fetchUsers: async () => {},
      fetchChats: async () => {},
      chats: null,
      users: null,
      setChats: () => {},
    };
  }

  return context;
};
