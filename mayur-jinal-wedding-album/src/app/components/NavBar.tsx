"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Lang = "en" | "gu";

const TEXT: Record<Lang, { title: string; english: string; gujarati: string }>= {
  en: { title: "Mayur & Jinal", english: "English", gujarati: "Gujarati (ગુજરાતી)" },
  gu: { title: "મયુર & જિનલ", english: "English", gujarati: "ગુજરાતી" },
};

export default function NavBar() {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('lang')) as Lang | null;
    if (saved === 'en' || saved === 'gu') setLang(saved);
    document.documentElement.lang = saved || 'en';
  }, []);

  const switchLang = (newLang: Lang) => {
    setLang(newLang);
    if (typeof window !== 'undefined') localStorage.setItem('lang', newLang);
    document.documentElement.lang = newLang === 'en' ? 'en' : 'gu';
    // Persist also in cookie for SSR match
    document.cookie = `lang=${newLang}; path=/; max-age=${60 * 60 * 24 * 365}`;
    // Emit a simple event so pages can react if needed
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('lang:change', { detail: newLang }));
  };

  return (
    <nav className="navbar navbar-light bg-white border-bottom">
      <div className="container d-flex align-items-center justify-content-between py-2">
        <Link href="/" className="navbar-brand d-flex align-items-center text-black m-0">
          <i className="bi bi-heart-fill me-2 text-primary"></i>
          <span className="fw-bold" style={{ fontFamily: 'var(--font-heading)' }} suppressHydrationWarning>{TEXT[lang].title}</span>
        </Link>

        <div className="btn-group" role="group" aria-label="Language switcher">
          <button
            type="button"
            className={`btn btn-sm ${lang === 'en' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => switchLang('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`btn btn-sm ${lang === 'gu' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => switchLang('gu')}
          >
            ગુજરાતી
          </button>
        </div>
      </div>
    </nav>
  );
}
