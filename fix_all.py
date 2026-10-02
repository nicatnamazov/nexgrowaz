import re

def fix(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Remove the block I added at the top
    block = 'import { useState, useEffect } from "react";\nimport { submitContactForm } from "@/app/actions";\nimport { showAlert } from "@/utils/alert";\nimport { supabase } from "@/utils/supabase";\n'
    content = content.replace(block, '')

    # Now add missing imports right after the first import safely
    if 'import { submitContactForm }' not in content:
        content = content.replace('import { motion }', 'import { submitContactForm } from "@/app/actions";\nimport { showAlert } from "@/utils/alert";\nimport { supabase } from "@/utils/supabase";\nimport { motion }')

    # Fix multiple useState / useEffect
    if 'import { useState } from "react";' in content:
        content = content.replace('import { useState } from "react";', 'import { useState, useEffect } from "react";')
        
    # We might have duplicates if it was already imported, so remove duplicates
    # For supabase:
    if content.count('import { supabase }') > 1:
        # just remove the second one
        parts = content.split('import { supabase } from "@/utils/supabase";')
        content = parts[0] + 'import { supabase } from "@/utils/supabase";' + "".join(parts[1:])
        
    with open(filepath, "w") as f:
        f.write(content)

fix("src/app/contact/page.tsx")
fix("src/app/page.tsx")
