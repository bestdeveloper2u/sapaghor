import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { dashboardAPI, STATUS_LABELS } from '../utils/api'
import { WORKFLOW_STAGES, getStatusLabel } from '../components/WorkflowProgress'
import { 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Truck,
  TrendingUp,
  AlertCircle,
  Plus,
  FileText,
  Search,
  Settings
} from 'lucide-react'

function StatCard({ title, titleBn, value, icon: Icon, color, subtext }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xs text-gray-400">{titleBn}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

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
  const displayText = label ? `${label.bn}` : status?.replace(/_/g, ' ')

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {displayText}
    </span>
  )
}

function QuickActionButton({ icon: Icon, label, labelBn, shortcut, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all group`}
    >
      <div className={`p-3 rounded-full ${color} mb-2`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <span className="text-sm font-medium text-gray-700">{labelBn}</span>
      <span className="text-xs text-gray-500">{label}</span>
      {shortcut && (
        <span className="mt-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-600 font-mono">
          {shortcut}
        </span>
      )}
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardAPI.getStats
  })

  const { data: recentOrders } = useQuery({
    queryKey: ['recent-orders'],
    queryFn: dashboardAPI.getRecentOrders
  })

  const { data: ordersByStatus } = useQuery({
    queryKey: ['orders-by-status'],
    queryFn: dashboardAPI.getOrdersByStatus
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard (ড্যাশবোর্ড)</h1>
          <p className="text-gray-600">সাপাঘর ইআরপি সিস্টেমে স্বাগতম</p>
        </div>
        <Link to="/orders/new" className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          নতুন অর্ডার
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Actions (দ্রুত কার্যক্রম)</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <QuickActionButton
            icon={Plus}
            label="New Order"
            labelBn="নতুন অর্ডার"
            shortcut="F4"
            onClick={() => navigate('/orders/new')}
            color="bg-blue-500"
          />
          <QuickActionButton
            icon={Search}
            label="Search Orders"
            labelBn="অর্ডার খুঁজুন"
            shortcut="F5"
            onClick={() => navigate('/orders')}
            color="bg-purple-500"
          />
          <QuickActionButton
            icon={Users}
            label="Customers"
            labelBn="গ্রাহক"
            shortcut="F6"
            onClick={() => navigate('/customers')}
            color="bg-green-500"
          />
          <QuickActionButton
            icon={CreditCard}
            label="Payments"
            labelBn="পেমেন্ট"
            shortcut="F7"
            onClick={() => navigate('/finance')}
            color="bg-orange-500"
          />
          <QuickActionButton
            icon={Truck}
            label="Delivery"
            labelBn="ডেলিভারি"
            shortcut="F8"
            onClick={() => navigate('/delivery')}
            color="bg-teal-500"
          />
          <QuickActionButton
            icon={FileText}
            label="Reports"
            labelBn="রিপোর্ট"
            shortcut="F9"
            onClick={() => navigate('/finance')}
            color="bg-rose-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          titleBn="আজকের অর্ডার"
          value={stats?.orders?.today || 0}
          icon={ShoppingCart}
          color="bg-blue-500"
          subtext={`${stats?.orders?.pending || 0} পেন্ডিং`}
        />
        <StatCard
          title="Total Customers"
          titleBn="মোট গ্রাহক"
          value={stats?.customers?.total || 0}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Monthly Revenue"
          titleBn="মাসিক আয়"
          value={`৳${(stats?.finance?.month_revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Payments"
          titleBn="বাকি পেমেন্ট"
          value={`৳${(stats?.finance?.pending_payments || 0).toLocaleString()}`}
          icon={CreditCard}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Workflow Stages (ওয়ার্কফ্লো ধাপ)</h2>
          <div className="space-y-2">
            {WORKFLOW_STAGES.map((stage) => {
              const label = STATUS_LABELS[stage]
              const count = ordersByStatus?.[stage] || 0
              
              return (
                <Link 
                  key={stage}
                  to={`/orders?status=${stage}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${count > 0 ? 'bg-primary-500' : 'bg-gray-300'}`} />
                    <div>
                      <span className="font-medium">{label?.bn}</span>
                      <span className="text-sm text-gray-500 ml-2">({label?.en})</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    count > 0 ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {count}
                  </span>
                </Link>
              )
            })}
            
            <div className="border-t mt-2 pt-2">
              <Link 
                to="/orders?status=cancelled"
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div>
                    <span className="font-medium">{STATUS_LABELS.cancelled?.bn}</span>
                    <span className="text-sm text-gray-500 ml-2">({STATUS_LABELS.cancelled?.en})</span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                  {ordersByStatus?.cancelled || 0}
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Stats (দ্রুত পরিসংখ্যান)</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Truck className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Today's Deliveries (আজকের ডেলিভারি)</p>
                <p className="text-xl font-bold">{stats?.deliveries?.today || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Low Stock Items (স্টক কম)</p>
                <p className="text-xl font-bold">{stats?.inventory?.low_stock_items || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Net Income (নীট আয়)</p>
                <p className="text-xl font-bold">৳{(stats?.finance?.net_income || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders (সাম্প্রতিক অর্ডার)</h2>
          <Link to="/orders" className="text-primary-600 hover:underline text-sm">
            সব দেখুন →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 font-medium text-gray-500">Order # (অর্ডার নং)</th>
                <th className="pb-3 font-medium text-gray-500">Customer (গ্রাহক)</th>
                <th className="pb-3 font-medium text-gray-500">Work (কাজ)</th>
                <th className="pb-3 font-medium text-gray-500">Status (অবস্থা)</th>
                <th className="pb-3 font-medium text-gray-500">Amount (টাকা)</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3">
                    <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline font-medium">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="py-3">{order.customer?.company_name}</td>
                  <td className="py-3">{order.work_name}</td>
                  <td className="py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="py-3 font-medium">৳{order.total_amount?.toLocaleString()}</td>
                </tr>
              ))}
              {(!recentOrders || recentOrders.length === 0) && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    এখনো কোনো অর্ডার নেই। <Link to="/orders/new" className="text-primary-600 hover:underline">প্রথম অর্ডার তৈরি করুন</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
