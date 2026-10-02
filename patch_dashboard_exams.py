import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Add states for attempts
if "const [attempts, setAttempts] = useState<any[]>([]);" not in content:
    content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n  const [attempts, setAttempts] = useState<any[]>([]);')
    
    # fetch attempts after user is set
    new_effect = """  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        supabase.from('exam_attempts').select('*, exams(title)').eq('user_id', user.id).order('created_at', { ascending: false }).then(({data}) => setAttempts(data || []));
        setLoading(false);
      }
    });
  }, [router]);"""
    old_effect = """  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
      } else {
        setUser(user);
        setLoading(false);
      }
    });
  }, [router]);"""
    content = content.replace(old_effect, new_effect)

# Replace the Exam placeholder UI
old_exam_ui = """              <div className="flex flex-col items-center justify-center py-10 text-center relative z-10">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                  <CheckCircle className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium mb-3">Siz hələ heç bir imtahanda iştirak etməmisiniz.</p>
                <Link href="/online-exam" className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors">
                  İmtahanlara Bax
                </Link>
              </div>"""

new_exam_ui = """              <div className="relative z-10 mt-6 space-y-4">
                {attempts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <CheckCircle className="text-gray-300" size={24} />
                    </div>
                    <p className="text-gray-500 font-medium mb-3">İmtahan tarixçəniz boşdur.</p>
                    <Link href="/online-exam" className="inline-flex items-center gap-2 bg-black text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-gray-800 transition-colors">
                      İmtahanlara Bax
                    </Link>
                  </div>
                ) : (
                  attempts.map((attempt) => (
                    <div key={attempt.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-gray-900">{attempt.exams?.title}</h4>
                        <p className="text-xs text-gray-500 mt-1">{new Date(attempt.started_at).toLocaleDateString('az-AZ')}</p>
                      </div>
                      <div className="text-right">
                        {attempt.status === 'pending' ? (
                          <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md border border-yellow-100">Yoxlanılır</span>
                        ) : (
                          <span className="text-sm font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-lg border border-green-100">{attempt.score} Bal</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
                {attempts.length > 0 && (
                  <div className="pt-2 text-center">
                     <Link href="/online-exam" className="text-sm font-bold text-blue-600 hover:underline">Yeni İmtahana Başla &rarr;</Link>
                  </div>
                )}
              </div>"""
content = content.replace(old_exam_ui, new_exam_ui)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
