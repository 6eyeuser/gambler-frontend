"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import { Receipt, Clock, CheckCircle2, XCircle, TrendingUp, AlertCircle } from "lucide-react";

interface Match {
  id: string;
  sportGroup: string;
  teamA: string;
  teamB: string;
  startTime: string;
  status: string;
}

interface Bet {
  id: string;
  amount: number;
  guess: string;
  lockedOdds: number;
  createdAt: string;
  status?: string; 
  match: Match;
}

export default function Dashboard() {
  const router = useRouter();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBets = async () => {
      try {
        // Direct absolute fetch with credentials to guarantee proper domain hitting
        const res = await fetch("https://gambler-backend-production-b2fe.up.railway.app/api/v1/sports/bets", {
          credentials: "include",
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to load bet history.");
        
        setBets(data.data);
      } catch (err: any) {
        setError(err.message || "Failed to load bet history.");
      } finally {
        setLoading(false);
      }
    };
    fetchBets();
  }, []);

  const getGuessName = (guess: string, match: Match) => {
    if (guess === "TEAM_A") return match.teamA;
    if (guess === "TEAM_B") return match.teamB;
    return "Draw";
  };

  const getStatusIcon = (status: string | undefined) => {
    switch (status) {
      case "WON": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "LOST": return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Clock className="w-4 h-4 text-blue-400 animate-spin" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      <div className="max-w-[1300px] mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 pb-6 border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
              <Receipt className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">My Bets & History</h1>
              <p className="text-zinc-400 text-sm mt-1">Track your active prediction slips and past performance</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-zinc-500 font-medium gap-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm tracking-wider uppercase font-semibold">Loading Bet History...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 font-semibold flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" /> {error}
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-28 bg-zinc-900/40 rounded-3xl border border-white/10 backdrop-blur-2xl">
            <Receipt className="w-12 h-12 text-zinc-600 mx-auto mb-4 stroke-[1.5]" />
            <h3 className="text-xl font-bold text-white mb-2">No bets placed yet</h3>
            <p className="text-zinc-400 text-sm">Head over to the sportsbook or lobby to lock in your first prediction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-2xl flex flex-col hover:border-white/20 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {bet.match?.sportGroup || "SPORTS"}
                    </span>
                    <div className="text-xs text-zinc-500 mt-2.5 font-medium">
                      Placed on {new Date(bet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-black/40 px-3.5 py-1.5 rounded-xl border border-white/10">
                    {getStatusIcon(bet.status)}
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {bet.status || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 mb-6 border-b border-white/5 pb-6">
                  <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5">Matchup</div>
                  <div className="text-lg font-bold tracking-tight text-white leading-snug">
                    {bet.match ? `${bet.match.teamA} vs ${bet.match.teamB}` : "Match Data Unavailable"}
                  </div>
                  <div className="text-xs text-zinc-500 font-medium mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 
                    {bet.match ? new Date(bet.match.startTime).toLocaleString() : "TBA"}
                  </div>
                </div>

                <div className="bg-black/40 rounded-2xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 font-medium">Prediction</span>
                    <span className="font-bold text-white">{bet.match ? getGuessName(bet.guess, bet.match) : bet.guess}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 font-medium">Locked Odds</span>
                    <span className="font-bold text-blue-400">{bet.lockedOdds.toFixed(3)}x</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400 font-medium">Wager</span>
                    <span className="font-bold text-white">₹{bet.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2">
                    <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Potential Payout
                    </span>
                    <span className="text-base font-extrabold text-emerald-400">
                      ₹{(bet.amount * bet.lockedOdds).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}