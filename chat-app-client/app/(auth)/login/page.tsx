/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {login} from "@/app/service/auth/login";
import {ArrowRightToLine, Loader2, Mail} from "lucide-react";
import {useRouter} from "next/navigation";
import React, {useState} from "react";

const LoginPage = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);

    try {
      // const {data} = await axios.post(`http://localhost:5001/api/v1/login`, {email}); // when "use client" use -> localhost
      const data = await login(email);

      console.log(data);
      alert(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      alert(error.response.data.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="bg-gray-800 border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Mail size={40}></Mail>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Welcome To ChatApp</h1>
            <p className="text-gray-300 text-lg">Enter your email to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-4 bg-gray-700 border-gray-600 rounded-lg text-white placeholder-gray-400"
                placeholder="Enter Your email address"
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5"></Loader2> Sending OTP to your mail
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Send Verification Code</span>
                  <ArrowRightToLine className="w-5 h-5"></ArrowRightToLine>
                </div>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
