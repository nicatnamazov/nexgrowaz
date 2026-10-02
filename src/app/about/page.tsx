"use client";

import AnimateIn from "@/components/AnimateIn";
import Link from "next/link";
import { GraduationCap, BookOpen, PenTool, Globe, Award, Users, Clock, Star } from "lucide-react";
import AnimatedNumber from "@/components/AnimatedNumber";
import { useLang } from "@/utils/LangContext";

export default function About() {
  const { dict } = useLang();

  const STATS = [
    { icon: Users,       value: "500+", label: dict.about.stats.graduates },
    { icon: Award,       value: "8.0+", label: dict.about.stats.ielts },
    { icon: GraduationCap, value: "100+", label: dict.about.stats.abroad },
    { icon: Clock,       value: "5+",   label: dict.about.stats.experience },
  ];

  const SERVICES = [
    { icon: GraduationCap, title: dict.services[0].title, desc: dict.services[0].desc },
    { icon: BookOpen,      title: dict.services[1].title, desc: dict.services[1].desc },
    { icon: PenTool,       title: dict.services[2].title, desc: dict.services[2].desc },
    { icon: Globe,         title: dict.services[3].title, desc: dict.services[3].desc },
  ];

  return (
    <main className="bg-[#F6F9EA] overflow-hidden">

      {/* ── Hero ── */}
      <section className="pt-28 md:pt-36 pb-14 md:pb-20 container mx-auto px-4 max-w-5xl text-center">
        <AnimateIn delay={0.05}>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-4 py-2 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" />
            {dict.about.tag}
          </div>
        </AnimateIn>
        <AnimateIn delay={0.12}>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.08] mb-5 text-[#0B0C0B]">
            {dict.about.title}
          </h1>
        </AnimateIn>
        <AnimateIn delay={0.2}>
          <p className="text-base md:text-lg text-[#5E6157] max-w-2xl mx-auto leading-relaxed font-medium">
            {dict.about.desc}
          </p>
        </AnimateIn>
      </section>

      {/* ── Stats ── */}
      <section className="pb-14 md:pb-20 container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <AnimateIn key={i} delay={0.06 * i} direction="up">
                <div className="rounded-2xl bg-[#0B0C0B] p-6 flex flex-col items-center text-center gap-3 border border-white/5 hover:-translate-y-1 transition-transform duration-300">
                  <div className="w-11 h-11 rounded-full bg-[#D4F754]/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[#D4F754]" />
                  </div>
                  <AnimatedNumber value={s.value} />
                  <span className="text-xs font-medium text-gray-400">{s.label}</span>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-14 md:py-20 bg-[#EAF7B8]">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <AnimateIn delay={0.05} direction="left">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
                  <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.about.missionTag}
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-[#0B0C0B]">
                  {dict.about.missionTitle}
                </h2>
                <p className="text-[#5E6157] leading-relaxed font-medium mb-4" dangerouslySetInnerHTML={{ __html: dict.about.missionDesc1 }} />
                <p className="text-[#5E6157] leading-relaxed font-medium" dangerouslySetInnerHTML={{ __html: dict.about.missionDesc2 }} />
              </div>
            </AnimateIn>
            <AnimateIn delay={0.12} direction="right">
              <div className="rounded-2xl md:rounded-[2rem] bg-[#D4F754] p-8 md:p-10 flex flex-col gap-4">
                {dict.about.missionPoints.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#D4F754]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-semibold text-black text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="py-14 md:py-20 container mx-auto px-4 max-w-5xl">
        <AnimateIn delay={0.05} className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.about.servicesTag}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0B0C0B]">{dict.about.servicesTitle}</h2>
        </AnimateIn>

        <div className="grid sm:grid-cols-2 gap-4">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <AnimateIn key={i} delay={0.07 * i} direction="up">
                <div className="rounded-2xl bg-white border border-gray-100 p-7 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-11 h-11 rounded-xl bg-[#EAF7B8] flex items-center justify-center text-[#5A6332] mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0B0C0B] mb-2">{svc.title}</h3>
                  <p className="text-sm text-[#5E6157] leading-relaxed font-medium">{svc.desc}</p>
                </div>
              </AnimateIn>
            );
          })}
        </div>
      </section>


      {/* ── Address ── */}
      <section className="py-14 md:py-20 container mx-auto px-4 max-w-5xl">
        <AnimateIn delay={0.05} className="text-center mb-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.about.addressTag}
          </div>
          <h2 className="text-3xl font-bold text-[#0B0C0B]">{dict.about.addressTitle}</h2>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="rounded-2xl md:rounded-[2rem] bg-white border border-gray-100 shadow-sm p-8 md:p-10 grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-xs font-bold text-[#5E6157] uppercase tracking-widest mb-2">{dict.about.phone}</p>
              <a href="tel:+994993517082" className="block text-base font-bold text-[#0B0C0B] hover:text-[#5A6332]">+994 99 351 70 82</a>
              <a href="tel:+994993517081" className="block text-base font-bold text-[#0B0C0B] hover:text-[#5A6332]">+994 99 351 70 81</a>
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E6157] uppercase tracking-widest mb-2">{dict.about.email}</p>
              <a href="mailto:info@nexgrow.az" className="text-base font-bold text-[#0B0C0B] hover:text-[#5A6332]">info@nexgrow.az</a>
            </div>
            <div>
              <p className="text-xs font-bold text-[#5E6157] uppercase tracking-widest mb-2">{dict.about.address}</p>
              <address className="not-italic text-sm font-medium text-[#5E6157] leading-relaxed" dangerouslySetInnerHTML={{ __html: dict.about.addressText }} />
            </div>
          </div>
        </AnimateIn>
      </section>

      {/* ── CTA ── */}
      <section className="pb-16 container mx-auto px-4 max-w-5xl">
        <AnimateIn delay={0.05}>
          <div className="rounded-2xl md:rounded-[2rem] bg-[#D4F754] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">{dict.about.ctaTitle}</h2>
              <p className="text-sm font-medium text-black/70 max-w-sm">{dict.about.ctaDesc}</p>
            </div>
            <Link href="/contact"
              className="shrink-0 rounded-full bg-black px-8 py-4 text-sm font-bold text-white hover:bg-gray-900 transition-colors">
              {dict.nav.apply}
            </Link>
          </div>
        </AnimateIn>
      </section>

    </main>
  );
}
