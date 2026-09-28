"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/axios";
import Navbar from "../../components/Navbar";
import {
  Coins,
  CircleDot,
  Flame,
  Play,
  Trophy,
  CreditCard,
  Rocket,
  ArrowRight,
  Zap,
  Bomb,
  CircleDashed
} from "lucide-react";

export default function LobbyPage() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/user/dashboard");
        const inrWallet = res.data.data.wallets.find(
          (w: any) => w.currency === "INR"
        );
        if (inrWallet) {
          setBalance(inrWallet.balance);
        }
      } catch (error) {
        router.push("/auth");
      }
    };
    fetchUser();
  }, [router]);

  const loadRazorpayScript = () => {
    return new Promise<boolean>((resolve) => {
      const existingScript = document.querySelector(
        'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
      );
      if (existingScript) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayDeposit = async (depositAmount: number) => {
    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert("Razorpay SDK failed to load. Please check your connection or adblocker.");
        return;
      }

      const orderRes = await api.post("/wallet/razorpay/order", {
        amount: depositAmount,
      });
      
      const order = orderRes.data.data;

      if (!order || !order.id) {
        alert("Failed to generate payment order from server.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "GamblerPro",
        description: "Secure Wallet Deposit",
        order_id: order.id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post("/wallet/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: depositAmount,
              currency: "INR",
            });

            if (verifyRes.data.success) {
              alert("Deposit successful! Funds added to your balance.");
              window.location.reload();
            }
          } catch (verifyErr) {
            console.error("Verification failed:", verifyErr);
            alert("Payment verification failed on server.");
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const paymentWindow = new (window as any).Razorpay(options);
      
      paymentWindow.on('payment.failed', function (response: any){
        console.error("Razorpay Payment Failed Event:", response.error);
        alert(`Payment Failed: ${response.error.description} (${response.error.reason})`);
      });

      paymentWindow.open();
    } catch (err: any) {
      console.error("Razorpay initialization error:", err.response?.data || err.message);
      alert(`Unable to initialize payment: ${err.response?.data?.error || err.message}`);
    }
  };

  const games = [
    {
      id: "sportsbook",
      title: "Global Sportsbook",
      description: "Bet on live odds across the Premier League, NBA, UFC, and more with real-time settlement engines.",
      icon: Trophy,
      color: "from-blue-600/15 via-indigo-600/5 to-transparent",
      borderColor: "border-blue-500/20 hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]",
      textColor: "text-blue-400",
      badge: "Live Arena",
      route: "/sports",
      active: true,
    },
    {
      id: "crash",
      title: "Rocket Crash",
      description: "Watch the multiplier skyrocket and cash out before it crashes in this multiplayer thriller.",
      icon: Rocket,
      color: "from-red-600/15 via-rose-600/5 to-transparent",
      borderColor: "border-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.15)]",
      textColor: "text-red-400",
      badge: "Hot Live",
      route: "/casino/crash",
      active: true,
    },
    {
      id: "plinko",
      title: "Plinko Board",
      description: "Drop balls through pegs with customizable rows & risk profiles. Multi-ball spam enabled.",
      icon: CircleDashed,
      color: "from-amber-500/15 via-orange-500/5 to-transparent",
      borderColor: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      textColor: "text-amber-400",
      badge: "Arcade",
      route: "/casino/plinko",
      active: true,
    },
    {
      id: "mines",
      title: "Minesweeper",
      description: "Clear the board of hidden mines to increase your multiplier. Cash out anytime.",
      icon: Bomb,
      color: "from-amber-600/15 via-yellow-600/5 to-transparent",
      borderColor: "border-amber-500/20 hover:border-amber-500/50 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]",
      textColor: "text-amber-400",
      badge: "Arcade",
      route: "/casino/mines",
      active: true,
    },
    {
      id: "coinflip",
      title: "Coin Flip",
      description: "Classic 50/50 high-stakes odds. Go head-to-head against the house to double your money instantly.",
      icon: CircleDot,
      color: "from-yellow-500/15 via-amber-600/5 to-transparent",
      borderColor: "border-yellow-500/20 hover:border-yellow-500/50 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]",
      textColor: "text-yellow-400",
      badge: "Classic",
      route: "/games/coinflip",
      active: true,
    },
    {
      id: "roulette",
      title: "Cyber Roulette",
      description: "Spin the digital wheel and hit high-roller number combinations.",
      icon: Flame,
      color: "from-purple-500/15 via-pink-600/5 to-transparent",
      borderColor: "border-purple-500/20",
      textColor: "text-purple-400",
      badge: "Coming Soon",
      route: "#",
      active: false,
    },
  ];

  return (
    <main className="min-h-screen bg-[#030305] text-white selection:bg-blue-600 selection:text-white relative overflow-hidden">
      
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <Navbar />

      <div className="mx-auto max-w-7xl px-6 py-12 relative z-10">

        <section className="mb-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-zinc-900/80 via-zinc-950/90 to-black p-8 shadow-2xl backdrop-blur-2xl relative">
          <div className="absolute top-0 right-0 w-96 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <p className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  Active Wallet Vault
                </p>
              </div>

              <h1 className="text-4xl font-black tracking-tight md:text-5xl flex items-baseline gap-3">
                ₹{balance.toFixed(2)}
                <span className="text-sm font-bold text-zinc-500 bg-white/5 px-3 py-1 rounded-lg border border-white/10">
                  INR
                </span>
              </h1>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleRazorpayDeposit(10000)}
                className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-sm font-black transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-105 active:scale-95"
              >
                <CreditCard className="h-4 w-4" />
                Deposit ₹10,000 (Razorpay)
              </button>

              <button
                onClick={async () => {
                  try {
                    const res = await api.post("/wallet/deposit", {
                      currency: "INR",
                      amount: 10000,
                    });
                    if (res.data) {
                      setBalance((b) => b + 10000);
                    }
                  } catch (err: any) {
                    console.error("Demo fund error:", err.response || err);
                    alert(`Failed to add demo funds: ${err.response?.data?.message || err.message}`);
                  }
                }}
                className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-zinc-900/80 px-6 py-4 text-sm font-black transition-all hover:bg-zinc-800 hover:border-white/20 active:scale-95"
              >
                <Coins className="h-4 w-4 text-yellow-500" />
                +₹10,000 Demo Funds
              </button>
            </div>
          </div>
        </section>

        <section className="mb-8 flex justify-between items-end">
          <div>
            <div className="flex items-center gap-2 text-blue-500 font-black text-xs uppercase tracking-widest mb-2">
              <Zap className="w-4 h-4" /> High-Performance Arenas
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">
              Casino & Sports Lobby
            </h2>
          </div>
          <p className="text-zinc-400 text-sm font-medium hidden md:block">
            Choose an experience and start wagering securely.
          </p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => {
            const Icon = game.icon;

            return (
              <div
                key={game.id}
                onClick={() => {
                  if (game.active) {
                    router.push(game.route);
                  }
                }}
                className={`group relative flex flex-col justify-between rounded-3xl border bg-gradient-to-br p-8 backdrop-blur-xl transition-all duration-300 ${game.color} ${game.borderColor} ${
                  game.active
                    ? "cursor-pointer hover:-translate-y-2"
                    : "cursor-not-allowed opacity-50 grayscale"
                }`}
              >
                <div className="mb-8 flex items-center justify-between">
                  <span
                    className={`rounded-full border border-white/10 bg-black/40 px-3.5 py-1 text-xs font-black tracking-wider uppercase ${game.textColor}`}
                  >
                    {game.badge}
                  </span>

                  <div className={`rounded-2xl bg-black/40 border border-white/10 p-3.5 ${game.textColor} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black tracking-tight mb-2 group-hover:text-white transition-colors">
                    {game.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-zinc-400 font-medium min-h-[50px]">
                    {game.description}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-white/5">
                  {game.active ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(game.route);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl bg-white/5 border border-white/10 px-5 py-3.5 font-black transition-all group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white ${game.textColor}`}
                    >
                      <span className="flex items-center gap-2">
                        <Play className="h-4 w-4 fill-current" /> Play Now
                      </span>
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-2xl bg-white/5 px-5 py-3.5 font-bold text-zinc-600 border border-white/5"
                    >
                      <Flame className="h-4 w-4" /> Coming Soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </section>

      </div>
    </main>
  );
}