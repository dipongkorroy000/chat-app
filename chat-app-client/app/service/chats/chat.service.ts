"use server";

import config from "@/app/env";
import axios from "axios";

export const getUserChats = async (token: string) => {
  const {data} = await axios.get(`${config.chat_service_base_url}/chat/all`, {headers: {Authorization: `Bearer ${token}`}});

  return data.chats;
};

export const createNewChat = async (token: string, otherUserId: string) => {
  const {data} = await axios.post(`${config.chat_service_base_url}/chat/new`, {otherUserId}, {headers: {Authorization: `Bearer ${token}`}});

  return data;
};

export const getMessagesByChat = async (token: string, chatId: string) => {
  const {data} = await axios.get(`${config.chat_service_base_url}/message/${chatId}`, {headers: {Authorization: `Bearer ${token}`}});

  return data;
};

export const sendMessage = async (token: string, formData: FormData) => {
  const {data} = await axios.post(`${config.chat_service_base_url}/message`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
