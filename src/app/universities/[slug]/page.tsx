"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";
import { supabase } from "@/utils/supabase";
import { useLang } from "@/utils/LangContext";

export default function UniversityDetailPage() {
  const params = useParams();
  const slug = params.slug;
  const { lang, dict } = useLang();
  
  const [uni, setUni] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("icmal");

  useEffect(() => {
    async function fetchUni() {
      try {
        const { data, error } = await supabase.from('universities').select('*').eq('slug', slug).single();
        if (data && !error) setUni(data);
      } catch (err) {}
      setLoading(false);
    }
    fetchUni();
  }, [slug]);

  if (loading) return <div className="min-h-screen pt-40 text-center">Yüklənir...</div>;
  if (!uni) return <div className="min-h-screen pt-40 text-center font-bold text-xl">Universitet tapılmadı</div>;

  return (
    <main className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] md:h-[500px]">
        <Image src={uni.image} alt={uni.name} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-[#0B0C0B]/80 mix-blend-multiply" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto pt-20">
          <AnimateIn direction="up">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">{uni.name}</h1>
            <div className="flex items-center gap-2 text-white/70 text-sm md:text-base font-medium">
              <Link href="/" className="hover:text-white">{dict.nav.home}</Link>
              <span>/</span>
              <span className="text-white">{uni.name}</span>
            </div>
          </AnimateIn>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-[-80px] md:mt-[-120px] relative z-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area */}
          <div className="flex-1 mt-20 lg:mt-32">
            <div className="bg-gray-100/50 p-2 rounded-xl flex gap-2 mb-8 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('mezmun')}
                className={`px-8 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'mezmun' ? 'bg-white shadow-sm text-black border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Məzmun
              </button>
              <button 
                onClick={() => setActiveTab('telebler')}
                className={`px-8 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'telebler' ? 'bg-white shadow-sm text-black border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Tələblər
              </button>
              <button 
                onClick={() => setActiveTab('proqramlar')}
                className={`px-8 py-3 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${activeTab === 'proqramlar' ? 'bg-white shadow-sm text-black border-b-2 border-red-600' : 'text-gray-500 hover:bg-gray-200'}`}
              >
                Proqramlar
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-gray-100 prose max-w-none prose-p:text-gray-600 prose-headings:text-black">
              <h2 className="text-2xl font-bold mb-6">Universitet Haqqında</h2>
              {/* Display translated content based on tab */}
              {(() => {
                const c = uni.content && (uni.content[lang] || uni.content.az);
                let text = "";
                if (typeof c === "string") {
                  text = activeTab === "mezmun" ? c : "Məlumat yoxdur";
                } else if (c && typeof c === "object") {
                  text = c[activeTab] || "Məlumat yoxdur";
                } else {
                  text = "Məlumat yoxdur";
                }
                // Convert newlines to br tags for simple display
                const htmlText = text.replace(/\n/g, '<br/>');
                return <div dangerouslySetInnerHTML={{ __html: htmlText }} />;
              })()}
            </div>
          </div>

          {/* Right Sidebar Card */}
          <div className="w-full lg:w-[350px] shrink-0">
            <div className="bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 sticky top-32">
              <div className="relative w-full h-[220px]">
                <Image src={uni.image} alt={uni.name} fill sizes="(max-width: 1024px) 100vw, 350px" className="object-cover" />
              </div>
              <div className="p-8">
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                      <span className="text-blue-500">🎓</span> Level
                    </span>
                    <span className="text-gray-600 text-sm font-medium text-right max-w-[150px] truncate">
                      {(() => {
                        try {
                          const degs = typeof uni.degrees === 'string' ? JSON.parse(uni.degrees) : (uni.degrees || []);
                          return Array.isArray(degs) ? degs.join(", ") : "";
                        } catch(e) {
                          return typeof uni.degrees === 'string' ? uni.degrees : "";
                        }
                      })()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                      <span className="text-blue-500">📍</span> Location
                    </span>
                    <span className="text-gray-600 text-sm font-medium text-right max-w-[150px] truncate">
                      {uni.city}, {uni.country}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <span className="flex items-center gap-2 text-gray-700 font-bold text-sm">
                      <span className="text-blue-500">💶</span> Ödəniş
                    </span>
                    <span className="text-gray-600 text-sm font-medium flex items-center gap-1">
                      {uni.price} <span className="text-blue-500 cursor-help" title="Məlumat">ⓘ</span>
                    </span>
                  </div>
                </div>

                <a href={`https://wa.me/994993517082?text=${encodeURIComponent('Salam, mən ' + uni.name + ' universiteti ilə maraqlanıram.')}`} target="_blank" rel="noopener noreferrer" className="mt-8 block w-full bg-[#0066FF] hover:bg-blue-700 text-white text-center font-bold py-4 rounded-xl transition-colors uppercase tracking-wider text-sm shadow-lg shadow-blue-500/30">
                  MÜRACİƏT ET
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
