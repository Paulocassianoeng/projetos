import { Calendar, Clock, Users, TrendingUp } from 'lucide-react'
import { useAppointmentStore } from '../store/appointmentStore'
import { useEffect } from 'react'

const Dashboard = () => {
  const { appointments, fetchAppointments, loading } = useAppointmentStore();
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, []);

  const today = new Date();
  const todayAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate.toDateString() === today.toDateString();
  });

  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.startTime);
    return aptDate > today;
  }).slice(0, 5);

  // Estatísticas dinâmicas
  const totalAppointments = appointments.length;
  const completedAppointments = appointments.filter(a => a.status === 'COMPLETED').length;
  const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(1) : '0';
  const avgDuration = totalAppointments > 0
    ? (
        appointments.reduce((acc, a) => {
          const start = new Date(a.startTime).getTime();
          const end = new Date(a.endTime).getTime();
          return acc + Math.max(0, end - start);
        }, 0) / totalAppointments / (1000 * 60 * 60)
      ).toFixed(1)
    : '0.0';
  const collaborators = Array.from(new Set(
    appointments.flatMap(a => Array.isArray(a.participants) ? a.participants : [])
  ));

  const stats = [
    {
      name: 'Total de Compromissos',
      value: totalAppointments,
      icon: Calendar,
      change: '',
      changeType: '',
    },
    {
      name: 'Taxa de Conclusão',
      value: `${completionRate}%`,
      icon: TrendingUp,
      change: '',
      changeType: '',
    },
    {
      name: 'Tempo Médio',
      value: `${avgDuration}h`,
      icon: Clock,
      change: '',
      changeType: '',
    },
    {
      name: 'Colaboradores',
      value: collaborators.length,
      icon: Users,
      change: '',
      changeType: '',
    },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-lg">Carregando dados...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo de volta! Aqui está o resumo das suas atividades.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs. mês anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Agenda de Hoje</h3>
          {todayAppointments.length > 0 ? (
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {new Date(appointment.endTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum compromisso para hoje</p>
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Próximos Compromissos</h3>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{appointment.title}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(appointment.startTime).toLocaleDateString('pt-BR')} às{' '}
                      {new Date(appointment.startTime).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
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
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum compromisso próximo</p>
            </div>
          )}
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sugestões da IA</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Otimização de Horário</h4>
            <p className="text-sm text-blue-700">
              Reagrupe suas reuniões da tarde para ter 2h livres para trabalho focado.
            </p>
          </div>
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Tempo de Descanso</h4>
            <p className="text-sm text-green-700">
              Adicione um intervalo de 15min entre reuniões para melhor produtividade.
            </p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Agenda Balanceada</h4>
            <p className="text-sm text-purple-700">
              Considere mover reuniões longas para manhã quando você está mais focado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
