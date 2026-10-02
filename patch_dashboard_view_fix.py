import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

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
content = content.replace('{showSettings && (', modal_ui + '\n        {showSettings && (')

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)

