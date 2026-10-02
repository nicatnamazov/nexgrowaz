import sys

with open('src/utils/dictionary.ts', 'r') as f:
    content = f.read()

# Replace studentsTag and studentsTitle with teamTag and teamTitle respectively
content = content.replace('studentsTag: "Tələbələr"', 'teamTag: "Komandamız",\n      teamTitle: "Müəllimlərimiz",\n      studentsTag: "Tələbələr"')
content = content.replace('studentsTitle: "Tələbələrimiz nə deyir"', 'studentsTitle: "Tələbələrimiz nə deyir"')

content = content.replace('studentsTag: "Students"', 'teamTag: "Our Team",\n      teamTitle: "Our Teachers",\n      studentsTag: "Students"')
content = content.replace('studentsTag: "Студенты"', 'teamTag: "Наша команда",\n      teamTitle: "Наши преподаватели",\n      studentsTag: "Студенты"')
content = content.replace('studentsTag: "Öğrenciler"', 'teamTag: "Ekibimiz",\n      teamTitle: "Öğretmenlerimiz",\n      studentsTag: "Öğrenciler"')
content = content.replace('studentsTag: "Studenten"', 'teamTag: "Unser Team",\n      teamTitle: "Unsere Lehrer",\n      studentsTag: "Studenten"')

with open('src/utils/dictionary.ts', 'w') as f:
    f.write(content)
