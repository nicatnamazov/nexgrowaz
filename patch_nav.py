import sys

with open('src/components/Navbar.tsx', 'r') as f:
    content = f.read()

# Remove the online exam button from CTA
cta_button = """              <a href="/online-exam"
                className="inline-flex rounded-full bg-white/10 border border-white/20 px-5 sm:px-6 py-2.5 sm:py-3 text-[13px] sm:text-sm font-bold text-white hover:bg-white/20 transition-all duration-300 hover:scale-105 whitespace-nowrap">
                Onlayn imtahan
              </a>"""
content = content.replace(cta_button, '')

# Remove from mobile CTA
mobile_cta_button = """                <a href="/online-exam" onClick={closeMobile}
                  className="block w-full rounded-full bg-white/10 border border-white/20 px-6 py-4 text-center text-base font-bold text-white shadow-lg">
                  Onlayn imtahan
                </a>"""
content = content.replace(mobile_cta_button, '')

with open('src/components/Navbar.tsx', 'w') as f:
    f.write(content)
