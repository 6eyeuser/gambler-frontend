"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import Navbar from "../../components/Navbar";
import { Trophy, Activity, Flame, Clock, X, ChevronDown, Pin, CheckCircle2, AlertCircle } from "lucide-react";

interface Match {
  id: string;
  sportGroup: string;
  teamA: string;
  teamB: string;
  startTime: string;
  oddsA: number;
  oddsB: number;
  oddsDraw: number | null;
}

const universalLogoDictionary: Record<string, string> = {
  // --- Premier League ---
  "Arsenal": "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg",
  "Aston Villa": "https://upload.wikimedia.org/wikipedia/en/9/9f/Aston_Villa_logo.svg",
  "Chelsea": "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg",
  "Liverpool": "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg",
  "Manchester City": "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg",
  "Manchester United": "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  "Tottenham Hotspur": "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg",

  // --- La Liga & Serie A & Others ---
  "FC Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Juventus": "https://upload.wikimedia.org/wikipedia/commons/b/bc/Juventus_FC_2017_icon_%28black%29.svg",
  "AC Milan": "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg",
  "AS Roma": "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  "Roma": "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg",
  "Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282002%29.svg",
  "Paris Saint Germain": "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C.%27s_logo.svg",

  // --- NBA Teams ---
  "Atlanta Hawks": "https://a.espncdn.com/i/teamlogos/nba/500/atl.png",
  "Boston Celtics": "https://a.espncdn.com/i/teamlogos/nba/500/bos.png",
  "Brooklyn Nets": "https://a.espncdn.com/i/teamlogos/nba/500/bkn.png",
  "Charlotte Hornets": "https://a.espncdn.com/i/teamlogos/nba/500/cha.png",
  "Chicago Bulls": "https://a.espncdn.com/i/teamlogos/nba/500/chi.png",
  "Cleveland Cavaliers": "https://a.espncdn.com/i/teamlogos/nba/500/cle.png",
  "Dallas Mavericks": "https://a.espncdn.com/i/teamlogos/nba/500/dal.png",
  "Denver Nuggets": "https://a.espncdn.com/i/teamlogos/nba/500/den.png",
  "Detroit Pistons": "https://a.espncdn.com/i/teamlogos/nba/500/det.png",
  "Golden State Warriors": "https://a.espncdn.com/i/teamlogos/nba/500/gs.png",
  "Houston Rockets": "https://a.espncdn.com/i/teamlogos/nba/500/hou.png",
  "Indiana Pacers": "https://a.espncdn.com/i/teamlogos/nba/500/ind.png",
  "LA Clippers": "https://a.espncdn.com/i/teamlogos/nba/500/lac.png",
  "Los Angeles Lakers": "https://a.espncdn.com/i/teamlogos/nba/500/lal.png",
  "Memphis Grizzlies": "https://a.espncdn.com/i/teamlogos/nba/500/mem.png",
  "Miami Heat": "https://a.espncdn.com/i/teamlogos/nba/500/mia.png",
  "Milwaukee Bucks": "https://a.espncdn.com/i/teamlogos/nba/500/mil.png",
  "Minnesota Timberwolves": "https://a.espncdn.com/i/teamlogos/nba/500/min.png",
  "New Orleans Pelicans": "https://a.espncdn.com/i/teamlogos/nba/500/no.png",
  "New York Knicks": "https://a.espncdn.com/i/teamlogos/nba/500/ny.png",
  "Oklahoma City Thunder": "https://a.espncdn.com/i/teamlogos/nba/500/okc.png",
  "Orlando Magic": "https://a.espncdn.com/i/teamlogos/nba/500/orl.png",
  "Philadelphia 76ers": "https://a.espncdn.com/i/teamlogos/nba/500/phi.png",
  "Phoenix Suns": "https://a.espncdn.com/i/teamlogos/nba/500/phx.png",
  "Portland Trail Blazers": "https://a.espncdn.com/i/teamlogos/nba/500/por.png",
  "Sacramento Kings": "https://a.espncdn.com/i/teamlogos/nba/500/sac.png",
  "San Antonio Spurs": "https://a.espncdn.com/i/teamlogos/nba/500/sa.png",
  "Toronto Raptors": "https://a.espncdn.com/i/teamlogos/nba/500/tor.png",
  "Utah Jazz": "https://a.espncdn.com/i/teamlogos/nba/500/utah.png",
  "Washington Wizards": "https://a.espncdn.com/i/teamlogos/nba/500/was.png",

  // --- Elite UFC Fighters ---
  "Khamzat Chimaev": "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/4351602.png",
  "Tyron Woodley": "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/2507661.png",
  "Conor McGregor": "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/3022677.png",
  "Jon Jones": "https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/2335639.png"
};

