import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'crewsim-theme'

export function readStoredTheme(): Theme {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

    return storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : 'light'
  } catch {
    return 'light'
  }
}

export function applyTheme(theme: Theme, persist = true) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme

  if (!persist) {
    return
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // The selected theme still applies for the current session when storage
    // is unavailable, such as in a restricted browser context.
  }
}

export function initializeTheme(): Theme {
  const theme = readStoredTheme()
  applyTheme(theme, false)
  return theme
}

export function useTheme(initialTheme: Theme) {
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  return [theme, setTheme] as const
}
