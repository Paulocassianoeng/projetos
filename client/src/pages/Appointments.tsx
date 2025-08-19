import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useAppointmentStore, Appointment } from '../store/appointmentStore'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

export default function Appointments() {

  const { appointments, fetchAppointments, addAppointment, updateAppointment, deleteAppointment, loading, error } = useAppointmentStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchAppointments(page, limit)
  }, [page, limit])
      {/* Paginação */}
      <div className="flex justify-between items-center mt-4">
        <button
          className="btn-secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Página anterior
        </button>
        <span>Página {page}</span>
        <button
          className="btn-secondary"
          onClick={() => setPage((p) => p + 1)}
          disabled={appointments.length < limit}
        >
          Próxima página
        </button>
        <select
          className="ml-4 border rounded px-2 py-1"
          value={limit}
          onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter.toUpperCase()
    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await updateAppointment(id, { status })
  }

  // Formulário de novo compromisso
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compromissos</h1>
          <p className="text-gray-600">Gerencie todos os seus compromissos</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Compromisso</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar compromissos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">Todos os Status</option>
              <option value="scheduled">Agendado</option>
              <option value="in-progress">Em Andamento</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

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
                  <input type="datetime-local" className="input w-full" {...register('startTime')} />
                  {errors.startTime && <span className="text-red-500 text-xs">{errors.startTime.message as string}</span>}
                </div>
                <div>
                  <label className="block text-sm font-medium">Fim</label>
                  <input type="datetime-local" className="input w-full" {...register('endTime')} />
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
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              {error && <div className="text-red-500 text-xs mt-2">{error}</div>}
            </form>
          </div>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <div key={appointment.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-start space-x-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{appointment.title}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                          appointment.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {appointment.priority === 'HIGH' ? 'Alta' :
                           appointment.priority === 'MEDIUM' ? 'Média' : 'Baixa'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          appointment.type === 'MEETING' ? 'bg-blue-100 text-blue-800' :
                          appointment.type === 'TASK' ? 'bg-purple-100 text-purple-800' :
                          appointment.type === 'REMINDER' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {appointment.type === 'MEETING' ? 'Reunião' :
                           appointment.type === 'TASK' ? 'Tarefa' :
                           appointment.type === 'REMINDER' ? 'Lembrete' : 'Pessoal'}
                        </span>
                      </div>
                      {appointment.description && (
                        <p className="text-gray-600 mb-3">{appointment.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(appointment.startTime).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })} - {new Date(appointment.endTime).toLocaleTimeString('pt-BR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {appointment.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{appointment.location}</span>
                          </div>
                        )}
                        {appointment.participants && appointment.participants.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{appointment.participants.length} participante(s)</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={appointment.status}
                    onChange={(e) => handleStatusChange(appointment.id, e.target.value as Appointment['status'])}
                    className={`text-sm border rounded-lg px-2 py-1 ${
                      appointment.status === 'COMPLETED' ? 'bg-green-50 border-green-200 text-green-800' :
                      appointment.status === 'IN_PROGRESS' ? 'bg-blue-50 border-blue-200 text-blue-800' :
                      appointment.status === 'CANCELLED' ? 'bg-red-50 border-red-200 text-red-800' :
                      'bg-gray-50 border-gray-200 text-gray-800'
                    }`}
                  >
                    <option value="SCHEDULED">Agendado</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluído</option>
                    <option value="CANCELLED">Cancelado</option>
                  </select>
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum compromisso encontrado</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tente ajustar os filtros de pesquisa'
                : 'Comece criando seu primeiro compromisso'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary"
            >
              Criar Compromisso
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-gray-900">
            {appointments.filter(a => a.status === 'SCHEDULED').length}
          </div>
          <div className="text-sm text-gray-600">Agendados</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">
            {appointments.filter(a => a.status === 'IN_PROGRESS').length}
          </div>
          <div className="text-sm text-gray-600">Em Andamento</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">
            {appointments.filter(a => a.status === 'COMPLETED').length}
          </div>
          <div className="text-sm text-gray-600">Concluídos</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-red-600">
            {appointments.filter(a => a.status === 'CANCELLED').length}
          </div>
          <div className="text-sm text-gray-600">Cancelados</div>
        </div>
      </div>
    </div>
  )
}
