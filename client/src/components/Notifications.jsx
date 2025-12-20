import React, { useState, useEffect } from 'react'
import { Bell, X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [showPanel, setShowPanel] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useAuth()

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
        className="relative p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showPanel && (
        <div className="absolute right-0 mt-2 w-96 glass rounded-2xl shadow-glass-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-white/20">
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-white/60">
              <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/20">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-white/5 transition-colors ${!notif.is_read ? 'bg-white/10' : ''}`}
                >
                  <div className="flex gap-3">
                    {getNotificationIcon(notif.notification_type)}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white text-sm">{notif.title}</h4>
                      <p className="text-white/70 text-xs mt-1 line-clamp-2">{notif.message}</p>
                      <p className="text-white/40 text-xs mt-2">
                        {new Date(notif.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-white/40 hover:text-white/60"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  {!notif.is_read && (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-blue-300 mt-2 hover:text-blue-200"
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
