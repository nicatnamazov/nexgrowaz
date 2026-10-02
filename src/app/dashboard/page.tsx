"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User, LogOut, FileText, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F6F9EA] flex items-center justify-center text-black">Yüklənir...</div>;
  }

  const firstName = user?.user_metadata?.first_name || "İstifadəçi";
  const lastName = user?.user_metadata?.last_name || "";
  const phone = user?.user_metadata?.phone || "Qeyd olunmayıb";

  return (
    <div className="min-h-screen bg-[#F6F9EA] font-sans">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-[#D4F754] flex items-center justify-center shadow-inner">
                <User size={36} className="text-black/80" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">{firstName} {lastName}</h1>
                <p className="text-gray-500 font-medium">{user.email} • {phone}</p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 px-5 py-2.5 rounded-xl font-bold transition-colors"
            >
              <LogOut size={18} /> Çıxış
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Applications (Müraciətlər) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><FileText className="text-blue-500" /> Müraciətlərim</h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 font-medium mb-1">Hələ heç bir müraciət göndərməmisiniz.</p>
                <Link href="/contact" className="text-blue-600 hover:underline font-semibold text-sm">Yeni müraciət göndər</Link>
              </div>
            </div>

            {/* Exams (İmtahanlar) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 border-b border-gray-50 pb-4">
                <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle className="text-green-500" /> İştirak etdiyim İmtahanlar</h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="text-gray-400" size={24} />
                </div>
                <p className="text-gray-500 font-medium">Siz hələ heç bir imtahanda iştirak etməmisiniz.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
