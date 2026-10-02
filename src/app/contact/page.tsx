"use client";
import { submitContactForm } from "@/app/actions";
import { showAlert } from "@/utils/alert";
import { supabase } from "@/utils/supabase";



import AnimateIn from "@/components/AnimateIn";
import { Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useLang } from "@/utils/LangContext";

export default function Contact() {
  const { dict } = useLang();
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", contact: "", service: "", message: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.id]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`NexGrow Müraciət — ${form.service || "Ümumi"}`);
    const body = encodeURIComponent(
      `Ad: ${form.firstName} ${form.lastName}\n` +
      `Əlaqə: ${form.contact}\n` +
      `Xidmət: ${form.service}\n\n` +
      `Mesaj:\n${form.message}`
    );
    window.location.href = `mailto:info@nexgrow.az?subject=${subject}&body=${body}`;
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };


  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({data: {user}}: any) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({data}: any) => {
          if (data) {
            setUserProfile({...data, email: user.email});
          }
        });
      }
    });
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitContactForm(formData);
    setLoading(false);
    if (res?.error) {
      showAlert(res.error, "error");
    } else {
      showAlert("Mesajınız uğurla göndərildi!", "success");
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <main className="pt-28 pb-16 overflow-hidden min-h-screen bg-[#F6F9EA]">
      <div className="container mx-auto px-4 max-w-6xl">

        <AnimateIn delay={0.05} direction="up" className="text-center mb-12">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#EAF7B8] px-3 py-1.5 text-xs font-semibold text-[#5A6332]">
            <span className="h-2 w-2 rounded-full bg-[#82992F]" /> {dict.contact.tag}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3 text-[#0B0C0B]">{dict.contact.title}</h1>
          <p className="text-base text-[#5E6157] max-w-lg mx-auto font-medium">
            {dict.contact.desc}
          </p>
        </AnimateIn>

        <div className="grid lg:grid-cols-2 gap-5 md:gap-6 items-start">

          {/* Info column */}
          <AnimateIn delay={0.1} direction="left" className="flex flex-col gap-4">

            {[
              { label: "Telefon 1", value: "+994 99 351 70 82", href: "tel:+994993517082", icon: Phone },
              { label: "Telefon 2", value: "+994 99 351 70 81", href: "tel:+994993517081", icon: Phone },
              { label: "Email",    value: "info@nexgrow.az",   href: "mailto:info@nexgrow.az", icon: Mail },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-[#EAF7B8] flex items-center justify-center text-[#5A6332] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{item.label}</p>
                    <a href={item.href} className="text-base font-bold text-[#0B0C0B] hover:text-[#5A6332] transition-colors">{item.value}</a>
                  </div>
                </div>
              );
            })}

            {/* Address */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-full bg-[#EAF7B8] flex items-center justify-center text-[#5A6332] shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest mb-1">{dict.about.address}</p>
                <address className="not-italic text-sm font-bold text-[#0B0C0B] leading-relaxed" dangerouslySetInnerHTML={{ __html: dict.about.addressText }} />
              </div>
            </div>

            {/* Social */}
            <div className="rounded-2xl bg-[#0B0C0B] p-5 flex flex-wrap gap-2">
              {[
                { label: "Instagram", href: "https://instagram.com/nexgrowlanguage" },
                { label: "WhatsApp",  href: "https://wa.me/994993517082" },
                { label: "TikTok",    href: "https://tiktok.com/@nexgrowlanguage" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2 rounded-full transition-colors text-xs">
                  {s.label}
                </a>
              ))}
            </div>
          </AnimateIn>

          {/* Form */}
          <AnimateIn delay={0.15} direction="right">
            <div className="rounded-[1.5rem] bg-white p-6 md:p-8 border border-gray-100 shadow-lg">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-[#EAF7B8] flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#5A6332]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <p className="text-lg font-bold text-[#0B0C0B]">{dict.contact.successTitle}</p>
                  <p className="text-sm text-[#5E6157]">{dict.contact.successDesc}</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-bold text-[#0B0C0B] mb-5">{dict.contact.title}</h2>
                  <form onSubmit={handleContactSubmit} className="flex flex-col gap-4">
<input type="hidden" name="type" value="Contact Page" />
                    <input type="hidden" name="_subject" value="Yeni Müraciət (Əlaqə səhifəsindən)" />
                    <input type="hidden" name="_captcha" value="false" />
                    <input type="hidden" name="_template" value="table" />
                    
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{dict.contact.form.name.split(' ')[0]}</label>
                        <input name="Ad" type="text" placeholder={dict.contact.form.namePlaceholder}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all" required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{dict.contact.form.name.split(' ')[2] || dict.contact.form.name}</label>
                        <input name="Soyad" type="text" placeholder={dict.contact.form.namePlaceholder}
                          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{dict.contact.form.phone}</label>
                      <input name="Telefon" type="text" placeholder={dict.contact.form.phonePlaceholder}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all" required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">Email (Mütləqdir)</label>
                      <input name="Email" type="email" placeholder="Email ünvanınız"
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all" required />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{dict.contact.form.service}</label>
                      <select name="Xidmət" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all appearance-none">
                        <option value="">{dict.contact.form.servicePlaceholder}</option>
                        {dict.services.map((svc: any, idx: number) => (
                          <option key={idx} value={svc.title}>{svc.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-2">
                      <label className="text-[10px] font-bold text-[#5E6157] uppercase tracking-widest">{dict.contact.form.message}</label>
                      <textarea name="Mesaj" rows={4} placeholder={dict.contact.form.messagePlaceholder}
                        className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-[#82992F] focus:bg-white focus:ring-2 focus:ring-[#82992F]/10 transition-all resize-none" />
                    </div>

                    <button type="submit" className="group rounded-xl bg-[#0B0C0B] px-6 py-4 text-sm font-bold text-white hover:bg-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
                      {dict.contact.form.submit}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </AnimateIn>
        </div>
      </div>
    </main>
  );
}