const TeamLogo = ({ name, sportGroup }: { name: string; sportGroup?: string }) => {
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  
  const isUfc = sportGroup === "UFC";
  const cleanName = name.trim();

  useEffect(() => {
    let isMounted = true;
    setImgError(false);

    if (universalLogoDictionary[cleanName]) {
      setImgUrl(universalLogoDictionary[cleanName]);
      return;
    }

    const extractFromEspn = async () => {
      try {
        const type = isUfc ? "player" : "team";
        const res = await fetch(`https://site.web.api.espn.com/apis/search/v2?limit=1&type=${type}&query=${encodeURIComponent(cleanName)}`);
        const data = await res.json();
        
        const jsonString = JSON.stringify(data);
        const idMatch = jsonString.match(/\/id\/(\d+)/);
        
        if (idMatch && idMatch[1]) {
          const espnId = idMatch[1];
          let dynamicUrl = "";
          
          if (isUfc) {
             dynamicUrl = `https://a.espncdn.com/combiner/i?img=/i/headshots/mma/players/full/${espnId}.png&w=350&h=250`;
          } else if (sportGroup === "Basketball") {
             dynamicUrl = `https://a.espncdn.com/i/teamlogos/nba/500/scoreboard/${espnId}.png`;
          } else {
             dynamicUrl = `https://a.espncdn.com/combiner/i?img=/i/teamlogos/soccer/500/${espnId}.png`;
          }
          
          if (isMounted) setImgUrl(dynamicUrl);
          return;
        }
        
        if (isMounted) setImgUrl(isUfc ? "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" : null);
      } catch (error) {
        if (isMounted) setImgUrl(isUfc ? "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png" : null);
      }
    };

    extractFromEspn();
    return () => { isMounted = false; };
  }, [cleanName, isUfc, sportGroup]);

  if (imgUrl && !imgError) {
    return (
      <div className={`bg-zinc-900 overflow-hidden shrink-0 border-2 border-white/10 shadow-lg flex items-center justify-center ${
        isUfc ? "w-14 h-14 rounded-full object-cover bg-black" : "w-12 h-12 rounded-full p-1.5 bg-white"
      }`}>
        <img 
          src={imgUrl} 
          alt={cleanName} 
          className={isUfc ? "w-full h-full object-cover object-top scale-125" : "max-w-full max-h-full object-contain"} 
          onError={() => setImgError(true)} 
        />
      </div>
    );
  }
  
  const initials = cleanName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600/40 to-indigo-900/60 border-2 border-white/20 flex items-center justify-center font-black text-white shadow-inner shrink-0 text-xs tracking-wider">
      {initials}
    </div>
  );
};

