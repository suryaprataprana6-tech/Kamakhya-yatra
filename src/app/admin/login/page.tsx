"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loginAdmin } from "../actions";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await loginAdmin(password);
      if (res.success) {
        router.push("/admin");
      } else {
        setError(res.error || "Invalid password");
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#f7fafc] min-h-screen text-slate-800 flex flex-col justify-between">
      <div>
        <Navbar />

        <div className="max-w-md mx-auto py-24 px-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xl">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#0b1c3e]">Admin Portal</h2>
              <p className="text-xs text-slate-400 mt-1">Enter your password to access the dashboard</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold text-center mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#0b1c3e]">Admin Password</label>
                <div className="flex items-center gap-3 border border-slate-200 focus-within:border-[#0b1c3e] rounded-xl px-4 py-3 bg-slate-50 transition">
                  <Lock className="w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-transparent text-sm font-semibold outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#0b1c3e] hover:bg-[#1e3c72] disabled:bg-slate-400 text-white font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 transition shadow-lg shadow-[#0b1c3e]/10"
              >
                <span>{loading ? "Authenticating..." : "Login"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
