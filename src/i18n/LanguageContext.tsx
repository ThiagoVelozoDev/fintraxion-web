import { createContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

type Language = 'en' | 'pt'

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (en: string, pt: string) => string
}

const LANGUAGE_KEY = 'fintraxion_language'

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY)
    return saved === 'pt' ? 'pt' : 'en'
  })

  function setLanguage(nextLanguage: Language) {
    setLanguageState(nextLanguage)
    localStorage.setItem(LANGUAGE_KEY, nextLanguage)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (en: string, pt: string) => (language === 'pt' ? pt : en),
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export { LanguageContext }
