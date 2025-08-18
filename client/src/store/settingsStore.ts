import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Settings {
  emailNotifications: boolean
  pushNotifications: boolean
  reminders: boolean
  workingHoursStart: string
  workingHoursEnd: string
  timezone: string
  theme: string
  language: string
}

interface SettingsState {
  settings: Settings | null
  fetchSettings: () => Promise<void>
  updateSettings: (data: Partial<Settings>) => Promise<void>
}

export const useSettingsStore = create<SettingsState>()(
  persist(
  (set) => ({
      settings: null,
      fetchSettings: async () => {
        const res = await (await import('../lib/api')).default.get('/settings')
        set({ settings: res.data.data })
      },
      updateSettings: async (data) => {
        const res = await (await import('../lib/api')).default.put('/settings', data)
        set({ settings: res.data.data })
      }
    }),
    { name: 'settings-storage' }
  )
)
