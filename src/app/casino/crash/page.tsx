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
    // 1. Fetch User
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

    // 2. Connect WebSockets
    const socket = io("http://localhost:8080");
    socketRef.current = socket;

    socket.on("crash_state", (data: any) => {
      setGameState(data.state);
      setMultiplier(Number(data.multiplier));
      
      if (data.countdown !== undefined) setCountdown(data.countdown);
      if (data.crashPoint !== undefined) setCrashPoint(Number(data.crashPoint));

      // Reset bet status automatically when a new round starts
      if (data.state === "WAITING" && data.countdown === 10) {
        setBetStatus((prev) => (prev === "PLACED" ? "PLACED" : "IDLE"));
        setWinAmount(null);
        setCrashPoint(null);
      }

      // If the game crashes and the user didn't cash out, they lose
      if (data.state === "CRASHED") {
        setBetStatus((prev) => {
          if (prev === "PLACED") return "IDLE"; // Lost
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
      await api.post("http://localhost:8080/api/v1/crash/bet", {
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
      const res = await api.post("http://localhost:8080/api/v1/crash/cashout", {
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

  // --- Dynamic Button Rendering ---
  const renderActionBox = () => {
    if (gameState === "WAITING") {
      if (betStatus === "PLACED") {
        return (
          <button disabled className="w-full bg-green-600/50 text-white font-black py-4 rounded-xl shadow-[0_4px_0_rgba(22,163,74,0.5)] text-lg opacity-80 cursor-not-allowed">
            WAITING FOR ROUND...
          </button>
        );
      }
      return (
        <button
          onClick={handleBet}
          disabled={loading || !userId}
          className="w-full bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-black py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(29,78,216)] active:translate-y-[4px] active:shadow-none text-lg tracking-wide disabled:opacity-50"
        >
          {loading ? "..." : "PLACE BET"}
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
            className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-black font-black py-4 rounded-xl transition-all shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-[4px] active:shadow-none text-xl tracking-wide flex flex-col items-center leading-tight"
          >
            <span>CASH OUT</span>
            <span className="text-sm opacity-80">₹{currentPayout}</span>
          </button>
        );
      }
      if (betStatus === "CASHED_OUT") {
        return (
          <button disabled className="w-full bg-zinc-800 text-green-400 border border-green-500/30 font-black py-4 rounded-xl text-lg opacity-80 cursor-not-allowed">
            CASHED OUT: ₹{winAmount?.toFixed(2)}
          </button>
        );
      }
      return (
        <button disabled className="w-full bg-zinc-800 text-zinc-500 font-black py-4 rounded-xl text-lg cursor-not-allowed">
          GAME IN PROGRESS
        </button>
      );
    }

    // CRASHED
    return (
      <button disabled className="w-full bg-zinc-800 text-zinc-500 font-black py-4 rounded-xl text-lg cursor-not-allowed">
        CRASHED
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#090b14] text-white font-sans overflow-x-hidden">
      <Navbar />

      <div className="max-w-[1200px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT SIDEBAR CONTROLS */}
        <div className="w-full md:w-[320px] bg-[#1a1f2e] border border-white/5 rounded-2xl flex flex-col shadow-2xl shrink-0 p-4 relative z-20">
          
          <div className="flex items-center gap-2 mb-6 p-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
            <Rocket className="w-5 h-5" />
            <span className="font-black uppercase tracking-wider text-sm">Crash</span>
          </div>

          <div className="space-y-6">
            <div>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-2">Bet Amount (₹)</div>
              <div className="flex bg-black/40 rounded-lg p-1 relative border border-white/5">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameState === "PLAYING" || betStatus === "PLACED"}
                  className="w-full bg-transparent text-white font-bold p-2 outline-none pl-3 disabled:opacity-50"
                />
                <div className="flex gap-1 p-1">
                  <button onClick={() => setBetAmount(prev => Math.max(1, prev / 2))} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-3 rounded">/2</button>
                  <button onClick={() => setBetAmount(prev => prev * 2)} className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold px-3 rounded">x2</button>
                </div>
              </div>
            </div>

            <div className="mt-4">
              {renderActionBox()}
            </div>

            <div className="flex items-center justify-center gap-2 text-zinc-400 pt-2 border-t border-white/5">
              <Coins className="w-4 h-4 text-yellow-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Balance:</span>
              <span className="font-black text-white">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT GAME BOARD */}
        <div className="flex-1 bg-[#121624] rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex items-center justify-center min-h-[500px] relative z-10 p-8">
          
          {/* Decorative Grid Background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

          {/* MAIN GRAPH DISPLAY */}
          <div className="relative z-20 flex flex-col items-center justify-center">
            
            {gameState === "WAITING" && (
              <div className="flex flex-col items-center text-center animate-pulse">
                <Clock className="w-16 h-16 text-blue-500 mb-4" />
                <h2 className="text-3xl font-black tracking-tight text-white">Starting in {countdown}s</h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm mt-2">Place your bets</p>
              </div>
            )}

            {gameState === "PLAYING" && (
              <div className="flex flex-col items-center">
                <span className="text-[120px] font-black leading-none tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  {multiplier.toFixed(2)}x
                </span>
                <span className="text-blue-500 font-black uppercase tracking-widest mt-2 animate-bounce flex items-center gap-2">
                  <Rocket className="w-5 h-5" /> Flying...
                </span>
              </div>
            )}

            {gameState === "CRASHED" && (
              <div className="flex flex-col items-center">
                <span className="text-[120px] font-black leading-none tracking-tighter text-red-500 drop-shadow-[0_0_40px_rgba(239,68,68,0.4)]">
                  {crashPoint?.toFixed(2)}x
                </span>
                <span className="text-red-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Crashed
                </span>
              </div>
            )}

          </div>

          {/* Rising Line Visualizer (Only visible while playing) */}
          {gameState === "PLAYING" && (
            <div className="absolute bottom-0 left-0 w-full h-[300px] pointer-events-none overflow-hidden opacity-50">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-blue-500 stroke-[1px] fill-blue-500/10">
                <path d={`M 0 100 Q ${Math.min(100, multiplier * 10)} ${100 - Math.min(100, multiplier * 15)} 100 0 L 100 100 Z`} />
              </svg>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}