import re

with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

old_del_exam = """  const handleDeleteExam = async (id: string) => {
    if(await showConfirm("Bu imtahanı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  };"""

new_del_exam = """  const handleDeleteExam = async (id: string) => {
    if(await showConfirm("Bu imtahanı silmək istədiyinizə əminsiniz? Bütün suallar və tələbə nəticələri də silinəcək!")) {
      const { data: atts } = await supabase.from('exam_attempts').select('id').eq('exam_id', id);
      if (atts && atts.length > 0) {
        const attIds = atts.map(a => a.id);
        await supabase.from('exam_answers').delete().in('attempt_id', attIds);
        await supabase.from('exam_attempts').delete().eq('exam_id', id);
      }
      await supabase.from('questions').delete().eq('exam_id', id);
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  };"""
admin = admin.replace(old_del_exam, new_del_exam)


old_del_q = """  const handleDeleteQuestion = async (id: string) => {
    if(await showConfirm("Sualı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('questions').delete().eq('id', id);
      fetchQuestions(selectedExam.id);
    }
  };"""

new_del_q = """  const handleDeleteQuestion = async (id: string) => {
    if(await showConfirm("Sualı silmək istədiyinizə əminsiniz? Bu suala verilən cavablar da silinəcək.")) {
      await supabase.from('exam_answers').delete().eq('question_id', id);
      await supabase.from('questions').delete().eq('id', id);
      fetchQuestions(selectedExam.id);
    }
  };"""
admin = admin.replace(old_del_q, new_del_q)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)

# Fix online-exam fetch and created_at
with open("src/app/online-exam/page.tsx", "r") as f:
    online = f.read()

online = online.replace(".order('created_at', { ascending: false })", "")

with open("src/app/online-exam/page.tsx", "w") as f:
    f.write(online)

