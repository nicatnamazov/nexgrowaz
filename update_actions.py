import re

with open("src/app/actions.ts", "r") as f:
    content = f.read()

old_vars = """  const phone = (formData.get('Telefon') || formData.get('phone')) as string;
  const company = formData.get('company') as string || '';
  const message = (formData.get('Mesaj') || formData.get('message') || 'Mesaj yoxdur') as string;
  const type = formData.get('type') as string || 'General';"""

new_vars = """  const phone = (formData.get('Telefon') || formData.get('phone')) as string;
  const service = (formData.get('Xidmət') || formData.get('service') || 'Adi Müraciət') as string;
  const message = (formData.get('Mesaj') || formData.get('message') || 'Mesaj yoxdur') as string;
  const type = formData.get('type') as string || 'Adi Müraciət';"""
content = content.replace(old_vars, new_vars)

old_html = """        <p><strong>Ad/Soyad:</strong> ${name}</p>
        <p><strong>E-poçt:</strong> ${email}</p>
        <p><strong>Nömrə:</strong> ${phone || 'Qeyd edilməyib'}</p>
        <p><strong>Şirkət:</strong> ${company || 'Qeyd edilməyib'}</p>
        <br/>"""

new_html = """        <p><strong>Ad/Soyad:</strong> ${fullName}</p>
        <p><strong>E-poçt:</strong> ${email}</p>
        <p><strong>Nömrə:</strong> ${phone || 'Qeyd edilməyib'}</p>
        <p><strong>Seçilmiş Xidmət:</strong> ${service}</p>
        <br/>"""
content = content.replace(old_html, new_html)
content = content.replace("subject: `Yeni Müraciət: ${type} - ${name}`", "subject: `Yeni Müraciət: ${service !== 'Adi Müraciət' && service ? service : type} - ${fullName}`, reply_to: email")

with open("src/app/actions.ts", "w") as f:
    f.write(content)
