"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { DICTIONARY } from "./dictionary";

type Lang = keyof typeof DICTIONARY;

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  dict: typeof DICTIONARY["az"];
}

const LangContext = createContext<LangContextType | undefined>(undefined);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("az");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("siteLang") as Lang;
    if (stored && DICTIONARY[stored]) {
      setLang(stored);
    }
  }, []);

  const changeLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem("siteLang", newLang);
  };

  // Prevent hydration mismatch by rendering default or nothing
  if (!mounted) {
    return (
      <LangContext.Provider value={{ lang: "az", setLang: changeLang, dict: DICTIONARY["az"] }}>
        <div style={{ visibility: "hidden" }}>{children}</div>
      </LangContext.Provider>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang: changeLang, dict: DICTIONARY[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within a LangProvider");
  return context;
}
