import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../utils/api'
import { Plus, Search, Filter } from 'lucide-react'

function OrderStatusBadge({ status }) {
  const statusColors = {
    pre_order: 'bg-yellow-100 text-yellow-800',
    order_placed: 'bg-blue-100 text-blue-800',
    designer_assigned: 'bg-purple-100 text-purple-800',
    proof_sent: 'bg-indigo-100 text-indigo-800',
    proof_confirmed: 'bg-green-100 text-green-800',
    in_process: 'bg-orange-100 text-orange-800',
    printing: 'bg-pink-100 text-pink-800',
    binding: 'bg-rose-100 text-rose-800',
    ready_for_delivery: 'bg-teal-100 text-teal-800',
    out_for_delivery: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

function PaymentBadge({ status }) {
  const colors = {
    paid: 'bg-green-100 text-green-800',
    partial: 'bg-yellow-100 text-yellow-800',
    pending: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage all orders</p>
        </div>
        <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          New Order
        </Link>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order number or work name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input w-full sm:w-48"
          >
            <option value="">All Status</option>
            <option value="pre_order">Pre Order</option>
            <option value="order_placed">Order Placed</option>
            <option value="designer_assigned">Designer Assigned</option>
            <option value="proof_sent">Proof Sent</option>
            <option value="proof_confirmed">Proof Confirmed</option>
            <option value="in_process">In Process</option>
            <option value="printing">Printing</option>
            <option value="binding">Binding</option>
            <option value="ready_for_delivery">Ready for Delivery</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
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
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.pages > 1 && (
          <div className="px-6 py-4 border-t flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing page {page} of {data.pages} ({data.total} total orders)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
