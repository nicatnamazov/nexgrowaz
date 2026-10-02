def prepend(filepath):
    with open(filepath, "r") as f:
        content = f.read()
    
    imports = """import { submitContactForm } from "@/app/actions";
import { showAlert } from "@/utils/alert";
import { supabase } from "@/utils/supabase";
"""
    # put it right after "use client";
    content = content.replace('"use client";', '"use client";\n' + imports)
    
    with open(filepath, "w") as f:
        f.write(content)

prepend("src/app/contact/page.tsx")
prepend("src/app/page.tsx")
