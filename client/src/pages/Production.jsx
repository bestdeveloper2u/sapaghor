import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productionAPI } from '../utils/api'
import { Factory, Printer, BookOpen, CheckCircle, Clock } from 'lucide-react'

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_process: 'bg-blue-100 text-blue-800',
    printing: 'bg-pink-100 text-pink-800',
    binding: 'bg-purple-100 text-purple-800',
    quality_check: 'bg-orange-100 text-orange-800',
    completed: 'bg-green-100 text-green-800',
    on_hold: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Production() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['production-tasks', { status }],
    queryFn: () => productionAPI.listTasks({ status })
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => productionAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['production-tasks'])
    }
  })

  const stats = {
    pending: data?.tasks?.filter(t => t.status === 'pending').length || 0,
    printing: data?.tasks?.filter(t => t.status === 'printing').length || 0,
    binding: data?.tasks?.filter(t => t.status === 'binding').length || 0,
    completed: data?.tasks?.filter(t => t.status === 'completed').length || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Production Module</h1>
        <p className="text-gray-600">Manage production workflow</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Printer className="w-8 h-8 text-pink-500" />
            <div>
              <p className="text-2xl font-bold">{stats.printing}</p>
              <p className="text-sm text-gray-500">Printing</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.binding}</p>
              <p className="text-sm text-gray-500">Binding</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input w-full sm:w-48"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_process">In Process</option>
          <option value="printing">Printing</option>
          <option value="binding">Binding</option>
          <option value="quality_check">Quality Check</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tasks */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data?.tasks?.length > 0 ? (
          data.tasks.map((task) => (
            <div key={task.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Order #{task.order_id}</h3>
                  <p className="text-sm text-gray-500">Type: {task.task_type || 'General'}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={task.status} />
                    {task.priority === 'high' && (
                      <span className="text-xs text-red-600 font-medium">HIGH PRIORITY</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'in_process' } })}
                      className="btn-secondary text-sm"
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'in_process' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'printing' } })}
                      className="btn-secondary text-sm"
                    >
                      Printing
                    </button>
                  )}
                  {task.status === 'printing' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'binding' } })}
                      className="btn-secondary text-sm"
                    >
                      Binding
                    </button>
                  )}
                  {task.status === 'binding' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'quality_check' } })}
                      className="btn-secondary text-sm"
                    >
                      QC
                    </button>
                  )}
                  {task.status === 'quality_check' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'completed' } })}
                      className="btn-primary text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              {task.time_spent_minutes > 0 && (
                <p className="text-sm text-gray-500 mt-2">
                  Time spent: {Math.floor(task.time_spent_minutes / 60)}h {task.time_spent_minutes % 60}m
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="card text-center py-12 text-gray-500">
            No production tasks found. Production tasks are created when orders enter production phase.
          </div>
        )}
      </div>
    </div>
  )
}
