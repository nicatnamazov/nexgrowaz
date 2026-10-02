import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# Enable exam tab
old_exam_tab = '{ id: "exam", label: "Online İmtahan", icon: <CheckCircle size={20} />, disabled: true, tag: "Gözləmədə" }'
new_exam_tab = '{ id: "exam", label: "Onlayn İmtahanlar", icon: <CheckCircle size={20} /> }'
content = content.replace(old_exam_tab, new_exam_tab)

# Add exam to activeTab render
old_tabs_render = '{activeTab === "users" && <UsersTab />}\n              </div>'
new_tabs_render = '{activeTab === "users" && <UsersTab />}\n                {activeTab === "exam" && <ExamsTab />}\n              </div>'
content = content.replace(old_tabs_render, new_tabs_render)

# Add ExamsTab component
exams_tab_code = """
// -----------------------------------------------------
// EXAMS TAB
// -----------------------------------------------------
function ExamsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", duration_minutes: 60 });

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

  const handleDelete = async (id: string) => {
    if(confirm("Silmək istədiyinizə əminsiniz?")) {
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Onlayn İmtahanlar</h2>
        <button onClick={() => setShowAdd(true)} className="bg-[#D4F754] text-black px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c2e44d]">
          <Plus size={18} /> Yeni İmtahan
        </button>
      </div>

      {showAdd && (
        <div className="bg-gray-50 p-6 rounded-xl border mb-6">
          <h3 className="font-bold mb-4">Yeni İmtahan Yarat</h3>
          <form onSubmit={handleAddExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">İmtahanın Adı (məs: Azərbaycan Dili)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qısa Açıqlama</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2" rows={2}></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Müddət (Dəqiqə ilə)</label>
              <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full border rounded-lg p-2" />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-black text-white px-4 py-2 rounded-lg">Yadda Saxla</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-200 text-black px-4 py-2 rounded-lg">Ləğv et</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {exams.length === 0 ? (
          <p className="text-gray-500">Heç bir imtahan yoxdur.</p>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="border p-4 rounded-xl flex justify-between items-center bg-white shadow-sm">
              <div>
                <h3 className="font-bold text-lg">{exam.title}</h3>
                <p className="text-sm text-gray-500">{exam.description}</p>
                <span className="text-xs font-semibold bg-gray-100 px-2 py-1 rounded-md mt-2 inline-block">⏳ {exam.duration_minutes} dəqiqə</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                <button onClick={() => handleDelete(exam.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
"""

if "function ExamsTab()" not in content:
    content += exams_tab_code

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
