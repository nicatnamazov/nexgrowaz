import re

def fix_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()
        
    imports = """import { useState, useEffect } from "react";
import { submitContactForm } from "@/app/actions";
import { showAlert } from "@/utils/alert";
import { supabase } from "@/utils/supabase";
"""
    if 'submitContactForm' not in content[:500]:
        content = content.replace('"use client";', '"use client";\n' + imports)

    content = content.replace('({data: {user}})', '({data: {user}}: any)')
    content = content.replace('({data})', '({data}: any)')
    
    with open(filepath, "w") as f:
        f.write(content)

fix_file("src/app/contact/page.tsx")
fix_file("src/app/page.tsx")
