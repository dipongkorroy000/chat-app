/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {ArrowRight, Loader2, Lock} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";
import {useEffect, useRef, useState} from "react";
import {verifyOTP} from "../service/auth/login";

const VerifyOTP = () => {
  const searchParams = useSearchParams();
  const email: string = searchParams.get("email") || "";

  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [otp, setOTP] = useState<string[]>(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOTP = digits.split("");
      setOTP(newOTP);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please Enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);

    try {
      //   const data = await verifyOTP(email, otpString);

      //   console.log(data);
      //   cookies setup

      //   alert(data.message);
      router.push(`/success`);
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
              <Lock size={40}></Lock>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">Verify Your Email</h1>
            <p className="text-gray-300 text-lg">We have sent a 6 digit code to</p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter your 6 digit OTP here
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(e: HTMLInputElement | null) => {
                      inputRefs.current[i] = e;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700 text-white"
                  ></input>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3">
                <p className="text-red-300 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5"></Loader2> Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span>Verify</span>
                  <ArrowRight className="w-5 h-5"></ArrowRight>
                </div>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm mb-4">Did&apos;t receive the code? </p>
            {timer > 0 ? (
              <p className="text-gray-400 text-sm">Resend code in {timer} seconds</p>
            ) : (
              <button className="text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50" disabled={loading}>
                {loading ? "Sending..." : "Resend Code"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
