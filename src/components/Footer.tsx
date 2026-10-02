"use client";

import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/utils/LangContext";
import { usePathname } from "next/navigation";

const getSocialIcon = (label: string) => {
  const l = label.toLowerCase();
  if (l.includes("instagram")) return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>;
  if (l.includes("tiktok")) return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.26 8.26 0 004.84 1.55V6.79a4.85 4.85 0 01-1.07-.1z"/></svg>;
  if (l.includes("facebook")) return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>;
  if (l.includes("whatsapp")) return <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>;
  return null;
};

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";

export default function Footer() {
  const { dict } = useLang();
  const pathname = usePathname();
  const [socials, setSocials] = useState<any[]>([
    // Fallback default socials
    { label: "Instagram", href: "https://instagram.com/nexgrowlanguage" },
    { label: "WhatsApp", href: "https://wa.me/994993517082" }
  ]);

  useEffect(() => {
    supabase.from('settings').select('socials').eq('id', 1).single().then(({data}) => {
      if (data && data.socials && data.socials.length > 0) {
        setSocials(data.socials);
      }
    });
  }, []);
  
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="bg-[#F6F9EA] pt-5 pb-4 px-3 sm:px-5">
      <div className="container mx-auto max-w-[1400px]">
        <div className="flex flex-col lg:flex-row gap-4">

          {/* Lime card */}
          <div className="flex-1 bg-[#D4F754] rounded-[2rem] p-7 md:p-9 flex flex-col justify-between min-h-[260px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white overflow-hidden border-2 border-white/50 shadow-sm">
                  <Image src="/Logo.jpeg" alt="NexGrow" width={40} height={40} className="object-cover" />
                </div>
                <div>
                  <span className="font-bold text-lg tracking-tight text-black block">{dict.home.heroTag.split(' ')[0]}</span>
                  <span className="text-[10px] text-black/60 font-medium">{dict.home.heroTag.substring(dict.home.heroTag.indexOf(' ') + 1)}</span>
                </div>
              </div>
              <p className="text-black/75 font-medium text-sm max-w-xs leading-relaxed">
                {dict.about.desc}
              </p>
            </div>

            <div className="mt-6">
              <div className="flex flex-wrap gap-2">
                {socials.map((s, idx) => (
                  <a key={idx} href={s.href} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 bg-white/80 hover:bg-white text-black font-semibold px-3.5 py-2 rounded-full transition-colors text-xs">
                    {getSocialIcon(s.label)} {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Dark card */}
          <div className="flex-[1.6] bg-[#0A0A0A] rounded-[2rem] p-7 md:p-9 flex flex-col sm:flex-row gap-8 sm:gap-10 text-white min-h-[260px]">

            <div className="flex-1 min-w-[110px]">
              <div className="flex flex-col gap-3 text-gray-400 text-sm font-medium mt-4">
                <Link href="/news"         className="text-[#D4F754] hover:text-white transition-colors">{dict.nav.news}</Link>
                <Link href="/about"        className="hover:text-white transition-colors">{dict.nav.about}</Link>
                <Link href="/contact"      className="hover:text-white transition-colors">{dict.nav.contact}</Link>
              </div>
            </div>

            <div className="flex-[2]">
              <p className="text-[10px] font-bold text-white/35 uppercase tracking-widest mb-4">{dict.nav.contact}</p>
              <div className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-1">
                  <a href="tel:+994993517082" className="text-gray-300 hover:text-white transition-colors font-medium">+994 99 351 70 82</a>
                  <a href="tel:+994993517081" className="text-gray-300 hover:text-white transition-colors font-medium">+994 99 351 70 81</a>
                </div>
                <a href="mailto:info@nexgrow.az" className="text-gray-300 hover:text-white transition-colors font-medium">info@nexgrow.az</a>
                <address className="not-italic text-gray-500 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: dict.about.addressText }} />
              </div>
            </div>
          </div>
        </div>

        <div className="w-full text-center mt-4 text-xs font-medium text-gray-500">
          © {new Date().getFullYear()} {dict.home.heroTag}. Bütün hüquqlar qorunur.
        </div>
      </div>
    </footer>
  );
}

