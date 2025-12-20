import React, { useState, useEffect } from 'react'
import { CheckSquare } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { api } from '../utils/api'

const PRIORITY_COLORS = {
  urgent: { light: 'bg-red-500/20 text-red-700', dark: 'bg-red-900/40 text-red-300' },
  high: { light: 'bg-orange-500/20 text-orange-700', dark: 'bg-orange-900/40 text-orange-300' },
  medium: { light: 'bg-yellow-500/20 text-yellow-700', dark: 'bg-yellow-900/40 text-yellow-300' },
  low: { light: 'bg-blue-500/20 text-blue-700', dark: 'bg-blue-900/40 text-blue-300' }
}

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const { isDark } = useTheme()

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const data = await api.get(`/tasks${filter !== 'all' ? `?status=${filter}` : ''}`)
      setTasks(data.tasks || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const stats = [
    { label: 'Total Tasks', value: tasks.length, color: isDark ? 'bg-blue-900/40' : 'bg-blue-500/20' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: isDark ? 'bg-yellow-900/40' : 'bg-yellow-500/20' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: isDark ? 'bg-green-900/40' : 'bg-green-500/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`glass p-4 rounded-xl ${isDark ? 'dark' : ''}`}>
            <div className={stat.color + ' w-12 h-12 rounded-lg flex items-center justify-center mb-2'}>
              <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</span>
            </div>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className={`glass p-4 rounded-xl flex gap-2 overflow-x-auto ${isDark ? 'dark' : ''}`}>
        {['all', 'pending', 'in_progress', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              filter === status
                ? isDark ? 'bg-secondary-600 text-white' : 'bg-primary-600 text-white'
                : isDark ? 'bg-dark-700/50 text-gray-300 hover:bg-dark-600/50' : 'bg-white/30 text-gray-900 hover:bg-white/40'
            }`}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className={`card text-center py-12 ${isDark ? 'dark' : ''}`}>
            <CheckSquare className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-300'}`} />
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No tasks found</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`card hover:shadow-md transition-all ${isDark ? 'dark hover:bg-dark-700/70' : 'hover:bg-white/40'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority][isDark ? 'dark' : 'light']}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className={`mb-3 ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>{task.description}</p>
                  <div className={`flex flex-wrap gap-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div>Type: <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{task.task_type}</span></div>
                    {task.due_date && (
                      <div>Due: <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{new Date(task.due_date).toLocaleDateString()}</span></div>
                    )}
                    {task.estimated_hours && (
                      <div>Est: <span className={isDark ? 'text-gray-300' : 'text-gray-900'}>{task.estimated_hours}h</span></div>
                    )}
                  </div>
                </div>
                <select
                  onChange={e => updateTaskStatus(task.id, e.target.value)}
                  value={task.status}
                  className={`px-3 py-2 rounded-lg border text-sm ${isDark ? 'bg-dark-700/50 border-white/20 text-white' : 'bg-white/30 border-white/30 text-gray-900'}`}
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
