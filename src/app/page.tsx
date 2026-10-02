"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import {
  ArrowDown, MessageCircle, GraduationCap, BookOpen, PenTool, Globe, Calendar, Eye, ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AnimateIn from "@/components/AnimateIn";
import { useLang } from "@/utils/LangContext";
import { supabase } from "@/utils/supabase";

// ─── Constants ────────────────────────────────────────────────────────────────

const WA_NUMBER = "994993517082";


// ─── Testimonials — interactive auto-scroll, swipeable, pause on hover ────────

function TeamSection() {
  const [team, setTeam] = useState<any[]>([]);
  const { lang } = useLang();

  useEffect(() => {
    async function fetchTeam() {
      const { data } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
      if (data) setTeam(data);
    }
    fetchTeam();
  }, []);

  if (team.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {team.map((t, idx) => (
        <div key={idx} className="group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100">
            <img src={t.image} alt={t.name[lang] || t.name.az} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform">
              <h3 className="font-bold text-xl mb-1">{t.name[lang] || t.name.az}</h3>
              <p className="text-[#D4F754] text-sm font-medium">{t.role[lang] || t.role.az}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── FAQ Item — opens on hover (desktop) OR click (mobile) ───────────────────

function FaqItem({ faq, idx }: { faq: { q: string, a: string }; idx: number }) {
  const [open, setOpen] = useState(false);

  return (
    <AnimateIn delay={0.05 * idx} direction="up">
      <div
        className={`rounded-2xl border transition-colors duration-300 cursor-pointer overflow-hidden
          ${open ? "bg-[#D4F754] border-[#D4F754]" : "bg-white border-gray-200 hover:bg-[#D4F754] hover:border-[#D4F754]"}`}
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <div className="flex justify-between items-center p-5">
          <h4 className="text-base font-bold text-black pr-4">{faq.q}</h4>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
            ${open ? "bg-black text-white rotate-180" : "bg-[#EAF7B8] text-[#5A6332]"}`}>
            <ArrowDown className="w-3.5 h-3.5" />
          </div>
        </div>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.44, 0, 0.56, 1] }}
            >
              <p className="px-5 pb-5 text-sm text-black/80 font-medium leading-relaxed">{faq.a}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimateIn>
  );
}

// ─── Hero Phone ── seamless infinite marquee ──────────────────────────────────

function HeroPhone({ newsList, heroSlugs }: { newsList: any[], heroSlugs: string[] }) {
  const { lang } = useLang();
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Only use explicitly selected items via Telefon ekranında göstər (make_hero)
  const phoneItems = newsList ? newsList.filter(n => heroSlugs.includes(n.slug)) : [];
  const displayItems = phoneItems.length > 0 ? phoneItems : [];

  useEffect(() => {
    if (displayItems.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % displayItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [displayItems.length]);

  const current = displayItems[currentIdx];

  // Ensure enough items to fill the screen twice for seamless infinite scroll
  const minItemsRequired = 30;
  // Use ALL news items for the background marquee!
  const marqueeItems = newsList && newsList.length > 0 ? newsList : displayItems;
  const safeMarqueeLength = Math.max(1, marqueeItems.length);
  const marqueeMultiplier = Math.max(1, Math.ceil(minItemsRequired / safeMarqueeLength));
  const marqueeTiles = Array.from({ length: marqueeMultiplier }).flatMap(() => marqueeItems);
  const all = marqueeItems.length > 0 ? [...marqueeTiles, ...marqueeTiles] : []; // Move exactly 50%

  return (
    <section className="relative w-full mb-12 flex justify-center items-center">
      {/* Background Marquee Wrapper (overflow-hidden to contain images horizontally) */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-full h-[260px] sm:h-[320px] md:h-[380px] overflow-hidden z-10 pointer-events-auto">
        {/* Seamless marquee strip */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 flex gap-4 md:gap-6"
          style={{ width: "max-content" }}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 65, repeat: Infinity, ease: "linear", repeatType: "loop" }}
        >
          {all.map((news, i) => (
            <Link
              href={`/news/${news.slug}`}
              key={i}
              className="group block w-[160px] sm:w-[220px] md:w-[260px] aspect-[4/5] rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-black/5 relative hover:scale-[1.03] transition-transform"
            >
              <Image src={news.image} alt={news.title[lang] || news.title.az} width={260} height={325} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs md:text-sm font-bold leading-tight line-clamp-2">{news.title[lang] || news.title.az}</span>
              </div>
            </Link>
          ))}
        </motion.div>

        {/* Fade edges */}
        <div className="absolute inset-y-0 left-0 w-12 md:w-24 bg-gradient-to-r from-[#F6F9EA] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 md:w-24 bg-gradient-to-l from-[#F6F9EA] to-transparent z-10 pointer-events-none" />
      </div>

      {/* iPhone 17 Pro-style phone (Relative so it dictates section height, NO overflow hidden on parent) */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.45, ease: [0.44, 0, 0.56, 1] }}
        className="relative z-30 w-[45vw] max-w-[180px] sm:max-w-[220px] md:max-w-[260px] aspect-[9/19.5] drop-shadow-[0_25px_25px_rgba(0,0,0,0.3)] my-4 md:my-8"
      >
        {/* Outer shell (Thinner bezels) */}
        <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3rem] bg-[#1C1C1E] shadow-[0_0_0_1.5px_#555,0_0_0_5px_#1C1C1E] overflow-hidden">
          {/* Side buttons */}
          <div className="absolute left-[-4px] top-[22%] w-[4px] h-6 rounded-l-full bg-[#555]" />
          <div className="absolute left-[-4px] top-[32%] w-[4px] h-10 rounded-l-full bg-[#555]" />
          <div className="absolute left-[-4px] top-[43%] w-[4px] h-10 rounded-l-full bg-[#555]" />
          <div className="absolute right-[-4px] top-[30%] w-[4px] h-14 rounded-r-full bg-[#555]" />

          {/* Screen */}
          <div className="absolute inset-[3px] md:inset-[4px] rounded-[2.3rem] md:rounded-[2.8rem] bg-[#D4F754] overflow-hidden flex flex-col items-center justify-center gap-3">
            {/* Dynamic Island */}
            <div className="absolute top-[3%] left-1/2 -translate-x-1/2 w-[30%] h-[3.8%] bg-black rounded-full z-10 flex items-center justify-between px-2 shadow-sm">
              <div className="w-[8%] aspect-square rounded-full bg-[#111]" />
              <div className="w-[8%] aspect-square rounded-full bg-[#0a0a2a] relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-blue-500/40 rounded-full blur-[1px]" />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {current ? (
                <motion.div
                  key={current.slug}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full pointer-events-auto"
                >
                  <Link href={`/news/${current.slug}`} className="block w-full h-full group">
                    <Image src={current.image} alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4">
                      <span className="text-white text-xs sm:text-sm font-bold leading-snug line-clamp-3">{current.title[lang] || current.title.az}</span>
                    </div>
                  </Link>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-black"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-xl mb-2">
                    <svg className="w-5 h-5 ml-1 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="font-bold text-sm">Video Yeri</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dot indicators */}
            {displayItems.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {displayItems.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all duration-300 ${i === currentIdx ? 'w-3 h-1.5 bg-[#D4F754]' : 'w-1.5 h-1.5 bg-white/50'}`} />
                ))}
              </div>
            )}

            {/* Home indicator */}
            <div className="absolute bottom-1.5 w-[35%] h-1 bg-black/40 rounded-full" />
          </div>
        </div>
      </motion.div>
    </section>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────


function FormCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length, isPaused]);

  if (!images || images.length === 0) return null;

  if (images.length === 1) {
    return (
      <div className="absolute inset-0 w-full h-full">
        <Image src={images[0]} alt={title} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div 
      className="absolute inset-0 w-full h-full overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0"
        >
          <Image src={images[currentIndex]} alt={`${title} - ${currentIndex + 1}`} fill className="object-cover" />
        </motion.div>
      </AnimatePresence>

      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
      </button>
      
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setCurrentIndex((prev) => (prev + 1) % images.length); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, idx) => (
          <button 
            type="button"
            key={idx}
            onClick={(e) => { e.preventDefault(); setCurrentIndex(idx); }}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentIndex ? 'bg-[#D4F754] w-4' : 'bg-white/50 hover:bg-white'}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { lang, dict } = useLang();
  const [newsList, setNewsList] = useState<any[]>([]);
  const [dynamicForms, setDynamicForms] = useState<any[]>([]);

  const [settings, setSettings] = useState<any>(null);
  const [heroSlugs, setHeroSlugs] = useState<string[]>([]);

  useEffect(() => {
    async function fetchData() {
      const { data: n } = await supabase.from('news').select('*').order('created_at', { ascending: false });
      if (n) setNewsList(n);

      const { data: f } = await supabase.from('dynamic_forms').select('*').eq('is_active', true);
      if (f) setDynamicForms(f);

      const { data: s } = await supabase.from('settings').select('*').eq('id', 1).single();
      if (s) {
        setSettings(s);
        if (s.hero_news_slug) setHeroSlugs(s.hero_news_slug.split(',').map((x: string) => x.trim()));
      }
    }
    fetchData();
  }, []);

  const SERVICES = [
    { title: dict.services[0].title, desc: dict.services[0].desc, icon: GraduationCap,
      waMsg: dict.services[0].waMsg, image: "/1.jpeg" },
    { title: dict.services[1].title, desc: dict.services[1].desc, icon: BookOpen,
      waMsg: dict.services[1].waMsg, image: "/2.jpeg" },
    { title: dict.services[2].title, desc: dict.services[2].desc, icon: PenTool,
      waMsg: dict.services[2].waMsg, image: "/1.jpeg" },
    { title: dict.services[3].title, desc: dict.services[3].desc, icon: Globe,
      waMsg: dict.services[3].waMsg, image: "/2.jpeg" },
  ];

  
  return (
    <main className="overflow-hidden font-sans bg-[#F6F9EA] selection:bg-[#D4F754] selection:text-black">

      {/* ── Hero ── */}
      <section className="container mx-auto px-4 pt-28 md:pt-32 pb-4 flex flex-col items-center text-center">
        <AnimateIn delay={0.1}>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-4 py-2 text-xs font-semibold text-[#5A6332] shadow-sm notranslate">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" />
            {dict.home.heroTag}
          </div>
        </AnimateIn>

        <AnimateIn delay={0.18}>
          <h1 className="max-w-4xl text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.08] tracking-tight mb-4 text-[#0B0C0B]">
            {dict.home.heroTitle}
          </h1>
        </AnimateIn>

        <AnimateIn delay={0.26}>
          <p className="max-w-xl text-base md:text-lg text-[#5E6157] mb-7 leading-relaxed font-medium px-2">
            {dict.home.heroDesc}
          </p>
        </AnimateIn>

        <AnimateIn delay={0.34}>
          <div className="flex flex-row items-center justify-center gap-2 sm:gap-3 mb-6 w-full max-w-sm mx-auto px-2 sm:px-4">
            <a href="#xidmetler"
              className="flex-1 text-center whitespace-nowrap rounded-full border border-gray-300 bg-white px-2 sm:px-4 py-3 sm:py-3.5 text-[12px] sm:text-sm font-bold text-black hover:bg-gray-50 transition-colors">
              {dict.home.services}
            </a>
            <a href="/contact"
              className="flex-1 text-center whitespace-nowrap rounded-full bg-[#0B0C0B] px-2 sm:px-4 py-3 sm:py-3.5 text-[12px] sm:text-sm font-bold text-white hover:bg-black transition-all hover:scale-105">
              {dict.home.apply}
            </a>
          </div>
        </AnimateIn>
      </section>

      {/* ── Hero phone + marquee ── */}
      <HeroPhone newsList={newsList} heroSlugs={heroSlugs} />

      {/* ── Services ── */}
      <section id="xidmetler" className="py-14 md:py-20 container mx-auto px-4 relative">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[600px] h-[400px] bg-[#D4F754] opacity-[0.12] blur-[90px] rounded-full" />
        </div>

        <AnimateIn delay={0.05} className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.home.servicesTag}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-2 text-[#0B0C0B]">{dict.home.servicesTitle}</h2>
          <p className="text-base text-[#5E6157] max-w-lg mx-auto">{dict.home.servicesDesc}</p>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-7xl mx-auto">
          {SERVICES.map((svc, idx) => {
            const Icon = svc.icon;
            const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(svc.waMsg)}`;
            return (
              <AnimateIn key={idx} delay={0.08 * idx} direction="up">
                <a href={waUrl} target="_blank" rel="noopener noreferrer"
                  className="group block rounded-2xl bg-gradient-to-b from-[#1A1A1A] to-[#0A0A0A] p-6 md:p-7 h-full min-h-[220px] flex flex-col justify-between border border-white/10 shadow-xl transition-all duration-500 hover:-translate-y-2 relative overflow-hidden">
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-[#D4F754] opacity-[0.15] blur-3xl rounded-full group-hover:opacity-30 transition-opacity duration-500" />

                  <div className="flex-1">
                    <div className="mb-4 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center text-white group-hover:text-[#D4F754] group-hover:bg-white/15 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{svc.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">{svc.desc}</p>
                  </div>

                  <div className="mt-5 flex items-center gap-1.5 text-[#D4F754] text-xs font-bold group-hover:gap-2.5 transition-all duration-300">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    WhatsApp-da müraciət et
                  </div>
                </a>
              </AnimateIn>
            );
          })}
        </div>
      </section>


            {/* ── Dynamic Forms ── */}
      {dynamicForms.map((form, idx) => (
        <section key={form.id} className="py-10 md:py-16 container mx-auto px-4 max-w-7xl">
          <AnimateIn delay={0.1}>
            <div className="relative rounded-[2rem] overflow-hidden bg-white shadow-2xl border border-gray-100 flex flex-col md:flex-row min-h-[500px]">
              <div className="md:w-[55%] p-8 md:p-14 flex flex-col justify-center">
                <h3 className="text-3xl md:text-5xl font-bold mb-4">{form.title}</h3>
                
                {(form.start_date || form.end_date) && (
                  <div className="flex flex-wrap gap-3 mb-4 text-sm font-semibold text-gray-700">
                    {form.start_date && (
                      <span className="bg-[#D4F754]/20 text-[#5A6332] px-3 py-1 rounded-full border border-[#D4F754]/30">{dict.home.formStart}: {form.start_date}</span>
                    )}
                    {form.end_date && (
                      <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full border border-red-200">{dict.home.formEnd}: {form.end_date}</span>
                    )}
                  </div>
                )}
                
                <p className="text-gray-600 mb-8 md:text-lg">{form.content}</p>
                <form action="https://formsubmit.co/info@nexgrow.az" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="hidden" name="_subject" value={`Yeni Müraciət: ${form.title}`} />
                  <input type="hidden" name="_captcha" value="false" />
                  <input type="hidden" name="_template" value="table" />
                  
                  <input type="text" name="Ad" required placeholder={dict.home.formName} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4F754] focus:ring-1 focus:ring-[#D4F754]" />
                  <input type="text" name="Soyad" required placeholder={dict.home.formSurname} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4F754] focus:ring-1 focus:ring-[#D4F754]" />
                  <input type="tel" name="Telefon" required placeholder={dict.home.formPhone} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4F754] focus:ring-1 focus:ring-[#D4F754]" />
                  <input type="email" name="Email" required placeholder={dict.home.formEmail} className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:outline-none focus:border-[#D4F754] focus:ring-1 focus:ring-[#D4F754]" />
                  
                  <div className="md:col-span-2 mt-2">
                    <button type="submit" className="w-full rounded-xl bg-black text-white font-bold py-4 hover:bg-gray-900 transition-colors text-lg">
                      {dict.home.formSubmit}
                    </button>
                  </div>
                </form>
              </div>
              <div className="md:w-[45%] relative min-h-[350px] md:min-h-full">
                {(() => {
                  let imgs = [];
                  try {
                    if (form.image?.startsWith('[')) imgs = JSON.parse(form.image);
                    else if (form.image) imgs = [form.image];
                  } catch(e) { imgs = form.image ? [form.image] : []; }
                  return <FormCarousel images={imgs} title={form.title} />;
                })()}
              </div>
            </div>
          </AnimateIn>
        </section>
      ))}

      {/* ── Testimonials ── infinite auto-marquee, no pause ── */}
      <section className="py-14 md:py-20 container mx-auto px-4 max-w-6xl overflow-hidden">
        <AnimateIn delay={0.05} className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.home.teamTag || "Komandamız"}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B0C0B]">{dict.home.teamTitle || "Müəllimlərimiz"}</h2>
        </AnimateIn>
        <TeamSection />
      </section>

      
{/* ── Latest News (Redesigned) ── */}
      <section className="py-14 md:py-20 container mx-auto px-4 overflow-hidden">
        <AnimateIn delay={0.05} className="flex justify-between items-end mb-8 max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B0C0B]">Ən son məlumatlar</h2>
          <Link href="/news" className="text-blue-600 font-bold hover:text-blue-800 transition-colors hidden sm:flex items-center gap-1">
            Bütün məlumatlar <ArrowRight size={18} />
          </Link>
        </AnimateIn>

        <div className="max-w-7xl mx-auto">
          {(() => {
            const display = newsList.filter(n => n.is_pinned);
            if (display.length === 0) return <p className="text-center text-gray-500">Ana səhifədə göstəriləcək məlumat seçilməyib.</p>;
            
            const mainNews = display[0];
            const sideNews = display.slice(1); // Infinite scroll, no slice limit

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Main Large News Card */}
                <div className="lg:col-span-7 flex flex-col h-full">
                  <AnimateIn direction="up" className="h-full">
                    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-shadow relative">
                      <Link href={`/news/${mainNews.slug}`} className="relative w-full h-[250px] sm:h-[350px] lg:h-[400px] block overflow-hidden shrink-0">
                        <Image src={mainNews.image} alt={mainNews.title[lang] || mainNews.title.az} fill className="object-cover hover:scale-105 transition-transform duration-700" />
                        <div className="absolute top-4 left-4 bg-white px-4 py-1.5 rounded-full text-xs font-bold text-blue-800 shadow-sm">
                          Ümumi
                        </div>
                      </Link>
                      <div className="p-6 md:p-8 flex flex-col flex-1">
                        <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 mb-4">
                          <span className="flex items-center gap-1.5"><Calendar size={14} /> {mainNews.date}</span>
                          
                        </div>
                        <h3 className="text-2xl md:text-3xl font-extrabold text-[#0B0C0B] mb-4 leading-tight hover:text-blue-600 transition-colors">
                          <Link href={`/news/${mainNews.slug}`}>{mainNews.title[lang] || mainNews.title.az}</Link>
                        </h3>
                        <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-6 flex-1">
                          {mainNews.excerpt[lang] || mainNews.excerpt.az}
                        </p>
                        <Link href={`/news/${mainNews.slug}`} className="inline-flex items-center text-red-600 font-bold text-sm gap-1 hover:text-red-800 transition-colors mt-auto">
                          Ətraflı <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </AnimateIn>
                </div>

                {/* Side Smaller News Cards */}
                {sideNews.length > 0 && (
                  <div className="lg:col-span-5 flex flex-col gap-4">
                    {sideNews.map((news, idx) => (
                      <AnimateIn key={news.id} delay={0.1 * idx} direction="left" className="h-[140px] sm:h-[160px]">
                        <Link href={`/news/${news.slug}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex p-3 hover:shadow-md hover:border-gray-200 transition-all h-full relative group">
                          <div className="relative w-[35%] sm:w-[40%] h-full rounded-xl overflow-hidden shrink-0">
                            <Image src={news.image} alt={news.title[lang] || news.title.az} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 bg-red-600 px-2 py-1 rounded text-[8px] sm:text-[10px] font-bold text-white shadow-sm max-w-[90%] break-words">
                              {news.title[lang] ? news.title[lang].substring(0, 20) : news.title.az.substring(0, 20)}...
                            </div>
                          </div>
                          <div className="pl-4 flex flex-col justify-center flex-1 w-[60%]">
                            <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wide mb-1 sm:mb-2 line-clamp-1">
                              MƏLUMAT
                            </span>
                            <h4 className="text-sm sm:text-base font-bold text-black mb-1 sm:mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
                              {news.title[lang] || news.title.az}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] sm:text-xs font-semibold text-gray-400 mt-auto">
                              <span className="flex items-center gap-1"><Calendar size={12} /> {news.date}</span>
                              
                            </div>
                          </div>
                        </Link>
                      </AnimateIn>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
        
        {/* Mobile "All news" button fallback */}
        <div className="mt-6 flex justify-center sm:hidden">
          <Link href="/news" className="text-blue-600 font-bold flex items-center gap-1">
            Bütün məlumatlar <ArrowRight size={18} />
          </Link>
        </div>
      </section>


      {/* ── FAQ ── */}
      <section className="py-14 md:py-20 container mx-auto px-4 max-w-6xl">
        <div className="mb-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.home.faqTag}
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#0B0C0B]">{dict.home.faqTitle}</h2>
        </div>

        <div className="grid md:grid-cols-[1fr_1.6fr] gap-6 items-start">
          <AnimateIn delay={0.05} direction="left">
            <div className="rounded-2xl md:rounded-[2rem] bg-[#D4F754] p-8 flex flex-col items-center text-center shadow-md">
              <div className="w-18 h-18 mb-5 w-20 h-20 rounded-full bg-gradient-to-b from-gray-700 to-black flex items-center justify-center shadow-xl">
                <MessageCircle className="w-9 h-9 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-black">{dict.home.faqBoxTitle}</h3>
              <p className="text-sm text-black/75 font-medium mb-6">{dict.home.faqBoxDesc}</p>
              <Link href="/contact" className="w-full rounded-full bg-black px-6 py-3.5 text-sm font-semibold text-white hover:bg-gray-900 transition-colors">
                {dict.home.contactBtn}
              </Link>
            </div>
          </AnimateIn>

          <div className="flex flex-col gap-3">
            {dict.faqs.map((faq: {q: string, a: string}, idx: number) => <FaqItem key={idx} faq={faq} idx={idx} />)}
          </div>
        </div>
      </section>


      {/* ── Pre-footer CTA — full width, rotating bg images ── */}
      <section className="bg-[#0B0C0B] relative overflow-hidden w-full">
        {/* Rotating image strip as background */}
        <div className="absolute inset-0 z-0 opacity-25">
          <motion.div
            className="flex gap-4 h-full items-center"
            style={{ width: "max-content" }}
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 70, repeat: Infinity, ease: "linear", repeatType: "loop" }}
          >
            {(() => {
               const sourceImages = (settings?.bottom_images && settings.bottom_images.length >= 2) 
                 ? settings.bottom_images.map((img: string) => ({ image: img })) 
                 : null;
               
               if (!sourceImages || sourceImages.length === 0) return null;
               
               // Duplicate enough times to fill screen
               const multiplier = Math.max(1, Math.ceil(20 / sourceImages.length));
               const tiles = Array.from({ length: multiplier }).flatMap(() => sourceImages);
               const all = [...tiles, ...tiles]; // Double it for seamless loop
               
               return all.map((item, i) => (
                 <div key={i} className="w-[200px] md:w-[280px] h-full min-h-full flex-shrink-0 overflow-hidden">
                   <Image
                     src={item.image}
                     alt=""
                     width={280}
                     height={400}
                     className="w-full h-full object-cover object-top"
                   />
                 </div>
               ));
            })()}
          </motion.div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0C0B]/80 via-[#0B0C0B]/70 to-[#0B0C0B] z-10 pointer-events-none" />

        {/* Content */}
        <div className="relative z-20 py-20 md:py-28 px-4 text-center">
          <AnimateIn delay={0.05}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-[#D4F754]" /> {dict.home.startTag}
            </div>
          </AnimateIn>
          <AnimateIn delay={0.12}>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-white leading-[1.1] max-w-3xl mx-auto">
              {dict.home.startTitle}
            </h2>
          </AnimateIn>
          <AnimateIn delay={0.18}>
            <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto font-medium mb-8">
              {dict.home.startDesc}
            </p>
          </AnimateIn>
          <AnimateIn delay={0.24}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/online-exam"
                className="inline-flex rounded-full bg-white/10 px-10 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all hover:scale-105 shadow-2xl border border-white/20"
              >
                Onlayn imtahan başla
              </Link>
            </div>
          </AnimateIn>
        </div>
      </section>
    </main>
  );
}

