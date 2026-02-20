"use client";

import {useEffect} from "react";
import {useAppData} from "../context/AppContext";
import {redirect} from "next/navigation";
import Loading from "../components/Loading";

const ChatApp = () => {
  const {isAuth, loading: load} = useAppData();

  useEffect(() => {
    if (!isAuth && !load) redirect("/login");
  }, [isAuth, load]);

  if (load) return <Loading></Loading>;

  return <div>ChatApp</div>;
};

export default ChatApp;
