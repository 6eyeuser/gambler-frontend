"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/axios";
import Navbar from "../../../components/Navbar";
import { Coins, Rocket, AlertTriangle, Clock } from "lucide-react";
import { io, Socket } from "socket.io-client";

export default function CrashPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [loading, setLoading] = useState(false);

  // Live Game States from WebSocket
  const [gameState, setGameState] = useState<"WAITING" | "PLAYING" | "CRASHED">("WAITING");
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [countdown, setCountdown] = useState<number>(10);
  const [crashPoint, setCrashPoint] = useState<number | null>(null);

  // User Bet States
  const [betStatus, setBetStatus] = useState<"IDLE" | "PLACED" | "CASHED_OUT">("IDLE");
  const [winAmount, setWinAmount] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // 1. Fetch User Session
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/dashboard");
        setUserId(res.data.data.id);
        const inrWallet = res.data.data.wallets?.find((w: any) => w.currency === "INR");
        if (inrWallet) setBalance(inrWallet.balance);
      } catch (error) {
        console.error("Auth error:", error);
        router.push("/auth");
      }
    };
    fetchUser();

    // 2. Connect WebSockets using dynamic environment URL
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on("crash_state", (data: any) => {
      setGameState(data.state);
      setMultiplier(Number(data.multiplier));
      
      if (data.countdown !== undefined) setCountdown(data.countdown);
      if (data.crashPoint !== undefined) setCrashPoint(Number(data.crashPoint));

      if (data.state === "WAITING" && data.countdown === 10) {
        setBetStatus((prev) => (prev === "PLACED" ? "PLACED" : "IDLE"));
        setWinAmount(null);
        setCrashPoint(null);
      }

      if (data.state === "CRASHED") {
        setBetStatus((prev) => {
          if (prev === "PLACED") return "IDLE";
          return prev;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [router]);

  const handleBet = async () => {
    if (betAmount <= 0 || loading || balance < betAmount) return;
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      await api.post(`${backendUrl}/api/v1/crash/bet`, {
        userId,
        amount: betAmount,
      });

      setBalance((prev) => prev - betAmount);
      setBetStatus("PLACED");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to place bet.");
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    if (loading || betStatus !== "PLACED") return;
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/crash/cashout`, {
        userId,
      });

      const { payout } = res.data.data;
      setBalance((prev) => prev + payout);
      setWinAmount(payout);
      setBetStatus("CASHED_OUT");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to cash out.");
    } finally {
      setLoading(false);
    }
  };

  const renderActionBox = () => {
    if (gameState === "WAITING") {
      if (betStatus === "PLACED") {
        return (
          <button disabled className="w-full bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold py-4 rounded-2xl text-base opacity-80 cursor-not-allowed">
            WAITING FOR ROUND...
          </button>
        );
      }
      return (
        <button
          onClick={handleBet}
          disabled={loading || !userId}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:scale-[1.01] active:scale-[0.99] text-base tracking-wide disabled:opacity-50"
        >
          {loading ? "Processing..." : "PLACE BET"}
        </button>
      );
    }

    if (gameState === "PLAYING") {
      if (betStatus === "PLACED") {
        const currentPayout = (betAmount * multiplier).toFixed(2);
        return (
          <button
            onClick={handleCashout}
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] hover:scale-[1.01] active:scale-[0.99] text-lg tracking-wide flex flex-col items-center leading-tight"
          >
            <span>CASH OUT</span>
            <span className="text-xs font-semibold opacity-80">₹{currentPayout}</span>
          </button>
        );
      }
      if (betStatus === "CASHED_OUT") {
        return (
          <button disabled className="w-full bg-zinc-900 border border-emerald-500/30 text-emerald-400 font-bold py-4 rounded-2xl text-base cursor-not-allowed">
            CASHED OUT: ₹{winAmount?.toFixed(2)}
          </button>
        );
      }
      return (
        <button disabled className="w-full bg-zinc-900 border border-white/5 text-zinc-500 font-bold py-4 rounded-2xl text-base cursor-not-allowed">
          GAME IN PROGRESS
        </button>
      );
    }

    return (
      <button disabled className="w-full bg-zinc-900 border border-red-500/20 text-red-400 font-bold py-4 rounded-2xl text-base cursor-not-allowed">
        ROUND ENDED
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans selection:bg-purple-500 selection:text-white">
      <Navbar />

      <div className="max-w-[1280px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT CONTROLS PANEL */}
        <div className="w-full lg:w-[340px] bg-zinc-900/40 border border-white/10 rounded-3xl flex flex-col shadow-2xl backdrop-blur-2xl p-6 shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5 text-blue-400">
              <Rocket className="w-5 h-5" />
              <span className="font-bold tracking-wide text-sm uppercase">Crash Module</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-semibold text-zinc-400 mb-2">
                <span>BET AMOUNT (₹)</span>
                <span className="text-zinc-500">Balance: ₹{balance.toFixed(2)}</span>
              </div>
              <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/10 focus-within:border-purple-500 transition-colors">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState === "PLAYING" || betStatus === "PLACED"}
                  className="w-full bg-transparent text-white font-bold px-3 py-2 outline-none text-base disabled:opacity-50"
                />
                <div className="flex gap-1">
                  <button onClick={() => setBetAmount(prev => Math.max(1, prev / 2))} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold px-3 rounded-xl transition-colors">/2</button>
                  <button onClick={() => setBetAmount(prev => prev * 2)} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-bold px-3 rounded-xl transition-colors">2x</button>
                </div>
              </div>
            </div>

            <div>
              {renderActionBox()}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
              <span className="text-zinc-500 font-medium">Active Wallet</span>
              <div className="flex items-center gap-1.5 font-bold text-zinc-200">
                <Coins className="w-3.5 h-3.5 text-yellow-500" />
                <span>₹{balance.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT GAME BOARD */}
        <div className="flex-1 bg-zinc-900/40 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl overflow-hidden flex items-center justify-center min-h-[520px] relative p-8">
          
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative z-20 flex flex-col items-center justify-center text-center">
            {gameState === "WAITING" && (
              <div className="flex flex-col items-center animate-pulse">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                  <Clock className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-extrabold tracking-tight text-white mb-2">Next Round in {countdown}s</h2>
                <p className="text-zinc-500 text-sm font-medium tracking-wide">Place your bets before takeoff</p>
              </div>
            )}

            {gameState === "PLAYING" && (
              <div className="flex flex-col items-center">
                <span className="text-7xl sm:text-9xl font-black tracking-tighter text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                  {multiplier.toFixed(2)}x
                </span>
                <span className="text-blue-400 font-semibold uppercase tracking-[0.2em] mt-4 animate-bounce flex items-center gap-2 text-sm">
                  <Rocket className="w-4 h-4" /> Rocket Ascending...
                </span>
              </div>
            )}

            {gameState === "CRASHED" && (
              <div className="flex flex-col items-center">
                <span className="text-7xl sm:text-9xl font-black tracking-tighter text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.4)]">
                  {crashPoint?.toFixed(2)}x
                </span>
                <span className="text-red-400 font-semibold uppercase tracking-[0.2em] mt-4 flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-4 h-4" /> Round Crashed
                </span>
              </div>
            )}
          </div>

          {gameState === "PLAYING" && (
            <div className="absolute bottom-0 left-0 w-full h-[240px] pointer-events-none overflow-hidden opacity-30">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-blue-500 stroke-[2px] fill-gradient">
                <path d={`M 0 100 Q ${Math.min(100, multiplier * 10)} ${100 - Math.min(100, multiplier * 15)} 100 0 L 100 100 Z`} />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}