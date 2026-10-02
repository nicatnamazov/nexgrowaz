import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# Add password to formData
content = content.replace('const [formData, setFormData] = useState({ title: "", description: "", duration_minutes: 60 });', 'const [formData, setFormData] = useState({ title: "", description: "", duration_minutes: 60, password: "" });')

# Add password input in the Add Exam form
old_form_field = """            <div>
              <label className="block text-sm font-medium mb-1">Müddət (Dəqiqə ilə)</label>
              <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-32 border rounded-lg p-2.5 outline-none focus:border-black transition-colors" />
            </div>"""

new_form_field = """            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Müddət (Dəqiqə ilə)</label>
                <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Şifrə (İstəyə bağlı)</label>
                <input type="text" placeholder="Şifrəsiz olması üçün boş saxlayın" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" />
              </div>
            </div>"""

content = content.replace(old_form_field, new_form_field)

# Add password display in the exams list
old_card_desc = """                <div className="flex gap-2 mt-4">
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> {exam.duration_minutes} dəqiqə</span>
                </div>"""

new_card_desc = """                <div className="flex gap-2 mt-4">
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> {exam.duration_minutes} dəqiqə</span>
                  {exam.password ? (
                    <span className="text-[11px] font-bold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md flex items-center gap-1">Şifrəli</span>
                  ) : (
                    <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-md flex items-center gap-1">Şifrəsiz</span>
                  )}
                </div>"""

content = content.replace(old_card_desc, new_card_desc)

# When submitting, handle password
old_submit = """    const { error } = await supabase.from('exams').insert([formData]);"""
new_submit = """    const payload = {
      title: formData.title,
      description: formData.description,
      duration_minutes: formData.duration_minutes,
      password: formData.password.trim() === "" ? null : formData.password.trim()
    };
    const { error } = await supabase.from('exams').insert([payload]);"""

content = content.replace(old_submit, new_submit)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
