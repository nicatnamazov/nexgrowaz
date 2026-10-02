"use client";
import { User } from "lucide-react";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useLenis } from "lenis/react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useLang } from "@/utils/LangContext";
import { supabase } from "@/utils/supabase";

const LANGS = [
  { code: "az", label: "AZ" },
  { code: "en", label: "EN" },
  { code: "tr", label: "TR" },
  { code: "ru", label: "RU" },
  { code: "de", label: "DE" },
] as const;

// Saytlab easing: cubic-bezier(0.44, 0, 0.56, 1)
const EASE = [0.44, 0, 0.56, 1] as const;

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
    useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    const { data: authListener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  const lenis = useLenis();
  const pathname = usePathname();

  const { lang, setLang, dict } = useLang();

  if (pathname?.startsWith("/admin")) return null;

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const router = useRouter();

  const goHome = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    if (pathname === "/") {
      if (lenis) lenis.scrollTo(0, { duration: 2.0, easing: (t: number) => 1 - Math.pow(1 - t, 4) });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      router.push('/');
    } else {
      router.push('/');
    }
  }, [lenis, pathname, router]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const handleLangChange = (code: any) => {
    setLang(code);
    setLangOpen(false);
  };

  const navLinks = [
    { label: dict.nav.home,         href: "/",            action: goHome },
    { label: dict.nav.services,     href: "/#xidmetler",  action: closeMobile },
    { label: dict.nav.universities, href: "/universities",action: closeMobile },
    { label: "İmtahanlar", href: "/online-exam", action: closeMobile },
    { label: dict.nav.contact,      href: "/contact",     action: closeMobile },
  ];

  return (
    <>
      {/* ── Navbar bar ── */}
      <div className={`fixed top-0 left-0 right-0 z-50 flex justify-center px-3 sm:px-5 transition-all duration-500 ${scrolled ? "pt-2 sm:pt-3" : "pt-4 sm:pt-6"}`}>
        <nav className="relative z-10 bg-[#0B0C0B] text-white rounded-full px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between w-[96%] max-w-[880px] shadow-2xl gap-2 md:gap-3 lg:gap-4">

          {/* Logo */}
          <a href="/" onClick={goHome} className="flex items-center gap-3 group shrink-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white overflow-hidden border border-white/20 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <Image src="/Logo.jpeg" alt="NexGrow" width={52} height={52} className="object-cover w-full h-full" />
            </div>
            <span className="font-bold text-base sm:text-[17px] tracking-tight leading-none">NexGrow</span>
          </a>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-3 lg:gap-4 text-sm font-medium whitespace-nowrap">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} onClick={l.action as React.MouseEventHandler}
                className="text-white hover:text-[#D4F754] transition-colors duration-200 tracking-wide">
                {l.label}
              </a>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2.5">

            {/* Lang switcher — globe SVG icon */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 rounded-full px-3.5 py-2.5 text-xs font-bold text-white transition-colors"
              >
                <svg className="w-4 h-4 text-white/70 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
                </svg>
                <span>{lang.toUpperCase()}</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${langOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.96 }}
                    transition={{ duration: 0.18, ease: EASE }}
                    className="absolute right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-2xl p-2 flex flex-col gap-1 min-w-[72px] shadow-xl z-50"
                  >
                    {LANGS.map((l) => (
                      <button key={l.code}
                        onClick={() => handleLangChange(l.code)}
                        className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${lang === l.code ? "bg-[#D4F754] text-black" : "text-white/70 hover:text-white hover:bg-white/10"}`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* CTA — hide on very small screens since it's inside the mobile menu */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <a href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#D4F754] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-black hover:bg-[#c2e44d] transition-all duration-300 hover:scale-105 whitespace-nowrap shadow-lg">
                  <User size={18}/> Profil
                </a>
              ) : (
                <a href="/auth"
                  className="inline-flex rounded-full bg-[#D4F754] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-black hover:bg-[#c2e44d] transition-all duration-300 hover:scale-105 whitespace-nowrap">
                  {dict.nav.auth}
                </a>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex flex-col gap-[5px] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menyu"
            >
              <motion.span animate={mobileOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="block w-[22px] h-[2.5px] bg-white rounded-full origin-center" />
              <motion.span animate={mobileOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.2 }}
                className="block w-[22px] h-[2.5px] bg-white rounded-full" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                transition={{ duration: 0.28, ease: EASE }}
                className="block w-[22px] h-[2.5px] bg-white rounded-full origin-center" />
            </button>
          </div>
        </nav>
      </div>

      {/* ── Mobile menu — drops down from top (high z-index to stay above content) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
              onClick={closeMobile}
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="fixed top-[5.5rem] left-3 right-3 z-50 bg-[#0B0C0B] rounded-[2rem] py-5 px-6 shadow-2xl md:hidden border border-white/10"
            >
              <div className="flex flex-col gap-1 flex-1">
                {navLinks.map((l, i) => (
                  <motion.div key={l.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i, duration: 0.32, ease: EASE }}
                  >
                    <a href={l.href} onClick={l.action as React.MouseEventHandler}
                      className="flex items-center py-4 text-lg font-semibold text-white/80 hover:text-white border-b border-white/10 last:border-0 transition-colors duration-200">
                      {l.label}
                    </a>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.32, ease: EASE }}
                className="mt-6 flex flex-col gap-3"
              >

                {user ? (<a href="/dashboard" onClick={closeMobile} className="w-full text-center py-4 bg-[#D4F754] text-black font-bold text-lg rounded-full shadow-lg flex items-center justify-center gap-2"><User size={20}/> Profil</a>) : (<a href="/auth" onClick={closeMobile}
                  className="block w-full rounded-full bg-[#D4F754] px-6 py-4 text-center text-base font-bold text-black shadow-lg">
                  {dict.nav.auth}
                </a>)}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Close lang on outside click */}
      {langOpen && <div className="fixed inset-0 z-[45]" onClick={() => setLangOpen(false)} />}
    </>
  );
}
