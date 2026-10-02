import re

with open("src/app/online-exam/[id]/page.tsx", "r") as f:
    content = f.read()

# 1. State for password
if 'const [enteredPassword, setEnteredPassword] = useState("");' not in content:
    content = content.replace('const [dob, setDob] = useState("");', 'const [dob, setDob] = useState("");\n  const [enteredPassword, setEnteredPassword] = useState("");\n  const [passwordError, setPasswordError] = useState(false);')

# 2. Modify handleStart logic
# Old handleStart:
old_start = """  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      showAlert("Doğum tarixini daxil edin", "error");
      return;
    }
    
    // Create attempt
    const { data: att, error } = await supabase.from('exam_attempts').insert([{
      user_id: user.id,
      exam_id: params.id,
      dob: dob
    }]).select().single();"""

new_start = """  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) {
      showAlert("Doğum tarixini daxil edin", "error");
      return;
    }

    if (exam.password && enteredPassword !== exam.password) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    
    // Create attempt
    const { data: att, error } = await supabase.from('exam_attempts').insert([{
      user_id: user.id,
      exam_id: params.id,
      dob: dob
    }]).select().single();"""

content = content.replace(old_start, new_start)

# 3. Add password input to the intro form
old_form_ui = """                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doğum tarixi</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#D4F754] bg-white transition-colors" />
                </div>
              </div>
              <button type="submit" className="w-full bg-black text-[#D4F754] font-bold py-4 rounded-xl text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-8">
                İmtahana Başla <ArrowRight size={20} />
              </button>"""

new_form_ui = """                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Doğum tarixi</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="w-full border-2 border-gray-200 rounded-xl p-3 outline-none focus:border-[#D4F754] bg-white transition-colors" />
                </div>

                {exam.password && (
                  <div className="mt-4 p-5 bg-gray-50 border rounded-2xl">
                    <label className="block text-sm font-bold text-gray-900 mb-2">İmtahan Şifrəsi (Tələb olunur)</label>
                    <input type="text" value={enteredPassword} onChange={e => {setEnteredPassword(e.target.value); setPasswordError(false);}} placeholder="Şifrəni daxil edin" className={`w-full border-2 rounded-xl p-3 outline-none transition-colors ${passwordError ? 'border-red-500 focus:border-red-500' : 'border-gray-200 focus:border-black'}`} />
                    {passwordError && <p className="text-red-500 text-sm mt-2 font-medium">Şifrə yanlışdır!</p>}
                    <a href="https://wa.me/994500000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 hover:text-green-700 mt-3">
                      <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="css-i6dzq1"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                      Şifrəni əldə etmək üçün WhatsApp-la əlaqə saxlayın
                    </a>
                  </div>
                )}
              </div>
              <button type="submit" className="w-full bg-black text-[#D4F754] font-bold py-4 rounded-xl text-lg hover:scale-[1.02] transition-transform flex items-center justify-center gap-2 mt-8 shadow-xl">
                İmtahana Başla <ArrowRight size={20} />
              </button>"""

content = content.replace(old_form_ui, new_form_ui)

with open("src/app/online-exam/[id]/page.tsx", "w") as f:
    f.write(content)
