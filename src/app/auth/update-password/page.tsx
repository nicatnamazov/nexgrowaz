"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Lock } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Şifrə ən azı 6 simvoldan ibarət olmalıdır.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      if (error) throw error;
      
      setMessage("Şifrəniz uğurla yeniləndi! İndi hesabınıza daxil ola bilərsiniz.");
      setTimeout(() => {
        router.push("/auth");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0C0B] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111211] border border-white/5 rounded-3xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-white mb-2">Yeni Şifrə Təyin Edin</h1>
        <p className="text-white/50 text-sm mb-6">Hesabınız üçün yeni şifrənizi aşağıya daxil edin.</p>
        
        {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl mb-4">{error}</div>}
        {message && <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-xs p-3 rounded-xl mb-4">{message}</div>}
        
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Yeni Şifrə</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-white/30" />
              </div>
              <input type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-[#D4F754] text-black font-bold py-3.5 rounded-xl mt-4 hover:bg-[#c2e44d] transition-all">
            {loading ? "Yenilənir..." : "Şifrəni Yenilə"}
          </button>
        </form>
      </div>
    </div>
  );
}
