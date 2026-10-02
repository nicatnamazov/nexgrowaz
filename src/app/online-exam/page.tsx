"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function OnlineExamList() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('exams').select('*').then(({data}) => {
      setExams(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <main className="min-h-screen bg-[#F6F9EA] font-sans flex flex-col">
      <Navbar />
      <div className="flex-1 pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">Onlayn İmtahanlar</h1>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Biliklərinizi sınayın və özünüzü kəşf edin. Aktiv imtahanlardan birini seçərək dərhal başlaya bilərsiniz.
            </p>
          </motion.div>

          {loading ? (
            <div className="text-center py-20 text-gray-500 font-medium">Yüklənir...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
              <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">Hal-hazırda aktiv imtahan yoxdur.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {exams.map((exam, idx) => (
                <motion.div 
                  key={exam.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link href={`/online-exam/${exam.id}`} className="block group">
                    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 group-hover:-translate-y-1">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{exam.title}</h2>
                        <p className="text-gray-500 line-clamp-2 max-w-2xl mb-4">{exam.description}</p>
                        <div className="flex items-center gap-4 text-sm font-bold">
                          <span className="flex items-center gap-1.5 bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Clock size={16} className="text-gray-400" />
                            {exam.duration_minutes} dəqiqə
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <div className="w-12 h-12 rounded-full bg-[#D4F754] flex items-center justify-center text-black group-hover:scale-110 group-hover:bg-[#c2e44d] transition-all shadow-md">
                          <ChevronRight size={24} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </main>
  );
}
