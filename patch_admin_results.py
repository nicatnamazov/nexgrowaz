import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# Add results tab to sidebar
old_tabs_def = '{ id: "exam", label: "Onlayn İmtahanlar", icon: <CheckCircle size={20} /> }'
new_tabs_def = '{ id: "exam", label: "Onlayn İmtahanlar", icon: <CheckCircle size={20} /> },\n    { id: "results", label: "İmtahan Nəticələri", icon: <GraduationCap size={20} /> }'
content = content.replace(old_tabs_def, new_tabs_def)

# Add activeTab condition
content = content.replace('{activeTab === "exam" && <ExamsTab />}\n              </div>', '{activeTab === "exam" && <ExamsTab />}\n                {activeTab === "results" && <ResultsTab />}\n              </div>')

# Add ResultsTab component
results_tab_code = """
// -----------------------------------------------------
// RESULTS TAB
// -----------------------------------------------------
function ResultsTab() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);
  const [answers, setAnswers] = useState<any[]>([]);
  const [ansLoading, setAnsLoading] = useState(false);
  const [grading, setGrading] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    const { data } = await supabase.from('exam_attempts').select('*, exams(title), users:user_id(email), profiles:user_id(first_name, last_name, phone)').order('created_at', { ascending: false });
    setAttempts(data || []);
    setLoading(false);
  };

  const openAttempt = async (attempt: any) => {
    setSelectedAttempt(attempt);
    setAnsLoading(true);
    const { data } = await supabase.from('exam_answers').select('*, questions(*)').eq('attempt_id', attempt.id);
    setAnswers(data || []);
    
    // Init grading state for open questions
    const initG: Record<string, number> = {};
    data?.forEach(a => {
      if (a.questions.question_type === 'open' && !a.graded) {
        initG[a.id] = 0; // default 0 points to give
      }
    });
    setGrading(initG);
    setAnsLoading(false);
  };

  const handleGradeSubmit = async () => {
    let extraScore = 0;
    
    // Update each open answer
    for (const ansId of Object.keys(grading)) {
      const pts = grading[ansId];
      extraScore += pts;
      await supabase.from('exam_answers').update({
        points_awarded: pts,
        graded: true
      }).eq('id', ansId);
    }

    // Update attempt
    const newScore = selectedAttempt.score + extraScore;
    await supabase.from('exam_attempts').update({
      score: newScore,
      status: 'graded'
    }).eq('id', selectedAttempt.id);

    showAlert("Qiymətləndirmə uğurla tamamlandı!", "success");
    setSelectedAttempt(null);
    fetchAttempts();
  };

  const handleDelete = async (id: string) => {
    if(await showConfirm("Bu nəticəni silmək istədiyinizə əminsiniz?")) {
      await supabase.from('exam_attempts').delete().eq('id', id);
      fetchAttempts();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  if (selectedAttempt) {
    const unGradedOpenCount = answers.filter(a => a.questions.question_type === 'open' && !a.graded).length;

    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedAttempt(null)} className="mb-4 text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Geriyə qayıt
        </button>
        
        <div className="bg-white p-6 rounded-2xl border mb-6 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">İmtahan Vərəqi</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div><span className="text-gray-500">Tələbə:</span> <span className="font-bold">{selectedAttempt.profiles?.first_name} {selectedAttempt.profiles?.last_name}</span></div>
            <div><span className="text-gray-500">E-poçt:</span> <span className="font-bold">{selectedAttempt.users?.email}</span></div>
            <div><span className="text-gray-500">İmtahan:</span> <span className="font-bold">{selectedAttempt.exams?.title}</span></div>
            <div><span className="text-gray-500">İndiki Bal:</span> <span className="font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">{selectedAttempt.score}</span></div>
          </div>
        </div>

        {ansLoading ? (
          <p className="text-gray-500">Cavablar yüklənir...</p>
        ) : (
          <div className="space-y-6">
            <h3 className="font-bold text-lg">Suallar və Cavablar</h3>
            {answers.map((ans, idx) => (
              <div key={ans.id} className="bg-white p-6 rounded-2xl border shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-semibold text-gray-800 text-base"><span className="text-gray-400 mr-2">{idx+1}.</span>{ans.questions.question_text}</h4>
                  <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-xs font-bold shrink-0">{ans.questions.points} Bal dəyərində</span>
                </div>

                {ans.questions.question_type === 'closed' ? (
                  <div className="bg-gray-50 p-4 rounded-xl border">
                    <p className="text-sm text-gray-500 mb-2">Tələbənin seçimi:</p>
                    {ans.selected_option === ans.questions.correct_option ? (
                      <div className="text-green-700 font-bold flex items-center gap-2"><CheckCircle size={16}/> Doğru ({ans.points_awarded} Bal verildi)</div>
                    ) : (
                      <div className="text-red-600 font-bold flex items-center gap-2"><X size={16}/> Yanlış (0 Bal)</div>
                    )}
                  </div>
                ) : (
                  <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                    <p className="text-sm text-gray-500 mb-2">Tələbənin yazılı cavabı:</p>
                    <div className="bg-white p-4 rounded-lg border text-gray-800 mb-4 whitespace-pre-wrap">{ans.text_answer || <i className="text-gray-400">Boş buraxılıb</i>}</div>
                    
                    {ans.graded ? (
                      <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100">
                        Qiymətləndirilib: {ans.points_awarded} Bal verildi.
                      </div>
                    ) : (
                      <div className="flex items-center gap-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <span className="font-bold text-yellow-800">Qiymət verin:</span>
                        <input 
                          type="number" 
                          min="0" 
                          max={ans.questions.points} 
                          value={grading[ans.id] || 0}
                          onChange={e => setGrading({...grading, [ans.id]: parseInt(e.target.value) || 0})}
                          className="w-24 border rounded-lg p-2 font-bold text-center outline-none focus:border-black"
                        />
                        <span className="text-sm text-gray-500">/ {ans.questions.points} maksimum</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {unGradedOpenCount > 0 && (
              <div className="sticky bottom-4 bg-white p-6 rounded-2xl border shadow-2xl flex justify-between items-center">
                <span className="font-medium text-gray-600">{unGradedOpenCount} ədəd yoxlanmamış açıq sual var.</span>
                <button onClick={handleGradeSubmit} className="bg-[#D4F754] text-black font-bold px-8 py-3 rounded-xl hover:bg-[#c2e44d] transition-colors shadow-md">
                  Qiymətləndirməni Təsdiqlə və Bitir
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">İmtahan Nəticələri</h2>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tələbə</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">İmtahan</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tarix</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Bal</th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">Heç bir nəticə yoxdur.</td></tr>
              ) : (
                attempts.map(att => (
                  <tr key={att.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{att.profiles?.first_name} {att.profiles?.last_name}</div>
                      <div className="text-xs text-gray-500">{att.users?.email}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-800">{att.exams?.title}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(att.started_at).toLocaleDateString('az-AZ')}</td>
                    <td className="p-4">
                      {att.status === 'pending' ? (
                        <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-md text-xs font-bold">Yoxlanılır</span>
                      ) : (
                        <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold">Bitib</span>
                      )}
                    </td>
                    <td className="p-4 font-black text-gray-900">{att.score}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openAttempt(att)} className="text-sm bg-black text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors">Bax</button>
                        <button onClick={() => handleDelete(att.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
"""

content = content.replace("function ExamsTab() {", results_tab_code + "\n" + "function ExamsTab() {")

# Type for activeTab state must include "results"
# Actually I replaced it to be a generic string in previous calls or I should cast it.
# Wait, I explicitly patched `activeTab` to have `"news" | "forms" | "universities" | "settings" | "team" | "users" | "exam"`. Let's just make it `string`.
old_state = 'useState<"news" | "forms" | "universities" | "settings" | "team" | "users" | "exam">("news")'
new_state = 'useState<string>("news")'
content = content.replace(old_state, new_state)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)

