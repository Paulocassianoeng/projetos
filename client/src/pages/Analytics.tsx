import { BarChart3, Calendar, Clock, TrendingUp, Users, Target } from 'lucide-react'
import { useAppointmentStore } from '../store/appointmentStore'

export default function Analytics() {
  const { appointments } = useAppointmentStore()

  // Dados para análises
  const totalAppointments = appointments.length
  const completedAppointments = appointments.filter(a => a.status === 'completed').length
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : '0'
  
  const thisWeekAppointments = appointments.filter(apt => {
    const today = new Date()
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const aptDate = new Date(apt.startTime)
    return aptDate >= weekAgo && aptDate <= today
  }).length

  const productivityData = [
    { day: 'Seg', completed: 8, total: 10 },
    { day: 'Ter', completed: 6, total: 8 },
    { day: 'Qua', completed: 9, total: 12 },
    { day: 'Qui', completed: 7, total: 9 },
    { day: 'Sex', completed: 10, total: 11 },
    { day: 'Sáb', completed: 4, total: 5 },
    { day: 'Dom', completed: 2, total: 3 }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Análises</h1>
        <p className="text-gray-600">Acompanhe sua produtividade e padrões de agendamento</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Compromissos</p>
              <p className="text-2xl font-bold text-gray-900">{totalAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-green-600">+{thisWeekAppointments}</span>
            <span className="text-sm text-gray-500 ml-2">esta semana</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Conclusão</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-green-600">+2.3%</span>
            <span className="text-sm text-gray-500 ml-2">vs. mês anterior</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-2xl font-bold text-gray-900">1.2h</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-red-600">-0.2h</span>
            <span className="text-sm text-gray-500 ml-2">vs. mês anterior</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Colaboradores</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm font-medium text-green-600">+3</span>
            <span className="text-sm text-gray-500 ml-2">este mês</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productivity Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Produtividade Semanal</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {productivityData.map((data) => (
              <div key={data.day} className="flex items-center space-x-4">
                <div className="w-10 text-sm font-medium text-gray-600">{data.day}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-sm text-gray-900">{data.completed}/{data.total}</span>
                    <span className="text-xs text-gray-500">
                      ({((data.completed / data.total) * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(data.completed / data.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time Distribution */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribuição por Tipo</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {[
              { type: 'Reuniões', count: appointments.filter(a => a.type === 'meeting').length, color: 'bg-blue-500' },
              { type: 'Tarefas', count: appointments.filter(a => a.type === 'task').length, color: 'bg-purple-500' },
              { type: 'Lembretes', count: appointments.filter(a => a.type === 'reminder').length, color: 'bg-orange-500' },
              { type: 'Pessoal', count: appointments.filter(a => a.type === 'personal').length, color: 'bg-green-500' }
            ].map((item) => {
              const percentage = totalAppointments > 0 ? (item.count / totalAppointments * 100).toFixed(1) : '0'
              return (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                    <span className="text-sm font-medium text-gray-900">{item.type}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.count}</span>
                    <span className="text-xs text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights da IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🎯 Pico de Produtividade</h4>
            <p className="text-sm text-blue-700">
              Você é mais produtivo entre 9h-11h. Considere agendar tarefas importantes neste horário.
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">⏰ Padrão de Reuniões</h4>
            <p className="text-sm text-green-700">
              Suas reuniões têm duração média de 45min. Considere blocos de 30min para maior eficiência.
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">📊 Distribuição Balanceada</h4>
            <p className="text-sm text-purple-700">
              Sua agenda está bem balanceada entre trabalho e compromissos pessoais.
            </p>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🔄 Sugestão de Melhoria</h4>
            <p className="text-sm text-orange-700">
              Adicione intervalos de 15min entre reuniões para reduzir o estresse e aumentar o foco.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