export default function Sportsbook() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [loading, setLoading] = useState(true);
  
  const [activeMatch, setActiveMatch] = useState<Match | null>(null);
  const [marketTab, setMarketTab] = useState("Popular");
  
  const [betAmount, setBetAmount] = useState<string>("10");
  const [placing, setPlacing] = useState(false);
  const [betStatus, setBetStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        const res = await api.get(`${backendUrl}/api/v1/sports/matches`);
        setMatches(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredMatches = activeTab === "All" ? matches : matches.filter((m) => m.sportGroup === activeTab);
  const tabs = ["All", "Football", "Basketball", "UFC"];
  const marketTabs = ["All markets", "Popular", "Total", "Result + Total"];

  const handlePlaceBet = async (guess: string) => {
    if (!activeMatch) return;
    setPlacing(true);
    setBetStatus(null);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
      const res = await api.post(`${backendUrl}/api/v1/sports/bet`, { 
        matchId: activeMatch.id, 
        amount: parseFloat(betAmount), 
        guess 
      });
      
      if (res.data?.data?.match) {
        setActiveMatch(res.data.data.match);
        setMatches(prev => prev.map(m => m.id === activeMatch.id ? res.data.data.match : m));
      }

      setBetStatus({ type: "success", msg: "Bet locked in successfully!" });
      setTimeout(() => { setBetStatus(null); }, 3000); 
    } catch (err: any) {
      setBetStatus({ type: "error", msg: err.response?.data?.message || "Error placing bet" });
    } finally {
      setPlacing(false);
    }
  };

  const getDoubleChanceOdds = (match: Match) => {
    if (!match.oddsDraw) return { odds1X: 0, odds12: 0, odds2X: 0 };
    const probA = 1 / match.oddsA;
    const probB = 1 / match.oddsB;
    const probDraw = 1 / match.oddsDraw;
    const margin = 0.95; 
    return {
      odds1X: (1 / (probA + probDraw)) * margin,
      odds12: (1 / (probA + probB)) * margin,
      odds2X: (1 / (probB + probDraw)) * margin,
    };
  };

  return (
    <div className="min-h-screen bg-[#030305] text-white font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Trophy className="text-yellow-500 w-10 h-10" /> Global Sportsbook
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Live odds and automated real-time settlements</p>
          </div>
          <div className="flex bg-zinc-900/40 p-1.5 rounded-2xl border border-white/10 backdrop-blur-2xl shadow-inner">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeTab === tab ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 text-zinc-500 font-medium gap-4">
            <Activity className="w-8 h-8 animate-spin text-blue-500" />
            <p className="text-xs uppercase tracking-widest font-bold">Syncing Live Markets...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredMatches.map((match) => (
              <div 
                key={match.id} 
                onClick={() => { setActiveMatch(match); setBetStatus(null); }}
                className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 hover:border-blue-500/40 hover:bg-zinc-900/60 transition-all cursor-pointer group shadow-2xl backdrop-blur-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                    {match.sportGroup}
                  </span>
                  <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(match.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex flex-col items-center gap-3 flex-1 w-1/3">
                    <TeamLogo name={match.teamA} sportGroup={match.sportGroup} />
                    <span className="text-sm font-bold text-center leading-tight truncate w-full">{match.teamA}</span>
                  </div>
                  <div className="px-2 text-zinc-600 font-black italic text-sm">VS</div>
                  <div className="flex flex-col items-center gap-3 flex-1 w-1/3">
                    <TeamLogo name={match.teamB} sportGroup={match.sportGroup} />
                    <span className="text-sm font-bold text-center leading-tight truncate w-full">{match.teamB}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Advanced Match Detail Modal */}
      {activeMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in p-4 md:p-0">
          <div className="bg-[#0b1015] w-full max-w-2xl h-full max-h-[90vh] md:rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/10">
            
            <div className="bg-gradient-to-b from-[#1a232f] to-[#0b1015] p-6 pb-4 shrink-0 border-b border-white/5">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setActiveMatch(null)} className="p-2 text-zinc-400 hover:text-white transition-colors bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
                <div className="text-center">
                  <h2 className="text-sm font-bold text-white">{activeMatch.sportGroup} Match</h2>
                  <p className="text-xs text-zinc-400">Regular Time</p>
                </div>
                <div className="p-2 text-blue-500"><Flame className="w-5 h-5" /></div>
              </div>

              <div className="flex items-center justify-between px-2 md:px-8 mb-6">
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <TeamLogo name={activeMatch.teamA} sportGroup={activeMatch.sportGroup} />
                  <span className="text-sm font-medium text-center leading-tight">{activeMatch.teamA}</span>
                </div>
                <div className="text-center w-1/3">
                  <div className="text-xl md:text-2xl font-black text-white mb-1">VS</div>
                  <div className="text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-800/50 px-2.5 py-1 rounded-md mx-auto w-fit">
                    {new Date(activeMatch.startTime).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex flex-col items-center gap-2 w-1/3">
                  <TeamLogo name={activeMatch.teamB} sportGroup={activeMatch.sportGroup} />
                  <span className="text-sm font-medium text-center leading-tight">{activeMatch.teamB}</span>
                </div>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {marketTabs.map(tab => (
                  <button 
                    key={tab} onClick={() => setMarketTab(tab)}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      marketTab === tab ? "bg-white text-black shadow-lg" : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-[#0b1015]">
              
              <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-400 text-xs uppercase tracking-wider">1X2 Match Result</h3>
                  <Pin className="w-4 h-4 text-zinc-500" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handlePlaceBet("TEAM_A")} 
                    disabled={placing}
                    className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-xs text-zinc-400 mb-1 font-medium">W1</span>
                    <span className="text-base font-extrabold text-white">{activeMatch.oddsA.toFixed(3)}</span>
                  </button>
                  <button 
                    onClick={() => handlePlaceBet("DRAW")} 
                    disabled={!activeMatch.oddsDraw || placing} 
                    className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-xs text-zinc-400 mb-1 font-medium">Draw</span>
                    <span className="text-base font-extrabold text-white">{activeMatch.oddsDraw ? activeMatch.oddsDraw.toFixed(3) : "-"}</span>
                  </button>
                  <button 
                    onClick={() => handlePlaceBet("TEAM_B")} 
                    disabled={placing}
                    className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className="text-xs text-zinc-400 mb-1 font-medium">W2</span>
                    <span className="text-base font-extrabold text-white">{activeMatch.oddsB.toFixed(3)}</span>
                  </button>
                </div>
              </div>

              {activeMatch.oddsDraw && (
                <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-zinc-400 text-xs uppercase tracking-wider">Double Chance</h3>
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <button 
                      onClick={() => handlePlaceBet("TEAM_A")} 
                      disabled={placing}
                      className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs text-zinc-400 mb-1 font-medium">1X</span>
                      <span className="text-base font-extrabold text-white">{getDoubleChanceOdds(activeMatch).odds1X.toFixed(3)}</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet("TEAM_A")} 
                      disabled={placing}
                      className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs text-zinc-400 mb-1 font-medium">12</span>
                      <span className="text-base font-extrabold text-white">{getDoubleChanceOdds(activeMatch).odds12.toFixed(3)}</span>
                    </button>
                    <button 
                      onClick={() => handlePlaceBet("TEAM_B")} 
                      disabled={placing}
                      className="bg-black/40 hover:bg-blue-600/20 hover:border-blue-500 rounded-xl py-3.5 flex flex-col items-center border border-white/5 transition-all active:scale-95 disabled:opacity-50"
                    >
                      <span className="text-xs text-zinc-400 mb-1 font-medium">2X</span>
                      <span className="text-base font-extrabold text-white">{getDoubleChanceOdds(activeMatch).odds2X.toFixed(3)}</span>
                    </button>
                  </div>
                </div>
              )}

              {betStatus && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${betStatus.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-red-500/10 text-red-400 border border-red-500/30"}`}>
                  {betStatus.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                  {betStatus.msg}
                </div>
              )}

              <div className="mt-6 p-5 bg-zinc-900/40 rounded-2xl border border-white/10">
                 <p className="text-xs text-zinc-400 mb-2 font-bold uppercase tracking-wider">Quick Wager Amount (INR)</p>
                 <div className="relative">
                   <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">₹</span>
                   <input 
                     type="number" 
                     value={betAmount}
                     onChange={(e) => setBetAmount(e.target.value)}
                     min="1"
                     className="w-full bg-black/50 border border-white/10 rounded-xl pl-8 pr-4 py-3 text-white font-bold outline-none focus:border-blue-500 transition-colors" 
                   />
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}