import re

with open("src/app/online-exam/[id]/page.tsx", "r") as f:
    content = f.read()

old_handle = """  const handleStartForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return showAlert("Zəhmət olmasa doğum tarixini seçin!");
    startExam();
  };"""

new_handle = """  const handleStartForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dob) return showAlert("Zəhmət olmasa doğum tarixini seçin!");
    if (exam?.password && enteredPassword !== exam.password) {
      setPasswordError(true);
      return;
    }
    setPasswordError(false);
    startExam();
  };"""

content = content.replace(old_handle, new_handle)

with open("src/app/online-exam/[id]/page.tsx", "w") as f:
    f.write(content)
