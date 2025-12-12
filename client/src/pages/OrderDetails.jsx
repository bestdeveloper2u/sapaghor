import React, { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersAPI, financeAPI, STATUS_LABELS } from '../utils/api'
import WorkflowProgress, { WORKFLOW_STAGES, getStatusLabel, MATERIAL_LABELS, FEE_LABELS } from '../components/WorkflowProgress'
import { ArrowLeft, CreditCard, Truck, Palette, Factory, CheckCircle, XCircle, Clock } from 'lucide-react'

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
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {displayText}
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
    return <div className="text-center py-12">অর্ডার খুঁজে পাওয়া যায়নি (Order not found)</div>
  }

  const statusButtonConfig = [
    { status: 'design_sent', label: 'ডিজাইনে পাঠান', icon: Palette, color: 'text-purple-500', enabledFrom: ['order'] },
    { status: 'proof_given', label: 'প্রুফ প্রদান', icon: CheckCircle, color: 'text-indigo-500', enabledFrom: ['design_sent'] },
    { status: 'proof_complete', label: 'প্রুফ সম্পন্ন', icon: CheckCircle, color: 'text-green-500', enabledFrom: ['proof_given'] },
    { status: 'plate_setting', label: 'প্লেট সেটিং', icon: Factory, color: 'text-yellow-600', enabledFrom: ['proof_complete'] },
    { status: 'printing_complete', label: 'ছাপা সম্পন্ন', icon: Factory, color: 'text-pink-500', enabledFrom: ['plate_setting'] },
    { status: 'binding_sent', label: 'বাইন্ডিং এ পাঠান', icon: Factory, color: 'text-rose-500', enabledFrom: ['printing_complete'] },
    { status: 'order_ready', label: 'অর্ডার প্রস্তুত', icon: CheckCircle, color: 'text-teal-500', enabledFrom: ['binding_sent', 'printing_complete'] },
    { status: 'delivered', label: 'ডেলিভারি প্রদান', icon: Truck, color: 'text-green-600', enabledFrom: ['order_ready'] },
    { status: 'cancelled', label: 'বাতিল করুন', icon: XCircle, color: 'text-red-500', enabledFrom: WORKFLOW_STAGES }
  ]

  const hasMaterialData = order.items?.some(item => 
    item.plate || item.paper || item.duplicate || item.ink || 
    item.printing || item.binding || item.laminating || item.others
  )

  const hasExtraFees = order.design_fee || order.urgency_fee || order.cashing_fee || order.misc_fee

  return (
    <div className="space-y-6">
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
            স্ট্যাটাস আপডেট করুন
          </button>
        </div>
      </div>

      <WorkflowProgress currentStatus={order.status} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Customer Information (গ্রাহকের তথ্য)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Company Name (প্রতিষ্ঠানের নাম)</p>
                <p className="font-medium">{order.customer?.company_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Contact (যোগাযোগ)</p>
                <p className="font-medium">{order.customer?.phone}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-gray-500">Address (ঠিকানা)</p>
                <p className="font-medium">{order.customer?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Items (অর্ডার আইটেম)</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b">
                    <th className="pb-3 text-sm font-medium text-gray-500">Item (আইটেম)</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Size (সাইজ)</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Color (কালার)</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Qty (পরিমাণ)</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Rate (দর)</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Total (মোট)</th>
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

          {hasMaterialData && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Material Usage (উপকরণ ব্যবহার)</h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium mb-3">{item.product_name}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                        item[key] > 0 && (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-600">{label.bn}:</span>
                            <span className="font-medium">৳{item[key]?.toLocaleString()}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasExtraFees && (
            <div className="card">
              <h2 className="text-lg font-semibold mb-4">Extra Fees (অতিরিক্ত ফি)</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(FEE_LABELS).map(([key, label]) => (
                  order[key] > 0 && (
                    <div key={key} className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-600">{label.bn}</p>
                      <p className="text-lg font-semibold">৳{order[key]?.toLocaleString()}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Status History (স্ট্যাটাস ইতিহাস)</h2>
            <div className="space-y-4">
              {history?.map((h, idx) => {
                const label = STATUS_LABELS[h.status]
                return (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-500" />
                    <div>
                      <p className="font-medium">
                        {label ? `${label.en} (${label.bn})` : h.status?.replace(/_/g, ' ')}
                      </p>
                      <p className="text-sm text-gray-500">{h.notes}</p>
                      <p className="text-xs text-gray-400">{new Date(h.changed_at).toLocaleString()}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Payment Summary (পেমেন্ট সারসংক্ষেপ)</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal (উপমোট)</span>
                <span>৳{order.subtotal?.toLocaleString()}</span>
              </div>
              {hasExtraFees && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Extra Fees (অতিরিক্ত ফি)</span>
                  <span>৳{((order.design_fee || 0) + (order.urgency_fee || 0) + (order.cashing_fee || 0) + (order.misc_fee || 0)).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Discount (ছাড়)</span>
                <span>-৳{order.discount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-t pt-3 font-bold">
                <span>Total (মোট)</span>
                <span>৳{order.total_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Paid (পরিশোধিত)</span>
                <span>৳{order.paid_amount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold">
                <span>Due (বাকি)</span>
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
                <CreditCard className="w-4 h-4 inline mr-2" />
                পেমেন্ট রেকর্ড করুন
              </button>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Quick Actions (দ্রুত কার্যক্রম)</h2>
            <div className="space-y-2">
              {statusButtonConfig.map(({ status, label, icon: Icon, color, enabledFrom }) => {
                const isEnabled = enabledFrom.includes(order.status)
                return (
                  <button
                    key={status}
                    onClick={() => updateStatusMutation.mutate({ status })}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg ${
                      isEnabled ? 'hover:bg-gray-50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                    disabled={!isEnabled || updateStatusMutation.isPending}
                  >
                    <Icon className={`w-5 h-5 ${color}`} />
                    <div>
                      <span className="text-sm font-medium">{label}</span>
                      <span className="text-xs text-gray-500 ml-1">({STATUS_LABELS[status]?.en})</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Order Info (অর্ডার তথ্য)</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Date (অর্ডার তারিখ)</span>
                <span>{new Date(order.order_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expected Delivery (প্রত্যাশিত ডেলিভারি)</span>
                <span>{order.expected_delivery_date ? new Date(order.expected_delivery_date).toLocaleDateString() : 'Not set'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order Type (অর্ডার প্রকার)</span>
                <span className="capitalize">{order.order_type?.replace(/_/g, ' ')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Order Status (স্ট্যাটাস আপডেট করুন)</h3>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="input mb-4"
            >
              <option value="">স্ট্যাটাস নির্বাচন করুন...</option>
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
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowStatusModal(false)} className="btn-secondary">বাতিল</button>
              <button
                onClick={() => updateStatusMutation.mutate({ status: newStatus })}
                disabled={!newStatus}
                className="btn-primary disabled:opacity-50"
              >
                আপডেট করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Record Payment (পেমেন্ট রেকর্ড করুন)</h3>
            <div className="space-y-4">
              <div>
                <label className="label">Amount (পরিমাণ) ৳</label>
                <input
                  type="number"
                  value={paymentData.amount}
                  onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Payment Method (পেমেন্ট পদ্ধতি)</label>
                <select
                  value={paymentData.payment_method}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                  className="input"
                >
                  <option value="cash">Cash (নগদ)</option>
                  <option value="bank_transfer">Bank Transfer (ব্যাংক ট্রান্সফার)</option>
                  <option value="mobile_banking">Mobile Banking (মোবাইল ব্যাংকিং)</option>
                  <option value="cheque">Cheque (চেক)</option>
                </select>
              </div>
              <div>
                <label className="label">Notes (মন্তব্য)</label>
                <input
                  type="text"
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowPaymentModal(false)} className="btn-secondary">বাতিল</button>
              <button
                onClick={() => createPaymentMutation.mutate(paymentData)}
                className="btn-primary"
              >
                পেমেন্ট রেকর্ড করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
