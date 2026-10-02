import sys

with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# 1. Remove ExamsTab rendering
content = content.replace('{activeTab === "exams" && <ExamsTab />}', '')

# 2. Remove the button
start_btn = '          <button\n            onClick={() => setActiveTab("exams")}'
if start_btn in content:
    idx = content.find(start_btn)
    end_idx = content.find('</button>', idx) + len('</button>')
    content = content[:idx] + content[end_idx:]

# 3. Modify TeamTab
# We will search for function TeamTab() and replace it entirely to remove other language inputs and add auto-translation on submit.
team_tab_start = content.find('// ─── TEAM TAB ────────────────────────────────────────────────────────────────')
team_tab_new = """// ─── TEAM TAB ────────────────────────────────────────────────────────────────
function TeamTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name_az: "", role_az: "", image: "", order_index: 0
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name_az: "", role_az: "", image: "", order_index: 0 });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name_az: item.name.az || "",
      role_az: item.role.az || "",
      image: item.image || "",
      order_index: item.order_index || 0
    });
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Silmək istədiyinizə əminsiniz?")) return;
    await supabase.from('team_members').delete().eq('id', id);
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Auto translate role
    const translateRole = async (lang: string) => {
      if (!formData.role_az) return "";
      return await translateChunk(formData.role_az, lang);
    };

    const role_en = await translateRole("en");
    const role_ru = await translateRole("ru");
    const role_tr = await translateRole("tr");
    const role_de = await translateRole("de");
    
    // Names usually don't need translation, but we map them to all langs
    const nameAll = formData.name_az;

    const payload = {
      name: { az: nameAll, en: nameAll, ru: nameAll, tr: nameAll, de: nameAll },
      role: { az: formData.role_az, en: role_en, ru: role_ru, tr: role_tr, de: role_de },
      image: formData.image,
      order_index: formData.order_index
    };
    
    if (editingId && editingId !== "new") {
      await supabase.from('team_members').update(payload).eq('id', editingId);
    } else {
      await supabase.from('team_members').insert([payload]);
    }
    setSaving(false);
    resetForm();
    fetchItems();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Komandamız</h2>
        {!editingId && <button onClick={() => setEditingId("new")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"><Plus size={18} className="mr-2" /> Əlavə et</button>}
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{editingId === "new" ? "Yeni Üzv" : "Redaktə et"}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
              <input required className="w-full border p-2 rounded-md" value={formData.name_az} onChange={e => setFormData({...formData, name_az: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vəzifə (AZ) * (Digər dillərə avtomatik tərcümə olunacaq)</label>
              <input required className="w-full border p-2 rounded-md" value={formData.role_az} onChange={e => setFormData({...formData, role_az: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil URL * (4:5 format)</label>
              <input required className="w-full border p-2 rounded-md" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
              <input type="number" className="w-full border p-2 rounded-md" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">{saving ? "Saxlanılır (Tərcümə edilir)..." : "Yadda Saxla"}</button>
            <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200">Ləğv et</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Şəkil</th>
                <th className="p-4 font-medium">Ad</th>
                <th className="p-4 font-medium">Vəzifə</th>
                <th className="p-4 font-medium">Sıralama</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img src={item.image} alt="team" className="w-12 h-15 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium">{item.name.az}</td>
                  <td className="p-4 text-gray-500">{item.role.az}</td>
                  <td className="p-4">{item.order_index}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition ml-2"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Məlumat yoxdur</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
"""
content = content[:team_tab_start] + team_tab_new

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)
