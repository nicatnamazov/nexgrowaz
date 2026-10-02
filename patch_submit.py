import re

with open("src/app/online-exam/[id]/page.tsx", "r") as f:
    content = f.read()

old_submit = """    await supabase.from('exam_attempts').update({
      completed_at: new Date().toISOString(),
      score: score,
      status: 'pending' // pending manual review for open questions
    }).eq('id', attemptId);"""

new_submit = """    const hasOpen = questions.some(q => q.question_type === 'open');

    await supabase.from('exam_attempts').update({
      completed_at: new Date().toISOString(),
      score: score,
      status: hasOpen ? 'pending' : 'graded'
    }).eq('id', attemptId);"""

content = content.replace(old_submit, new_submit)

with open("src/app/online-exam/[id]/page.tsx", "w") as f:
    f.write(content)
