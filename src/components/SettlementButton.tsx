"use client";

import { useState } from "react";
import { api } from "../lib/axios";
import { Zap } from "lucide-react";

export default function SettlementButton() {
  const [loading, setLoading] = useState(false);

  const handleSettle = async () => {
    setLoading(true);
    try {
      // Hits the manual trigger endpoint on your backend
      const res = await api.post("/sports/force-settle");
      alert(res.data.message || "Settlement complete.");
      // Optional: Refresh the page to show updated bet statuses
      window.location.reload();
    } catch (error: any) {
      console.error("Settlement Error:", error);
      alert(error.response?.data?.error || "Failed to settle bets.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleSettle}
      disabled={loading}
      className="bg-red-600 hover:bg-red-500 text-white font-black py-2.5 px-5 rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
    >
      <Zap className="w-4 h-4" />
      {loading ? "Processing..." : "Force Settle"}
    </button>
  );
}