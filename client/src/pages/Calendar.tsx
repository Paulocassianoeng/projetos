import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { useAppointmentStore } from '../store/appointmentStore'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { appointments, selectedDate, setSelectedDate } = useAppointmentStore()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
        <button className="btn-primary flex items-center space-x-2">
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
                              appointment.priority === 'high' ? 'bg-red-100 text-red-800' :
                              appointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
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
                        appointment.priority === 'high' ? 'bg-red-100 text-red-800' :
                        appointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.priority === 'high' ? 'Alta' :
                         appointment.priority === 'medium' ? 'Média' : 'Baixa'}
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
                <button className="btn-primary text-sm">
                  Adicionar Compromisso
                </button>
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
