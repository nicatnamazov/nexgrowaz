import sys

with open('src/app/admin/page.tsx', 'r') as f:
    content = f.read()

old_state = """  const [saving, setSaving] = useState(false);"""
new_state = """  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, image: url }));
      } catch (err) {
        alert("Şəkil yüklənmədi");
      }
      setUploading(false);
    }
  };"""

content = content.replace(old_state, new_state)

old_input = """            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil URL * (4:5 format)</label>
              <input required className="w-full border p-2 rounded-md" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://..." />
            </div>"""

new_input = """            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil * (4:5 format)</label>
              <div className="flex items-center space-x-3">
                {formData.image && <img src={formData.image} alt="preview" className="w-10 h-12 object-cover rounded shadow-sm" />}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center space-x-2 border border-gray-200">
                  {uploading ? <Loader2 className="animate-spin text-blue-500" size={16} /> : <Upload size={16} className="text-gray-600" />}
                  <span className="text-sm font-medium">{uploading ? "Yüklənir..." : "Şəkil Yüklə"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
                <input required type="text" className="flex-1 border border-gray-200 p-2 rounded-md text-sm" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="və ya URL daxil edin" />
              </div>
            </div>"""

content = content.replace(old_input, new_input)

with open('src/app/admin/page.tsx', 'w') as f:
    f.write(content)
