import sys

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Fix marquee image priority
old_marquee_img = '<Image src={news.image} alt={news.title[lang] || news.title.az} width={260} height={325} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />'
new_marquee_img = '<Image priority={i < 6} src={news.image} alt={news.title[lang] || news.title.az} width={260} height={325} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />'
content = content.replace(old_marquee_img, new_marquee_img)

# Fix phone image priority
old_phone_img = '<Image src={current.image} alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />'
new_phone_img = '<Image priority src={current.image} alt="Hero" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />'
content = content.replace(old_phone_img, new_phone_img)

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
