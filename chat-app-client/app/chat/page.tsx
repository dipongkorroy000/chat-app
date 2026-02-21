/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {useEffect, useState} from "react";
import {useAppData} from "../context/AppContext";
import {redirect} from "next/navigation";
import Loading from "../components/Loading";
import {Message, User} from "../types";
import ChatSidebar from "../components/ChatSidebar";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import {createNewChat, getMessagesByChat, sendMessage} from "../service/chats/chat.service";
import ChatHeader from "../components/ChatHeader";
import ChatMessages from "../components/ChatMessages";
import MessageInput from "../components/MessageInput";

const ChatApp = () => {
  const {isAuth, loading: load, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats} = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typeingTimeOut, setTypeingTimeOut] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isAuth && !load) redirect("/login");
  }, [isAuth, load]);

  const handleLogout = () => logoutUser();

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();

    if ((!message.trim() && !imageFile) || !selectedUser) return;
    // socket setup

    const token = Cookies.get("chat-app-token");

    try {
      const formData = new FormData();

      formData.append("chatId", selectedUser);

      if (message.trim()) formData.append("text", message);

      if (imageFile) formData.append("image", imageFile);

      const data = await sendMessage(token as string, formData);

      setMessages((prev) => {
        const currentMessages = prev || [];

        const messageExists = currentMessages.some((msg) => msg._id === data.messages.chatId);

        if (!messageExists) return [...currentMessages, data.messages];

        return currentMessages;
      });

      setMessage("");

      const displayText = imageFile ? "📸 image" : message;
    } catch (error: any) {
      toast.error(error.response.data.message);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedUser) return;

    // socket setup
  };

  async function createChat(u: User) {
    const token = Cookies.get("chat-app-token");
    try {
      const data = await createNewChat(token as string, u._id);

      setSelectedUser(data.chatId);
      setShowAllUsers(false);
      await fetchChats();
    } catch (error) {
      toast.error("Failed to start chat");
    }
  }

  useEffect(() => {
    if (selectedUser) {
      const fetchChat = async () => {
        const token = Cookies.get("chat-app-token");
        try {
          const data = await getMessagesByChat(token as string, selectedUser);
          setMessages(data.messages);
          setUser(data.user.user);
          await fetchChats();
        } catch {
          toast.error("Failed to load messages");
        }
      };
      fetchChat();
    }
  }, [selectedUser]);

  if (load) return <Loading></Loading>;

  return (
    <div className="min-h-screen flex bg-gray-900 text-white relative overflow-hidden">
      <ChatSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        chats={chats}
        showAllUsers={showAllUsers}
        setShowAllUsers={setShowAllUsers}
        handleLogout={handleLogout}
        loggedInUser={loggedInUser}
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        users={users}
        createChat={createChat}
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-2 border-white/10">
        <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} />

        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />

        <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend}></MessageInput>
      </div>
    </div>
  );
};

export default ChatApp;
