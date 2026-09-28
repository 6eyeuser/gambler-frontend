"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../lib/axios";
import Navbar from "../../../components/Navbar";
import { Coins } from "lucide-react";

interface Drop {
  id: string;
  keyframes: string;
  finalIndex: number;
}

interface Hit {
  id: string;
  payout: number;
  multiplier: number;
  index: number;
}

export default function PlinkoPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string>("");
  const [balance, setBalance] = useState<number>(0);
  const [betAmount, setBetAmount] = useState<number>(100);
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"Manual" | "Auto">("Manual");
  const [risk, setRisk] = useState<"Low" | "Medium" | "High">("Medium");
  const [rows, setRows] = useState<number>(8);

  const [drops, setDrops] = useState<Drop[]>([]);
  const [hits, setHits] = useState<Hit[]>([]);
  const [activeBuckets, setActiveBuckets] = useState<{ [key: number]: number }>({});

  const getMultipliers = useCallback((r: number, riskLvl: string) => {
    let base = [];
    if (r === 8) base = [10, 3, 1.5, 0.5, 0, 0.5, 1.5, 3, 10];
    else {
      for (let i = 0; i <= r; i++) {
        const dist = Math.abs(i - r / 2);
        base.push(Number((Math.pow(1.4, dist) - 0.4).toFixed(1)));
      }
    }
    if (riskLvl === "Low") return base.map(b => Number((b * 0.6 + 0.4).toFixed(1)));
    if (riskLvl === "High") return base.map(b => Number((b * 1.5).toFixed(1)));
    return base;
  }, []);

  const multipliers = getMultipliers(rows, risk);

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

  const dx = Math.min(35, 500 / rows); 
  const dy = Math.min(35, 400 / rows);
  const startY = 60;

  const pegs: { x: number; y: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const numPegs = r + 1; 
    const rowStartX = 300 - ((numPegs - 1) * dx) / 2;
    for (let p = 0; p < numPegs; p++) {
      pegs.push({ x: rowStartX + p * dx, y: startY + r * dy });
    }
  }

  const bucketWidth = dx - 2; 
  const startBucketX = 300 - (rows * dx) / 2;
  const buckets = multipliers.map((mult, i) => ({
    x: startBucketX + i * dx,
    y: startY + rows * dy + 15,
    mult,
    index: i,
  }));

  const handlePlay = async () => {
    if (betAmount <= 0 || loading || balance < betAmount) return;
    if (!userId) {
      alert("Authenticating...");
      return;
    }

    setLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/plinko/bet`, {
        userId,
        amount: betAmount,
        rows,
        risk
      });

      const { bet } = res.data.data;
      const path = bet.path; 

      setBalance(prev => prev - betAmount);

      const dropId = `drop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const bx = (val: number) => (val - 8).toFixed(1); 
      const by = (val: number) => (val - 8).toFixed(1);

      let keyframes = `\n@keyframes anim_${dropId} {\n`;
      let curX = 300;
      let curY = startY; 

      keyframes += `  0% { transform: translate(${bx(curX)}px, ${by(curY - 40)}px); animation-timing-function: ease-in; }\n`;
      keyframes += `  ${(100 / (rows * 2 + 2)).toFixed(2)}% { transform: translate(${bx(curX)}px, ${by(curY - 12)}px); animation-timing-function: ease-out; }\n`;

      let curPct = 100 / (rows * 2 + 2);
      const pctStep = (100 - curPct - 5) / (rows * 2);
      let finalIndex = 0;

      for (let i = 0; i < path.length; i++) {
        const dir = path[i];
        const nextX = curX + (dir === "R" ? dx / 2 : -dx / 2);
        const nextY = curY + dy;

        const midX = curX + (dir === "R" ? dx / 4 : -dx / 4);
        const midY = curY - 20; 

        curPct += pctStep;
        keyframes += `  ${curPct.toFixed(2)}% { transform: translate(${bx(midX)}px, ${by(midY)}px); animation-timing-function: ease-in; }\n`;

        curPct += pctStep;
        keyframes += `  ${curPct.toFixed(2)}% { transform: translate(${bx(nextX)}px, ${by(nextY - 12)}px); animation-timing-function: ease-out; }\n`;

        curX = nextX;
        curY = nextY;
        if (dir === "R") finalIndex++;
      }

      keyframes += `  100% { transform: translate(${bx(curX)}px, ${by(curY + 30)}px); animation-timing-function: ease-in; }\n`;
      keyframes += `}`;

      setDrops((prev) => [...prev, { id: dropId, keyframes, finalIndex }]);
      setLoading(false);

      setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== dropId));
        setActiveBuckets((prev) => ({ ...prev, [finalIndex]: (prev[finalIndex] || 0) + 1 }));

        setBalance(prev => prev + bet.payout);

        const hitId = `hit_${Date.now()}`;
        setHits((prev) => [...prev, { id: hitId, payout: bet.payout, multiplier: bet.multiplier, index: finalIndex }]);

        setTimeout(() => {
          setActiveBuckets((prev) => ({ ...prev, [finalIndex]: Math.max(0, (prev[finalIndex] || 1) - 1) }));
        }, 300);

        setTimeout(() => {
          setHits((prev) => prev.filter((h) => h.id !== hitId));
        }, 1000);

      }, 2500);

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || err.message);
      setLoading(false); 
    }
  };

  const getBucketColor = (index: number, isActive: boolean) => {
    const isEdge = index === 0 || index === multipliers.length - 1;
    const isNearEdge = index === 1 || index === multipliers.length - 2;
    const isMid = index === 2 || index === multipliers.length - 3;
    
    const base = isActive ? "brightness-150 scale-110 shadow-[0_0_30px_currentColor] z-10 translate-y-[2px]" : "scale-100";
    
    if (isEdge) return `bg-red-600 border-red-800 text-white shadow-[0_4px_0_rgb(153,27,27)] ${base}`;
    if (isNearEdge) return `bg-orange-500 border-orange-700 text-white shadow-[0_4px_0_rgb(194,65,12)] ${base}`;
    if (isMid) return `bg-yellow-500 border-yellow-700 text-black shadow-[0_4px_0_rgb(161,98,7)] ${base}`;
    return `bg-yellow-400 border-yellow-600 text-black shadow-[0_4px_0_rgb(202,138,4)] ${base}`; 
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans overflow-x-hidden relative selection:bg-purple-500 selection:text-white">
      
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      <div className="max-w-[1300px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-start relative z-10">
        
        {/* LEFT SIDEBAR CONTROLS */}
        <div className="w-full md:w-[340px] bg-zinc-900/40 border border-white/10 rounded-3xl flex flex-col shadow-2xl shrink-0 p-6 backdrop-blur-2xl relative">
          
          <div className="flex bg-black/50 rounded-2xl p-1.5 mb-6 border border-white/10 shadow-inner">
            <button 
              onClick={() => setMode("Manual")}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${mode === "Manual" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "text-zinc-400 hover:text-white"}`}
            >
              Manual
            </button>
            <button 
              onClick={() => setMode("Auto")}
              className={`flex-1 py-2.5 text-xs font-black rounded-xl transition-all ${mode === "Auto" ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "text-zinc-400 hover:text-white"}`}
            >
              Auto
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">Risk Level</div>
              <div className="flex bg-black/50 rounded-2xl p-1.5 border border-white/10 shadow-inner">
                {["Low", "Medium", "High"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRisk(r as any)}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${risk === r ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-zinc-400 hover:text-white"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">Rows ({rows})</div>
              <div className="grid grid-cols-5 gap-1.5 bg-black/50 p-2 rounded-2xl border border-white/10 shadow-inner">
                {[8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
                  <button
                    key={num}
                    onClick={() => { if(drops.length === 0) setRows(num) }}
                    className={`h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all ${rows === num ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "text-zinc-400 hover:bg-white/5 hover:text-white"} ${drops.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-zinc-400 font-black uppercase tracking-wider mb-2">Bet Amount (₹)</div>
              <div className="flex bg-black/50 rounded-2xl p-1.5 relative border border-white/10 shadow-inner">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="w-full bg-transparent text-white font-black p-2.5 outline-none pl-3 text-lg"
                />
                <div className="flex gap-1 items-center">
                  <button onClick={() => setBetAmount(prev => Math.max(1, prev / 2))} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-black px-3 py-2 rounded-xl transition-all">/2</button>
                  <button onClick={() => setBetAmount(prev => prev * 2)} className="bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-black px-3 py-2 rounded-xl transition-all">2x</button>
                </div>
              </div>
            </div>

            <button
              onClick={handlePlay}
              disabled={loading || !userId}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(59,130,246,0.3)] text-lg tracking-wide disabled:opacity-50 mt-4"
            >
              {loading ? "PROCESSING..." : "BET"}
            </button>

            <div className="flex items-center justify-between pt-4 border-t border-white/10 text-zinc-400">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-yellow-500" /> Balance:
              </span>
              <span className="font-black text-white text-base">₹{balance.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* RIGHT GAME BOARD */}
        <div className="flex-1 bg-zinc-900/45 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex items-center justify-center min-h-[620px] relative z-10 backdrop-blur-2xl">
          
          <style dangerouslySetInnerHTML={{ __html: drops.map(d => d.keyframes).join("\n") }} />

          <h1 className="absolute top-10 left-1/2 -translate-x-1/2 text-[120px] font-black text-white/[0.015] tracking-tighter select-none pointer-events-none">
            PLINKO
          </h1>

          <div className="relative w-[600px] h-[550px] scale-90 md:scale-100 transform origin-center">
            
            {pegs.map((peg, i) => (
              <div 
                key={i}
                className="absolute w-2 h-2 bg-zinc-200 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                style={{ 
                  left: `${peg.x - 4}px`, 
                  top: `${peg.y - 4}px`,
                }}
              />
            ))}

            {buckets.map((bucket) => (
              <div 
                key={bucket.index}
                className={`absolute h-8 rounded-xl flex items-center justify-center text-[10px] font-black border-b-[3px] transition-all duration-100 ${getBucketColor(bucket.index, (activeBuckets[bucket.index] || 0) > 0)}`}
                style={{ 
                  left: `${bucket.x - bucketWidth / 2}px`, 
                  top: `${bucket.y - 16}px`,
                  width: `${bucketWidth}px`
                }}
              >
                {bucket.mult}x
              </div>
            ))}

            {drops.map((drop) => (
              <div 
                key={drop.id}
                className="absolute w-4 h-4 bg-blue-500 rounded-full z-20 pointer-events-none"
                style={{
                  left: 0,
                  top: 0,
                  animation: `anim_${drop.id} 2.5s forwards`, 
                  boxShadow: '0 0 15px rgba(59,130,246,1), inset 0 -2px 4px rgba(0,0,0,0.5)'
                }}
              />
            ))}
            
            {hits.map((hit) => {
              const bucket = buckets[hit.index];
              return (
                <div 
                  key={hit.id}
                  className={`absolute z-30 pointer-events-none font-black text-xl animate-out fade-out slide-out-to-top-8 duration-1000 ${hit.payout > betAmount ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'text-zinc-500'}`}
                  style={{
                    left: `${bucket.x}px`,
                    top: `${bucket.y - 30}px`,
                    transform: 'translate(-50%, -50%)',
                    animation: 'floatUp 1s ease-out forwards'
                  }}
                >
                  {hit.payout > betAmount ? `+₹${hit.payout.toFixed(0)}` : `₹${hit.payout.toFixed(0)}`}
                </div>
              );
            })}

            <style dangerouslySetInnerHTML={{__html: `
              @keyframes floatUp {
                0% { opacity: 1; transform: translate(-50%, 0) scale(0.8); }
                20% { transform: translate(-50%, -15px) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -40px) scale(1); }
              }
            `}} />
            
          </div>
        </div>
      </div>
    </div>
  );
}