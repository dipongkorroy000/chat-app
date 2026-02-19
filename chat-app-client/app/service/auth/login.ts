"use server";

import config from "@/app/env";
import axios from "axios";

export const login = async (email: string) => {
  const {data} = await axios.post(`${config.user_service_base_url}/login`, {email});

  return data;
};
