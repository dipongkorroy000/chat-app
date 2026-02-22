/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {useEffect, useState} from "react";
import {useAppData} from "../context/AppContext";
import {useRouter} from "next/navigation";
import {updateProfile} from "../service/auth/auth.service";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import Loading from "../components/Loading";
import {ArrowLeft, Save, UserCircle} from "lucide-react";

interface ProfileUpdate {
  name: string;
  bio: string;
  about: string;
}

const ProfilePage = () => {
  const {user, loading, isAuth, setUser} = useAppData();
  const router = useRouter();

  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState<ProfileUpdate>({
    name: user?.name || "",
    bio: user?.bio || "",
    about: user?.about || "",
  });

  useEffect(() => {
    if (!isAuth && !loading) router.push("/login");
  }, [isAuth, router, loading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {name, value} = e.target;
    setFormData((prev) => ({...prev, [name]: value}));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("chat-app-token");
    try {
      const data = await updateProfile(token as string, {name: formData.name, bio: formData.bio, about: formData.about});

      if (data.success) {
        toast.success(data.message);
        setUser(data);
        setIsEdit(false);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.push("/chat")} className="p-3 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700">
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account information</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
          <div className="bg-gray-700 p-8 border-b border-gray-600">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-600 flex items-center justify-center">
                  <UserCircle className="w-12 h-12 text-gray-300" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">{user?.name}</h2>
                <p className="text-gray-300 text-sm">Active now</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {isEdit ? (
              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Display Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Bio</label>
                  <input
                    type="text"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                {/* About */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">About</label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"
                  />
                </div>

                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg" type="submit">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>

                  <button
                    onClick={() => setIsEdit(false)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border-gray-600">
                  <span className="text-white font-medium text-lg">{user?.name || "No name set"}</span>
                  <button
                    onClick={() => setIsEdit(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg"
                  >
                    Edit
                  </button>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg border-gray-600">
                  <p className="text-gray-300">
                    <strong>Bio:</strong> {user?.bio || "No bio set"}
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>About:</strong> {user?.about || "No about info set"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
