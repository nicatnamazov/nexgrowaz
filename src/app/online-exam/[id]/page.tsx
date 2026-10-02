"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import Navbar from "@/components/Navbar";
import { Clock, AlertCircle, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { showAlert, showConfirm } from "@/utils/alert";

export default function ExamRoom({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [step, setStep] = useState<"intro" | "form" | "exam" | "submitting">("intro");
  const [dob, setDob] = useState("");
  
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQ, setCurrentQ] = useState(0);
  
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [examId]);

  useEffect(() => {
    if (step === "exam" && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => (t ? t - 1 : 0)), 1000);
      return () => clearInterval(timer);
    } else if (step === "exam" && timeLeft === 0) {
      handleFinalSubmit(); // auto submit when time is up
    }
  }, [step, timeLeft]);

  const fetchInitialData = async () => {
    // 1. Get user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }

    // 2. Get exam
    const { data: examData } = await supabase.from('exams').select('*').eq('id', examId).single();
    if (!examData) {
      router.push('/online-exam');
      return;
    }
    setExam(examData);
    
    // 3. Get questions
    const { data: qData } = await supabase.from('questions').select('*').eq('exam_id', examId);
    setQuestions(qData || []);

    // 4. Check if already attempted
    if (user) {
      const { data: attempt } = await supabase.from('exam_attempts').select('*').eq('user_id', user.id).eq('exam_id', examId).single();
      if (attempt) {
        showAlert("Siz artıq bu imtahanda iştirak etmisiniz!");
        router.push('/dashboard');
        return;
      }
    }

    setLoading(false);
  };

  const handleStartForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return showAlert("Zəhmət olmasa doğum tarixini seçin!");
    startExam();
  };

  const startExam = async () => {
    setLoading(true);
    // Create attempt
    const { data, error } = await supabase.from('exam_attempts').insert([{
      user_id: user.id,
      exam_id: exam.id,
      dob: dob
    }]).select().single();

    if (error) {
      showAlert("Xəta baş verdi: " + error.message);
      setLoading(false);
      return;
    }

    setAttemptId(data.id);
    setTimeLeft(exam.duration_minutes * 60);
    setStep("exam");
    setLoading(false);
  };

  const handleFinalSubmit = async () => {
    setStep("submitting");
    
    let score = 0;
    
    const inserts = questions.map((q) => {
      const ans = answers[q.id];
      const isCorrect = q.question_type === 'closed' && ans === q.correct_option;
      const pts = isCorrect ? q.points : 0;
      score += pts;
      
      return {
        attempt_id: attemptId,
        question_id: q.id,
        selected_option: q.question_type === 'closed' ? ans : null,
        text_answer: q.question_type === 'open' ? ans : null,
        points_awarded: pts,
        graded: q.question_type === 'closed'
      };
    });

    if (inserts.length > 0) {
      await supabase.from('exam_answers').insert(inserts);
    }

    const hasOpen = questions.some(q => q.question_type === 'open');

    await supabase.from('exam_attempts').update({
      completed_at: new Date().toISOString(),
      score: score,
      status: hasOpen ? 'pending' : 'graded'
    }).eq('id', attemptId);

    showAlert("İmtahan uğurla bitdi! Nəticələr mütəxəssis tərəfindən yoxlanıldıqdan sonra kabinetinizdə əks olunacaq.");
    router.push('/dashboard');
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="min-h-screen bg-[#F6F9EA] flex items-center justify-center font-sans">Yüklənir...</div>;

  return (
    <div className="min-h-screen bg-[#F6F9EA] font-sans flex flex-col">
      {step !== "exam" && <Navbar />}

      <div className={`flex-1 flex flex-col ${step === "exam" ? "pt-8" : "pt-32"} pb-20 px-4 max-w-4xl w-full mx-auto`}>
        
        {step === "intro" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-4">{exam.title}</h1>
            <p className="text-gray-500 mb-8">{exam.description}</p>
            
            <div className="flex justify-center gap-6 mb-10">
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl w-32">
                <Clock className="text-blue-500 mb-2" size={32} />
                <span className="font-bold text-gray-900">{exam.duration_minutes} Dəq</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-green-50 rounded-2xl w-32">
                <CheckCircle className="text-green-500 mb-2" size={32} />
                <span className="font-bold text-gray-900">{questions.length} Sual</span>
              </div>
            </div>

            {!user ? (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-xl font-medium border border-yellow-200">
                İmtahanda iştirak etmək üçün sistemə daxil olmalısınız.
                <br/>
                <button onClick={() => router.push('/auth')} className="mt-4 bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800">Daxil ol / Qeydiyyat</button>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-gray-50 text-gray-500 p-4 rounded-xl font-medium border border-gray-200">
                Bu imtahana hələ suallar əlavə edilməyib.
              </div>
            ) : (
              <button onClick={() => setStep("form")} className="bg-[#D4F754] text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-lg">
                İmtahan Formunu Doldur
              </button>
            )}
          </motion.div>
        )}

        {step === "form" && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-black/5 border border-gray-100 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-6 text-center">İmtahan Zalı Qeydiyyatı</h2>
            <form onSubmit={handleStartForm} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Ad və Soyad</label>
                <input type="text" readOnly value={`${profile?.first_name || ''} ${profile?.last_name || ''}`} className="w-full bg-gray-50 border rounded-xl p-3 outline-none text-gray-700 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">E-poçt</label>
                <input type="email" readOnly value={user?.email || ''} className="w-full bg-gray-50 border rounded-xl p-3 outline-none text-gray-700 font-medium" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Doğum Tarixi (Məcburi)</label>
                <input required type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 outline-none focus:border-black font-medium" />
              </div>
              
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setStep("intro")} className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors">Geriyə</button>
                <button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors">İmtahana Başla</button>
              </div>
            </form>
          </motion.div>
        )}

        {step === "exam" && questions.length > 0 && (
          <div className="flex flex-col h-full bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
            {/* Exam Header */}
            <div className="bg-gray-900 text-white p-6 flex justify-between items-center">
              <h2 className="font-bold text-lg md:text-xl truncate pr-4">{exam.title}</h2>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg font-mono text-xl font-bold shrink-0">
                <Clock size={20} className={timeLeft !== null && timeLeft < 300 ? "text-red-400 animate-pulse" : "text-[#D4F754]"} />
                <span className={timeLeft !== null && timeLeft < 300 ? "text-red-400" : "text-[#D4F754]"}>
                  {timeLeft !== null ? formatTime(timeLeft) : "00:00"}
                </span>
              </div>
            </div>

            {/* Question Area */}
            <div className="p-8 md:p-12 flex-1 overflow-auto">
              <div className="mb-8 flex justify-between items-end border-b pb-4">
                <span className="text-gray-500 font-bold tracking-widest uppercase text-sm">Sual {currentQ + 1} / {questions.length}</span>
                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-md font-bold text-xs">{questions[currentQ].points} Bal</span>
              </div>
              
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-8 leading-relaxed">
                {questions[currentQ].question_text}
              </h3>

              {questions[currentQ].question_type === 'closed' ? (
                <div className="space-y-3">
                  {questions[currentQ].options?.map((opt: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setAnswers({...answers, [questions[currentQ].id]: idx})}
                      className={`w-full text-left p-5 rounded-2xl border-2 transition-all font-medium text-lg flex items-center gap-4 ${
                        answers[questions[currentQ].id] === idx 
                          ? "border-black bg-gray-50 shadow-md" 
                          : "border-gray-100 hover:border-gray-300 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold border-2 ${
                        answers[questions[currentQ].id] === idx ? "border-black bg-black text-white" : "border-gray-300 text-gray-400"
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      {opt}
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <textarea 
                    value={answers[questions[currentQ].id] || ""}
                    onChange={e => setAnswers({...answers, [questions[currentQ].id]: e.target.value})}
                    placeholder="Cavabınızı bura yazın..."
                    className="w-full min-h-[200px] p-5 border-2 border-gray-200 rounded-2xl outline-none focus:border-black text-lg transition-colors resize-y"
                  ></textarea>
                  <p className="text-gray-400 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14}/> Bu sual mütəxəssis tərəfindən oxunub qiymətləndiriləcək.</p>
                </div>
              )}
            </div>

            {/* Exam Footer Nav */}
            <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
              <button 
                onClick={() => setCurrentQ(q => Math.max(0, q - 1))}
                disabled={currentQ === 0}
                className="flex items-center gap-2 px-6 py-3 font-bold text-gray-600 disabled:opacity-30 hover:bg-gray-200 rounded-xl transition-colors"
              >
                <ChevronLeft size={20} /> Əvvəlki
              </button>
              
              {currentQ === questions.length - 1 ? (
                <button 
                  onClick={async () => {
                    if(await showConfirm("İmtahanı bitirmək istədiyinizə əminsiniz?")) handleFinalSubmit();
                  }}
                  className="flex items-center gap-2 px-8 py-3 font-bold bg-[#D4F754] text-black hover:bg-[#c2e44d] hover:scale-105 rounded-xl transition-all shadow-md"
                >
                  <CheckCircle size={20} /> İmtahanı Bitir
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentQ(q => Math.min(questions.length - 1, q + 1))}
                  className="flex items-center gap-2 px-8 py-3 font-bold bg-black text-white hover:bg-gray-800 rounded-xl transition-colors"
                >
                  Növbəti <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
