"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/utils/LangContext";
import AnimateIn from "@/components/AnimateIn";
import { supabase } from "@/utils/supabase";

export default function UniversitiesPage() {
  const { dict, lang } = useLang();
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCountry, setSelectedCountry] = useState("Bütün Ölkələr");
  const [selectedDegree, setSelectedDegree] = useState("Bütün Dərəcələr");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function fetchUnis() {
      try {
        const { data, error } = await supabase.from('universities').select('*').order('created_at', { ascending: false });
        if (data && !error) {
          setUniversities(data);
        }
      } catch (err) {
        console.log("Universities table might not exist yet.");
      }
      setLoading(false);
    }
    fetchUnis();
  }, []);

  // Compute unique values for dropdowns
  const countries = useMemo(() => {
    const set = new Set(universities.map(u => u.country).filter(Boolean));
    return ["Bütün Ölkələr", ...Array.from(set)];
  }, [universities]);

  const degrees = useMemo(() => {
    const set = new Set<string>();
    universities.forEach(u => {
      let dList = [];
      try {
        dList = typeof u.degrees === 'string' ? JSON.parse(u.degrees) : (u.degrees || []);
      } catch (e) {
        dList = typeof u.degrees === 'string' ? u.degrees.split(',') : [];
      }
      if (Array.isArray(dList)) dList.forEach(d => set.add(d.trim()));
    });
    return ["Bütün Dərəcələr", ...Array.from(set)];
  }, [universities]);

  // Apply filters
  const filteredUniversities = useMemo(() => {
    return universities.filter(uni => {
      // Country Filter
      if (selectedCountry !== "Bütün Ölkələr" && uni.country !== selectedCountry) return false;

      // Degree Filter
      if (selectedDegree !== "Bütün Dərəcələr") {
        let dList = [];
        try {
          dList = typeof uni.degrees === 'string' ? JSON.parse(uni.degrees) : (uni.degrees || []);
        } catch (e) {
          dList = typeof uni.degrees === 'string' ? uni.degrees.split(',') : [];
        }
        if (!Array.isArray(dList) || !dList.some(d => d.trim() === selectedDegree)) return false;
      }

      // Price Filter
      if (maxPrice.trim() !== "") {
        const numPrice = parseFloat(maxPrice);
        if (!isNaN(numPrice)) {
          // Parse price string to number, e.g. "€ 4800,00" -> 4800
          const uniPriceRaw = typeof uni.price === 'string' ? uni.price.replace(/[^0-9]/g, '') : "0";
          const uniPriceNum = parseInt(uniPriceRaw) || 0;
          if (uniPriceNum > numPrice) return false;
        }
      }

      return true;
    });
  }, [universities, selectedCountry, selectedDegree, maxPrice]);

  return (
    <main className="min-h-screen pt-32 pb-20 px-4 max-w-[1400px] mx-auto bg-gray-50/50">
      <AnimateIn delay={0.1}>
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">Universitetlər</h1>
          <p className="text-black/60 max-w-2xl text-lg font-medium">Xaricdə təhsil üçün ən yaxşı universitetlər</p>
        </div>
      </AnimateIn>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-80 shrink-0">
          <div className="bg-white p-4 md:p-6 rounded-3xl border border-gray-100 shadow-sm sticky top-32">
            <h2 className="text-xl md:text-2xl font-bold mb-2">Universitetləri Filtrlə</h2>
            <div className="w-12 h-1 bg-[#D4F754] mb-6"></div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Ölkə</label>
                <select 
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F754]"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Təhsil Dərəcəsi</label>
                <select 
                  value={selectedDegree}
                  onChange={(e) => setSelectedDegree(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F754]"
                >
                  {degrees.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Maks Təhsil Haqqı</label>
                <input 
                  type="number" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="məs. 5000" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4F754]" 
                />
              </div>

              {/* Removing non-functional IELTS/GPA mockups as requested "düzgün filtrləmə qoy universitetlərə aid" */}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="flex-1">
          <p className="text-gray-500 mb-6 font-medium">Sizin üçün <span className="font-bold text-black">{filteredUniversities.length}</span> universitet tapıldı</p>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">Yüklənir...</div>
          ) : filteredUniversities.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl text-center border border-gray-100">
              <p className="text-gray-500">Heç bir universitet tapılmadı.</p>
              <button 
                onClick={() => {
                  setSelectedCountry("Bütün Ölkələr");
                  setSelectedDegree("Bütün Dərəcələr");
                  setMaxPrice("");
                }} 
                className="mt-4 px-4 py-2 bg-black text-[#D4F754] font-bold rounded-lg hover:bg-gray-800 transition-colors"
              >
                Filtrləri Təmizlə
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:p-6">
              {filteredUniversities.map((uni, i) => {
                let degreesList = [];
                try {
                  degreesList = typeof uni.degrees === 'string' ? JSON.parse(uni.degrees) : (uni.degrees || []);
                } catch (e) {
                  degreesList = typeof uni.degrees === 'string' ? uni.degrees.split(',') : [];
                }
                const hasDegrees = Array.isArray(degreesList) && degreesList.length > 0;

                return (
                  <AnimateIn key={uni.id} delay={0.1 + (i % 4) * 0.1}>
                    <Link href={`/universities/${uni.slug}`} className="group block bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300">
                      <div className="relative w-full aspect-[2/1] md:aspect-[16/10] overflow-hidden">
                        <Image
                          src={uni.image}
                          alt={uni.name}
                          fill
                          priority={i < 4}
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          {uni.is_exclusive && (
                            <span className="bg-[#D4F754] text-black px-3 py-1 rounded text-xs font-bold shadow-sm">Eksklüziv</span>
                          )}
                          {hasDegrees && (
                            <span className="bg-black text-white px-3 py-1 rounded text-xs font-bold shadow-sm">
                              {degreesList.join(", ")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="p-4 md:p-6">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mb-3">
                          <span>🎓 Ödəniş: {uni.price}</span>
                          <span className="text-[#8cb815] cursor-help" title="Məlumat">ⓘ</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-black mb-2 group-hover:text-[#8cb815] transition-colors">{uni.name}</h3>
                        <p className="text-gray-500 text-sm">{uni.city}, {uni.country}</p>
                      </div>
                    </Link>
                  </AnimateIn>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
