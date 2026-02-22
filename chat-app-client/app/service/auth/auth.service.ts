"use server";

import config from "@/app/env";
import axios from "axios";

export const login = async (email: string) => {
  const {data} = await axios.post(`${config.user_service_base_url}/login`, {email});

  return data;
};

export const verifyOTP = async (email: string, otp: string) => {
  const {data} = await axios.post(`${config.user_service_base_url}/verify-user`, {email, otp});

  return data;
};

export const profile = async (token: string) => {
  const {data} = await axios.get(`${config.user_service_base_url}/my-profile`, {headers: {Authorization: `Bearer ${token}`}});

  return data.user;
};

export const getChatUsers = async (token: string) => {
  const {data} = await axios.get(`${config.user_service_base_url}/get-users`, {headers: {Authorization: `Bearer ${token}`}});

  return data.users;
};

export const updateProfile = async (token: string, payload: {name: string | undefined; bio: string | undefined; about: string | undefined}) => {
  const {data} = await axios.patch(`${config.user_service_base_url}/update-profile`, payload, {headers: {Authorization: `Bearer ${token}`}});

  return data.user;
};
