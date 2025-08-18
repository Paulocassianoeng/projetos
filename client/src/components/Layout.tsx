import Sidebar from './Sidebar'
import Header from './Header'
import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
        <footer className="bg-primary-50 border-t border-primary-100 text-primary-700 text-center py-3 text-sm font-medium">
          © {new Date().getFullYear()} PACCASS grup . Todos os direitos reservados.
        </footer>
      </div>
    </div>
  )
}
