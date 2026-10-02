import sys

with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

# 1. Add Users to lucide-react imports
if 'Users,' not in content:
    content = content.replace('Loader2, Plus', 'Users, Loader2, Plus')

# 2. Add Team button
team_btn = """
          <button
            onClick={() => setActiveTab("team")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "team" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Users size={20} />
            <span>Komanda</span>
          </button>
"""

settings_btn = """          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md transition ${activeTab === "settings" ? "bg-gray-100 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Settings size={20} />
            <span>Parametrlər</span>
          </button>"""

if 'setActiveTab("team")' not in content:
    content = content.replace(settings_btn, settings_btn + team_btn)

# 3. Add Component render
if '{activeTab === "team" && <TeamTab />}' not in content:
    content = content.replace('{activeTab === "settings" && <SettingsTab />}', '{activeTab === "settings" && <SettingsTab />}\n        {activeTab === "team" && <TeamTab />}')

# 4. Add TeamTab function at the end
team_tab_code = """
// ─── TEAM TAB ────────────────────────────────────────────────────────────────
function TeamTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name_az: "", name_en: "", name_ru: "", name_tr: "", name_de: "",
    role_az: "", role_en: "", role_ru: "", role_tr: "", role_de: "",
    image: "", order_index: 0
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
    setFormData({
      name_az: "", name_en: "", name_ru: "", name_tr: "", name_de: "",
      role_az: "", role_en: "", role_ru: "", role_tr: "", role_de: "",
      image: "", order_index: 0
    });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name_az: item.name.az || "", name_en: item.name.en || "", name_ru: item.name.ru || "", name_tr: item.name.tr || "", name_de: item.name.de || "",
      role_az: item.role.az || "", role_en: item.role.en || "", role_ru: item.role.ru || "", role_tr: item.role.tr || "", role_de: item.role.de || "",
      image: item.image || "", order_index: item.order_index || 0
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
    const payload = {
      name: { az: formData.name_az, en: formData.name_en, ru: formData.name_ru, tr: formData.name_tr, de: formData.name_de },
      role: { az: formData.role_az, en: formData.role_en, ru: formData.role_ru, tr: formData.role_tr, de: formData.role_de },
      image: formData.image,
      order_index: formData.order_index
    };
    if (editingId) {
      await supabase.from('team_members').update(payload).eq('id', editingId);
    } else {
      await supabase.from('team_members').insert([payload]);
    }
    setSaving(false);
    resetForm();
    fetchItems();
  };

  const handleAutoTranslate = async () => {
    if (!formData.name_az && !formData.role_az) return alert("Azərbaycan dilində məlumat daxil edin.");
    
    // Translated names might just be the same if it's a person's name, but let's translate roles
    const translateRole = async (lang: string) => {
      if (!formData.role_az) return "";
      return await translateChunk(formData.role_az, lang);
    };

    const en = await translateRole("en");
    const ru = await translateRole("ru");
    const tr = await translateRole("tr");
    const de = await translateRole("de");

    setFormData(prev => ({
      ...prev,
      name_en: prev.name_az, name_ru: prev.name_az, name_tr: prev.name_az, name_de: prev.name_az,
      role_en: en, role_ru: ru, role_tr: tr, role_de: de
    }));
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
            <button type="button" onClick={handleAutoTranslate} className="text-sm bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-md font-medium flex items-center hover:bg-indigo-100">
               Avto Tərcümə
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad (AZ) *</label>
              <input required className="w-full border p-2 rounded-md" value={formData.name_az} onChange={e => setFormData({...formData, name_az: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vəzifə (AZ) *</label>
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
          
          <div className="border-t pt-4 grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ad (EN)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ad (RU)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.name_ru} onChange={e => setFormData({...formData, name_ru: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ad (TR)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.name_tr} onChange={e => setFormData({...formData, name_tr: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Ad (DE)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.name_de} onChange={e => setFormData({...formData, name_de: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vəzifə (EN)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.role_en} onChange={e => setFormData({...formData, role_en: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vəzifə (RU)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.role_ru} onChange={e => setFormData({...formData, role_ru: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vəzifə (TR)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.role_tr} onChange={e => setFormData({...formData, role_tr: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Vəzifə (DE)</label>
              <input className="w-full border p-2 rounded-md text-sm" value={formData.role_de} onChange={e => setFormData({...formData, role_de: e.target.value})} />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">{saving ? "Saxlanılır..." : "Yadda Saxla"}</button>
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
if 'function TeamTab()' not in content:
    content += "\n" + team_tab_code

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)
