import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# 1. Increase padding top (move down)
content = content.replace('pt-28 pb-20', 'pt-36 pb-20 mt-4')

# 2. Add Settings component logic
# We'll just add a "Tənzimləmələr" tab to the dashboard. But dashboard currently just shows cards.
# Let's add a "Profili Yenilə" button to the header and open a modal for it.
imports = 'import { User, LogOut, FileText, CheckCircle, Clock, Settings as SettingsIcon, X, Save } from "lucide-react";\nimport { showAlert } from "@/utils/alert";'
content = content.replace('import { User, LogOut, FileText, CheckCircle, Clock } from "lucide-react";', imports)

# State for settings modal
if "const [showSettings, setShowSettings] = useState(false);" not in content:
    content = content.replace('const [attempts, setAttempts] = useState<any[]>([]);', 'const [attempts, setAttempts] = useState<any[]>([]);\n  const [showSettings, setShowSettings] = useState(false);\n  const [updateForm, setUpdateForm] = useState({ first_name: "", last_name: "", phone: "", password: "" });\n  const [updating, setUpdating] = useState(false);')

# Load current data into update form when opening settings
open_settings_func = """
  const handleOpenSettings = () => {
    setUpdateForm({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      password: ""
    });
    setShowSettings(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    
    // Update profiles table
    const { error: pErr } = await supabase.from('profiles').update({
      first_name: updateForm.first_name,
      last_name: updateForm.last_name,
      phone: updateForm.phone
    }).eq('id', user.id);

    if (pErr) {
      showAlert("Xəta: " + pErr.message, "error");
      setUpdating(false);
      return;
    }

    // Update password if provided
    if (updateForm.password) {
      const { error: aErr } = await supabase.auth.updateUser({ password: updateForm.password });
      if (aErr) {
        showAlert("Şifrə yenilənərkən xəta: " + aErr.message, "error");
        setUpdating(false);
        return;
      }
    }
    
    showAlert("Məlumatlarınız uğurla yeniləndi!", "success");
    setShowSettings(false);
    setUpdating(false);
    // update local state
    setProfile({...profile, first_name: updateForm.first_name, last_name: updateForm.last_name, phone: updateForm.phone});
  };
"""
content = content.replace('const handleLogout = async () => {', open_settings_func + '\n  const handleLogout = async () => {')

# Add button to header
old_buttons = """            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
            >
              <LogOut size={18} /> Sistemdən Çıx
            </button>"""
new_buttons = """            <div className="flex gap-3">
              <button 
                onClick={handleOpenSettings}
                className="flex items-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
              >
                <SettingsIcon size={18} /> Tənzimləmələr
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-sm hover:shadow-md"
              >
                <LogOut size={18} /> Çıxış
              </button>
            </div>"""
content = content.replace(old_buttons, new_buttons)

# Add Settings Modal at the end of the return
modal_ui = """
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black"><X size={24} /></button>
              <h2 className="text-2xl font-bold mb-6">Profili Yenilə</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ad</label>
                    <input type="text" value={updateForm.first_name} onChange={e => setUpdateForm({...updateForm, first_name: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Soyad</label>
                    <input type="text" value={updateForm.last_name} onChange={e => setUpdateForm({...updateForm, last_name: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">E-poçt (Dəyişdirilə bilməz)</label>
                  <input type="email" readOnly value={user?.email || ''} className="w-full bg-gray-100 text-gray-400 border rounded-xl p-3 font-medium outline-none cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Nömrə</label>
                  <input type="text" value={updateForm.phone} onChange={e => setUpdateForm({...updateForm, phone: e.target.value})} className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Yeni Şifrə (Dəyişmək istəmirsinizsə boş saxlayın)</label>
                  <input type="password" value={updateForm.password} onChange={e => setUpdateForm({...updateForm, password: e.target.value})} placeholder="••••••" className="w-full bg-gray-50 border rounded-xl p-3 outline-none focus:border-black font-medium" />
                </div>
                <button type="submit" disabled={updating} className="w-full bg-[#D4F754] text-black font-bold py-4 rounded-xl mt-4 hover:scale-105 transition-transform flex items-center justify-center gap-2">
                  {updating ? "Yenilənir..." : <><Save size={20} /> Yadda Saxla</>}
                </button>
              </form>
            </motion.div>
          </div>
        )}
"""
content = content.replace('</motion.div>\n          </div>\n\n        </div>\n      </div>\n    </div>', '</motion.div>\n          </div>\n\n        </div>\n      </div>\n' + modal_ui + '\n    </div>')

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
