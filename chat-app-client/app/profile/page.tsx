"use client";

import {useAppData} from "../context/AppContext";

const ProfilePage = () => {
  const {user} = useAppData();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <h2>Profile page</h2>
      <h2>User Name: {user?.name as string}</h2>
      <h2>User Name: {user?.email as string}</h2>
    </div>
  );
};

export default ProfilePage;
