import re

with open("src/app/page.tsx", "r") as f:
    page = f.read()

# Speed up phone reveal
page = page.replace("transition={{ duration: 0.9, delay: 0.45, ease: [0.44, 0, 0.56, 1] }}", "transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}")

with open("src/app/page.tsx", "w") as f:
    f.write(page)
