"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { User, LogOut, FileText, CheckCircle, Clock, Settings as SettingsIcon, X, Save } from "lucide-react";
import { showAlert } from "@/utils/alert";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [updateForm, setUpdateForm] = useState({ first_name: "", last_name: "", phone: "", password: "" });
  const [updating, setUpdating] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [ansLoading, setAnsLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        supabase.from('exam_attempts').select('*, exams(title, password)').eq('user_id', user.id).order('started_at', { ascending: false }).then(({data}) => setAttempts(data || []));
        setLoading(false);
      }
    });
  }, [router]);

  
  
  const handleOpenAttempt = async (attempt: any) => {
    setSelectedAttempt(attempt);
    setAnsLoading(true);
    const { data } = await supabase.from('exam_answers').select('*, questions(*)').eq('attempt_id', attempt.id);
    setAnswers(data || []);
    setAnsLoading(false);
  };

  const handleOpenSettings = () => {
    setUpdateForm({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      password: ""
    });
    setShowSettings(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    // Update profiles table
    const { error: pErr } = await supabase.from('profiles').update({
      first_name: updateForm.first_name,
      last_name: updateForm.last_name,
      phone: updateForm.phone
    }).eq('id', user.id);

    if (pErr) {
      showAlert("Xəta: " + pErr.message, "error");
      setUpdating(false);
      return;
    }

    // Update password if provided
    if (updateForm.password) {
      const { error: aErr } = await supabase.auth.updateUser({ password: updateForm.password });
      if (aErr) {
        showAlert("Şifrə yenilənərkən xəta: " + aErr.message, "error");
        setUpdating(false);
        return;
      }
    }
    
    showAlert("Məlumatlarınız uğurla yeniləndi!", "success");
    setShowSettings(false);
    setUpdating(false);
    // update local state
    window.location.reload();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F6F9EA] flex items-center justify-center text-black">Yüklənir...</div>;
  }

  const firstName = user?.user_metadata?.first_name || "İstifadəçi";
  const lastName = user?.user_metadata?.last_name || "";
  const phone = user?.user_metadata?.phone || "Qeyd olunmayıb";

  return (
    <div className="min-h-screen bg-[#F6F9EA] font-sans overflow-hidden">
      <Navbar />
      
      <div className="pt-36 pb-20 mt-4 px-4 relative">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] bg-[#D4F754]/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-xl shadow-black/5 border border-white mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-[#D4F754] flex items-center justify-center shadow-lg">
                  <User size={36} className="text-black" />
                </div>
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 border-[3px] border-white rounded-full"
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-1">{firstName} {lastName}</h1>
                <p className="text-gray-500 font-medium flex items-center gap-2">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{user.email}</span>
                  <span className="bg-gray-100 px-2 py-0.5 rounded-md text-xs">{phone}</span>
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleOpenSettings}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
              >
                <SettingsIcon size={18} /> Tənzimləmələr
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
              >
                <LogOut size={18} /> Çıxış
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Applications (Müraciətlər) */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[2rem] p-8 shadow-lg shadow-black/5 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <FileText size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><FileText size={20} /></div>
                  Müraciətlərim
                </h2>
              </div>
              
              <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <Clock className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium mb-3">Sistemdə aktiv müraciətiniz tapılmadı.</p>
                <Link href="/contact" className="inline-flex items-center gap-2 bg-[#D4F754] text-black px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-[#c2e44d] transition-colors">
                  Yeni Müraciət Yarat
                </Link>
              </div>
            </motion.div>

            {/* Exams (İmtahanlar) */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-[2rem] p-8 shadow-lg shadow-black/5 border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
                <CheckCircle size={120} />
              </div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={20} /></div>
                  İştirak etdiyim İmtahanlar
                </h2>
              </div>
              
              <div className="relative z-10 mt-6 space-y-4">
                {attempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle className="text-gray-300" size={24} />
                    </div>
                    <p className="text-gray-500 font-medium mb-3">İmtahan tarixçəniz boşdur.</p>
                    <Link href="/online-exam" className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors">
                      İmtahanlara Bax
                    </Link>
                  </div>
                ) : (
                  attempts.map((attempt) => (
                    <div key={attempt.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{attempt.exams?.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(attempt.started_at).toLocaleDateString('az-AZ')}</p>
                      </div>
                      <div className="text-right">
                        {attempt.status === 'pending' ? (
                          <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">Gözləmədədir</span>
                        ) : (
                          <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">{attempt.score} Bal</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {attempts.length > 0 && (
                  <div className="pt-2 text-center">
                     <Link href="/online-exam" className="text-sm font-bold text-blue-600 hover:underline">Yeni İmtahana Başla &rarr;</Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

        </div>
      </div>

        
        {/* VIEW ATTEMPT MODAL */}
        {selectedAttempt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-6 md:p-8 max-w-3xl w-full shadow-2xl relative max-h-[90vh] flex flex-col">
              <button onClick={() => setSelectedAttempt(null)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-2">İmtahan Vərəqiniz</h2>
              <p className="text-gray-500 mb-6 font-medium">{selectedAttempt.exams?.title} — {new Date(selectedAttempt.started_at).toLocaleString('az-AZ')}</p>
              
              <div className="overflow-y-auto pr-2 flex-1 space-y-6">
                {ansLoading ? (
                  <p className="text-center text-gray-500 py-10 font-medium">Cavablar yüklənir...</p>
                ) : answers.length === 0 ? (
                  <p className="text-center text-gray-500 py-10 font-medium">Heç bir cavab tapılmadı.</p>
                ) : (
                  answers.map((ans, idx) => (
                    <div key={ans.id} className="bg-gray-50 p-5 rounded-2xl border shadow-sm">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-semibold text-gray-800 text-base"><span className="text-gray-400 mr-2">{idx+1}.</span>{ans.questions.question_text}</h4>
                        <span className="bg-white border text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold shrink-0">{ans.questions.points} Bal</span>
                      </div>

                      {ans.questions.question_type === 'closed' ? (
                        <div className="bg-white p-4 rounded-xl border">
                          <p className="text-sm text-gray-500 mb-2">Sizin seçiminiz:</p>
                          {ans.selected_option === ans.questions.correct_option ? (
                            <div className="text-green-700 font-bold flex items-center gap-2"><CheckCircle size={16}/> Doğru ({ans.points_awarded} Bal aldınız)</div>
                          ) : (
                            <div className="text-red-600 font-bold flex items-center gap-2"><X size={16}/> Yanlış (0 Bal)</div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                          <p className="text-sm text-gray-500 mb-2">Yazılı cavabınız:</p>
                          <div className="bg-white p-4 rounded-lg border text-gray-800 mb-4 whitespace-pre-wrap">{ans.text_answer || <i className="text-gray-400">Boş buraxmısınız</i>}</div>
                          
                          {ans.graded ? (
                            ans.points_awarded === 0 ? (
                              <div className="text-red-600 font-bold bg-red-50 p-3 rounded-lg border border-red-100 flex items-center gap-2">
                                <X size={16}/> Səhv cavab (0 Bal)
                              </div>
                            ) : (
                              <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100 flex items-center gap-2">
                                <CheckCircle size={16}/> Doğru ({ans.points_awarded} Bal verildi)
                              </div>
                            )
                          ) : (
                            <div className="flex items-center gap-2 text-yellow-700 font-bold bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                              <Clock size={16}/> Hələ yoxlanılır (Gözləmədə)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-6">Profili Yenilə</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ad</label>
                    <input type="text" value={updateForm.first_name} onChange={e => setUpdateForm({...updateForm, first_name: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Soyad</label>
                    <input type="text" value={updateForm.last_name} onChange={e => setUpdateForm({...updateForm, last_name: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">E-poçt (Dəyişdirilə bilməz)</label>
                  <input type="email" readOnly value={user?.email || ''} className="w-full bg-gray-100 text-gray-400 border rounded-xl p-3 font-medium outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nömrə</label>
                  <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Yeni Şifrə (Dəyişmək istəmirsinizsə boş saxlayın)</label>
                  <input type="password" value={updateForm.password} onChange={e => setUpdateForm({...updateForm, password: e.target.value})} placeholder="••••••" className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                </div>
                <button type="submit" disabled={updating} className="w-full bg-[#D4F754] text-black font-bold py-4 rounded-xl mt-4 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  {updating ? "Yenilənir..." : <><Save size={20} /> Yadda Saxla</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}

    </div>
  );
}
