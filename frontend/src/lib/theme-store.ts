import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

interface ThemeStore {
  theme: Theme
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: 'system',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') localStorage.setItem('theme', theme)
    set({ theme })
  },
}))

// Hydrate on client
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved) useThemeStore.setState({ theme: saved })
}
