"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, User } from "lucide-react";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        // If logged in, redirect to home or admin
        router.push("/");
      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Şifrələr uyğun gəlmir!");
        }

        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              phone: formData.phone,
            }
          }
        });

        if (error) throw error;
        
        // Try to insert profile manually (might fail if email confirmation is required and RLS blocks, but we try)
        if (data.user) {
          await supabase.from("profiles").insert({
            id: data.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            email: formData.email
          }).select().single();
        }

        setMessage("Qeydiyyat uğurla tamamlandı! Zəhmət olmasa e-poçtunuzu yoxlayın və hesabınızı təsdiqləyin.");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Zəhmət olmasa e-poçt ünvanınızı daxil edin.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?reset=true`,
      });
      if (error) throw error;
      setMessage("Şifrə sıfırlama linki e-poçtunuza göndərildi!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#0B0C0B] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-[#D4F754]/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-[#D4F754]/5 blur-[100px] rounded-full" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-white/50 hover:text-white transition-colors mb-8 group">
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Ana səhifəyə qayıt
        </Link>

        <div className="bg-[#111211] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Animated top border */}
          <motion.div 
            className="absolute top-0 left-0 h-1 bg-[#D4F754]"
            initial={{ width: "0%" }}
            animate={{ width: isLogin ? "40%" : "100%" }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? "login" : "register"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h1 className="text-3xl font-bold text-white mb-2">
                {isLogin ? "Xoş gəlmisiniz!" : "Yeni Hesab Yarat"}
              </h1>
              <p className="text-white/50 text-sm mb-8">
                {isLogin ? "Davam etmək üçün hesabınıza giriş edin." : "Bizə qoşulun və xidmətlərimizdən tam yararlanın."}
              </p>

                            {error && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-xs p-3 rounded-xl mb-4">{error}</div>}
              {message && <div className="bg-green-500/10 border border-green-500/50 text-green-500 text-xs p-3 rounded-xl mb-4">{message}</div>}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {!isLogin && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Ad</label>
                      <input type="text" required placeholder="Adınız" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Soyad</label>
                      <input type="text" required placeholder="Soyadınız" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                    </div>
                  </div>
                )}

                {!isLogin && (
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Əlaqə nömrəsi</label>
                    <input type="tel" required placeholder="+994" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">E-poçt</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-white/30" />
                    </div>
                    <input type="email" required placeholder="nümunə@email.com" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                  </div>
                </div>

                <div className={!isLogin ? "grid grid-cols-2 gap-4" : ""}>
                  <div>
                    <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Şifrə</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock size={18} className="text-white/30" />
                      </div>
                      <input type="password" required placeholder="••••••••" name="password" value={formData.password} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                    </div>
                  </div>

                  {!isLogin && (
                    <div>
                      <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider mb-2">Təkrar Şifrə</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Lock size={18} className="text-white/30" />
                        </div>
                        <input type="password" required placeholder="••••••••" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-[#D4F754] transition-colors" />
                      </div>
                    </div>
                  )}
                </div>

                {isLogin && (
                  <div className="flex justify-end mt-2">
                    <a href="#" onClick={handleResetPassword} className="text-xs text-white/50 hover:text-[#D4F754] transition-colors">Şifrəni unutmusunuz?</a>
                  </div>
                )}
                
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#D4F754] text-black font-bold py-3.5 rounded-xl mt-6 hover:bg-[#c2e44d] hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-[#D4F754]/20"
                >
                  {loading ? "Gözləyin..." : (isLogin ? "Daxil ol" : "Qeydiyyatdan keç")}
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-white/50 text-sm">
                  {isLogin ? "Hesabınız yoxdur?" : "Artıq hesabınız var?"}{" "}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-[#D4F754] font-semibold hover:underline transition-all"
                  >
                    {isLogin ? "Qeydiyyatdan keçin" : "Giriş edin"}
                  </button>
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
