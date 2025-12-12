import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ordersAPI, dashboardAPI, STATUS_LABELS } from '../utils/api'
import { WorkflowSidebar, WORKFLOW_STAGES, getStatusLabel } from '../components/WorkflowProgress'
import { Plus, Search, Filter } from 'lucide-react'

function OrderStatusBadge({ status }) {
  const statusColors = {
    order: 'bg-blue-100 text-blue-800',
    design_sent: 'bg-purple-100 text-purple-800',
    proof_given: 'bg-indigo-100 text-indigo-800',
    proof_complete: 'bg-green-100 text-green-800',
    plate_setting: 'bg-yellow-100 text-yellow-800',
    printing_complete: 'bg-pink-100 text-pink-800',
    binding_sent: 'bg-rose-100 text-rose-800',
    order_ready: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const label = STATUS_LABELS[status]
  const displayText = label ? `${label.en} (${label.bn})` : status?.replace(/_/g, ' ')

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {displayText}
    </span>
  )
}

function PaymentBadge({ status }) {
  const colors = {
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-red-100 text-red-800'
  }

  const labels = {
    paid: 'Paid (পরিশোধিত)',
    partial: 'Partial (আংশিক)',
    pending: 'Pending (বাকি)'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {labels[status] || status}
    </span>
  )
}

export default function Orders() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['orders', { search, status, page }],
    queryFn: () => ordersAPI.list({ search, status, page, per_page: 20 })
  })

  const { data: ordersByStatus } = useQuery({
    queryKey: ['orders-by-status'],
    queryFn: dashboardAPI.getOrdersByStatus
  })

  return (
    <div className="flex gap-6">
      <div className="hidden lg:block w-72 flex-shrink-0">
        <WorkflowSidebar ordersByStatus={ordersByStatus} />
      </div>

      <div className="flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders (অর্ডার সমূহ)</h1>
            <p className="text-gray-600">সকল অর্ডার পরিচালনা করুন</p>
          </div>
          <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            New Order (নতুন অর্ডার)
          </Link>
        </div>

        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="অর্ডার নম্বর বা কাজের নাম দিয়ে খুঁজুন..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input pl-10"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input w-full sm:w-56"
            >
              <option value="">সকল অবস্থা (All Status)</option>
              {WORKFLOW_STAGES.map((stage) => {
                const label = STATUS_LABELS[stage]
                return (
                  <option key={stage} value={stage}>
                    {label?.en} ({label?.bn})
                  </option>
                )
              })}
              <option value="cancelled">Cancelled (বাতিল)</option>
            </select>
          </div>
        </div>

        <div className="card overflow-hidden p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order # (অর্ডার নং)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer (গ্রাহক)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work (কাজ)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status (অবস্থা)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment (পেমেন্ট)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (মোট)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due (বাকি)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date (তারিখ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data?.orders?.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <Link to={`/orders/${order.id}`} className="text-primary-600 font-medium hover:underline">
                          {order.order_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">{order.customer?.company_name}</p>
                          <p className="text-sm text-gray-500">{order.customer?.phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">{order.work_name}</td>
                      <td className="px-6 py-4">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-4">
                        <PaymentBadge status={order.payment_status} />
                      </td>
                      <td className="px-6 py-4 font-medium">৳{order.total_amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-red-600 font-medium">৳{order.due_amount?.toLocaleString()}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {(!data?.orders || data.orders.length === 0) && (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                        কোনো অর্ডার পাওয়া যায়নি (No orders found)
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {data?.pages > 1 && (
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <p className="text-sm text-gray-500">
                পৃষ্ঠা {page}/{data.pages} (মোট {data.total} অর্ডার)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50"
                >
                  পূর্ববর্তী
                </button>
                <button
                  onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="btn-secondary disabled:opacity-50"
                >
                  পরবর্তী
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
