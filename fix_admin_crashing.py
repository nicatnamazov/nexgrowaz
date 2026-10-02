import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

# Fix fetchExams
old_fetch_exams = """  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('started_at', { ascending: false });
    setExams(data || []);
    setLoading(false);
  };"""
new_fetch_exams = """  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*');
    setExams(data || []);
    setLoading(false);
  };"""
content = content.replace(old_fetch_exams, new_fetch_exams)

# Fix fetchAttempts
old_fetch_attempts = """  const fetchAttempts = async () => {
    const { data } = await supabase.from('exam_attempts').select('*, exams(title), users:user_id(email), profiles:user_id(first_name, last_name, phone)').order('started_at', { ascending: false });
    setAttempts(data || []);
    setLoading(false);
  };"""
new_fetch_attempts = """  const fetchAttempts = async () => {
    // Cannot query auth.users from client, and profiles doesn't have direct FK from exam_attempts
    const { data: attempts } = await supabase.from('exam_attempts').select('*, exams(title)').order('started_at', { ascending: false });
    
    if (attempts && attempts.length > 0) {
        // Fetch profiles for these users
        const userIds = [...new Set(attempts.map(a => a.user_id))];
        const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name, phone').in('id', userIds);
        
        // Map profiles to attempts
        const mapped = attempts.map(att => {
            const prof = profiles?.find(p => p.id === att.user_id);
            return {
                ...att,
                profiles: prof || { first_name: "Bilinmir", last_name: "", phone: "" }
            };
        });
        setAttempts(mapped);
    } else {
        setAttempts([]);
    }
    
    setLoading(false);
  };"""
content = content.replace(old_fetch_attempts, new_fetch_attempts)

# Remove `att.users?.email` everywhere in ResultsTab since we don't have email from profiles
content = content.replace('{att.users?.email}', '{att.profiles?.phone || "Nömrə yoxdur"}')
content = content.replace('{selectedAttempt.users?.email}', '{selectedAttempt.profiles?.phone || "Nömrə yoxdur"}')
content = content.replace('<div><span className="text-gray-500">E-poçt:</span>', '<div><span className="text-gray-500">Nömrə:</span>')


with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
