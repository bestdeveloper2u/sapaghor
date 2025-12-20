import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Notifications from './Notifications'
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Palette, 
  Factory, 
  Truck, 
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  TrendingUp,
  CheckSquare
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Orders', href: '/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Design', href: '/design', icon: Palette },
  { name: 'Production', href: '/production', icon: Factory },
  { name: 'Delivery', href: '/delivery', icon: Truck },
  { name: 'Finance', href: '/finance', icon: CreditCard },
  { name: 'Users', href: '/users', icon: Settings },
  { name: 'My Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Profit', href: '/shareholder', icon: TrendingUp },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const filteredNavigation = navigation.filter(item => {
    if (item.name === 'My Tasks' && !['Employee', 'Designer', 'Production'].includes(user?.role?.name)) {
      return false
    }
    if (item.name === 'Profit' && user?.role?.name !== 'Shareholder') {
      return false
    }
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 w-64 glass rounded-r-2xl shadow-glass-lg">
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
            <h1 className="text-xl font-bold text-white">সাপাঘর</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.href
                    ? 'bg-white/30 text-white font-medium'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 glass rounded-r-2xl shadow-glass-lg">
          <div className="flex items-center h-16 px-6 border-b border-white/20">
            <h1 className="text-2xl font-bold text-white">সাপাঘর ERP</h1>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {filteredNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.href
                    ? 'bg-white/30 text-white font-medium shadow-lg'
                    : 'text-white/70 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-white/20">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/10">
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-white font-bold text-lg">
                  {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.full_name || user?.username}</p>
                <p className="text-xs text-white/60 truncate">{user?.role?.name || 'User'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-white/70 hover:bg-white/10 rounded-xl transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-40 glass border-b border-white/20 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button onClick={() => setSidebarOpen(true)} className="text-white">
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-white">সাপাঘর ERP</h1>
            <div className="w-6" />
          </div>
        </header>

        <header className="hidden lg:sticky lg:top-0 lg:z-40 lg:flex lg:items-center lg:justify-between lg:h-16 lg:px-6 lg:glass lg:border-b lg:border-white/20">
          <h2 className="text-xl font-semibold text-white">
            {filteredNavigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <Notifications />
          </div>
        </header>

        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
