import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
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
  CheckSquare,
  Moon,
  Sun
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
  const { isDark, toggleTheme } = useTheme()
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
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className={isDark ? 'bg-gradient-dark' : 'bg-gradient-light'}>
        {/* Mobile sidebar */}
        <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur" onClick={() => setSidebarOpen(false)} />
          <div className={`fixed inset-y-0 left-0 w-64 glass rounded-r-2xl shadow-glass-lg ${isDark ? 'dark' : ''}`}>
            <div className={`flex items-center justify-between h-16 px-6 border-b ${isDark ? 'border-white/20 bg-dark-800/80' : 'border-white/20'}`}>
              <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-primary-700'}`}>সাপাঘর</h1>
              <button onClick={() => setSidebarOpen(false)}>
                <X className={`w-6 h-6 ${isDark ? 'text-white' : 'text-gray-900'}`} />
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
                      ? isDark ? 'bg-secondary-600/50 text-white font-medium' : 'bg-primary-100 text-primary-700 font-medium'
                      : isDark ? 'text-gray-300 hover:bg-dark-700/50' : 'text-gray-700 hover:bg-white/30'
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
          <div className={`flex flex-col flex-1 glass rounded-r-2xl shadow-glass-lg ${isDark ? 'dark' : ''}`}>
            <div className={`flex items-center h-16 px-6 border-b ${isDark ? 'border-white/20 bg-dark-800/80' : 'border-white/20'}`}>
              <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-primary-700'}`}>সাপাঘর ERP</h1>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {filteredNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    location.pathname === item.href
                      ? isDark ? 'bg-secondary-600/50 text-white font-medium shadow-lg' : 'bg-primary-100 text-primary-700 font-medium shadow-lg'
                      : isDark ? 'text-gray-300 hover:bg-dark-700/50' : 'text-gray-700 hover:bg-white/30'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className={`p-4 border-t ${isDark ? 'border-white/20' : 'border-white/20'}`}>
              <div className={`flex items-center gap-3 mb-4 p-3 rounded-xl ${isDark ? 'bg-dark-700/50' : 'bg-white/20'}`}>
                <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-secondary-600/60' : 'bg-primary-200'} flex items-center justify-center`}>
                  <span className={`${isDark ? 'text-white' : 'text-primary-700'} font-bold text-lg`}>
                    {user?.full_name?.[0] || user?.username?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.full_name || user?.username}</p>
                  <p className={`text-xs truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{user?.role?.name || 'User'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={toggleTheme}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isDark ? 'bg-dark-700/50 text-yellow-300 hover:bg-dark-600/70' : 'bg-white/20 text-gray-900 hover:bg-white/30'
                  }`}
                >
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleLogout}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    isDark ? 'bg-red-900/30 text-red-300 hover:bg-red-900/50' : 'bg-red-100/50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64">
          <header className={`sticky top-0 z-40 ${isDark ? 'dark bg-dark-800/80' : 'bg-white/70'} backdrop-blur border-b ${isDark ? 'border-white/10' : 'border-white/20'} lg:hidden`}>
            <div className="flex items-center justify-between h-16 px-4">
              <button onClick={() => setSidebarOpen(true)} className={isDark ? 'text-white' : 'text-gray-900'}>
                <Menu className="w-6 h-6" />
              </button>
              <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-primary-700'}`}>সাপাঘর ERP</h1>
              <button onClick={toggleTheme} className={isDark ? 'text-yellow-300' : 'text-gray-900'}>
                {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
              </button>
            </div>
          </header>

          <header className={`hidden lg:sticky lg:top-0 lg:z-40 lg:flex lg:items-center lg:justify-between lg:h-16 lg:px-8 lg:glass lg:border-b ${isDark ? 'lg:dark lg:border-white/10 lg:bg-dark-800/80' : 'lg:border-white/20'}`}>
            <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {filteredNavigation.find(n => n.href === location.pathname)?.name || 'Dashboard'}
            </h2>
            <div className="flex items-center gap-4">
              <Notifications />
            </div>
          </header>

          <main className="responsive-px responsive-py">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
