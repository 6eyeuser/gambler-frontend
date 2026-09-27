"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Gamepad2, Zap, ShieldCheck, Trophy, ArrowRight, Sparkles, Dices, Coins, Gem, CircleDollarSign, LayoutDashboard } from "lucide-react";
import { api } from "../lib/axios";

// --- 3D Antigravity Hover Card Component ---
const TiltCard = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [transition, setTransition] = useState("transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)");

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    
    const rotateX = (0.5 - y) * 30; 
    const rotateY = (x - 0.5) * 30;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`);
    setTransition("none");
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    setTransition("transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)");
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition, transformStyle: "preserve-3d" }}
      className={`relative rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md p-8 overflow-hidden group ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
        {children}
      </div>
    </div>
  );
};

// --- Floating Background Animation Settings ---
const floatingIcons = [
  { Icon: Dices, left: "10%", delay: "0s", duration: "18s", size: 48 },
  { Icon: Coins, left: "25%", delay: "4s", duration: "22s", size: 36 },
  { Icon: CircleDollarSign, left: "45%", delay: "2s", duration: "15s", size: 52 },
  { Icon: Gem, left: "65%", delay: "8s", duration: "20s", size: 32 },
  { Icon: Dices, left: "85%", delay: "1s", duration: "16s", size: 44 },
  { Icon: Coins, left: "75%", delay: "10s", duration: "25s", size: 40 },
  { Icon: Gem, left: "5%", delay: "12s", duration: "19s", size: 28 },
  { Icon: CircleDollarSign, left: "95%", delay: "6s", duration: "21s", size: 48 },
];

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    api.get("/user/dashboard")
      .then((res) => {
        setIsLoggedIn(true);
        if (res.data?.data?.email && !playerName) {
          const email = res.data.data.email;
          const parsedName = email.split('@')[0];
          setPlayerName(parsedName.charAt(0).toUpperCase() + parsedName.slice(1));
        }
      })
      .catch(() => setIsLoggedIn(false));
  }, [playerName]);

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-blue-500/30 relative">
      
      {/* Custom CSS for continuous antigravity floating */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-up {
          0% { transform: translateY(120vh) rotate(0deg) scale(0.8); opacity: 0; }
          10% { opacity: 0.15; }
          90% { opacity: 0.15; }
          100% { transform: translateY(-20vh) rotate(360deg) scale(1.2); opacity: 0; }
        }
        .animate-float-up {
          animation: float-up linear infinite;
        }
      `}} />

      {/* Animated Gambling Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingIcons.map((item, i) => (
          <div
            key={i}
            className="absolute bottom-0 text-white animate-float-up"
            style={{
              left: item.left,
              animationDelay: item.delay,
              animationDuration: item.duration,
              opacity: 0, 
            }}
          >
            <item.Icon size={item.size} strokeWidth={1} className="text-zinc-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]" />
          </div>
        ))}
      </div>

      {/* Background Grid & Ambient Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] pointer-events-none z-0" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Dynamic Navbar */}
      <nav className="relative w-full flex items-center justify-between px-8 py-6 z-50">
        <div className="flex items-center gap-2 group cursor-pointer">
          <Gamepad2 className="w-8 h-8 text-blue-500 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-2xl font-black tracking-tighter">
            GAMBLER<span className="text-blue-500">PRO</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          {isLoggedIn ? (
            <>
              <span className="hidden md:block text-sm font-medium text-zinc-300">
                Welcome back, <span className="text-white font-bold">{playerName}</span>
              </span>
              <Link 
                href="/lobby" 
                className="hidden md:block text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Lobby
              </Link>
              <Link 
                href="/dashboard" 
                className="relative px-6 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link 
                href="/auth" 
                className="hidden md:block text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/auth" 
                className="relative px-6 py-2.5 text-sm font-bold bg-white text-black rounded-xl overflow-hidden group transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                <span className="relative z-10">Play Now</span>
                <div className="absolute inset-0 bg-blue-500 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="absolute inset-0 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                  Play Now
                </span>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 flex flex-col items-center justify-center min-h-[85vh] text-center px-4 z-10 pointer-events-none">
        
        <div className="pointer-events-auto inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-medium text-zinc-300 tracking-wide uppercase text-xs">New Coin Flip Arena Live</span>
        </div>

        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-6 leading-none pointer-events-auto">
          DEFY <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-blue-600 to-purple-600 drop-shadow-[0_0_40px_rgba(37,99,235,0.3)]">
            GRAVITY
          </span>
        </h1>
        
        <p className="max-w-2xl text-lg md:text-xl text-zinc-400 mb-10 leading-relaxed font-light pointer-events-auto">
          Provably fair crypto gaming engineered for the future. Instant deposits, zero-gravity withdrawals, and odds that actually make sense.
        </p>

        <div className="w-full max-w-4xl mx-auto pointer-events-auto">
          {isLoggedIn ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* 1. The Betting Lobby Card */}
              <Link href="/lobby" className="group relative block">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 h-full hover:bg-zinc-900 transition-all flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Gamepad2 className="w-24 h-24 text-blue-500 transform rotate-12" />
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 border border-blue-500/20">
                      <Gamepad2 className="w-6 h-6 text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">Game Lobby</h3>
                    <p className="text-zinc-400 text-sm font-medium pr-8">
                      Enter the main casino arena. Choose between the Global Sportsbook, Coin Flip, and more.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-blue-400 font-bold text-sm">
                    Enter Lobby <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>

              {/* 2. The User Dashboard Card */}
              <Link href="/dashboard" className="group relative block">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative bg-zinc-950 border border-white/10 rounded-2xl p-6 h-full hover:bg-zinc-900 transition-all flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <LayoutDashboard className="w-24 h-24 text-emerald-500 transform -rotate-12" />
                  </div>
                  <div>
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                      <LayoutDashboard className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2">My Dashboard</h3>
                    <p className="text-zinc-400 text-sm font-medium pr-8">
                      Track your active bets, view historical performance, and manage your payouts.
                    </p>
                  </div>
                  <div className="mt-6 flex items-center text-emerald-400 font-bold text-sm">
                    View Dashboard <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-5 justify-center">
              <Link 
                href="/auth"
                className="group relative flex items-center justify-center gap-2 bg-blue-600 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(37,99,235,0.4)] hover:shadow-[0_0_60px_rgba(37,99,235,0.6)]"
              >
                Start Winning
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/auth"
                className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 active:scale-95 backdrop-blur-md"
              >
                View Live Games
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Antigravity Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <TiltCard>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/5 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.1)]">
              <Zap className="w-8 h-8 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Instant Payouts</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              No more waiting days for your winnings. Our automated smart-contract system ensures your withdrawals hit your wallet at lightspeed.
            </p>
          </TiltCard>

          <TiltCard>
            <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/5 rounded-2xl flex items-center justify-center mb-6 border border-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
              <ShieldCheck className="w-8 h-8 text-green-400 drop-shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">Provably Fair</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Every roll, flip, and spin is mathematically verifiable on-chain. We guarantee absolute transparency and zero tampering.
            </p>
          </TiltCard>

          <TiltCard>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
              <Trophy className="w-8 h-8 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]" />
            </div>
            <h3 className="text-2xl font-bold mb-3 tracking-tight">VIP Rewards</h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Level up your status as you play. Unlock exclusive rakeback, daily lossback bonuses, and a dedicated personal host.
            </p>
          </TiltCard>

        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-12 text-center text-zinc-600 text-sm font-medium">
        <p>© 2026 GamblerPro. 18+ Only. Play Responsibly.</p>
      </footer>
    </div>
  );
}