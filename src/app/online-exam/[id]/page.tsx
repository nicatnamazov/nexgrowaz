"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { useLang } from "@/utils/LangContext";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import AnimateIn from "@/components/AnimateIn";

export default function TakeExamPage() {
  const { id } = useParams();
  const { lang } = useLang();
  
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [started, setStarted] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", dob: "", phone: "" });
  
  // answers maps question_id to selected_option_id (or text for open)
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    async function fetchExam() {
      const { data: eData } = await supabase.from('exams').select('*').eq('id', id).single();
      if (eData) {
        setExam(eData);
        const { data: qData } = await supabase.from('exam_questions').select('*').eq('exam_id', id).order('order_index', { ascending: true });
        if (qData) setQuestions(qData);
      }
      setLoading(false);
    }
    fetchExam();
  }, [id]);

  const startExam = (e: React.FormEvent) => {
    e.preventDefault();
    setStarted(true);
    setTimeLeft((exam.duration_minutes || 45) * 60);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (started && !finished && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (started && !finished && timeLeft === 0) {
      submitExam(true); // Auto submit
    }
  }, [started, finished, timeLeft]);

  const submitExam = async (autoSubmit = false) => {
    if (!autoSubmit && !confirm("İmtahanı bitirmək istədiyinizə əminsiniz?")) return;
    
    // Calculate score
    let calculatedScore = 0;
    questions.forEach(q => {
      if (q.type === 'test') {
        const correctOpt = q.options.find((o: any) => o.is_correct);
        if (correctOpt && answers[q.id] === correctOpt.id) {
          calculatedScore += (q.points || 10);
        }
      }
    });
    
    setScore(calculatedScore);
    setFinished(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Save to DB
    await supabase.from('exam_submissions').insert([{
      exam_id: id,
      user_name: userInfo.name,
      user_dob: userInfo.dob,
      user_phone: userInfo.phone,
      answers: answers,
      score: calculatedScore,
      total_questions: questions.length
    }]);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-[#8cb815] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!exam) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-xl">İmtahan tapılmadı.</div>;
  }

  return (
    <main className="min-h-screen bg-[#F5F5F7] pt-32 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/online-exam" className="inline-flex items-center text-gray-500 hover:text-black mb-8 transition-colors font-semibold text-sm">
          <ArrowLeft size={16} className="mr-2" /> İmtahanlara qayıt
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
          {exam.image && <img src={exam.image} className="w-full h-48 md:h-64 object-cover" alt="Exam" />}
          <div className="p-8 md:p-12 text-center">
            <h1 className="text-3xl md:text-5xl font-extrabold text-black mb-4">{exam.title[lang] || exam.title.az}</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">{exam.description[lang] || exam.description.az}</p>
          </div>
        </div>

        {!started ? (
          <AnimateIn>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12">
              <h2 className="text-2xl font-bold mb-6 text-center">İlkin Məlumatlar</h2>
              <form onSubmit={startExam} className="max-w-xl mx-auto space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Ad və Soyad *</label>
                  <input required className="w-full border-2 border-gray-200 focus:border-[#8cb815] rounded-xl px-4 py-3 outline-none transition-colors" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} placeholder="Məsələn, Əli Məmmədov" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Doğum tarixi *</label>
                    <input required type="text" className="w-full border-2 border-gray-200 focus:border-[#8cb815] rounded-xl px-4 py-3 outline-none transition-colors" value={userInfo.dob} onChange={e => setUserInfo({...userInfo, dob: e.target.value})} placeholder="Məs. 26.10.2003" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Əlaqə nömrəsi *</label>
                    <input required type="text" className="w-full border-2 border-gray-200 focus:border-[#8cb815] rounded-xl px-4 py-3 outline-none transition-colors" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} placeholder="Məs. 0501234567" />
                  </div>
                </div>

                <div className="pt-4">
                  <button type="submit" className="w-full bg-black text-[#D4F754] font-bold text-lg py-4 rounded-xl hover:bg-gray-800 transition-colors shadow-lg shadow-md">İmtahana Başla</button>
                </div>
              </form>
            </div>
          </AnimateIn>
        ) : !finished ? (
          <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center sticky top-24 z-10">
              <span className="font-bold text-gray-500">Suallar: {questions.length}</span>
              <div className="flex flex-col items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Qalan Vaxt</span>
                <span className={`text-2xl font-black ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-black'}`}>
                  {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <span className="font-bold text-[#8cb815]">{userInfo.name}</span>
            </div>

            {questions.map((q, idx) => (
              <AnimateIn key={q.id} delay={0.1}>
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-6"><span className="text-[#8cb815] mr-2">{idx + 1}.</span> {q.question_text[lang] || q.question_text.az}</h3>
                  
                  {q.type === 'test' ? (
                    <div className="space-y-3">
                      {q.options.map((opt: any) => (
                        <label key={opt.id} className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${answers[q.id] === opt.id ? 'border-[#8cb815] bg-[#F7FBEA]' : 'border-gray-100 hover:border-gray-300'}`}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-3 ${answers[q.id] === opt.id ? 'border-[#8cb815]' : 'border-gray-300'}`}>
                            {answers[q.id] === opt.id && <div className="w-2.5 h-2.5 bg-[#F7FBEA]0 rounded-full" />}
                          </div>
                          <input type="radio" name={`q-${q.id}`} value={opt.id} className="hidden" onChange={() => setAnswers({...answers, [q.id]: opt.id})} />
                          <span className="font-medium text-gray-800">{opt.text[lang] || opt.text.az}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <textarea rows={4} className="w-full border-2 border-gray-200 focus:border-[#8cb815] rounded-xl p-4 outline-none transition-colors" placeholder="Cavabınızı bura yazın..." value={answers[q.id] || ""} onChange={e => setAnswers({...answers, [q.id]: e.target.value})}></textarea>
                    </div>
                  )}
                </div>
              </AnimateIn>
            ))}

            <div className="pt-8">
              <button onClick={() => submitExam(false)} className="w-full bg-black text-white font-bold text-lg py-5 rounded-xl hover:bg-gray-800 transition-colors shadow-lg">İmtahanı Bitir və Nəticəni Yoxla</button>
            </div>
          </div>
        ) : (
          <AnimateIn>
            <div className="space-y-8">
              <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-3xl font-extrabold mb-2">İmtahan Tamamlandı!</h2>
                <p className="text-gray-500 mb-8">Təbrik edirik, {userInfo.name}. Nəticələriniz qeydə alındı.</p>
                <div className="inline-block bg-[#F7FBEA] border border-blue-100 px-8 py-4 rounded-2xl">
                  <span className="block text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Doğru Cavablar</span>
                  <span className="text-4xl font-black text-[#5A6332]">{score} / {questions.filter(q => q.type === 'test').reduce((acc, q) => acc + (q.points || 10), 0)}</span>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-center mt-10 mb-6">Cavabların İcmalı</h3>
              
              {questions.map((q, idx) => {
                const isTest = q.type === 'test';
                const userAns = answers[q.id];
                const correctOpt = isTest ? q.options.find((o: any) => o.is_correct) : null;
                const isCorrect = isTest && correctOpt && correctOpt.id === userAns;
                
                return (
                  <div key={q.id} className={`bg-white p-6 md:p-8 rounded-3xl shadow-sm border-2 ${isTest ? (isCorrect ? 'border-green-200' : 'border-red-200') : 'border-gray-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-bold"><span className="text-gray-400 mr-2">{idx + 1}.</span> {q.question_text[lang] || q.question_text.az}</h4>
                      {isTest && (
                        <div className="flex items-center space-x-3 shrink-0 ml-4">
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isCorrect ? (q.points || 10) : 0} / {q.points || 10} Bal</span>
                          {isCorrect ? <CheckCircle className="text-green-500" size={24} /> : <XCircle className="text-red-500" size={24} />}
                        </div>
                      )}
                    </div>
                    
                    {isTest ? (
                      <div className="space-y-3 mt-4">
                        {q.options.map((opt: any) => {
                          const isUserSelected = userAns === opt.id;
                          const isActualCorrect = opt.is_correct;
                          
                          // Determine styles based on result
                          let optStyle = 'border-gray-100 bg-gray-50 text-gray-500'; // Default unselected
                          
                          if (isUserSelected && isActualCorrect) {
                            optStyle = 'border-green-500 bg-green-50 text-green-700 font-bold'; // Selected correctly
                          } else if (isUserSelected && !isActualCorrect) {
                            optStyle = 'border-red-500 bg-red-50 text-red-700 font-bold'; // Selected wrong
                          } else if (!isUserSelected && isActualCorrect && exam.show_answers) {
                            optStyle = 'border-green-500 bg-green-50 text-green-700 font-bold'; // Show correct answer if allowed
                          }

                          return (
                            <div key={opt.id} className={`p-4 border-2 rounded-xl flex items-center justify-between transition-all ${optStyle}`}>
                              <span>{opt.text[lang] || opt.text.az}</span>
                              {(isUserSelected || (isActualCorrect && exam.show_answers)) && (
                                <span>{isActualCorrect ? <CheckCircle size={18} /> : <XCircle size={18} />}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <span className="text-xs font-bold text-gray-400 uppercase block mb-1">Sizin cavabınız:</span>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-800 font-medium">
                          {userAns || <span className="text-gray-400 italic">Cavab yazılmayıb.</span>}
                        </div>
                        <p className="text-xs text-orange-500 mt-2 font-medium">* Açıq suallar daha sonra mütəxəssis tərəfindən yoxlanılacaq.</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="text-center pt-8">
                 <Link href="/" className="inline-flex bg-black text-[#D4F754] font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-800 transition-colors">Ana Səhifəyə Qayıt</Link>
              </div>
            </div>
          </AnimateIn>
        )}
      </div>
    </main>
  );
}
