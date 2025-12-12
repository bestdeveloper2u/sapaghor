import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { deliveryAPI } from '../utils/api'
import { Truck, Clock, CheckCircle, MapPin, Phone } from 'lucide-react'

function StatusBadge({ status }) {
  const colors = {
    scheduled: 'bg-blue-100 text-blue-800',
    out_for_delivery: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800',
    rescheduled: 'bg-yellow-100 text-yellow-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Delivery() {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState('')
  const [date, setDate] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['deliveries', { status, date }],
    queryFn: () => deliveryAPI.list({ status, date })
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => deliveryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['deliveries'])
    }
  })

  const stats = {
    scheduled: data?.deliveries?.filter(d => d.status === 'scheduled').length || 0,
    out_for_delivery: data?.deliveries?.filter(d => d.status === 'out_for_delivery').length || 0,
    delivered: data?.deliveries?.filter(d => d.status === 'delivered').length || 0
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Delivery Module</h1>
        <p className="text-gray-600">Track and manage deliveries</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{stats.out_for_delivery}</p>
              <p className="text-sm text-gray-500">Out for Delivery</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{stats.delivered}</p>
              <p className="text-sm text-gray-500">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input w-full sm:w-48"
          />
        </div>
      </div>

      {/* Deliveries */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data?.deliveries?.length > 0 ? (
          data.deliveries.map((delivery) => (
            <div key={delivery.id} className="card">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">Order #{delivery.order_id}</h3>
                    <StatusBadge status={delivery.status} />
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{delivery.delivery_address || 'Address not set'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{delivery.contact_phone || 'No phone'}</span>
                  </div>
                  {delivery.scheduled_date && (
                    <p className="text-sm text-gray-500">
                      Scheduled: {new Date(delivery.scheduled_date).toLocaleString()}
                    </p>
                  )}
                  {delivery.delivery_person && (
                    <p className="text-sm text-gray-500">
                      Assigned to: {delivery.delivery_person.full_name || delivery.delivery_person.username}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {delivery.status === 'scheduled' && (
                    <button
                      onClick={() => updateMutation.mutate({ id: delivery.id, data: { status: 'out_for_delivery' } })}
                      className="btn-secondary text-sm"
                    >
                      Out for Delivery
                    </button>
                  )}
                  {delivery.status === 'out_for_delivery' && (
                    <>
                      <button
                        onClick={() => updateMutation.mutate({ id: delivery.id, data: { status: 'delivered' } })}
                        className="btn-primary text-sm"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => updateMutation.mutate({ id: delivery.id, data: { status: 'failed' } })}
                        className="btn-secondary text-sm text-red-600"
                      >
                        Failed
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card text-center py-12 text-gray-500">
            No deliveries found. Deliveries are scheduled when orders are ready for delivery.
          </div>
        )}
      </div>
    </div>
  )
}
