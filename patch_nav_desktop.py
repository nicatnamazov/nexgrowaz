import re

with open("src/components/Navbar.tsx", "r") as f:
    content = f.read()

old_cta = """            {/* CTA — hide on very small screens since it's inside the mobile menu */}
            <div className="hidden sm:flex items-center gap-2">

              <a href="/auth"
                className="inline-flex rounded-full bg-[#D4F754] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-black hover:bg-[#c2e44d] transition-all duration-300 hover:scale-105 whitespace-nowrap">
                {dict.nav.auth}
              </a>
            </div>"""

new_cta = """            {/* CTA — hide on very small screens since it's inside the mobile menu */}
            <div className="hidden sm:flex items-center gap-2">
              {user ? (
                <a href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-[#D4F754] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-black hover:bg-[#c2e44d] transition-all duration-300 hover:scale-105 whitespace-nowrap shadow-lg">
                  <User size={18}/> Profil
                </a>
              ) : (
                <a href="/auth"
                  className="inline-flex rounded-full bg-[#D4F754] px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-black hover:bg-[#c2e44d] transition-all duration-300 hover:scale-105 whitespace-nowrap">
                  {dict.nav.auth}
                </a>
              )}
            </div>"""

# add User icon import if it doesn't exist
if "User" not in content[:300]:
    content = content.replace('import Image from "next/image";', 'import Image from "next/image";\nimport { User } from "lucide-react";')

content = content.replace(old_cta, new_cta)

with open("src/components/Navbar.tsx", "w") as f:
    f.write(content)

