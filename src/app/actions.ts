"use server";


import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function submitContactForm(formData: FormData) {
  const name = (formData.get('Ad') || formData.get('name')) as string;
  const surname = (formData.get('Soyad') || '') as string;
  const email = (formData.get('Email') || formData.get('email')) as string;
  const phone = (formData.get('Telefon') || formData.get('phone')) as string;
  const company = formData.get('company') as string || '';
  const message = (formData.get('Mesaj') || formData.get('message') || 'Mesaj yoxdur') as string;
  const type = formData.get('type') as string || 'General';
  const fullName = surname ? `${name} ${surname}` : name;

  // Basic validation
  if (!fullName || !email || !message) {
    return { error: 'Zəhmət olmasa vacib xanaları doldurun.' };
  }

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: 'E-poçt ünvanı düzgün deyil.' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'NexGrow <noreply@nexgrow.az>', // verified domain
      to: ['info@nexgrow.az'],
      subject: `Yeni Müraciət: ${type} - ${name}`,
      html: `
        <h2>Yeni Müraciət (${type})</h2>
        <p><strong>Ad/Soyad:</strong> ${name}</p>
        <p><strong>E-poçt:</strong> ${email}</p>
        <p><strong>Nömrə:</strong> ${phone || 'Qeyd edilməyib'}</p>
        <p><strong>Şirkət:</strong> ${company || 'Qeyd edilməyib'}</p>
        <br/>
        <h3>Mesaj:</h3>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `
    });

    if (error) {
      console.error(error);
      return { error: 'Resend xətası: ' + error.message };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Gözlənilməz xəta: ' + String(err) };
  }
}
