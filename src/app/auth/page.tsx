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
  const [loading, setLoading] = useState(true); // Start loading while checking session

  // Bulletproof Session Check
  useEffect(() => {
    api.get("/user/dashboard")
      .then(() => router.push("/dashboard")) // Already logged in? Get out of here.
      .catch(() => setLoading(false)); // Not logged in? Show the form.
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
    return <div className="min-h-screen bg-[#030305] flex items-center justify-center text-white font-bold">Checking Secure Connection...</div>;
  }

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 text-white">
      <div className="bg-zinc-900/60 border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl backdrop-blur-xl">
        <h1 className="text-3xl font-bold text-center mb-8">
          {step === "OTP" ? "Check Your Email" : isLogin ? "Welcome Back" : "Create Account"}
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {step === "FORM" ? (
          <>
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/google`}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-200 text-black font-bold py-3 rounded-xl transition-colors mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Continue with Google
            </a>

            <div className="relative flex items-center py-2 mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="flex-shrink-0 mx-4 text-zinc-500 text-sm font-medium">or</span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
              >
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
              </button>
            </form>
          </>
        ) : (
          <form onSubmit={handleOtpVerify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">6-Digit Code</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-blue-500 transition-colors"
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify & Play"}
            </button>
          </form>
        )}

        {step === "FORM" && (
          <p className="text-center text-zinc-400 text-sm mt-6">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in instead"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
}