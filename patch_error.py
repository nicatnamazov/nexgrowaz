import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

old_insert = """    await supabase.from('questions').insert([{
      exam_id: selectedExam.id,
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      options: qForm.question_type === 'closed' ? qForm.options : null,
      correct_option: qForm.question_type === 'closed' ? qForm.correct_option : null,
      points: qForm.points
    }]);"""

new_insert = """    const { error } = await supabase.from('questions').insert([{
      exam_id: selectedExam.id,
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      options: qForm.question_type === 'closed' ? qForm.options : null,
      correct_option: qForm.question_type === 'closed' ? qForm.correct_option : null,
      points: qForm.points
    }]);
    if (error) {
      alert("Xəta baş verdi: " + error.message);
      return;
    }"""

content = content.replace(old_insert, new_insert)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
