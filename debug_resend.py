import re

with open("src/app/actions.ts", "r") as f:
    content = f.read()

old_err = "return { error: 'Mesaj göndərilərkən xəta baş verdi.' };"
new_err = "return { error: 'Resend xətası: ' + error.message };"
content = content.replace(old_err, new_err)

old_catch = "return { error: 'Gözlənilməz xəta baş verdi.' };"
new_catch = "return { error: 'Gözlənilməz xəta: ' + String(err) };"
content = content.replace(old_catch, new_catch)

with open("src/app/actions.ts", "w") as f:
    f.write(content)
