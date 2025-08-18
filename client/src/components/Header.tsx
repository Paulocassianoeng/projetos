

import { useState, useRef, useEffect } from 'react'
import { Bell, Search, User } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'


export default function Header() {
  const { user, logout } = useAuthStore()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const notifRef = useRef<HTMLButtonElement>(null)
  const userRef = useRef<HTMLButtonElement>(null)

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const userMenu = document.getElementById('user-menu-dropdown')
      if (
        notifRef.current && !notifRef.current.contains(event.target as Node) &&
        userRef.current && !userRef.current.contains(event.target as Node) &&
        userMenu && !userMenu.contains(event.target as Node)
      ) {
        setShowNotifications(false)
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div className="flex items-center flex-1">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar compromissos..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notificações */}
        <div className="relative">
          <button
            ref={notifRef}
            className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => setShowNotifications((v) => !v)}
          >
            <Bell className="w-6 h-6" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Notificações</h4>
              <ul className="space-y-2 text-sm">
                <li className="text-gray-500">Nenhuma notificação no momento.</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>

          {/* Menu do usuário */}
          <div className="relative">
            <button
              ref={userRef}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              onClick={() => setShowUserMenu((v) => !v)}
            >
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
            </button>
            {showUserMenu && (
              <div
                id="user-menu-dropdown"
                className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-[9999] py-2"
                style={{ pointerEvents: 'auto' }}
                tabIndex={0}
              >
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm cursor-pointer"
                  tabIndex={0}
                >
                  Perfil & Configurações
                </Link>
                <button
                  onClick={() => { setShowUserMenu(false); logout(); }}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm cursor-pointer"
                  tabIndex={0}
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
