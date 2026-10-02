
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_dummy");

export async function submitContactForm(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const phone = formData.get('phone') as string;
  const company = formData.get('company') as string || '';
  const message = formData.get('message') as string;
  const type = formData.get('type') as string || 'General';

  // Basic validation
  if (!name || !email || !message) {
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
      return { error: 'Mesaj göndərilərkən xəta baş verdi.' };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { error: 'Gözlənilməz xəta baş verdi.' };
  }
}
