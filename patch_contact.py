import re

with open("src/app/contact/page.tsx", "r") as f:
    content = f.read()

imports = 'import { submitContactForm } from "@/app/actions";\nimport { showAlert } from "@/utils/alert";\nimport { supabase } from "@/utils/supabase";\nimport { useState, useEffect } from "react";'
content = content.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\n' + imports)

# We need to make Contact component a client component to handle form state and user data.
if '"use client"' not in content:
    content = '"use client";\n' + content

# Add state and user fetch logic inside default function Contact() {
state_logic = """
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({data: {user}}) => {
      if (user) {
        supabase.from('profiles').select('*').eq('id', user.id).single().then(({data}) => {
          if (data) {
            setUserProfile({...data, email: user.email});
          }
        });
      }
    });
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitContactForm(formData);
    setLoading(false);
    if (res?.error) {
      showAlert(res.error, "error");
    } else {
      showAlert("Mesajınız uğurla göndərildi!", "success");
      (e.target as HTMLFormElement).reset();
    }
  };
"""
# Replace ONLY the first occurrence of "  return ("
content = content.replace('  return (', state_logic + '\n  return (', 1)

# Remove the old dummy handleSubmit
old_dummy_handler = """  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };"""
content = content.replace(old_dummy_handler, '')

# Update form tag
old_form = '<form action="https://formsubmit.co/info@nexgrow.az" method="POST" className="flex flex-col gap-4">'
new_form = '<form onSubmit={handleContactSubmit} className="flex flex-col gap-4">\n<input type="hidden" name="type" value="Contact Page" />'
content = content.replace(old_form, new_form)

# Add defaultValue to inputs
content = content.replace('placeholder={dict.contact.name_ph} className=', 'defaultValue={userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : ""} placeholder={dict.contact.name_ph} className=')
content = content.replace('placeholder={dict.contact.email_ph} className=', 'defaultValue={userProfile?.email || ""} placeholder={dict.contact.email_ph} className=')
content = content.replace('placeholder={dict.contact.phone_ph} className=', 'defaultValue={userProfile?.phone || ""} placeholder={dict.contact.phone_ph} className=')

# Button text loading state
old_button = '<button type="submit" className="bg-[#D4F754] text-black font-bold py-4 rounded-xl hover:bg-[#c2e44d] transition-colors shadow-lg mt-2">'
new_button = '<button type="submit" disabled={loading} className="bg-[#D4F754] text-black font-bold py-4 rounded-xl hover:bg-[#c2e44d] transition-colors shadow-lg mt-2 disabled:opacity-50">'
content = content.replace(old_button, new_button)
content = content.replace('{dict.contact.send}</button>', '{loading ? "Göndərilir..." : dict.contact.send}</button>')

with open("src/app/contact/page.tsx", "w") as f:
    f.write(content)

