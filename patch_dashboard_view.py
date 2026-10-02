import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Add states for viewing
if 'const [selectedAttempt, setSelectedAttempt]' not in content:
    content = content.replace('const [updating, setUpdating] = useState(false);', 'const [updating, setUpdating] = useState(false);\n  const [selectedAttempt, setSelectedAttempt] = useState<any>(null);\n  const [answers, setAnswers] = useState<any[]>([]);\n  const [ansLoading, setAnsLoading] = useState(false);')

# Add openAttempt function
open_attempt_logic = """
  const handleOpenAttempt = async (attempt: any) => {
    setSelectedAttempt(attempt);
    setAnsLoading(true);
    const { data } = await supabase.from('exam_answers').select('*, questions(*)').eq('attempt_id', attempt.id);
    setAnswers(data || []);
    setAnsLoading(false);
  };
"""
content = content.replace('const handleOpenSettings', open_attempt_logic + '\n  const handleOpenSettings')

# Add action column to table
content = content.replace('<th className="p-4 font-semibold text-gray-600 text-sm">Status</th>', '<th className="p-4 font-semibold text-gray-600 text-sm">Status</th>\n<th className="p-4 font-semibold text-gray-600 text-sm text-right">Əməliyyat</th>')

# Add button to row
old_row = """                      <td className="p-4">
                        {att.status === 'pending' ? (
                          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-md text-xs font-bold">Yoxlanılır</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold">Qiymətləndirilib ({att.score} Bal)</span>
                        )}
                      </td>
                    </tr>"""
new_row = """                      <td className="p-4">
                        {att.status === 'pending' ? (
                          <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2.5 py-1 rounded-md text-xs font-bold">Yoxlanılır</span>
                        ) : (
                          <span className="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-md text-xs font-bold">Qiymətləndirilib ({att.score} Bal)</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleOpenAttempt(att)} className="text-sm bg-black text-white px-4 py-1.5 rounded-lg font-medium hover:bg-gray-800 transition-colors shadow-sm">Bax</button>
                      </td>
                    </tr>"""
content = content.replace(old_row, new_row)

# Add Modal UI for Answer View
modal_ui = """
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
                            <div className="text-green-700 font-bold bg-green-50 p-3 rounded-lg border border-green-100">
                              Qiymətləndirilib: {ans.points_awarded} Bal verildi.
                            </div>
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
"""

content = content.replace('{/* SETTINGS MODAL */}', modal_ui + '\n        {/* SETTINGS MODAL */}')

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

