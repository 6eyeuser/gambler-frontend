"use client";

import { useRouter } from "next/navigation";
import { api } from "../lib/axios";

export default function Navbar() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      router.push("/auth");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold text-white tracking-wide">
        Gambler<span className="text-blue-500">Pro</span>
      </div>
      <button
        onClick={handleLogout}
        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-zinc-700"
      >
        Sign Out
      </button>
    </nav>
  );
}