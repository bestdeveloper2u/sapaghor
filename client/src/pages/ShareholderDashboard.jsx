import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Award } from 'lucide-react'
import { api } from '../utils/api'

export default function ShareholderDashboard() {
  const [shareholder, setShareholder] = useState(null)
  const [profitHistory, setProfitHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchShareholderData()
  }, [])

  const fetchShareholderData = async () => {
    try {
      setLoading(true)
      const data = await api.get('/shareholder/dashboard')
      setShareholder(data.shareholder)
      setProfitHistory(data.profit_history || [])
    } catch (error) {
      console.error('Failed to fetch shareholder data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!shareholder) {
    return (
      <div className="card">
        <p className="text-gray-600">Shareholder profile not found</p>
      </div>
    )
  }

  const profitStats = [
    {
      label: 'Share Percentage',
      value: `${shareholder.share_percentage}%`,
      icon: Award,
      color: 'bg-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Total Invested',
      value: `৳${shareholder.invested_amount.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500/20',
      textColor: 'text-green-400'
    },
    {
      label: 'Profit Earned',
      value: `৳${shareholder.profit_earned.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: 'Current Share Value',
      value: `৳${shareholder.share_amount.toLocaleString()}`,
      icon: Award,
      color: 'bg-orange-500/20',
      textColor: 'text-orange-400'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profitStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className="card-dark">
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
              <p className="text-white/60 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className="card-dark">
        <h3 className="text-xl font-bold text-white mb-6">Profit Distribution History</h3>
        
        {profitHistory.length === 0 ? (
          <p className="text-white/60">No profit distribution history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Period</th>
                  <th className="text-right py-3 px-4 text-white/80 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-white/80 font-medium">Status</th>
                  <th className="text-right py-3 px-4 text-white/80 font-medium">Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {profitHistory.map((profit) => (
                  <tr key={profit.id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="py-3 px-4 text-white/80">
                      {new Date(profit.period_start).toLocaleDateString()} - {new Date(profit.period_end).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-semibold text-green-400">
                        ৳{parseFloat(profit.profit_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profit.payment_status === 'paid'
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-yellow-500/20 text-yellow-300'
                      }`}>
                        {profit.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-white/60">
                      {profit.paid_date ? new Date(profit.paid_date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
