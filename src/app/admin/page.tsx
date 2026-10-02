"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/utils/supabase";
import { Users, Loader2, Plus, Edit, ArrowLeft, ArrowRight, Trash, Upload, X, LogOut, CheckCircle, ImageIcon, FileText, Send, Settings, GraduationCap, Clock } from "lucide-react";

import { verifyAdmin } from "./actions";
import { showAlert, showConfirm } from "@/utils/alert";

// MyMemory free translation API — splits long texts into chunks to avoid 500-char limit
const LANG_MAP: Record<string, string> = { en: "en-US", ru: "ru-RU", tr: "tr-TR", de: "de-DE" };

const translateChunk = async (text: string, targetLang: string): Promise<string> => {
  if (!text.trim()) return "";
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=az|${LANG_MAP[targetLang] || targetLang}`;
    const res = await fetch(url);
    const json = await res.json();
    const result = json?.responseData?.translatedText || "";
    // MyMemory returns original with "MYMEMORY WARNING" if quota exceeded
    if (result.includes("MYMEMORY WARNING") || result.includes("YOU USED ALL AVAILABLE FREE TRANSLATIONS")) {
      return text; // fallback
    }
    return result || text;
  } catch {
    return text;
  }
};

const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text.trim()) return "";
  const MAX_CHUNK = 490; // MyMemory limit is 500 chars
  if (text.length <= MAX_CHUNK) {
    return translateChunk(text, targetLang);
  }
  // Split by sentence boundaries for long texts
  const sentences = text.match(/[^.!?]+[.!?\n]*/g) || [text];
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  // Translate each chunk (sequential to avoid rate limits)
  const translated: string[] = [];
  for (const chunk of chunks) {
    const result = await translateChunk(chunk, targetLang);
    translated.push(result);
    // Small delay between requests to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  return translated.join(" ");
};

// ImgBB Upload
const uploadImage = async (file: File) => {
  const apiKey = "174d8e4a3863a2debc05f6667337588e";
  
  // Convert to Base64 to avoid FormData boundary issues on client
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });

  const formData = new FormData();
  formData.append("image", base64);
  
  const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
    method: "POST",
    body: formData,
  });
  
  const data = await res.json();
  if (data.success) {
    return data.data.url;
  }
  throw new Error("Image upload failed: " + JSON.stringify(data));
};

const LANGUAGES = ["az", "en", "ru", "tr", "de"];

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [activeTab, setActiveTab] = useState<"news" | "forms" | "universities" | "settings" | "team" | "users" | "exam">("news");

  useEffect(() => {
    const logged = localStorage.getItem("admin_logged_in");
    if (logged === "true") setIsLoggedIn(true);
    else setIsLoggedIn(false);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await verifyAdmin(email, password);
    if (isValid) {
      setIsLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      setLoginError("");
    } else {
      setLoginError("Yanlış email və ya şifrə");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("admin_logged_in");
  };

  if (isLoggedIn === null) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-black" size={48} /></div>;
  }

  if (isLoggedIn === false) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">NexGrow Admin</h2>
          {loginError && <div className="text-red-500 text-sm mb-4 text-center">{loginError}</div>}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Şifrə</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Daxil ol
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F6F9EA] text-black overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-xl flex flex-col z-20 border-r border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h1 className="text-xl font-extrabold tracking-tight">İdarə Paneli</h1>
          <div className="w-8 h-8 rounded-full bg-[#D4F754] flex items-center justify-center shadow-sm">
            <Users size={16} className="text-black" />
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "news", label: "Məlumatlar", icon: <FileText size={20} /> },
            { id: "forms", label: "Formlar", icon: <Send size={20} /> },
            { id: "universities", label: "Universitetlər", icon: <GraduationCap size={20} /> },
            { id: "team", label: "Komandamız", icon: <Users size={20} /> },
            { id: "exam", label: "Onlayn İmtahanlar", icon: <CheckCircle size={20} /> },
            { id: "users", label: "İstifadəçilər", icon: <Users size={20} /> },
            { id: "settings", label: "Tənzimləmələr", icon: <Settings size={20} /> }
          ].map((tab: any) => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id as any)}
              disabled={tab.disabled}
              className={`relative w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 text-left font-medium ${
                activeTab === tab.id 
                  ? "text-black shadow-sm" 
                  : tab.disabled 
                    ? "text-gray-400 opacity-60 cursor-not-allowed" 
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
              }`}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#D4F754] rounded-xl z-0"
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex items-center w-full">
                <div className={`mr-3 ${activeTab === tab.id ? "text-black" : ""}`}>{tab.icon}</div>
                <span className="flex-1 text-[15px]">{tab.label}</span>
                {tab.tag && (
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-black/10 px-2 py-0.5 rounded-full ml-2">
                    {tab.tag}
                  </span>
                )}
              </div>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 hover:text-red-700 py-3 rounded-xl transition-colors font-bold shadow-sm border border-transparent hover:border-red-100">
            <LogOut size={20} />
            <span>Sistemdən Çıxış</span>
          </button>
        </div>
      </aside>

      {/* Main Content with AnimatePresence */}
      <main className="flex-1 overflow-auto relative bg-[#F6F9EA]">
        <div className="absolute inset-0 p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-full"
            >
              <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-8 min-h-full border border-gray-100/50">
                {activeTab === "news" && <NewsTab />}
                {activeTab === "forms" && <FormsTab />}
                {activeTab === "universities" && <UniversitiesTab />}
                {activeTab === "settings" && <SettingsTab />}
                {activeTab === "team" && <TeamTab />}
                {activeTab === "users" && <UsersTab />}
                {activeTab === "exam" && <ExamsTab />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

// -----------------------------------------------------
// NEWS TAB
// -----------------------------------------------------
function NewsTab() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'category' | 'exam' | 'question', id: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [heroSlugs, setHeroSlugs] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<any>({
    slug: "",
    image: "",
    date: new Date().toISOString().split('T')[0],
    title: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
    excerpt: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
    content: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
    is_pinned: false,
      make_hero: true,
      show_in_marquee: false,
    });
  const [uploading, setUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStep, setTranslationStep] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const { data } = await supabase.from("news").select("*").order("date", { ascending: false });
    if (data) setNews(data);
    const { data: sData } = await supabase.from("settings").select("hero_news_slug").eq("id", 1).single();
    if (sData && sData.hero_news_slug) setHeroSlugs(sData.hero_news_slug.split(',').map((x: string) => x.trim()));
    else setHeroSlugs([]);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, image: url }));
      } catch (err) {
        showAlert("Image upload failed");
      }
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ── STEP 1: Translate ──────────────────────────────────────────────────────
    setIsTranslating(true);
    const filledTitle = { ...formData.title };
    const filledExcerpt = { ...formData.excerpt };
    const filledContent = { ...formData.content };
    const otherLangs = LANGUAGES.filter(l => l !== "az");

    // Translate sequentially so user sees progress per language
    for (const l of otherLangs) {
      setTranslationStep(`Tərcümə edilir: ${l.toUpperCase()}...`);
      if (!filledTitle[l] || filledTitle[l] === filledTitle.az) {
        filledTitle[l] = await translateText(formData.title.az || "", l);
      }
      if (!filledExcerpt[l] || filledExcerpt[l] === filledExcerpt.az) {
        filledExcerpt[l] = await translateText(formData.excerpt.az || "", l);
      }
      if (!filledContent[l] || filledContent[l] === filledContent.az) {
        filledContent[l] = await translateText(formData.content.az || "", l);
      }
    }

    setTranslationStep("Bazaya yazılır...");

    const { make_hero, ...dataToSubmit } = {
      ...formData,
      title: filledTitle,
      excerpt: filledExcerpt,
      content: filledContent,
    };

    let heroSlug: string | null = null;
    let safeData = { ...dataToSubmit };

    // Try to update/insert. If it fails due to missing show_in_marquee column, retry without it.
    if (editingId) {
      let res = await supabase.from("news").update(safeData).eq("id", editingId);
      if (res.error && res.error.message.includes("show_in_marquee")) {
        delete safeData.show_in_marquee;
        res = await supabase.from("news").update(safeData).eq("id", editingId);
      }
      if (res.error) showAlert("Məlumat yenilənərkən xəta: " + res.error.message);
      heroSlug = safeData.slug;
    } else {
      let res = await supabase.from("news").insert([safeData]).select();
      if (res.error && res.error.message.includes("show_in_marquee")) {
        delete safeData.show_in_marquee;
        res = await supabase.from("news").insert([safeData]).select();
      }
      if (res.error) showAlert("Məlumat əlavə edərkən xəta: " + res.error.message);
      if (res.data && res.data[0]) heroSlug = res.data[0].slug;
    }

    const updateHeroSlug = async (slug: string) => {
      const { data: s } = await supabase.from("settings").select("hero_news_slug, id").eq("id", 1).single();
      let currentSlugs = s && s.hero_news_slug ? s.hero_news_slug.split(',').map((x: string) => x.trim()).filter(Boolean) : [];
      
      if (make_hero && !currentSlugs.includes(slug)) {
         currentSlugs.push(slug);
      } else if (!make_hero && currentSlugs.includes(slug)) {
         currentSlugs = currentSlugs.filter((x: string) => x !== slug);
      }
      
      const newSlugsString = currentSlugs.join(',');
      if (s) {
        await supabase.from("settings").update({ hero_news_slug: newSlugsString }).eq("id", 1);
      } else {
        await supabase.from("settings").insert({ id: 1, hero_news_slug: newSlugsString });
      }
    };

    if (heroSlug) {
      await updateHeroSlug(heroSlug);
    }

    setIsTranslating(false);
    setTranslationStep("");
    setShowModal(false);
    fetchNews();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await supabase.from("news").delete().eq("id", deleteId);
      setDeleteId(null);
      fetchNews();
    }
  };

  const openEdit = (item: any) => {
    const normalizedContent: any = {};
    for (const l of LANGUAGES) {
      const val = item.content ? item.content[l] : null;
      if (typeof val === 'object' && val !== null) {
        normalizedContent[l] = val.mezmun || "";
      } else {
        normalizedContent[l] = val || "";
      }
    }

    setFormData({
      slug: item.slug,
      image: item.image,
      date: item.date,
      title: item.title,
      excerpt: item.excerpt,
      content: normalizedContent,
      is_pinned: item.is_pinned || false,
      make_hero: heroSlugs.includes(item.slug),
      show_in_marquee: item.show_in_marquee || false,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const openAdd = () => {
    setFormData({
      slug: "",
      image: "",
      date: new Date().toISOString().split('T')[0],
      title: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
      excerpt: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
      content: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
      is_pinned: false,
      make_hero: true,
      show_in_marquee: false,
    });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div>
      {isTranslating && (
        <div className="fixed inset-0 bg-white/90 flex flex-col items-center justify-center z-[200]">
          <Loader2 className="animate-spin w-12 h-12 text-blue-600 mb-4" />
          <p className="text-xl font-bold">{translationStep}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Məlumatlər</h2>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
          <Plus size={18} />
          <span>Yeni Məlumat</span>
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-10" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Title (az)</th>
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {news.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {item.image && <img src={item.image} alt="news" className="w-16 h-16 object-cover rounded" />}
                  </td>
                  <td className="p-4">{item.title?.az || "N/A"}</td>
                  <td className="p-4">{item.date}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {news.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">Heç bir məlumat tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto overscroll-contain p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? "Məlumati Redaktə Et" : "Yeni Məlumat"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL adı)</label>
                  <input required className="w-full border rounded px-3 py-2" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tarix</label>
                  <input type="date" required className="w-full border rounded px-3 py-2" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
                </div>
                <div className="flex flex-col space-y-2 pb-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="is_pinned" checked={formData.is_pinned || false} onChange={(e) => setFormData({...formData, is_pinned: e.target.checked})} className="w-5 h-5" />
                    <label htmlFor="is_pinned" className="font-medium text-sm">Ana səhifədə (Ən son məlumatlar) göstər</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="make_hero" checked={formData.make_hero || false} onChange={(e) => setFormData({...formData, make_hero: e.target.checked})} className="w-5 h-5" />
                    <label htmlFor="make_hero" className="font-medium text-sm text-blue-600">Telefon ekranında göstər</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="show_in_marquee" checked={formData.show_in_marquee || false} onChange={(e) => setFormData({...formData, show_in_marquee: e.target.checked})} className="w-5 h-5" />
                    <label htmlFor="show_in_marquee" className="font-medium text-sm text-green-600">Bütün Məlumatlar səhifəsində göstər</label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image Upload</label>
                <div className="flex items-center space-x-4">
                  {formData.image && (
                    <div className="relative">
                      <img src={formData.image} alt="preview" className="h-16 w-16 object-cover rounded" />
                      <button type="button" onClick={() => setFormData({...formData, image: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center space-x-2">
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <h4 className="font-medium text-lg">Məzmun (Azərbaycan dilində)</h4>
                <p className="text-xs text-gray-500 mb-2">Mətni azərbaycanca yazın, sistem avtomatik digər dillər üçün də eyni mətni istifadə edəcək.</p>
                <div className="p-4 border rounded bg-gray-50 space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">Başlıq (Title)</label>
                    <input required className="w-full border rounded px-3 py-2 bg-white" value={(formData.title as any).az} onChange={(e) => setFormData({...formData, title: {...formData.title, az: e.target.value}})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Qısa Təsvir (Excerpt)</label>
                    <textarea required className="w-full border rounded px-3 py-2 bg-white h-20" value={(formData.excerpt as any).az} onChange={(e) => setFormData({...formData, excerpt: {...formData.excerpt, az: e.target.value}})} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Əsas Məzmun (Content)</label>
                    <textarea required className="w-full border rounded px-3 py-2 bg-white h-32" value={(formData.content as any).az} onChange={(e) => setFormData({...formData, content: {...formData.content, az: e.target.value}})} />
                  </div>
                </div>
              </div>

              {/* Translation loading overlay */}
              {isTranslating && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 rounded-lg gap-4">
                  <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
                  <p className="text-base font-semibold text-gray-700">{translationStep}</p>
                  <p className="text-sm text-gray-500 text-center px-8">Zəhmət olmasa gözləyin — mətn avtomatik olaraq 4 dilə tərcümə edilir...</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => { if (!isTranslating) setShowModal(false); }} disabled={isTranslating} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-40">Ləğv et</button>
                <button type="submit" disabled={uploading || isTranslating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center">
                  {isTranslating ? <><Loader2 size={15} className="animate-spin" /><span className="text-xs">{translationStep}</span></> : <span>Yadda Saxla</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">Silmək istədiyinizə əminsiniz?</h3>
            <p className="text-gray-500 text-sm mb-6">Bu əməliyyatı geri qaytarmaq mümkün deyil.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-800 hover:text-white rounded font-medium transition-colors">Ləğv et</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors">Bəli, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------
// FORMS TAB
// -----------------------------------------------------
function FormsTab() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'category' | 'exam' | 'question', id: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStep, setTranslationStep] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    start_date: "",
    end_date: "",
    image: [] as string[],
    is_active: true,
  });

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    setLoading(true);
    const { data } = await supabase.from("dynamic_forms").select("*").order("id", { ascending: false });
    if (data) setForms(data);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => {
          const current = Array.isArray(prev.image) ? prev.image : (prev.image ? [prev.image] : []);
          return { ...prev, image: [...current, url] };
        });
      } catch (err) {
        showAlert("Image upload failed");
      }
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit: any = { ...formData };
    dataToSubmit.image = JSON.stringify(formData.image);
    if (!dataToSubmit.start_date) dataToSubmit.start_date = null;
    if (!dataToSubmit.end_date) dataToSubmit.end_date = null;
    
    if (editingId) {
      const { error } = await supabase.from("dynamic_forms").update(dataToSubmit).eq("id", editingId);
      if (error) showAlert("Error updating form: " + error.message);
    } else {
      const { error } = await supabase.from("dynamic_forms").insert([dataToSubmit]);
      if (error) showAlert("Error creating form: " + error.message);
    }
    
    setShowModal(false);
    fetchForms();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await supabase.from("dynamic_forms").delete().eq("id", deleteId);
      setDeleteId(null);
      fetchForms();
    }
  };

  const openEdit = (item: any) => {
    setFormData({
      title: item.title,
      content: item.content,
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      image: (() => {
        try {
          if (item.image?.startsWith('[')) return JSON.parse(item.image);
          if (item.image) return [item.image];
          return [];
        } catch(e) { return item.image ? [item.image] : []; }
      })(),
      is_active: item.is_active,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const openNew = () => {
    setFormData({ title: "", content: "", start_date: "", end_date: "", image: [], is_active: true });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Formlar</h2>
        <button onClick={openNew} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
          <Plus size={18} />
          <span>Yeni Forma</span>
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-10" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Title</th>
                <th className="p-4 font-medium">Dates</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {(() => {
                      let imgs = [];
                      try {
                        if (item.image?.startsWith('[')) imgs = JSON.parse(item.image);
                        else if (item.image) imgs = [item.image];
                      } catch(e) { imgs = item.image ? [item.image] : []; }
                      
                      return imgs[0] ? <img src={imgs[0]} alt="form" className="w-16 h-16 object-cover rounded" /> : null;
                    })()}
                  </td>
                  <td className="p-4">{item.title}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {item.start_date} <br/> {item.end_date}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs ${item.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {item.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {forms.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">Heç bir forma tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[85vh] overflow-y-auto overscroll-contain p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">Yeni Forma</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required className="w-full border rounded px-3 py-2" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content</label>
                <textarea required className="w-full border rounded px-3 py-2 h-24" value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <input type="date" className="w-full border rounded px-3 py-2" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} />
                  <span className="text-sm font-medium">Is Active</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Şəkillər (Karusel)</label>
                <div className="flex items-center space-x-4 mb-3">
                  <label className={`cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center space-x-2`}>
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    <span>{uploading ? "Yüklənir..." : "Şəkil Seç"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  </label>
                  <span className="text-sm text-gray-500">İstənilən sayda şəkil</span>
                </div>
                <div className="flex gap-2">
                  {(formData.image as string[]).map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded overflow-hidden group">
                      <img src={img} alt="preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setFormData({...formData, image: (formData.image as string[]).filter((_, i) => i !== idx)})} className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">Silmək istədiyinizə əminsiniz?</h3>
            <p className="text-gray-500 text-sm mb-6">Bu əməliyyatı geri qaytarmaq mümkün deyil.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-800 hover:text-white rounded font-medium transition-colors">Ləğv et</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors">Bəli, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------
// SETTINGS TAB
// -----------------------------------------------------
function SettingsTab() {
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'category' | 'exam' | 'question', id: string} | null>(null);
  const [formData, setFormData] = useState({
    admin_email: "",
    admin_pass: "",
    socials: [] as any[],
    bottom_images: [] as string[],
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, image: url }));
      } catch (err) {
        showAlert("Şəkil yüklənmədi");
      }
      setUploading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("settings").select("*").eq("id", 1).single();
    if (data) {
      setFormData({
        admin_email: data.admin_email || "",
        admin_pass: data.admin_pass || "",
        socials: data.socials || [],
        bottom_images: data.bottom_images || [],
      });
    }
    setLoading(false);
  };

  const [saved, setSaved] = useState(false);
  const [uploadingBottom, setUploadingBottom] = useState(false);

  
  const handleBottomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (formData.bottom_images.length >= 5) return showAlert("Maksimum 5 şəkil əlavə edilə bilər.");
      setUploadingBottom(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData({ ...formData, bottom_images: [...formData.bottom_images, url] });
      } catch (err) {
        showAlert("Şəkil yüklənmədi");
      }
      setUploadingBottom(false);
    }
  };

  const removeBottomImage = (index: number) => {
    const newImgs = [...formData.bottom_images];
    newImgs.splice(index, 1);
    setFormData({ ...formData, bottom_images: newImgs });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from("settings").upsert({ id: 1, ...formData });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    setSaving(false);
  };

  const addSocial = () => {
    setFormData({
      ...formData,
      socials: [...formData.socials, { label: "", href: "" }]
    });
  };

  const updateSocial = (index: number, key: string, value: string) => {
    const newSocials = [...formData.socials];
    newSocials[index][key] = value;
    setFormData({ ...formData, socials: newSocials });
  };

  const removeSocial = (index: number) => {
    const newSocials = [...formData.socials];
    newSocials.splice(index, 1);
    setFormData({ ...formData, socials: newSocials });
  };

  if (loading) return <Loader2 className="animate-spin mx-auto mt-10" />;

  return (
    <div className="max-w-2xl bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Tənzimləmələr</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">Giriş Məlumatları</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input required type="email" className="w-full border rounded px-3 py-2" value={formData.admin_email} onChange={(e) => setFormData({...formData, admin_email: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Şifrə</label>
              <input required className="w-full border rounded px-3 py-2" value={formData.admin_pass} onChange={(e) => setFormData({...formData, admin_pass: e.target.value})} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex justify-between items-center">
            <span>Sosial Şəbəkələr</span>
            <button type="button" onClick={addSocial} className="text-sm bg-gray-100 px-3 py-1 rounded hover:bg-gray-200">Əlavə et</button>
          </h3>
          <div className="space-y-3">
            {formData.socials.map((social, idx) => (
              <div key={idx} className="flex space-x-2 items-center">
                <input placeholder="Ad (məs: Instagram)" required className="flex-1 border rounded px-3 py-2 text-sm" value={social.label} onChange={(e) => updateSocial(idx, 'label', e.target.value)} />
                <input placeholder="Link (URL)" required className="flex-1 border rounded px-3 py-2 text-sm" value={social.href} onChange={(e) => updateSocial(idx, 'href', e.target.value)} />
                <button type="button" onClick={() => removeSocial(idx)} className="text-red-500 hover:text-red-700 p-2"><Trash size={16} /></button>
              </div>
            ))}
            {formData.socials.length === 0 && <p className="text-sm text-gray-500">Heç bir sosial şəbəkə əlavə edilməyib.</p>}
          </div>
        </div>


        <div>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4 flex justify-between items-center">
            <span>Alt Bar Şəkilləri (Başlayaq)</span>
            <label className={`text-sm ${formData.bottom_images.length >= 5 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'} px-3 py-1 rounded flex items-center space-x-1`}>
              {uploadingBottom ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
              <span>Əlavə et</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleBottomImageUpload} disabled={uploadingBottom || formData.bottom_images.length >= 5} />
            </label>
          </h3>
          <p className="text-xs text-gray-500 mb-3">Minimum 2, maksimum 5 şəkil tövsiyə olunur.</p>
          <div className="grid grid-cols-5 gap-3">
            {formData.bottom_images.map((img: string, idx: number) => (
              <div key={idx} className="relative aspect-[3/4] border rounded overflow-hidden group">
                <img src={img} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeBottomImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
          {formData.bottom_images.length === 0 && <p className="text-sm text-gray-500">Heç bir şəkil əlavə edilməyib. Standard məlumat şəkilləri görünəcək.</p>}
        </div>

        <div className="flex items-center space-x-4">
          <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded font-bold hover:bg-gray-800 disabled:opacity-50 transition-colors">
            {saving ? "Saxlanılır..." : "Yadda Saxla"}
          </button>
          {saved && <span className="text-green-600 font-medium text-sm">✓ Uğurla yadda saxlanıldı!</span>}
        </div>
      </form>
    </div>
  );
}

// -----------------------------------------------------
// UNIVERSITIES TAB
// -----------------------------------------------------

const COUNTRY_CITIES: Record<string, string[]> = {
  "Türkiyə": ["İstanbul", "Ankara", "İzmir", "Antalya", "Bursa", "Digər"],
  "ABŞ": ["New York", "Boston", "Los Angeles", "Chicago", "Digər"],
  "Böyük Britaniya": ["London", "Manchester", "Birmingham", "Digər"],
  "Almaniya": ["Berlin", "Münhen", "Frankfurt", "Hamburq", "Digər"],
  "Kanada": ["Toronto", "Vancouver", "Montreal", "Digər"],
  "Polşa": ["Varşava", "Krakov", "Vrotslav", "Poznan", "Digər"],
  "İtaliya": ["Roma", "Milan", "Florensiya", "Bolonya", "Digər"],
  "Macarıstan": ["Budapeşt", "Debrecen", "Szeged", "Digər"],
  "Azərbaycan": ["Bakı", "Gəncə", "Digər"],
  "Digər": ["Digər"]
};
const CURRENCIES = ["$", "€", "£", "TL", "AZN"];

function UniversitiesTab() {
  const [universitiesList, setUniversitiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{type: 'category' | 'exam' | 'question', id: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    image: "",
    country: "",
    city: "",
    price: "", currency: "$", priceValue: "",
    degrees: "",
    is_exclusive: false,
    content: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
  });
  const [uploading, setUploading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationStep, setTranslationStep] = useState("");
  const [autoTranslate, setAutoTranslate] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const { data: unis } = await supabase.from('universities').select('*').order('id', { ascending: false });
    if (unis) setUniversitiesList(unis);
    setLoading(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, image: url }));
      } catch (err) {
        showAlert("Image upload failed");
      }
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsTranslating(true);
    const filledContent = { ...formData.content };
    const otherLangs = LANGUAGES.filter(l => l !== "az");

    if (autoTranslate) {
      for (const l of otherLangs) {
        setTranslationStep(`Tərcümə edilir: ${l.toUpperCase()}...`);
        let azContent = formData.content.az;
        if (typeof azContent === 'string') azContent = { mezmun: azContent, telebler: "", proqramlar: "" };
        else if (!azContent) azContent = { mezmun: "", telebler: "", proqramlar: "" };

        let currentL = filledContent[l];
        if (typeof currentL === 'string') currentL = { mezmun: currentL, telebler: "", proqramlar: "" };
        else if (!currentL) currentL = { mezmun: "", telebler: "", proqramlar: "" };
        
        currentL.mezmun = azContent.mezmun ? await translateText(azContent.mezmun, l) : "";
        currentL.telebler = azContent.telebler ? await translateText(azContent.telebler, l) : "";
        currentL.proqramlar = azContent.proqramlar ? await translateText(azContent.proqramlar, l) : "";
        
        filledContent[l] = currentL;
      }
    } else {
      // If not auto translating, ensure at least old values or fallback is kept
      for (const l of otherLangs) {
        let currentL = filledContent[l];
        if (typeof currentL === 'string') currentL = { mezmun: currentL, telebler: "", proqramlar: "" };
        else if (!currentL) currentL = { mezmun: "", telebler: "", proqramlar: "" };
        
        let azContent = formData.content.az;
        if (typeof azContent === 'string') azContent = { mezmun: azContent, telebler: "", proqramlar: "" };
        else if (!azContent) azContent = { mezmun: "", telebler: "", proqramlar: "" };
        
        if (!currentL.mezmun) currentL.mezmun = azContent.mezmun || "";
        filledContent[l] = currentL;
      }
    }

    setTranslationStep("Bazaya yazılır...");

    let degreesArray = [];
    if (typeof formData.degrees === 'string') {
        degreesArray = formData.degrees.split(',').map((s: string) => s.trim()).filter((s: string) => s);
    } else {
        degreesArray = formData.degrees;
    }

    const dataToSubmit = {
      ...formData,
      price: `${formData.currency || '$'} ${formData.priceValue || ''}`.trim(),
      content: filledContent,
      degrees: JSON.stringify(degreesArray),
    };
    delete dataToSubmit.currency;
    delete dataToSubmit.priceValue;

    if (editingId) {
      const { error } = await supabase.from("universities").upsert({ id: editingId, ...dataToSubmit });
      if (error) showAlert("Xəta: " + error.message);
    } else {
      const { error } = await supabase.from("universities").insert([dataToSubmit]);
      if (error) showAlert("Xəta: " + error.message);
    }

    setIsTranslating(false);
    setTranslationStep("");
    setShowModal(false);
    fetchData();
  };

  const handleDelete = (id: number) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await supabase.from("universities").delete().eq("id", deleteId);
      setDeleteId(null);
      fetchData();
    }
  };

  const openEdit = (item: any) => {
    let degStr = "";
    try {
      const parsed = typeof item.degrees === 'string' ? JSON.parse(item.degrees) : item.degrees;
      degStr = Array.isArray(parsed) ? parsed.join(", ") : "";
    } catch {
      degStr = item.degrees || "";
    }

    setFormData({
      name: item.name || "",
      slug: item.slug || "",
      image: item.image || "",
      country: item.country || "",
      city: item.city || "",
      price: item.price || "", currency: item.price ? item.price.replace(/[0-9\s.,]/g, '') : "$", priceValue: item.price ? item.price.replace(/[^0-9.,]/g, '') : "",
      degrees: degStr,
      is_exclusive: item.is_exclusive || false,
      content: item.content || LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: { mezmun: "", telebler: "", proqramlar: "" } }), {}),
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const openAdd = () => {
    setFormData({
      name: "",
      slug: "",
      image: "",
      country: "",
      city: "",
      price: "", currency: "$", priceValue: "",
      degrees: "",
      is_exclusive: false,
      content: LANGUAGES.reduce((acc, l) => ({ ...acc, [l]: "" }), {}),
    });
    setEditingId(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Universitetlər</h2>
        <button onClick={openAdd} className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2">
          <Plus size={18} />
          <span>Əlavə et</span>
        </button>
      </div>

      {loading ? (
        <Loader2 className="animate-spin mx-auto mt-10" />
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 font-medium">Image</th>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Country / City</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {universitiesList.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    {item.image && <img src={item.image} alt="uni" className="w-16 h-16 object-cover rounded" />}
                  </td>
                  <td className="p-4">{item.name}</td>
                  <td className="p-4">{item.country}, {item.city}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => openEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:bg-red-50 p-2 rounded">
                      <Trash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {universitiesList.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">Heç bir universitet tapılmadı</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[85vh] overflow-y-auto overscroll-contain p-6 relative">
            <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <X size={24} />
            </button>
            <h3 className="text-xl font-bold mb-4">{editingId ? "Universiteti Redaktə Et" : "Yeni Universitet"}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ad (Name)</label>
                  <input required className="w-full border rounded px-3 py-2" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug (URL adı)</label>
                  <input required className="w-full border rounded px-3 py-2" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ölkə (Country)</label>
                  <select required className="w-full border rounded px-3 py-2" value={formData.country} onChange={(e) => setFormData({...formData, country: e.target.value, city: COUNTRY_CITIES[e.target.value]?.[0] || ""})}>
                    <option value="">Seçin</option>
                    {Object.keys(COUNTRY_CITIES).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Şəhər (City)</label>
                  {formData.country && formData.country !== "Digər" ? (
                    <select required className="w-full border rounded px-3 py-2" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})}>
                      {(COUNTRY_CITIES[formData.country] || []).map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input required className="w-full border rounded px-3 py-2" placeholder="Şəhər adı" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Qiymət (Price)</label>
                  <div className="flex">
                    <select className="border rounded-l px-2 py-2 bg-gray-50" value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input required className="w-full border border-l-0 rounded-r px-3 py-2" placeholder="4800,00" value={formData.priceValue} onChange={(e) => setFormData({...formData, priceValue: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dərəcələr (Vergüllə ayırın)</label>
                  <input required placeholder="Bakalavr, Magistr" className="w-full border rounded px-3 py-2" value={formData.degrees} onChange={(e) => setFormData({...formData, degrees: e.target.value})} />
                </div>
                
                <div className="col-span-2 md:col-span-3 flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="is_exclusive" checked={formData.is_exclusive || false} onChange={(e) => setFormData({...formData, is_exclusive: e.target.checked})} className="w-5 h-5" />
                  <label htmlFor="is_exclusive" className="font-medium text-sm text-blue-600">Exclusive?</label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image Upload (Şəkil)</label>
                <div className="flex items-center space-x-4">
                  {formData.image && (
                    <div className="relative">
                      <img src={formData.image} alt="preview" className="h-16 w-16 object-cover rounded" />
                      <button type="button" onClick={() => setFormData({...formData, image: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center space-x-2">
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    <span>{uploading ? "Uploading..." : "Choose Image"}</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  </label>
                  <span className="text-sm text-gray-500">və ya</span>
                  <input type="text" placeholder="URL daxil edin" className="border rounded px-3 py-2 flex-1" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} />
                </div>
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">Məzmun (Azərbaycan dilində)</h4>
                  <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-200">
                    <input type="checkbox" id="auto_translate" checked={autoTranslate} onChange={(e) => setAutoTranslate(e.target.checked)} className="w-4 h-4" />
                    <label htmlFor="auto_translate" className="text-sm font-bold text-yellow-800">Digər dillərə avtomatik tərcümə et</label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-2">Xəbərdarlıq: Uzun mətnlərdə tərcümə çox vaxt apara bilər. Redaktə zamanı vaxta qənaət üçün tərcüməni bağlaya bilərsiniz.</p>
                <div className="p-4 border rounded bg-gray-50 space-y-4">
                  <div>
                    <label className="block text-sm font-bold mb-1">Məzmun (İcmal)</label>
                    <textarea required className="w-full border rounded px-3 py-2 bg-white h-24" value={((formData.content as any)?.az?.mezmun) || ""} onChange={(e) => setFormData({...formData, content: {...formData.content, az: { ...(formData.content as any)?.az, mezmun: e.target.value }}})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Tələblər</label>
                    <textarea required className="w-full border rounded px-3 py-2 bg-white h-24" value={((formData.content as any)?.az?.telebler) || ""} onChange={(e) => setFormData({...formData, content: {...formData.content, az: { ...(formData.content as any)?.az, telebler: e.target.value }}})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-1">Proqramlar</label>
                    <textarea required className="w-full border rounded px-3 py-2 bg-white h-24" value={((formData.content as any)?.az?.proqramlar) || ""} onChange={(e) => setFormData({...formData, content: {...formData.content, az: { ...(formData.content as any)?.az, proqramlar: e.target.value }}})} />
                  </div>
                </div>
              </div>

              {isTranslating && (
                <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-10 rounded-lg gap-4">
                  <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
                  <p className="text-base font-semibold text-gray-700">{translationStep}</p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => { if (!isTranslating) setShowModal(false); }} disabled={isTranslating} className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-40">Ləğv et</button>
                <button type="submit" disabled={uploading || isTranslating} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 min-w-[140px] justify-center">
                  {isTranslating ? <><Loader2 size={15} className="animate-spin" /><span className="text-xs">{translationStep}</span></> : <span>Yadda Saxla</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center">
            <h3 className="text-xl font-bold mb-2">Silmək istədiyinizə əminsiniz?</h3>
            <p className="text-gray-500 text-sm mb-6">Bu əməliyyatı geri qaytarmaq mümkün deyil.</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-200 hover:bg-gray-800 hover:text-white rounded font-medium transition-colors">Ləğv et</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors">Bəli, Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TEAM TAB ────────────────────────────────────────────────────────────────
function TeamTab() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name_az: "", role_az: "", image: "", order_index: 0
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      try {
        const url = await uploadImage(e.target.files[0]);
        setFormData((prev: any) => ({ ...prev, image: url }));
      } catch (err) {
        showAlert("Şəkil yüklənmədi");
      }
      setUploading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from('team_members').select('*').order('order_index', { ascending: true });
    if (data) setItems(data);
    setLoading(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name_az: "", role_az: "", image: "", order_index: 0 });
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name_az: item.name.az || "",
      role_az: item.role.az || "",
      image: item.image || "",
      order_index: item.order_index || 0
    });
  };

  const handleDelete = async (id: string) => {
    if(!await showConfirm("Silmək istədiyinizə əminsiniz?")) return;
    await supabase.from('team_members').delete().eq('id', id);
    fetchItems();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const translateRole = async (lang: string) => {
      if (!formData.role_az) return "";
      return await translateChunk(formData.role_az, lang);
    };

    const role_en = await translateRole("en");
    const role_ru = await translateRole("ru");
    const role_tr = await translateRole("tr");
    const role_de = await translateRole("de");
    
    const nameAll = formData.name_az;

    const payload = {
      name: { az: nameAll, en: nameAll, ru: nameAll, tr: nameAll, de: nameAll },
      role: { az: formData.role_az, en: role_en, ru: role_ru, tr: role_tr, de: role_de },
      image: formData.image,
      order_index: formData.order_index
    };
    
    if (editingId && editingId !== "new") {
      await supabase.from('team_members').update(payload).eq('id', editingId);
    } else {
      await supabase.from('team_members').insert([payload]);
    }
    setSaving(false);
    resetForm();
    fetchItems();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Komandamız</h2>
        {!editingId && <button onClick={() => setEditingId("new")} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"><Plus size={18} className="mr-2" /> Əlavə et</button>}
      </div>

      {editingId && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg">{editingId === "new" ? "Yeni Üzv" : "Redaktə et"}</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad *</label>
              <input required className="w-full border p-2 rounded-md" value={formData.name_az} onChange={e => setFormData({...formData, name_az: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vəzifə (AZ) * (Digər dillərə avtomatik tərcümə olunacaq)</label>
              <input required className="w-full border p-2 rounded-md" value={formData.role_az} onChange={e => setFormData({...formData, role_az: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şəkil * (4:5 format)</label>
              <div className="flex items-center space-x-3">
                {formData.image && <img src={formData.image} alt="preview" className="w-10 h-12 object-cover rounded shadow-sm" />}
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md flex items-center space-x-2 border border-gray-200">
                  {uploading ? <Loader2 className="animate-spin text-blue-500" size={16} /> : <Upload size={16} className="text-gray-600" />}
                  <span className="text-sm font-medium">{uploading ? "Yüklənir..." : "Şəkil Yüklə"}</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                </label>
                <input required type="text" className="flex-1 border border-gray-200 p-2 rounded-md text-sm" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="və ya URL daxil edin" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sıralama</label>
              <input type="number" className="w-full border p-2 rounded-md" value={formData.order_index} onChange={e => setFormData({...formData, order_index: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={saving} className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50">{saving ? "Saxlanılır (Tərcümə edilir)..." : "Yadda Saxla"}</button>
            <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-200">Ləğv et</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gray-400" size={32} /></div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b">
                <th className="p-4 font-medium">Şəkil</th>
                <th className="p-4 font-medium">Ad</th>
                <th className="p-4 font-medium">Vəzifə</th>
                <th className="p-4 font-medium">Sıralama</th>
                <th className="p-4 font-medium text-right">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {items.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <img src={item.image} alt="team" className="w-12 h-15 object-cover rounded-md" />
                  </td>
                  <td className="p-4 font-medium">{item.name.az}</td>
                  <td className="p-4 text-gray-500">{item.role.az}</td>
                  <td className="p-4">{item.order_index}</td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-md transition"><Edit size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-md transition ml-2"><Trash size={16} /></button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">Məlumat yoxdur</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------
// USERS TAB
// -----------------------------------------------------
function UsersTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({data}) => {
      setUsers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Qeydiyyatdan keçmiş İstifadəçilər</h2>
      <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b text-sm text-gray-500">
              <th className="p-4 font-semibold">Ad və Soyad</th>
              <th className="p-4 font-semibold">Nömrə</th>
              <th className="p-4 font-semibold">E-poçt</th>
              <th className="p-4 font-semibold text-right">Tarix</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">Hələ heç kim qeydiyyatdan keçməyib.</td>
              </tr>
            ) : (
              users.map((u: any) => (
                <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 font-medium">{u.first_name} {u.last_name}</td>
                  <td className="p-4">{u.phone}</td>
                  <td className="p-4 text-blue-600">{u.email}</td>
                  <td className="p-4 text-right text-sm text-gray-500">{new Date(u.created_at).toLocaleDateString('az-AZ')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// -----------------------------------------------------
// EXAMS TAB
// -----------------------------------------------------
function ExamsTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [formData, setFormData] = useState({ title: "", description: "", duration_minutes: 60 });
  
  // Managing questions state
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [qLoading, setQLoading] = useState(false);
  const [showAddQ, setShowAddQ] = useState(false);
  
  // Question Form
  const [qForm, setQForm] = useState({
    question_text: "",
    question_type: "closed",
    options: ["", "", "", ""],
    correct_option: 0,
    points: 1
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const { data } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    setExams(data || []);
    setLoading(false);
  };

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from('exams').insert([formData]);
    setShowAdd(false);
    setFormData({ title: "", description: "", duration_minutes: 60 });
    fetchExams();
  };

  const handleDeleteExam = async (id: string) => {
    if(await showConfirm("Bu imtahanı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('exams').delete().eq('id', id);
      fetchExams();
    }
  };

  const openExamManager = async (exam: any) => {
    setSelectedExam(exam);
    fetchQuestions(exam.id);
  };

  const fetchQuestions = async (examId: string) => {
    setQLoading(true);
    const { data } = await supabase.from('questions').select('*').eq('exam_id', examId);
    setQuestions(data || []);
    setQLoading(false);
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qForm.question_type === 'closed') {
      if (qForm.options.some(opt => !opt.trim())) {
        showAlert("Bütün variantları doldurun!");
        return;
      }
    }
    
    const { error } = await supabase.from('questions').insert([{
      exam_id: selectedExam.id,
      question_text: qForm.question_text,
      question_type: qForm.question_type,
      options: qForm.question_type === 'closed' ? qForm.options : null,
      correct_option: qForm.question_type === 'closed' ? qForm.correct_option : null,
      points: qForm.points
    }]);
    if (error) {
      showAlert("Xəta baş verdi: " + error.message);
      return;
    }
    
    setShowAddQ(false);
    setQForm({ question_text: "", question_type: "closed", options: ["", "", "", ""], correct_option: 0, points: 1 });
    fetchQuestions(selectedExam.id);
  };

  const handleDeleteQuestion = async (id: string) => {
    if(await showConfirm("Sualı silmək istədiyinizə əminsiniz?")) {
      await supabase.from('questions').delete().eq('id', id);
      fetchQuestions(selectedExam.id);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-gray-400" size={32} /></div>;

  if (selectedExam) {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
        <button onClick={() => setSelectedExam(null)} className="mb-4 text-gray-500 hover:text-black flex items-center gap-1 font-medium transition-colors">
          <ArrowLeft size={16} /> Geriyə qayıt
        </button>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">{selectedExam.title} - Suallar</h2>
            <p className="text-gray-500 text-sm">Müddət: {selectedExam.duration_minutes} dəqiqə</p>
          </div>
          <button onClick={() => setShowAddQ(true)} className="bg-black text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-colors">
            <Plus size={18} /> Yeni Sual Əlavə Et
          </button>
        </div>

        {showAddQ && (
          <div className="bg-gray-50 p-6 rounded-xl border mb-6 shadow-inner">
            <h3 className="font-bold mb-4">Sual Yarat</h3>
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sualın növü</label>
                <select value={qForm.question_type} onChange={e => setQForm({...qForm, question_type: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black">
                  <option value="closed">Qapalı (Variantlı)</option>
                  <option value="open">Açıq (Yazılı cavab tələb edən)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sual Mətni</label>
                <textarea required value={qForm.question_text} onChange={e => setQForm({...qForm, question_text: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black" rows={3}></textarea>
              </div>

              {qForm.question_type === 'closed' && (
                <div className="space-y-3 bg-white p-4 rounded-lg border">
                  <label className="block text-sm font-bold text-gray-700">Variantlar (Doğru olanı seçin)</label>
                  {qForm.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="correct_option" 
                        checked={qForm.correct_option === idx} 
                        onChange={() => setQForm({...qForm, correct_option: idx})}
                        className="w-4 h-4 cursor-pointer"
                      />
                      <span className="font-bold text-gray-500 w-4">{String.fromCharCode(65 + idx)})</span>
                      <input 
                        type="text" 
                        value={opt} 
                        onChange={e => {
                          const newOpts = [...qForm.options];
                          newOpts[idx] = e.target.value;
                          setQForm({...qForm, options: newOpts});
                        }} 
                        className="flex-1 border rounded-lg p-2 outline-none focus:border-black" 
                        placeholder="Variant mətni..."
                      />
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Bal</label>
                <input required type="number" min="1" value={qForm.points} onChange={e => setQForm({...qForm, points: parseInt(e.target.value)})} className="w-24 border rounded-lg p-2.5 outline-none focus:border-black" />
              </div>

              <div className="flex gap-2 pt-2">
                <button type="submit" className="bg-[#D4F754] text-black font-bold px-6 py-2.5 rounded-lg hover:scale-105 transition-transform">Yadda Saxla</button>
                <button type="button" onClick={() => setShowAddQ(false)} className="bg-white border text-black font-medium px-6 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">Ləğv et</button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {qLoading ? (
            <p className="text-gray-500">Suallar yüklənir...</p>
          ) : questions.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed">
              <p className="text-gray-500 mb-2">Bu imtahan üçün heç bir sual tapılmadı.</p>
              <button onClick={() => setShowAddQ(true)} className="text-blue-600 font-medium hover:underline">İlk sualı əlavə et</button>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="border p-5 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow relative group">
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDeleteQuestion(q.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"><Trash size={16} /></button>
                </div>
                <div className="flex gap-3 mb-3">
                  <span className="bg-gray-100 text-gray-600 font-bold w-7 h-7 flex items-center justify-center rounded-lg text-sm shrink-0">{idx + 1}</span>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-base">{q.question_text}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500">
                        {q.question_type === 'closed' ? 'Qapalı' : 'Açıq'}
                      </span>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-green-50 text-green-600">
                        {q.points} Bal
                      </span>
                    </div>
                  </div>
                </div>
                
                {q.question_type === 'closed' && q.options && (
                  <div className="ml-10 grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt: string, i: number) => (
                      <div key={i} className={`p-2.5 rounded-lg border text-sm ${q.correct_option === i ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-gray-50/50 text-gray-600 border-gray-100'}`}>
                        <span className="font-bold mr-2 opacity-50">{String.fromCharCode(65 + i)})</span> {opt}
                        {q.correct_option === i && <CheckCircle size={14} className="inline ml-2 text-green-500" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Onlayn İmtahanlar</h2>
        <button onClick={() => setShowAdd(true)} className="bg-[#D4F754] text-black px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-[#c2e44d] transition-colors shadow-sm hover:shadow-md">
          <Plus size={18} /> Yeni İmtahan
        </button>
      </div>

      {showAdd && (
        <div className="bg-white p-6 rounded-2xl border mb-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Yeni İmtahan Yarat</h3>
          <form onSubmit={handleAddExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">İmtahanın Adı (məs: Azərbaycan Dili)</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" placeholder="İmtahanın adı..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Qısa Açıqlama</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded-lg p-2.5 outline-none focus:border-black transition-colors" rows={2} placeholder="İmtahan haqqında qısa məlumat..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Müddət (Dəqiqə ilə)</label>
              <input required type="number" min="1" value={formData.duration_minutes} onChange={e => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} className="w-32 border rounded-lg p-2.5 outline-none focus:border-black transition-colors" />
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="bg-black text-white font-bold px-6 py-2.5 rounded-lg hover:scale-105 transition-transform">Yadda Saxla</button>
              <button type="button" onClick={() => setShowAdd(false)} className="bg-gray-100 text-gray-700 font-medium px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors">Ləğv et</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {exams.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-gray-50 border border-dashed rounded-2xl">
            <p className="text-gray-500 font-medium">Heç bir imtahan yaradılmayıb.</p>
          </div>
        ) : (
          exams.map((exam) => (
            <div key={exam.id} className="border p-6 rounded-2xl flex flex-col justify-between bg-white shadow-sm hover:shadow-md transition-shadow group">
              <div className="mb-6">
                <h3 className="font-bold text-xl mb-1 text-gray-900">{exam.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 min-h-[40px]">{exam.description || "Açıqlama yoxdur"}</p>
                <div className="flex gap-2 mt-4">
                  <span className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md flex items-center gap-1"><Clock size={12}/> {exam.duration_minutes} dəqiqə</span>
                </div>
              </div>
              <div className="flex gap-2 items-center justify-between border-t pt-4">
                <button onClick={() => openExamManager(exam)} className="text-sm font-bold bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center gap-2">
                  Sualları İdarə Et <ArrowRight size={14}/>
                </button>
                <button onClick={() => handleDeleteExam(exam.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash size={18} /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
