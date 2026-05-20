"use client";
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    // initialise from localStorage or system preference
    typeof window !== 'undefined'
      ? (localStorage.getItem('theme') as 'light' | 'dark') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    // store preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggle = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <button
      type="button"
      aria-label="Alternar modo claro/escuro"
      onClick={toggle}
      className="p-2 rounded-full bg-neutral-800 text-white hover:bg-neutral-700 transition"
    >
      {/* icon removed */}
    </button>
  );
}
