import React, { useState, useEffect } from 'react'
import { TrendingUp, DollarSign, Award } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { api } from '../utils/api'

export default function ShareholderDashboard() {
  const [shareholder, setShareholder] = useState(null)
  const [profitHistory, setProfitHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const { isDark } = useTheme()

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!shareholder) {
    return (
      <div className={`card ${isDark ? 'dark' : ''}`}>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Shareholder profile not found</p>
      </div>
    )
  }

  const profitStats = [
    { label: 'Share %', value: `${shareholder.share_percentage}%`, icon: Award, color: isDark ? 'bg-blue-900/40' : 'bg-blue-100' },
    { label: 'Invested', value: `৳${shareholder.invested_amount.toLocaleString()}`, icon: DollarSign, color: isDark ? 'bg-green-900/40' : 'bg-green-100' },
    { label: 'Earned', value: `৳${shareholder.profit_earned.toLocaleString()}`, icon: TrendingUp, color: isDark ? 'bg-purple-900/40' : 'bg-purple-100' },
    { label: 'Share Value', value: `৳${shareholder.share_amount.toLocaleString()}`, icon: Award, color: isDark ? 'bg-orange-900/40' : 'bg-orange-100' }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {profitStats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <div key={i} className={`card ${isDark ? 'dark' : ''}`}>
              <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-primary-600'}`} />
              </div>
              <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{stat.value}</p>
            </div>
          )
        })}
      </div>

      <div className={`card ${isDark ? 'dark' : ''}`}>
        <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profit Distribution History</h3>
        
        {profitHistory.length === 0 ? (
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>No profit distribution history yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                  <th className={`table-header ${isDark ? 'dark' : ''}`}>Period</th>
                  <th className={`table-header ${isDark ? 'dark' : ''} text-right`}>Amount</th>
                  <th className={`table-header ${isDark ? 'dark' : ''}`}>Status</th>
                  <th className={`table-header ${isDark ? 'dark' : ''} text-right`}>Paid Date</th>
                </tr>
              </thead>
              <tbody>
                {profitHistory.map((profit) => (
                  <tr key={profit.id} className={`${isDark ? 'border-white/10 hover:bg-dark-700/30' : 'border-gray-200 hover:bg-gray-50'} border-b transition-colors`}>
                    <td className={`table-cell ${isDark ? 'dark' : ''}`}>
                      {new Date(profit.period_start).toLocaleDateString()} - {new Date(profit.period_end).toLocaleDateString()}
                    </td>
                    <td className={`table-cell ${isDark ? 'dark' : ''} text-right font-semibold text-green-500`}>
                      ৳{parseFloat(profit.profit_amount).toLocaleString()}
                    </td>
                    <td className={`table-cell ${isDark ? 'dark' : ''}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profit.payment_status === 'paid'
                          ? isDark ? 'badge-completed dark' : 'badge-completed'
                          : isDark ? 'badge-pending dark' : 'badge-pending'
                      }`}>
                        {profit.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </span>
                    </td>
                    <td className={`table-cell ${isDark ? 'dark' : ''} text-right`}>
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
