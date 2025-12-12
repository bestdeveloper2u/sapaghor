import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI, designAPI, productionAPI, deliveryAPI, financeAPI } from '../utils/api'
import { ArrowLeft, Clock, CreditCard, Truck, Palette, Factory, Edit, CheckCircle } from 'lucide-react'

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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function OrderDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [paymentData, setPaymentData] = useState({ amount: 0, payment_method: 'cash', notes: '' })

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersAPI.get(id)
  })

  const { data: history } = useQuery({
    queryKey: ['order-history', id],
    queryFn: () => ordersAPI.getHistory(id)
  })

  const updateStatusMutation = useMutation({
    mutationFn: (data) => ordersAPI.updateStatus(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id])
      queryClient.invalidateQueries(['order-history', id])
      setShowStatusModal(false)
    }
  })

  const createPaymentMutation = useMutation({
    mutationFn: (data) => financeAPI.createPayment({ ...data, order_id: parseInt(id) }),
    onSuccess: () => {
      queryClient.invalidateQueries(['order', id])
      setShowPaymentModal(false)
      setPaymentData({ amount: 0, payment_method: 'cash', notes: '' })
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!order) {
    return <div className="text-center py-12">Order not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/orders')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{order.order_number}</h1>
            <p className="text-gray-600">{order.work_name}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <button onClick={() => setShowStatusModal(true)} className="btn-secondary">
            Update Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company Name</p>
                <p className="font-medium">{order.customer?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact</p>
                <p className="font-medium">{order.customer?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="font-medium">{order.customer?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Items</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 text-sm font-medium text-gray-500">Item</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Size</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Color</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Qty</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Rate</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="py-3">{item.product_name}</td>
                      <td className="py-3">{item.size || '-'}</td>
                      <td className="py-3">{item.color || '-'}</td>
                      <td className="py-3">{item.quantity}</td>
                      <td className="py-3">৳{item.unit_price}</td>
                      <td className="py-3 font-medium">৳{item.total_price?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status History */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Status History</h2>
            <div className="space-y-4">
              {history?.map((h, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                  <div>
                    <p className="font-medium capitalize">{h.status?.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-gray-500">{h.notes}</p>
                    <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Payment Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>৳{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Discount</span>
                <span>-৳{order.discount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total</span>
                <span>৳{order.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid</span>
                <span>৳{order.paid_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Due</span>
                <span>৳{order.due_amount?.toLocaleString()}</span>
              </div>
            </div>
            {order.due_amount > 0 && (
              <button
                onClick={() => {
                  setPaymentData({ ...paymentData, amount: order.due_amount })
                  setShowPaymentModal(true)
                }}
                className="btn-primary w-full mt-4"
              >
                Record Payment
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => updateStatusMutation.mutate({ status: 'designer_assigned' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
                disabled={order.status !== 'order_placed'}
              >
                <Palette className="w-5 h-5 text-purple-500" />
                <span>Assign Designer</span>
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ status: 'in_process' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
              >
                <Factory className="w-5 h-5 text-orange-500" />
                <span>Start Production</span>
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ status: 'ready_for_delivery' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
              >
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Mark Ready</span>
              </button>
              <button
                onClick={() => updateStatusMutation.mutate({ status: 'delivered' })}
                className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:bg-gray-50"
              >
                <Truck className="w-5 h-5 text-blue-500" />
                <span>Mark Delivered</span>
              </button>
            </div>
          </div>

          {/* Order Info */}
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Info</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date</span>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Delivery</span>
                <span>{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Type</span>
                <span className="capitalize">{order.order_type?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input mb-4"
            >
              <option value="">Select status...</option>
              <option value="pre_order">Pre Order</option>
              <option value="order_placed">Order Placed</option>
              <option value="designer_assigned">Designer Assigned</option>
              <option value="proof_sent">Proof Sent</option>
              <option value="proof_confirmed">Proof Confirmed</option>
              <option value="in_process">In Process</option>
              <option value="printing">Printing</option>
              <option value="binding">Binding</option>
              <option value="quality_check">Quality Check</option>
              <option value="ready_for_delivery">Ready for Delivery</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => updateStatusMutation.mutate({ status: newStatus })}
                disabled={!newStatus}
                className="btn-primary disabled:opacity-50"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Record Payment</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Amount (৳)</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="input"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="label">Notes</label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => createPaymentMutation.mutate(paymentData)}
                className="btn-primary"
              >
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
