import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# I will replace the ExamsTab entirely with a more complex one.
# First, let's extract the old ExamsTab to replace it.
start_str = "// -----------------------------------------------------\n// EXAMS TAB\n// -----------------------------------------------------"
start_idx = content.find(start_str)

if start_idx != -1:
    content_before = content[:start_idx]
    
    new_exams_tab = """// -----------------------------------------------------
// EXAMS TAB
// -----------------------------------------------------
function ExamsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", duration_minutes: 60 });
  
  // Managing questions state
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  
  // Question Form
  const [qForm, setQForm] = useState({
    question_text: "",
    question_type: "closed",
    options: ["", "", "", ""],
    correct_option: 0,
    points: 1
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    setExams(data || []);
    setLoading(false);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('exams').insert([formData]);
    setShowAdd(false);
    setFormData({ title: "", description: "", duration_minutes: 60 });
    fetchExams();
  };

  const handleDeleteExam = async (id: string) => {
    if(confirm("Bu imtahanı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  };

  const openExamManager = async (exam: any) => {
    setSelectedExam(exam);
    fetchQuestions(exam.id);
  };

  const fetchQuestions = async (examId: string) => {
    setQLoading(true);
    const { data } = await supabase.from('questions').select('*').eq('exam_id', examId).order('created_at', { ascending: true });
    setQuestions(data || []);
    setQLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qForm.question_type === 'closed') {
      if (qForm.options.some(opt => !opt.trim())) {
        alert("Bütün variantları doldurun!");
        return;
      }
    }
    
    await supabase.from('questions').insert([{
      exam_id: selectedExam.id,
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      options: qForm.question_type === 'closed' ? qForm.options : null,
      correct_option: qForm.question_type === 'closed' ? qForm.correct_option : null,
      points: qForm.points
    }]);
    
    setShowAddQ(false);
    setQForm({ question_text: "", question_type: "closed", options: ["", "", "", ""], correct_option: 0, points: 1 });
    fetchQuestions(selectedExam.id);
  };

  const handleDeleteQuestion = async (id: string) => {
    if(confirm("Sualı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('questions').delete().eq('id', id);
      fetchQuestions(selectedExam.id);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  if (selectedExam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedExam(null)} className="mb-4 text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Geriyə qayıt
        </button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedExam.title} - Suallar</h2>
            <p className="text-gray-500 text-sm">Müddət: {selectedExam.duration_minutes} dəqiqə</p>
          </div>
          <button onClick={() => setShowAddQ(true)} className="bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus size={18} /> Yeni Sual Əlavə Et
          </button>
        </div>

        {showAddQ && (
          <div className="bg-gray-50 p-6 rounded-xl border mb-6 shadow-inner">
            <h3 className="font-bold mb-4">Sual Yarat</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sualın növü</label>
                <select value={qForm.question_type} onChange={e => setQForm({...qForm, question_type: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black">
                  <option value="closed">Qapalı (Variantlı)</option>
                  <option value="open">Açıq (Yazılı cavab tələb edən)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sual Mətni</label>
                <textarea required value={qForm.question_text} onChange={e => setQForm({...qForm, question_text: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black" rows={3}></textarea>
              </div>

              {qForm.question_type === 'closed' && (
                <div className="space-y-3 bg-white p-4 rounded-lg border">
                  <label className="block text-sm font-bold text-gray-700">Variantlar (Doğru olanı seçin)</label>
                  {qForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct_option" 
                        checked={qForm.correct_option === idx} 
                        onChange={() => setQForm({...qForm, correct_option: idx})}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-gray-500 w-4">{String.fromCharCode(65 + idx)})</span>
                      <input 
                        type="text" 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...qForm.options];
                          newOpts[idx] = e.target.value;
                          setQForm({...qForm, options: newOpts});
                        }} 
                        className="flex-1 border rounded-lg p-2 outline-none focus:border-black" 
                        placeholder="Variant mətni..."
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Bal</label>
                <input required type="number" min="1" value={qForm.points} onChange={e => setQForm({...qForm, points: parseInt(e.target.value)})} className="w-24 border rounded-lg p-2.5 outline-none focus:border-black" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-[#D4F754] text-black font-bold px-6 py-2.5 rounded-lg hover:scale-105 transition-transform">Yadda Saxla</button>
                <button type="button" onClick={() => setShowAddQ(false)} className="bg-white border text-black font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Ləğv et</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {qLoading ? (
            <p className="text-gray-500">Suallar yüklənir...</p>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
              <p className="text-gray-500 mb-2">Bu imtahan üçün heç bir sual tapılmadı.</p>
              <button onClick={() => setShowAddQ(true)} className="text-blue-600 font-medium hover:underline">İlk sualı əlavə et</button>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash size={16} /></button>
                </div>
                <div className="flex gap-3 mb-3">
                  <span className="bg-gray-100 text-gray-600 font-bold w-7 h-7 flex items-center justify-center rounded-lg text-sm shrink-0">{idx + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{q.question_text}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                        {q.question_type === 'closed' ? 'Qapalı' : 'Açıq'}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-green-50 text-green-600">
                        {q.points} Bal
                      </span>
                    </div>
                  </div>
                </div>
                
                {q.question_type === 'closed' && q.options && (
                  <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className={`p-2.5 rounded-lg border text-sm ${q.correct_option === i ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50/50 text-gray-600 border-gray-100'}`}>
                        <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)})</span> {opt}
                        {q.correct_option === i && <CheckCircle size={14} className="inline ml-2 text-green-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Onlayn İmtahanlar</h2>
        <button onClick={() => setShowAdd(true)} className="bg-[#D4F754] text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c2e44d] transition-colors shadow-sm hover:shadow-md">
          <Plus size={18} /> Yeni İmtahan
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Yeni İmtahan Yarat</h3>
          <form onSubmit={handleAddExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">İmtahanın Adı (məs: Azərbaycan Dili)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" placeholder="İmtahanın adı..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qısa Açıqlama</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" rows={2} placeholder="İmtahan haqqında qısa məlumat..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Müddət (Dəqiqə ilə)</label>
              <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-32 border rounded-lg p-2.5 outline-none focus:border-black transition-colors" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-black text-white font-bold px-6 py-2.5 rounded-lg hover:scale-105 transition-transform">Yadda Saxla</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors">Ləğv et</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {exams.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed rounded-2xl">
            <p className="text-gray-500 font-medium">Heç bir imtahan yaradılmayıb.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="border p-6 rounded-2xl flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow group">
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1 text-gray-900">{exam.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{exam.description || "Açıqlama yoxdur"}</p>
                <div className="flex gap-2 mt-4">
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> {exam.duration_minutes} dəqiqə</span>
                </div>
              </div>
              <div className="flex gap-2 items-center justify-between border-t pt-4">
                <button onClick={() => openExamManager(exam)} className="text-sm font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                  Sualları İdarə Et <ArrowRight size={14}/>
                </button>
                <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
"""
    
    content = content_before + new_exams_tab
    with open("src/app/admin/page.tsx", "w") as f:
        f.write(content)
