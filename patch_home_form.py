import re

with open("src/app/page.tsx", "r") as f:
    content = f.read()

# Home page is already a client component ("use client")
if 'import { submitContactForm }' not in content:
    content = content.replace('import { motion } from "framer-motion";', 'import { motion } from "framer-motion";\nimport { submitContactForm } from "@/app/actions";\nimport { showAlert } from "@/utils/alert";\nimport { supabase } from "@/utils/supabase";')

state_logic = """
  const [formLoading, setFormLoading] = useState(false);
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

  const handleHomeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await submitContactForm(formData);
    setFormLoading(false);
    if (res?.error) {
      showAlert(res.error, "error");
    } else {
      showAlert("Mesajınız uğurla göndərildi!", "success");
      (e.target as HTMLFormElement).reset();
    }
  };
"""

if "handleHomeSubmit" not in content:
    content = content.replace('export default function Home() {', 'export default function Home() {\n' + state_logic)

old_form = '<form action="https://formsubmit.co/info@nexgrow.az" method="POST" className="grid grid-cols-1 md:grid-cols-2 gap-4">'
new_form = '<form onSubmit={handleHomeSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">\n<input type="hidden" name="type" value="Home Page CTA" />'
content = content.replace(old_form, new_form)

# Names might be different in home page, let's just do simple replace
content = content.replace('name="name" required placeholder=', 'name="name" defaultValue={userProfile ? `${userProfile.first_name} ${userProfile.last_name}` : ""} required placeholder=')
content = content.replace('name="email" required placeholder=', 'name="email" defaultValue={userProfile?.email || ""} required placeholder=')
content = content.replace('name="phone" placeholder=', 'name="phone" defaultValue={userProfile?.phone || ""} placeholder=')

# Button text
old_button = '<button type="submit" className="md:col-span-2 bg-[#D4F754] text-black font-bold py-4 rounded-xl hover:bg-[#c2e44d] transition-colors shadow-lg mt-2">'
new_button = '<button type="submit" disabled={formLoading} className="md:col-span-2 bg-[#D4F754] text-black font-bold py-4 rounded-xl hover:bg-[#c2e44d] transition-colors shadow-lg mt-2 disabled:opacity-50">'
content = content.replace(old_button, new_button)
content = content.replace('{dict.home.cta_button}</button>', '{formLoading ? "Göndərilir..." : dict.home.cta_button}</button>')

with open("src/app/page.tsx", "w") as f:
    f.write(content)

