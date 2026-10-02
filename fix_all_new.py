import re

# 1. FIX AUTH PHONE REQUIREMENT
with open("src/app/auth/page.tsx", "r") as f:
    auth = f.read()

old_auth_check = """      } else {
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Şifrələr uyğun gəlmir!");
        }"""
new_auth_check = """      } else {
        if (!formData.phone || formData.phone.trim().length < 5) {
          throw new Error("Qeydiyyat üçün mobil nömrə mütləq qeyd edilməlidir!");
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error("Şifrələr uyğun gəlmir!");
        }"""
auth = auth.replace(old_auth_check, new_auth_check)
with open("src/app/auth/page.tsx", "w") as f:
    f.write(auth)


# 2. FIX EXAM PASSWORD INPUT
with open("src/app/online-exam/[id]/page.tsx", "r") as f:
    exam_taking = f.read()

old_dob_html = """              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Doğum Tarixi (Məcburi)</label>
                <input required type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 outline-none focus:border-black font-medium" />
              </div>
              
              <div className="pt-4 flex gap-4">"""

new_dob_html = """              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Doğum Tarixi (Məcburi)</label>
                <input required type="date" value={dob} onChange={e => setDob(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl p-3 outline-none focus:border-black font-medium" />
              </div>

              {exam?.password && (
                <div className="mt-4 p-5 bg-yellow-50/50 border border-yellow-200 rounded-2xl">
                  <label className="block text-sm font-bold text-gray-900 mb-2">Ödənişli İmtahan Şifrəsi</label>
                  <input type="text" value={enteredPassword} onChange={e => {setEnteredPassword(e.target.value); setPasswordError(false);}} placeholder="İmtahana giriş şifrənizi daxil edin" className={`w-full border-2 rounded-xl p-3 outline-none transition-colors font-medium ${passwordError ? 'border-red-500 focus:border-red-500 bg-red-50' : 'border-yellow-300 focus:border-yellow-500 bg-white'}`} />
                  {passwordError && <p className="text-red-500 text-sm mt-2 font-bold">Daxil etdiyiniz şifrə yanlışdır!</p>}
                  
                  <a href="https://wa.me/994500000000" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-green-700 hover:text-green-800 mt-4 bg-green-100 hover:bg-green-200 px-4 py-2 rounded-lg transition-colors w-full justify-center">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                    Şifrə əldə etmək üçün WhatsApp-la yazın
                  </a>
                </div>
              )}
              
              <div className="pt-4 flex gap-4">"""
exam_taking = exam_taking.replace(old_dob_html, new_dob_html)
with open("src/app/online-exam/[id]/page.tsx", "w") as f:
    f.write(exam_taking)


# 3. RENAME "Şifrəli/Şifrəsiz" to "Ödənişli / Ödənişsiz"

# In Admin Page
with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

admin = admin.replace('Şifrəli', 'Ödənişli')
admin = admin.replace('Şifrəsiz', 'Ödənişsiz')
admin = admin.replace('İmtahan Şifrəsi (İstəyə bağlı)', 'Ödənişli İmtahan Şifrəsi (Boş olsa ödənişsiz olacaq)')
with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)

# In Online Exam List Page (src/app/online-exam/page.tsx)
with open("src/app/online-exam/page.tsx", "r") as f:
    online_list = f.read()

# I want to add a tag next to the clock in the list
old_clock = """<Clock size={16} className="text-gray-400" />
                            {exam.duration_minutes} dəqiqə
                          </span>
                        </div>"""

new_clock = """<Clock size={16} className="text-gray-400" />
                            {exam.duration_minutes} dəqiqə
                          </span>
                          {exam.password ? (
                            <span className="flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1.5 rounded-lg border border-yellow-200 shadow-sm">
                              Ödənişli
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg border border-green-200 shadow-sm">
                              Ödənişsiz
                            </span>
                          )}
                        </div>"""
if "Ödənişli" not in online_list:
    online_list = online_list.replace(old_clock, new_clock)

with open("src/app/online-exam/page.tsx", "w") as f:
    f.write(online_list)

