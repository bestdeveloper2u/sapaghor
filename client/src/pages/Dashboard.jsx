import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../utils/api'
import { 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Truck,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle
} from 'lucide-react'

function StatCard({ title, value, icon: Icon, color, subtext }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
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
    pre_order: 'bg-yellow-100 text-yellow-800',
    order_placed: 'bg-blue-100 text-blue-800',
    designer_assigned: 'bg-purple-100 text-purple-800',
    proof_sent: 'bg-indigo-100 text-indigo-800',
    proof_confirmed: 'bg-green-100 text-green-800',
    in_process: 'bg-orange-100 text-orange-800',
    printing: 'bg-pink-100 text-pink-800',
    binding: 'bg-rose-100 text-rose-800',
    ready_for_delivery: 'bg-teal-100 text-teal-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
      {status?.replace(/_/g, ' ')}
    </span>
  )
}

export default function Dashboard() {
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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome to Sapaghor ERP System</p>
        </div>
        <Link to="/orders/new" className="btn-primary">
          New Order
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Orders"
          value={stats?.orders?.today || 0}
          icon={ShoppingCart}
          color="bg-blue-500"
          subtext={`${stats?.orders?.pending || 0} pending`}
        />
        <StatCard
          title="Total Customers"
          value={stats?.customers?.total || 0}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          title="Monthly Revenue"
          value={`৳${(stats?.finance?.month_revenue || 0).toLocaleString()}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          title="Pending Payments"
          value={`৳${(stats?.finance?.pending_payments || 0).toLocaleString()}`}
          icon={CreditCard}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Overview */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Orders by Status</h2>
          <div className="space-y-3">
            {ordersByStatus && Object.entries(ordersByStatus).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <OrderStatusBadge status={status} />
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {(!ordersByStatus || Object.keys(ordersByStatus).length === 0) && (
              <p className="text-gray-500 text-center py-4">No orders yet</p>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <Truck className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-gray-500">Today's Deliveries</p>
                <p className="text-xl font-bold">{stats?.deliveries?.today || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-xl font-bold">{stats?.inventory?.low_stock_items || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Net Income (Month)</p>
                <p className="text-xl font-bold">৳{(stats?.finance?.net_income || 0).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link to="/orders" className="text-primary-600 hover:underline text-sm">
            View all
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-3 font-medium text-gray-500">Order #</th>
                <th className="pb-3 font-medium text-gray-500">Customer</th>
                <th className="pb-3 font-medium text-gray-500">Work</th>
                <th className="pb-3 font-medium text-gray-500">Status</th>
                <th className="pb-3 font-medium text-gray-500">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((order) => (
                <tr key={order.id} className="border-b last:border-0">
                  <td className="py-3">
                    <Link to={`/orders/${order.id}`} className="text-primary-600 hover:underline">
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
                    No orders yet. <Link to="/orders/new" className="text-primary-600 hover:underline">Create your first order</Link>
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
