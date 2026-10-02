import re

with open("src/app/actions.ts", "r") as f:
    content = f.read()

old_vars = """  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const company = formData.get('company') as string || '';
  const message = formData.get('message') as string;
  const type = formData.get('type') as string || 'General';"""

new_vars = """  const name = (formData.get('Ad') || formData.get('name')) as string;
  const surname = (formData.get('Soyad') || '') as string;
  const email = (formData.get('Email') || formData.get('email')) as string;
  const phone = (formData.get('Telefon') || formData.get('phone')) as string;
  const company = formData.get('company') as string || '';
  const message = (formData.get('Mesaj') || formData.get('message') || 'Mesaj yoxdur') as string;
  const type = formData.get('type') as string || 'General';
  const fullName = surname ? `${name} ${surname}` : name;"""

content = content.replace(old_vars, new_vars)

content = content.replace('!name || !email', '!fullName || !email')
content = content.replace('Name: ${name}', 'Name: ${fullName}')

with open("src/app/actions.ts", "w") as f:
    f.write(content)
