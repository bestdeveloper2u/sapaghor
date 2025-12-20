import React, { useState, useEffect } from 'react'
import { CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { api } from '../utils/api'

const PRIORITY_COLORS = {
  urgent: 'bg-red-500/20 text-red-300',
  high: 'bg-orange-500/20 text-orange-300',
  medium: 'bg-yellow-500/20 text-yellow-300',
  low: 'bg-blue-500/20 text-blue-300'
}

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

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
    { label: 'Total Tasks', value: tasks.length, color: 'bg-blue-500/20' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'in_progress').length, color: 'bg-yellow-500/20' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, color: 'bg-green-500/20' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} glass p-4 rounded-xl`}>
            <p className="text-white/60 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="glass p-4 rounded-xl flex gap-2 overflow-x-auto">
        {['all', 'pending', 'in_progress', 'completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-all ${
              filter === status
                ? 'bg-white text-primary-600'
                : 'bg-white/20 text-white hover:bg-white/30'
            }`}
          >
            {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="card-dark text-center py-12">
            <CheckSquare className="w-12 h-12 mx-auto mb-3 text-white/30" />
            <p className="text-white/60">No tasks found</p>
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="card-dark hover:bg-white/30 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-white/70 mb-3">{task.description}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <div>Type: <span className="text-white">{task.task_type}</span></div>
                    {task.due_date && (
                      <div>Due: <span className="text-white">{new Date(task.due_date).toLocaleDateString()}</span></div>
                    )}
                    {task.estimated_hours && (
                      <div>Est: <span className="text-white">{task.estimated_hours}h</span></div>
                    )}
                  </div>
                </div>
                <select
                  onChange={e => updateTaskStatus(task.id, e.target.value)}
                  value={task.status}
                  className="px-3 py-2 bg-white/20 text-white rounded-lg border border-white/30 text-sm"
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
