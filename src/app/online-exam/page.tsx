"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/utils/LangContext";
import AnimateIn from "@/components/AnimateIn";
import { ArrowRight, BookOpen, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/utils/supabase";

export default function OnlineExamPage() {
  const { dict, lang } = useLang();
  
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExams() {
      const { data } = await supabase.from('exams').select('*').eq('is_active', true).order('created_at', { ascending: false });
      if (data) setExams(data);
      setLoading(false);
    }
    fetchExams();
  }, []);

  return (
    <main className="min-h-screen pt-28 sm:pt-36 pb-20 bg-gray-50/50">
      <div className="container mx-auto px-4 max-w-6xl">
        <AnimateIn className="text-center mb-12 sm:mb-16">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#8cb815]" /> Onlayn İmtahanlar
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-[#0B0C0B] mb-4">
            İmtahan Kateqoriyasını Seçin
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Özünüzü sınamaq üçün uyğun imtahan kateqoriyasını seçin və biliklərinizi yoxlayın.
          </p>
        </AnimateIn>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[#8cb815]" /></div>
        ) : exams.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Hazırda aktiv imtahan yoxdur</h3>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((exam, i) => (
              <AnimateIn key={exam.id} delay={i * 0.1} direction="up">
                <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 flex flex-col h-full group items-center text-center">
                  {exam.image && (
                    <div className="w-full h-48 relative overflow-hidden">
                      <img src={exam.image} alt="Exam" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col flex-1 w-full items-center">
                    <h3 className="text-2xl font-extrabold text-black mb-3">{exam.title[lang] || exam.title.az}</h3>
                    <p className="text-gray-600 text-sm mb-8 flex-1">{exam.description[lang] || exam.description.az}</p>
                    
                    <Link href={`/online-exam/${exam.id}`} className="mt-auto flex items-center justify-center w-full py-3.5 bg-black text-[#D4F754] font-bold rounded-xl hover:bg-gray-800 transition-colors group">
                      İmtahana Başla <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
