import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

content = content.replace(".order('created_at', { ascending: true })", "")

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
