"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User, LogOut, FileText, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen bg-[#F6F9EA] font-sans overflow-hidden">
      <Navbar />
      
      <div className="pt-28 pb-20 px-4 relative">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#D4F754]/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-white mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#D4F754] flex items-center justify-center shadow-lg">
                  <User size={36} className="text-black" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-[3px] border-white rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">{firstName} {lastName}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{user.email}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{phone}</span>
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
            >
              <LogOut size={18} /> Sistemdən Çıx
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Applications (Müraciətlər) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[2rem] p-8 shadow-lg shadow-black/5 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <FileText size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText size={20} /></div>
                  Müraciətlərim
                </h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium mb-3">Sistemdə aktiv müraciətiniz tapılmadı.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-[#D4F754] text-black px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#c2e44d] transition-colors">
                  Yeni Müraciət Yarat
                </Link>
              </div>
            </motion.div>

            {/* Exams (İmtahanlar) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[2rem] p-8 shadow-lg shadow-black/5 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <CheckCircle size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={20} /></div>
                  İştirak etdiyim İmtahanlar
                </h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium mb-3">Siz hələ heç bir imtahanda iştirak etməmisiniz.</p>
                <Link href="/online-exam" className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors">
                  İmtahanlara Bax
                </Link>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
