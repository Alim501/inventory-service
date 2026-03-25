import { create } from 'zustand'
import i18n from '@/lib/i18n'

type Lang = 'en' | 'ru'

function getInitialLang(): Lang {
  return (localStorage.getItem('lang') as Lang | null) ?? 'en'
}

interface LangState {
  lang: Lang
  setLang: (lang: Lang) => void
  toggle: () => void
}

export const useLangStore = create<LangState>((set, get) => {
  const initial = typeof window !== 'undefined' ? getInitialLang() : 'en'
  if (typeof window !== 'undefined') i18n.changeLanguage(initial)

  return {
    lang: initial,
    setLang: (lang) => {
      localStorage.setItem('lang', lang)
      i18n.changeLanguage(lang)
      set({ lang })
    },
    toggle: () => {
      const next: Lang = get().lang === 'en' ? 'ru' : 'en'
      localStorage.setItem('lang', next)
      i18n.changeLanguage(next)
      set({ lang: next })
    },
  }
})
