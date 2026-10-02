import re

with open("src/app/dashboard/page.tsx", "r") as f:
    content = f.read()

# Replace the line that tries to use setProfile
old_line = "setProfile({...profile, first_name: updateForm.first_name, last_name: updateForm.last_name, phone: updateForm.phone});"
new_line = "window.location.reload();"
content = content.replace(old_line, new_line)

with open("src/app/dashboard/page.tsx", "w") as f:
    f.write(content)
