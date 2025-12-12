import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { designAPI } from '../utils/api'
import { Palette, Clock, CheckCircle, RefreshCw } from 'lucide-react'

function StatusBadge({ status }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    proof_sent: 'bg-purple-100 text-purple-800',
    revision_requested: 'bg-orange-100 text-orange-800',
    approved: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Design() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['design-tasks', { status }],
    queryFn: () => designAPI.listTasks({ status })
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }) => designAPI.updateTask(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['design-tasks'])
    }
  })

  const stats = {
    pending: data?.tasks?.filter(t => t.status === 'pending').length || 0,
    in_progress: data?.tasks?.filter(t => t.status === 'in_progress').length || 0,
    proof_sent: data?.tasks?.filter(t => t.status === 'proof_sent').length || 0,
    completed: data?.tasks?.filter(t => t.status === 'completed' || t.status === 'approved').length || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Design Module</h1>
        <p className="text-gray-600">Manage design tasks and proofs</p>
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
            <Palette className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.in_progress}</p>
              <p className="text-sm text-gray-500">In Progress</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-2xl font-bold">{stats.proof_sent}</p>
              <p className="text-sm text-gray-500">Awaiting Review</p>
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
          <option value="in_progress">In Progress</option>
          <option value="proof_sent">Proof Sent</option>
          <option value="revision_requested">Revision Requested</option>
          <option value="approved">Approved</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Tasks List */}
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
                  <h3 className="font-semibold">{task.title || `Order #${task.order_id}`}</h3>
                  <p className="text-sm text-gray-500">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <StatusBadge status={task.status} />
                    {task.designer && (
                      <span className="text-sm text-gray-500">
                        Assigned to: {task.designer.full_name || task.designer.username}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'in_progress' } })}
                      className="btn-primary text-sm"
                    >
                      Start Work
                    </button>
                  )}
                  {task.status === 'in_progress' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'proof_sent' } })}
                      className="btn-primary text-sm"
                    >
                      Send Proof
                    </button>
                  )}
                  {task.status === 'approved' && (
                    <button
                      onClick={() => updateTaskMutation.mutate({ id: task.id, data: { status: 'completed' } })}
                      className="btn-primary text-sm"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
              {task.proofs && task.proofs.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Proofs ({task.proofs.length})</p>
                  <div className="flex gap-2">
                    {task.proofs.map((proof) => (
                      <span key={proof.id} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        v{proof.version} - {proof.status}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="card text-center py-12 text-gray-500">
            No design tasks found. Design tasks are created when orders are assigned to designers.
          </div>
        )}
      </div>
    </div>
  )
}
