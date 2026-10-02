"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/utils/LangContext";
import AnimateIn from "@/components/AnimateIn";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/utils/supabase";

export default function NewsPage() {
  const { dict, lang } = useLang();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (data) setNewsList(data.filter(n => n.show_in_marquee));
      setLoading(false);
    }
    fetchNews();
  }, []);

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 max-w-[1400px] mx-auto">
      <AnimateIn delay={0.1}>
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">{dict.nav.news}</h1>
          <p className="text-black/60 max-w-2xl text-lg font-medium">Ən son məlumatlar</p>
        </div>
      </AnimateIn>

      {loading ? (
        <div className="flex justify-center items-center h-40">Yüklənir...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {newsList.map((news, i) => (
            <AnimateIn key={news.id} delay={0.1 + i * 0.1}>
              <Link
                href={`/news/${news.slug}`}
                className="group block rounded-[1.5rem] bg-white border border-gray-200 overflow-hidden hover:shadow-xl hover:border-[#D4F754] transition-all duration-300"
              >
                <div className="relative w-full aspect-[4/3] overflow-hidden">
                  <Image
                    src={news.image}
                    alt={news.title[lang] || news.title.az}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wider">{news.date}</p>
                  <h3 className="text-lg font-bold text-black mb-2 line-clamp-2 group-hover:text-[#8cb815] transition-colors">{news.title[lang] || news.title.az}</h3>
                  <p className="text-xs text-gray-500 font-medium line-clamp-2">{news.excerpt[lang] || news.excerpt.az}</p>
                </div>
              </Link>
            </AnimateIn>
          ))}
        </div>
      )}
    </main>
  );
}
