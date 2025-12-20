import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { api } from '../utils/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()
  const { isDark } = useTheme()

  useEffect(() => {
    if (!user) return
    
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user])

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications')
      if (data.notifications) {
        setNotifications(data.notifications)
        setUnreadCount(data.notifications.filter(n => !n.is_read).length)
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`, {})
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`)
      setNotifications(notifications.filter(n => n.id !== id))
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default: return <Info className="w-5 h-5 text-blue-500" />
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={`relative p-2 rounded-lg transition-colors ${isDark ? 'text-white hover:bg-dark-700/50' : 'text-gray-900 hover:bg-white/20'}`}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className={`absolute right-0 mt-2 w-96 glass rounded-2xl shadow-glass-lg z-50 max-h-96 overflow-y-auto ${isDark ? 'dark' : ''}`}>
          <div className={`p-4 border-b ${isDark ? 'border-white/10' : 'border-white/20'}`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className={`divide-y ${isDark ? 'divide-white/10' : 'divide-white/20'}`}>
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 transition-colors ${isDark ? 'hover:bg-dark-700/50' : 'hover:bg-white/10'} ${!notif.is_read ? (isDark ? 'bg-dark-700/30' : 'bg-white/20') : ''}`}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notif.notification_type)}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{notif.title}</h4>
                      <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{notif.message}</p>
                      <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className={isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-blue-500 mt-2 hover:text-blue-600"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
