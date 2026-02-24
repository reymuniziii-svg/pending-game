import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LocaleCode } from '@/types'

export type MotionIntensity = 'full' | 'reduced'
export type ContentIntensity = 'full' | 'softened'
export type FontScale = 'sm' | 'md' | 'lg'

interface SettingsState {
  language: LocaleCode
  motionIntensity: MotionIntensity
  contentIntensity: ContentIntensity
  subtitleSpeed: number
  fontScale: FontScale
  setLanguage: (language: LocaleCode) => void
  setMotionIntensity: (value: MotionIntensity) => void
  setContentIntensity: (value: ContentIntensity) => void
  setSubtitleSpeed: (value: number) => void
  setFontScale: (value: FontScale) => void
  reset: () => void
}

const initialState = {
  language: 'en' as LocaleCode,
  motionIntensity: 'full' as MotionIntensity,
  contentIntensity: 'full' as ContentIntensity,
  subtitleSpeed: 1,
  fontScale: 'md' as FontScale,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...initialState,
      setLanguage: (language) => set({ language }),
      setMotionIntensity: (motionIntensity) => set({ motionIntensity }),
      setContentIntensity: (contentIntensity) => set({ contentIntensity }),
      setSubtitleSpeed: (subtitleSpeed) => set({ subtitleSpeed }),
      setFontScale: (fontScale) => set({ fontScale }),
      reset: () => set(initialState),
    }),
    {
      name: 'pending_settings',
      partialize: (state) => ({
        language: state.language,
        motionIntensity: state.motionIntensity,
        contentIntensity: state.contentIntensity,
        subtitleSpeed: state.subtitleSpeed,
        fontScale: state.fontScale,
      }),
    }
  )
)
