"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useLang } from "@/utils/LangContext";
import AnimateIn from "@/components/AnimateIn";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/utils/supabase";

export default function SingleNewsPage() {
  const { dict, lang } = useLang();
  const params = useParams();
  const slug = params.id as string;
  
  const [news, setNews] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      const { data } = await supabase.from('news').select('*').eq('slug', decodeURIComponent(slug)).single();
      if (data) setNews(data);
      setLoading(false);
    }
    fetchNews();
  }, [slug]);

  if (loading) {
    return <main className="min-h-screen flex justify-center items-center">Yüklənir...</main>;
  }

  if (!news) {
    return (
      <main className="min-h-[70vh] flex flex-col items-center justify-center pt-32 pb-20 px-4">
        <h1 className="text-3xl font-bold mb-4">Məlumat tapılmadı</h1>
        <Link href="/news" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> {dict.home.backToNews}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-28 sm:pt-36 pb-20 px-4 max-w-[800px] mx-auto">
      <AnimateIn>
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors mb-8 sm:mb-10">
          <ArrowLeft className="w-4 h-4" /> {dict.home.backToNews}
        </Link>
      </AnimateIn>

      <AnimateIn delay={0.1}>
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {news?.title?.[lang] || news?.title?.az}
          </h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{news.date}</p>
        </div>
      </AnimateIn>

      <AnimateIn delay={0.2}>
        <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] rounded-2xl overflow-hidden mb-10 shadow-lg border border-gray-100 max-w-3xl">
          <Image
            src={news.image}
            alt={news?.title?.[lang] || news?.title?.az}
            fill
            className="object-cover object-center"
          />
        </div>
      </AnimateIn>

      <AnimateIn delay={0.3}>
        <div className="prose prose-base sm:prose-lg text-black/80 font-medium leading-relaxed max-w-none">
          {(() => {
            let contentText = (news?.content && news.content[lang]) || (news?.content && news.content.az) || "";
            if (typeof contentText === 'object') {
              contentText = contentText.mezmun || "";
            }
            return (typeof contentText === 'string' ? contentText : "").split("\n").map((para: string, i: number) => (
              <p key={i} className="mb-4">{para}</p>
            ));
          })()}
        </div>
      </AnimateIn>
    </main>
  );
}
