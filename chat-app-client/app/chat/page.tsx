/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {startTransition, useEffect, useState} from "react";
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
import {SocketData} from "../context/SocketContext";

const ChatApp = () => {
  const {isAuth, loading: load, logoutUser, chats, user: loggedInUser, users, fetchChats, setChats} = useAppData();

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeOut, setTypingTimeOut] = useState<NodeJS.Timeout | null>(null);

  const {onlineUsers, socket} = SocketData();

  useEffect(() => {
    if (!isAuth && !load) redirect("/login");
  }, [isAuth, load]);

  const handleLogout = () => logoutUser();

  const handleMessageSend = async (e: any, imageFile?: File | null) => {
    e.preventDefault();

    if ((!message.trim() && !imageFile) || !selectedUser) return;

    // socket setup
    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
      setTypingTimeOut(null);
    }

    socket?.emit("stopTyping", {
      chatId: selectedUser,
      userId: loggedInUser?._id,
    });

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

      moveChatToTop(selectedUser, {text: displayText, sender: data.sender}, false);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (!selectedUser || !socket) return;

    // socket setup
    if (value.trim()) {
      socket.emit("typing", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }

    if (typingTimeOut) {
      clearTimeout(typingTimeOut);
    }

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", {
        chatId: selectedUser,
        userId: loggedInUser?._id,
      });
    }, 2000); // 2 second after after call

    setTypingTimeOut(timeout);
  };

  const moveChatToTop = (chatId: string, newMessage: any, updatedUnseenCount = true) => {
    setChats((prev) => {
      if (!prev) return null;

      const updatedChats = [...prev];
      const chatIndex = updatedChats.findIndex((chat) => chat.chat._id === chatId);

      if (chatIndex !== -1) {
        const [moveChat] = updatedChats.splice(chatIndex, 1);

        const updatedChat = {
          ...moveChat,
          chat: {
            ...moveChat.chat,
            latestMessage: {
              text: newMessage.text,
              sender: newMessage.sender,
            },
            updatedAt: new Date(),
            unseenCount: updatedUnseenCount && newMessage.sender !== loggedInUser?._id ? (moveChat.chat.unseenCount || 0) + 1 : moveChat.chat.unseenCount || 0,
          },
        };

        updatedChats.unshift(updatedChat);
      }

      return updatedChats;
    });
  };

  useEffect(() => {
    socket?.on("newMessage", (message) => {
      // console.log(`Received new message: `, message);

      if (selectedUser === message.chatId) {
        setMessages((prev) => {
          const currentMessages = prev || [];
          const messageExists = currentMessages.some((msg) => msg._id === message._id);

          if (!messageExists) return [...currentMessages, message];
          return currentMessages;
        });

        moveChatToTop(message.chatId, message, false);
      } else {
        moveChatToTop(message.chatId, message, true);
      }
    });

    socket?.on("messagesSeen", (data) => {
      // console.log(`Message seen by: `, data);

      if (selectedUser === data.chatId) {
        setMessages((prev) => {
          if (!prev) return null;

          return prev.map((msg) => {
            if (msg.sender === loggedInUser?._id && data.messageIds && data.messageIds.includes(msg._id)) {
              return {...msg, seen: true, seenAt: new Date()};
            } else if (msg.sender === loggedInUser?._id && !data.messageIds) {
              return {...msg, seen: true, seenAt: new Date()};
            }

            return msg;
          });
        });
      }
    });

    socket?.on("userTyping", (data) => {
      // console.log("received user typing", data);

      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) setIsTyping(true);
    });

    socket?.on("userStoppedTyping", (data) => {
      // console.log("received user stopped typing", data);

      if (data.chatId === selectedUser && data.userId !== loggedInUser?._id) setIsTyping(false);
    });

    return () => {
      socket?.off("newMessage");
      socket?.off("messagesSeen");
      socket?.off("userTyping");
      socket?.off("userStoppedTyping");
    };
  }, [socket, selectedUser, setChats, loggedInUser?._id]);

  const resetUnseenCount = (chatId: string) => {
    setChats((prev) => {
      if (!prev) return null;

      return prev.map((chat) => {
        if (chat.chat._id === chatId) {
          return {...chat, chat: {...chat.chat, unseenCount: 0}};
        }
        return chat;
      });
    });
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

  const fetchChat = async () => {
    const token = Cookies.get("chat-app-token");
    try {
      const data = await getMessagesByChat(token as string, selectedUser as string);
      setMessages(data.messages);
      setUser(data.user.user);
      await fetchChats();
    } catch {
      toast.error("Failed to load messages");
    }
  };

  useEffect(() => {
    if (selectedUser) {
      startTransition(async () => {
        await fetchChat();
        setIsTyping(false);

        resetUnseenCount(selectedUser);

        socket?.emit("joinChat", selectedUser);
      });
      return () => {
        socket?.emit("leaveChat", selectedUser);
        setMessages(null);
      };
    }
  }, [selectedUser, socket]);

  useEffect(() => {
    return () => {
      if (typingTimeOut) {
        clearTimeout(typingTimeOut);
      }
    };
  }, [typingTimeOut]);

  if (load) return <Loading></Loading>;

  return (
    <div className="max-h-screen flex bg-gray-900 text-white relative overflow-y-auto">
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
        onlineUsers={onlineUsers}
      />
      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-2 border-white/10 max-h-screen overflow-y-auto">
        <ChatHeader user={user} setSidebarOpen={setSidebarOpen} isTyping={isTyping} onlineUsers={onlineUsers} />

        <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />

        <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend}></MessageInput>
      </div>
    </div>
  );
};

export default ChatApp;
