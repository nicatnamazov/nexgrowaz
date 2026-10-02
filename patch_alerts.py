import re

with open("src/app/admin/page.tsx", "r") as f:
    admin = f.read()

admin = admin.replace('import { verifyAdmin } from "./actions";', 'import { verifyAdmin } from "./actions";\nimport { showAlert, showConfirm } from "@/utils/alert";')

# Replace alert(...)
admin = re.sub(r'alert\((.*?)\)', r'showAlert(\1)', admin)

# Replace confirm(...) which are usually in if(confirm(...))
# We need to make the parent functions async if they aren't, but all of them are already async in React handlers!
# e.g., if(confirm("...")) -> if(await showConfirm("..."))
admin = re.sub(r'confirm\((.*?)\)', r'await showConfirm(\1)', admin)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(admin)


with open("src/app/online-exam/[id]/page.tsx", "r") as f:
    exam = f.read()

exam = exam.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\nimport { showAlert, showConfirm } from "@/utils/alert";')

exam = re.sub(r'alert\((.*?)\)', r'showAlert(\1)', exam)
exam = re.sub(r'confirm\((.*?)\)', r'await showConfirm(\1)', exam)

# Exam room has a special case:
# if(confirm("İmtahanı bitirmək istədiyinizə əminsiniz?")) handleFinalSubmit();
# in an onClick handler which is NOT async. 
# onClick={() => { if(confirm("...")) handleFinalSubmit(); }}
# I need to fix this one manually to make it async.

old_onclick = 'onClick={() => {\n                    if(await showConfirm("İmtahanı bitirmək istədiyinizə əminsiniz?")) handleFinalSubmit();\n                  }}'
new_onclick = 'onClick={async () => {\n                    if(await showConfirm("İmtahanı bitirmək istədiyinizə əminsiniz?")) handleFinalSubmit();\n                  }}'
exam = exam.replace(old_onclick, new_onclick)

with open("src/app/online-exam/[id]/page.tsx", "w") as f:
    f.write(exam)
