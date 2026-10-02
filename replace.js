const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');

const oldFunc = content.match(/function TestimonialsMarquee\(\) \{[\s\S]*?\n\}\n/)[0];

const teamFunc = `function TeamSection() {
  const [team, setTeam] = useState<any[]>([]);
  const { lang } = useLang();

  useEffect(() => {
    async function fetchTeam() {
      const { data } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
      if (data) setTeam(data);
    }
    fetchTeam();
  }, []);

  if (team.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {team.map((t, idx) => (
        <div key={idx} className="group relative rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
          <div className="aspect-[4/5] relative w-full overflow-hidden bg-gray-100">
            <img src={t.image} alt={t.name[lang] || t.name.az} className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6 text-white translate-y-2 group-hover:translate-y-0 transition-transform">
              <h3 className="font-bold text-xl mb-1">{t.name[lang] || t.name.az}</h3>
              <p className="text-[#D4F754] text-sm font-medium">{t.role[lang] || t.role.az}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
`;

content = content.replace(oldFunc, teamFunc);
content = content.replace('<TestimonialsMarquee />', '<TeamSection />');
content = content.replace('{dict.home.studentsTag}', '{dict.home.teamTag || "Komandamız"}');
content = content.replace('{dict.home.studentsTitle}', '{dict.home.teamTitle || "Müəllimlərimiz"}');

fs.writeFileSync('src/app/page.tsx', content);
