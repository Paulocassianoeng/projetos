import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAppointmentStore } from '../store/appointmentStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { appointments, selectedDate, setSelectedDate, addAppointment } = useAppointmentStore()
  const [showForm, setShowForm] = useState(false)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(appointment => 
      isSameDay(new Date(appointment.startTime), date)
    )
  }

  const selectedDayAppointments = getAppointmentsForDay(selectedDate)

  // Formulário de novo compromisso (reutilizando lógica de Appointments)
  const schema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    description: z.string().optional(),
    startTime: z.string().min(1, 'Data/hora início obrigatória'),
    endTime: z.string().min(1, 'Data/hora fim obrigatória'),
    location: z.string().optional(),
    type: z.enum(['MEETING', 'TASK', 'REMINDER', 'PERSONAL']).default('MEETING'),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
  })
  type FormFields = z.infer<typeof schema>;
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'MEETING',
      priority: 'MEDIUM',
      status: 'SCHEDULED',
      startTime: selectedDate ? new Date(selectedDate).toISOString().slice(0, 16) : '',
      endTime: selectedDate ? new Date(selectedDate).toISOString().slice(0, 16) : '',
    }
  })

  const onSubmit = async (data: any) => {
    await addAppointment(data)
    setShowForm(false)
    reset()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <button className="btn-primary flex items-center space-x-2" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="card">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </h2>
              
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {daysInMonth.map((day) => {
                const dayAppointments = getAppointmentsForDay(day)
                const isSelected = isSameDay(day, selectedDate)
                const isTodayDate = isToday(day)
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 text-sm rounded-lg transition-colors min-h-[80px] flex flex-col
                      ${isSelected ? 'bg-primary-100 border-2 border-primary-500' : 
                        isTodayDate ? 'bg-blue-50 border border-blue-300' : 
                        'hover:bg-gray-50 border border-transparent'}
                    `}
                  >
                    <span className={`font-medium ${
                      isSelected ? 'text-primary-700' :
                      isTodayDate ? 'text-blue-700' : 
                      'text-gray-900'
                    }`}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayAppointments.length > 0 && (
                      <div className="mt-1 space-y-1 flex-1">
                        {dayAppointments.slice(0, 2).map((appointment) => (
                          <div
                            key={appointment.id}
                            className={`text-xs p-1 rounded truncate ${
                              appointment.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                              appointment.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}
                          >
                            {appointment.title}
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayAppointments.length - 2} mais
                          </div>
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {format(selectedDate, 'dd MMM yyyy', { locale: ptBR })}
            </h3>
            
            {selectedDayAppointments.length > 0 ? (
              <div className="space-y-3">
                {selectedDayAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                        {appointment.description && (
                          <p className="text-sm text-gray-600 mt-1">{appointment.description}</p>
                        )}
                        <div className="flex items-center mt-2 text-sm text-gray-500">
                          <span>
                            {format(new Date(appointment.startTime), 'HH:mm')} - {format(new Date(appointment.endTime), 'HH:mm')}
                          </span>
                        </div>
                        {appointment.location && (
                          <p className="text-sm text-gray-500 mt-1">📍 {appointment.location}</p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        appointment.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        appointment.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.priority === 'HIGH' ? 'Alta' :
                         appointment.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-4">Nenhum compromisso para este dia</p>
                <button className="btn-primary text-sm" onClick={() => setShowForm(true)}>
                  Adicionar Compromisso
                </button>
      {/* Formulário de novo compromisso */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setShowForm(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">Novo Compromisso</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Título</label>
                <input className="input" {...register('title')} />
                {errors.title && <span className="text-red-500 text-xs">{errors.title.message as string}</span>}
              </div>
              <div>
                <label className="block text-sm font-medium">Descrição</label>
                <textarea className="input" {...register('description')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium">Início</label>
                  <input type="datetime-local" className="input" {...register('startTime')} />
                  {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Fim</label>
                  <input type="datetime-local" className="input" {...register('endTime')} />
                  {errors.endTime && <span className="text-red-500 text-xs">{errors.endTime.message as string}</span>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium">Local</label>
                <input className="input" {...register('location')} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Tipo</label>
                  <select className="input" {...register('type')}>
                    <option value="MEETING">Reunião</option>
                    <option value="TASK">Tarefa</option>
                    <option value="REMINDER">Lembrete</option>
                    <option value="PERSONAL">Pessoal</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">Prioridade</label>
                  <select className="input" {...register('priority')}>
                    <option value="HIGH">Alta</option>
                    <option value="MEDIUM">Média</option>
                    <option value="LOW">Baixa</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">
                Salvar
              </button>
            </form>
          </div>
        </div>
      )}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas do Mês</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Compromissos</span>
                <span className="font-medium">
                  {appointments.filter(apt => {
                    const aptDate = new Date(apt.startTime)
                    return aptDate.getMonth() === currentDate.getMonth() && 
                           aptDate.getFullYear() === currentDate.getFullYear()
                  }).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dias Ocupados</span>
                <span className="font-medium">
                  {new Set(appointments
                    .filter(apt => {
                      const aptDate = new Date(apt.startTime)
                      return aptDate.getMonth() === currentDate.getMonth() && 
                             aptDate.getFullYear() === currentDate.getFullYear()
                    })
                    .map(apt => new Date(apt.startTime).getDate())
                  ).size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Próximo Livre</span>
                <span className="font-medium text-green-600">Amanhã</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
