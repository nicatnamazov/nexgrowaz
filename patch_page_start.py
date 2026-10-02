import sys

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Replace online exam button with apply button in the footer-like CTA
old_btn = """              <Link href="/online-exam"
                className="inline-flex rounded-full bg-white/10 px-10 py-4 text-sm font-bold text-white hover:bg-white/20 transition-all hover:scale-105 shadow-2xl border border-white/20"
              >
                Onlayn imtahan başla
              </Link>"""
new_btn = """              <Link href="/contact"
                className="inline-flex rounded-full bg-[#D4F754] px-10 py-4 text-sm font-bold text-black hover:bg-[#c2e44d] transition-all hover:scale-105 shadow-2xl border border-transparent"
              >
                {dict.home.apply}
              </Link>"""
content = content.replace(old_btn, new_btn)

# Remove startDesc since it mentions checking level with online exams
old_desc = """          <AnimateIn delay={0.18}>
            <p className="text-sm md:text-base text-gray-400 max-w-md mx-auto font-medium mb-8">
              {dict.home.startDesc}
            </p>
          </AnimateIn>"""
content = content.replace(old_desc, "")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
