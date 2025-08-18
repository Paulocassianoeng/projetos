import { useState, useEffect } from 'react';
import { User, Bell, Shield, Palette, Clock, Save } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';


// Removido a função getAvatarUrl pois não é mais necessária

export default function Settings() {
  const { user, setUser } = useAuthStore();
  const { settings, fetchSettings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    notifications: {
      email: true,
      push: true,
      reminders: true,
    },
    workingHours: {
      start: '09:00',
      end: '18:00',
      timezone: 'America/Sao_Paulo',
    },
    preferences: {
      theme: 'light',
      language: 'pt-BR',
    }
  });

  // Carregar configurações do backend ao abrir a página
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Atualizar formData quando settings forem carregadas
  useEffect(() => {
    if (settings) {
      setFormData((prev) => ({
        ...prev,
        notifications: {
          email: settings.emailNotifications,
          push: settings.pushNotifications,
          reminders: settings.reminders,
        },
        workingHours: {
          start: settings.workingHoursStart,
          end: settings.workingHoursEnd,
          timezone: settings.timezone,
        },
        preferences: {
          theme: settings.theme,
          language: settings.language,
        },
      }));
    }
  }, [settings]);

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'appearance', name: 'Aparência', icon: Palette },
    { id: 'working-hours', name: 'Horário de Trabalho', icon: Clock },
  ]

  const handleSave = async () => {
    if (user) {
      setUser({
        ...user,
        name: formData.name,
        email: formData.email,
      });
    }
    // Salvar configurações no backend
    await updateSettings({
      emailNotifications: formData.notifications.email,
      pushNotifications: formData.notifications.push,
      reminders: formData.notifications.reminders,
      workingHoursStart: formData.workingHours.start,
      workingHoursEnd: formData.workingHours.end,
      timezone: formData.workingHours.timezone,
      theme: formData.preferences.theme,
      language: formData.preferences.language,
    });
    alert('Configurações salvas com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabs Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        {/* Content */}
        <div className="lg:col-span-3">
          <div className="card">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Informações do Perfil</h3>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-10 h-10 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Avatar Padrão</h4>
                      <p className="text-sm text-gray-500">Seu avatar padrão será exibido.</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Preferências de Notificação</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notificações por Email</h4>
                      <p className="text-sm text-gray-500">Receba notificações de compromissos por email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.email}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, email: e.target.checked }
                      })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Notificações Push</h4>
                      <p className="text-sm text-gray-500">Receba notificações push no navegador</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.push}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, push: e.target.checked }
                      })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Lembretes</h4>
                      <p className="text-sm text-gray-500">Receba lembretes antes dos compromissos</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifications.reminders}
                      onChange={(e) => setFormData({
                        ...formData,
                        notifications: { ...formData.notifications, reminders: e.target.checked }
                      })}
                      className="w-4 h-4 text-primary-600 rounded"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'working-hours' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Horário de Trabalho</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Início
                    </label>
                    <input
                      type="time"
                      value={formData.workingHours.start}
                      onChange={(e) => setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, start: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fim
                    </label>
                    <input
                      type="time"
                      value={formData.workingHours.end}
                      onChange={(e) => setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, end: e.target.value }
                      })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fuso Horário
                    </label>
                    <select
                      value={formData.workingHours.timezone}
                      onChange={(e) => setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, timezone: e.target.value }
                      })}
                      className="input"
                    >
                      <option value="America/Sao_Paulo">Brasília (GMT-3)</option>
                      <option value="America/New_York">Nova York (GMT-5)</option>
                      <option value="Europe/London">Londres (GMT+0)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Aparência</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tema
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'auto'].map((theme) => (
                        <button
                          key={theme}
                          onClick={() => setFormData({
                            ...formData,
                            preferences: { ...formData.preferences, theme }
                          })}
                          className={`p-3 border rounded-lg text-sm font-medium transition-colors ${
                            formData.preferences.theme === theme
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Escuro' : 'Automático'}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Idioma
                    </label>
                    <select
                      value={formData.preferences.language}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, language: e.target.value }
                      })}
                      className="input max-w-xs"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Segurança</h3>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h4 className="font-medium text-yellow-900 mb-2">Alterar Senha</h4>
                    <p className="text-sm text-yellow-700 mb-4">
                      Para sua segurança, altere sua senha regularmente.
                    </p>
                    <button className="btn-secondary text-sm">
                      Alterar Senha
                    </button>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Autenticação de Dois Fatores</h4>
                    <p className="text-sm text-blue-700 mb-4">
                      Adicione uma camada extra de segurança à sua conta.
                    </p>
                    <button className="btn-secondary text-sm">
                      Configurar 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}
