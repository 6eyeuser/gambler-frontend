"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/axios";
import Navbar from "../../../components/Navbar";
import { Coins, Bomb, Gem, X, CheckCircle2, Flame } from "lucide-react";

export default function MinesPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(100);
  const [minesCount, setMinesCount] = useState<number>(3);

  // Game States
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [revealedTiles, setRevealedTiles] = useState<number[]>([]);
  const [minePositions, setMinePositions] = useState<number[]>([]);
  const [multiplier, setMultiplier] = useState<number>(1.00);
  const [currentPayout, setCurrentPayout] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [hitBoom, setHitBoom] = useState<boolean>(false);

  // Custom Aesthetic Modal State
  const [cashoutModal, setCashoutModal] = useState<{ show: boolean; payout: number; mult: number } | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/dashboard");
        setUserId(res.data.data.id);
        const inrWallet = res.data.data.wallets?.find((w: any) => w.currency === "INR");
        if (inrWallet) setBalance(inrWallet.balance);
      } catch (error) {
        router.push("/auth");
      }
    };
    fetchUser();
  }, [router]);

  const handleStartGame = async () => {
    if (betAmount <= 0 || balance < betAmount || loading) return;
    setLoading(true);
    setHitBoom(false);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/mines/start`, {
        userId,
        amount: betAmount,
        minesCount,
      });

      setBalance(res.data.data.newBalance);
      setGameStarted(true);
      setRevealedTiles([]);
      setMinePositions([]);
      setMultiplier(1.00);
      setCurrentPayout(betAmount);
      setGameOver(false);
      setCashoutModal(null);
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to start game.");
    } finally {
      setLoading(false);
    }
  };

  const handleTileClick = async (tileIndex: number) => {
    if (!gameStarted || gameOver || revealedTiles.includes(tileIndex) || loading) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/mines/reveal`, {
        userId,
        tileIndex,
      });

      const { hitMine, minePositions: mines, multiplier: mult, payout, revealedTiles: revealed } = res.data.data;

      if (hitMine) {
        setMinePositions(mines);
        setGameOver(true);
        setGameStarted(false);
        setHitBoom(true);
      } else {
        setRevealedTiles(revealed);
        setMultiplier(mult);
        setCurrentPayout(payout);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Action failed.");
    }
  };

  const handleCashout = async () => {
    if (!gameStarted || gameOver || revealedTiles.length === 0 || loading) return;
    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/mines/cashout`, {
        userId,
      });

      const { payout, multiplier: finalMult, newBalance, minePositions: mines } = res.data.data;
      setBalance(newBalance);
      setMinePositions(mines);
      setGameOver(true);
      setGameStarted(false);
      
      setCashoutModal({ show: true, payout, mult: finalMult });
    } catch (err: any) {
      alert(err.response?.data?.error || "Cashout failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans overflow-x-hidden relative selection:bg-amber-500 selection:text-black">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      {/* CUSTOM GLOWING VICTORY MODAL */}
      {cashoutModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#161b2c] to-[#0d111a] border-2 border-emerald-500/50 rounded-3xl p-8 shadow-[0_0_60px_rgba(16,185,129,0.25)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            
            <button 
              onClick={() => setCashoutModal(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-white/5 p-2 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20 mb-3">
              Cashed Out Successfully
            </span>

            <h3 className="text-4xl font-black text-white mb-2 tracking-tight">
              +₹{cashoutModal.payout.toFixed(2)}
            </h3>
            <p className="text-sm text-zinc-400 font-bold mb-8">
              Total Multiplier: <span className="text-emerald-400 font-black">{cashoutModal.mult}x</span>
            </p>

            <button
              onClick={() => setCashoutModal(null)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black py-4 rounded-2xl shadow-[0_4px_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 text-base tracking-wide"
            >
              CONTINUE PLAYING
            </button>
          </div>
        </div>
      )}

      <div className="max-w-[1300px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-start relative z-10">
        
        {/* LEFT SIDEBAR CONTROLS */}
        <div className="w-full md:w-[340px] bg-zinc-900/40 border border-white/10 rounded-3xl flex flex-col shadow-2xl shrink-0 p-6 backdrop-blur-2xl relative">
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5 text-amber-400">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Bomb className="w-5 h-5" />
              </div>
              <span className="font-black uppercase tracking-wider text-sm">Minesweeper</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 border border-white/10">
              5x5 Grid
            </span>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">Bet Amount (₹)</div>
              <div className="flex bg-black/50 rounded-2xl p-1.5 relative border border-white/10 shadow-inner">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={gameStarted}
                  className="w-full bg-transparent text-white font-black p-2.5 outline-none pl-3 disabled:opacity-50 text-lg"
                />
                <div className="flex gap-1 items-center">
                  <button onClick={() => setBetAmount(prev => Math.max(1, prev / 2))} disabled={gameStarted} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-black px-3 py-2 rounded-xl transition-all">/2</button>
                  <button onClick={() => setBetAmount(prev => prev * 2)} disabled={gameStarted} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-black px-3 py-2 rounded-xl transition-all">2x</button>
                </div>
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">Mines Count (1 - 24)</div>
              <select
                value={minesCount}
                onChange={(e) => setMinesCount(Number(e.target.value))}
                disabled={gameStarted}
                className="w-full bg-black/50 border border-white/10 rounded-2xl p-4 text-white font-black outline-none disabled:opacity-50 shadow-inner cursor-pointer"
              >
                {Array.from({ length: 24 }).map((_, i) => (
                  <option key={i + 1} value={i + 1} className="bg-zinc-900 text-white font-bold">
                    {i + 1} Mine{i > 0 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>

            {!gameStarted ? (
              <button
                onClick={handleStartGame}
                disabled={loading || !userId}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] text-lg tracking-wide disabled:opacity-50 mt-4"
              >
                {loading ? "INITIALIZING..." : "BET"}
              </button>
            ) : (
              <button
                onClick={handleCashout}
                disabled={loading || revealedTiles.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-black font-black py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] text-lg tracking-wide disabled:opacity-50 mt-4 flex flex-col items-center leading-tight"
              >
                <span>CASH OUT</span>
                <span className="text-xs opacity-80 font-bold">₹{currentPayout.toFixed(2)} ({multiplier}x)</span>
              </button>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-500" /> Balance:
              </span>
              <span className="font-black text-white text-base">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT GAME BOARD (5x5 Grid) */}
        <div className={`flex-1 bg-zinc-900/40 rounded-3xl border ${hitBoom ? 'border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.2)]' : 'border-white/10 shadow-2xl'} overflow-hidden flex flex-col items-center justify-center min-h-[600px] relative z-10 p-8 backdrop-blur-2xl transition-all duration-300`}>
          
          {/* Cyberpunk Top Stat Bar */}
          {gameStarted && (
            <div className="absolute top-6 flex gap-4 bg-black/40 border border-white/10 px-6 py-2.5 rounded-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 border-r border-white/10 pr-4">
                <span className="text-xs text-zinc-400 font-bold uppercase">Multiplier:</span>
                <span className="text-emerald-400 font-black text-lg">{multiplier}x</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-bold uppercase">Profit:</span>
                <span className="text-white font-black text-lg">+₹{(currentPayout - betAmount).toFixed(2)}</span>
              </div>
            </div>
          )}

          <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[140px] font-black text-white/[0.015] tracking-tighter select-none pointer-events-none">
            MINES
          </h1>

          {/* 5x5 Grid Container */}
          <div className="grid grid-cols-5 gap-3.5 w-full max-w-[460px] relative z-20">
            {Array.from({ length: 25 }).map((_, index) => {
              const isRevealed = revealedTiles.includes(index);
              const isMine = minePositions.includes(index);

              let tileStyle = "bg-zinc-800/60 border-white/10 hover:border-blue-500/50 hover:bg-zinc-800 hover:scale-[1.03]";
              
              if (isRevealed) {
                tileStyle = "bg-blue-600/20 border-blue-500/60 text-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.3)] scale-[1.02]";
              } else if (gameOver && isMine) {
                tileStyle = "bg-red-600/20 border-red-500/60 text-red-500 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse";
              } else if (gameOver && !isRevealed && !isMine) {
                tileStyle = "bg-zinc-900/50 border-white/5 opacity-40";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleTileClick(index)}
                  disabled={!gameStarted || gameOver || isRevealed}
                  className={`aspect-square rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all duration-300 ${tileStyle} disabled:cursor-not-allowed`}
                >
                  {isRevealed && <Gem className="w-9 h-9 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)] animate-in zoom-in duration-200" />}
                  {gameOver && isMine && <Bomb className="w-9 h-9 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-in zoom-in duration-200" />}
                </button>
              );
            })}
          </div>

          {/* Game Over Warning Banner */}
          {gameOver && hitBoom && (
            <div className="absolute bottom-6 bg-red-950/80 border border-red-500/40 text-red-400 px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-wider backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-300 flex items-center gap-2">
              <Flame className="w-4 h-4" /> Boom! You hit a mine. Better luck next round.
            </div>
          )}

        </div>
      </div>
    </div>
  );
}