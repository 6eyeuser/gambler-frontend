"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Bulletproof Session Check
  useEffect(() => {
    api.get("/user/dashboard")
      .then(() => router.push("/dashboard"))
      .catch(() => setLoading(false));
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await api.post("/auth/login", { email, password });
        router.push("/dashboard");
      } else {
        await api.post("/auth/register", { email, password });
        setStep("OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/verify-otp", { email, otp });
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030305] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-zinc-400 font-medium tracking-wide text-sm">Securing Connection...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Background Ambient Glow Effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative bg-zinc-900/40 border border-white/10 p-8 sm:p-10 rounded-3xl w-full max-w-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] backdrop-blur-2xl">
        <div className="text-center mb-8">
          <h2 className="text-xs uppercase tracking-[0.2em] text-purple-400 font-semibold mb-2">GamblerPro Platform</h2>
          <h1 className="text-3xl font-extrabold tracking-tight">
            {step === "OTP" ? "Verify Code" : isLogin ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            {step === "OTP" ? `Enter the 6-digit code sent to ${email}` : "Enter your credentials to continue"}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 text-sm flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            {error}
          </div>
        )}

        {step === "FORM" ? (
          <>
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-black font-semibold py-3.5 rounded-2xl transition-all duration-200 mb-6 shadow-[0_0_25px_rgba(255,255,255,0.08)] hover:scale-[1.01] active:scale-[0.99]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              Continue with Google
            </a>

            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-500 text-xs uppercase tracking-wider font-semibold">or email</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-zinc-400 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-90 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(124,58,237,0.3)] disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Continue"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-6">
            <div>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-center text-3xl font-mono tracking-[0.6em] text-purple-300 placeholder-zinc-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                maxLength={6}
                placeholder="------"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-semibold py-3.5 rounded-2xl transition-all duration-200 shadow-[0_0_25px_rgba(124,58,237,0.3)] disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? "Verifying..." : "Verify & Enter"}
            </button>
          </form>
        )}

        {step === "FORM" && (
          <p className="text-center text-zinc-400 text-sm mt-8">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-purple-400 hover:text-purple-300 font-semibold transition-colors underline underline-offset-4"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}