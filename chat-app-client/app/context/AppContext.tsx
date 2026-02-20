"use client";

import React, {createContext, ReactNode, useContext, useEffect, useState} from "react";
import Cookies from "js-cookie";
import {profile} from "../service/auth/auth.service";

export interface User {
  _id: string;
  name: string;
  email: string;
  about?: string;
  bio?: string;
}

export interface Chat {
  _id: string;
  users: string[];
  latestMessage: {
    text: string;
    sender: string;
  };
  createdAt: Date;
  updateAt: Date;
  unseenCount?: number;
}

export interface Chats {
  _id: string;
  user: User;
  chat: Chat;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  isAuth: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setIsAuth: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const token = Cookies.get("chat-app-token");

        const data = await profile(token as string);

        setUser(data);
        setIsAuth(true);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return <AppContext.Provider value={{user, setUser, isAuth, setIsAuth, loading}}>{children}</AppContext.Provider>;
};

export const useAppData = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppdata must be used within AppProvider");
  return context;
};
