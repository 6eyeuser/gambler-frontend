"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/axios";
import Navbar from "../../components/Navbar";
import SettlementButton from "../../components/SettlementButton";
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
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBets = async () => {
      try {
        const res = await api.get("/sports/bets");
        setBets(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to load bet history.");
      } finally {
        loading && setLoading(false);
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
      case "WON": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "LOST": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-xl border border-blue-500/30">
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">My Bets</h1>
              <p className="text-zinc-400 text-sm font-medium">Track your active slips and history</p>
            </div>
          </div>
          
          {/* ✅ The manual settlement button injected here */}
          <SettlementButton />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-zinc-500 font-bold gap-3">
            <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Loading History...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 font-bold flex items-center gap-3">
            <AlertCircle className="w-5 h-5" /> {error}
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/30 rounded-2xl border border-white/5">
            <Receipt className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No bets placed yet</h3>
            <p className="text-zinc-500">Head over to the sportsbook to lock in your first prediction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-zinc-950/80 border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                      {bet.match?.sportGroup || "SPORTS"}
                    </span>
                    <div className="text-xs text-zinc-500 mt-3 font-medium">
                      Placed on {new Date(bet.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-lg border border-white/5">
                    {getStatusIcon(bet.status)}
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                      {bet.status || "PENDING"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 mb-6 border-b border-white/5 pb-6">
                  <div className="text-sm font-bold text-zinc-400 mb-1">Matchup</div>
                  <div className="text-lg font-black leading-tight">
                    {bet.match ? `${bet.match.teamA} vs ${bet.match.teamB}` : "Match Data Unavailable"}
                  </div>
                  <div className="text-xs text-zinc-600 font-bold mt-2 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 
                    {bet.match ? new Date(bet.match.startTime).toLocaleString() : "TBA"}
                  </div>
                </div>

                <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Prediction</span>
                    <span className="text-sm font-black text-white">{bet.match ? getGuessName(bet.guess, bet.match) : bet.guess}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Locked Odds</span>
                    <span className="text-sm font-black text-blue-400">{bet.lockedOdds.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Wager</span>
                    <span className="text-sm font-black text-white">₹{bet.amount.toFixed(2)}</span>
                  </div>
                  
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center mt-2">
                    <span className="text-xs text-green-500/70 font-bold uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> Potential Payout
                    </span>
                    <span className="text-lg font-black text-green-400">
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