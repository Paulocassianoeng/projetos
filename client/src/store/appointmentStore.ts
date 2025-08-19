import { create } from 'zustand'
import api from '../lib/api'

export interface Appointment {
  id: string
  title: string
  description?: string
  startTime: string // ISO string
  endTime: string // ISO string
  type: 'MEETING' | 'TASK' | 'REMINDER' | 'PERSONAL'
  priority: 'LOW' | 'MEDIUM' | 'HIGH'
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  participants?: string[]
  location?: string
  isRecurring?: boolean
  aiSuggested?: boolean
}

interface AppointmentState {
  appointments: Appointment[]
  selectedDate: Date
  loading: boolean
  error: string | null

  setAppointments: (appointments: Appointment[]) => void
  fetchAppointments: (page?: number, limit?: number) => Promise<void>
  addAppointment: (appointment: Omit<Appointment, 'id'>) => Promise<void>
  updateAppointment: (id: string, updates: Partial<Appointment>) => Promise<void>
  deleteAppointment: (id: string) => Promise<void>
  setSelectedDate: (date: Date) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  getAppointmentsByDate: (date: Date) => Appointment[]
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  selectedDate: new Date(),
  loading: false,
  error: null,

  setAppointments: (appointments) => set({ appointments }),

  fetchAppointments: async (page = 1, limit = 10) => {
    set({ loading: true })
    try {
      const res = await api.get(`/appointments?page=${page}&limit=${limit}`)
      set({ appointments: res.data.data, loading: false })
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Erro ao buscar compromissos', loading: false })
    }
  },

  addAppointment: async (appointmentData) => {
    set({ loading: true })
    try {
      // Converte tipos para o backend
      const payload = {
        ...appointmentData,
        startTime: new Date(appointmentData.startTime).toISOString(),
        endTime: new Date(appointmentData.endTime).toISOString(),
        type: (appointmentData.type || 'MEETING').toUpperCase(),
        priority: (appointmentData.priority || 'MEDIUM').toUpperCase(),
        status: (appointmentData.status || 'SCHEDULED').toUpperCase(),
      }
      const res = await api.post('/appointments', payload)
      set((state) => ({ appointments: [...state.appointments, res.data.data], loading: false }))
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Erro ao adicionar compromisso', loading: false })
    }
  },

  updateAppointment: async (id, updates) => {
    set({ loading: true })
    try {
      const payload: any = { ...updates }
      if (updates.startTime) payload.startTime = new Date(updates.startTime).toISOString()
      if (updates.endTime) payload.endTime = new Date(updates.endTime).toISOString()
      if (updates.type) payload.type = updates.type.toUpperCase()
      if (updates.priority) payload.priority = updates.priority.toUpperCase()
      if (updates.status) payload.status = updates.status.toUpperCase()
      const res = await api.put(`/appointments/${id}`, payload)
      set((state) => ({
        appointments: state.appointments.map((appointment) =>
          appointment.id === id ? res.data.data : appointment
        ),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Erro ao atualizar compromisso', loading: false })
    }
  },

  deleteAppointment: async (id) => {
    set({ loading: true })
    try {
      await api.delete(`/appointments/${id}`)
      set((state) => ({
        appointments: state.appointments.filter((appointment) => appointment.id !== id),
        loading: false
      }))
    } catch (err: any) {
      set({ error: err?.response?.data?.message || 'Erro ao excluir compromisso', loading: false })
    }
  },

  setSelectedDate: (date) => set({ selectedDate: date }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  getAppointmentsByDate: (date) => {
    const { appointments } = get()
    return appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.startTime)
      return appointmentDate.toDateString() === date.toDateString()
    })
  }
}))
