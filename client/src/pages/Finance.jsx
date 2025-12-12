import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { financeAPI } from '../utils/api'
import { CreditCard, TrendingUp, TrendingDown, Plus, X } from 'lucide-react'

export default function Finance() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('payments')
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [expenseForm, setExpenseForm] = useState({
    category: '',
    description: '',
    amount: 0,
    payment_method: 'cash',
    vendor_name: '',
    notes: ''
  })

  const { data: payments } = useQuery({
    queryKey: ['payments'],
    queryFn: () => financeAPI.listPayments()
  })

  const { data: expenses } = useQuery({
    queryKey: ['expenses'],
    queryFn: () => financeAPI.listExpenses()
  })

  const { data: invoices } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => financeAPI.listInvoices()
  })

  const createExpenseMutation = useMutation({
    mutationFn: financeAPI.createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries(['expenses'])
      setShowExpenseModal(false)
      setExpenseForm({
        category: '',
        description: '',
        amount: 0,
        payment_method: 'cash',
        vendor_name: '',
        notes: ''
      })
    }
  })

  const totalPayments = payments?.payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const totalExpenses = expenses?.expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Finance</h1>
          <p className="text-gray-600">Manage payments and expenses</p>
        </div>
        <button onClick={() => setShowExpenseModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Received</p>
              <p className="text-2xl font-bold">৳{totalPayments.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-2xl font-bold">৳{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-2xl font-bold ${totalPayments - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ৳{(totalPayments - totalExpenses).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card">
        <div className="flex border-b mb-4">
          {['payments', 'expenses', 'invoices'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-gray-500">Payment #</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Order</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Method</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments?.payments?.map((payment) => (
                  <tr key={payment.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{payment.payment_number}</td>
                    <td className="py-3">#{payment.order_id}</td>
                    <td className="py-3 text-green-600 font-medium">৳{payment.amount?.toLocaleString()}</td>
                    <td className="py-3 capitalize">{payment.payment_method?.replace(/_/g, ' ')}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(payment.payment_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!payments?.payments || payments.payments.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No payments recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-gray-500">Expense #</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Category</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Description</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses?.expenses?.map((expense) => (
                  <tr key={expense.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{expense.expense_number}</td>
                    <td className="py-3 capitalize">{expense.category?.replace(/_/g, ' ')}</td>
                    <td className="py-3">{expense.description}</td>
                    <td className="py-3 text-red-600 font-medium">৳{expense.amount?.toLocaleString()}</td>
                    <td className="py-3 text-sm text-gray-500">
                      {new Date(expense.expense_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!expenses?.expenses || expenses.expenses.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No expenses recorded yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b">
                  <th className="pb-3 text-sm font-medium text-gray-500">Invoice #</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Order</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Paid</th>
                  <th className="pb-3 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices?.invoices?.map((invoice) => (
                  <tr key={invoice.id} className="border-b last:border-0">
                    <td className="py-3 font-medium">{invoice.invoice_number}</td>
                    <td className="py-3">#{invoice.order_id}</td>
                    <td className="py-3 font-medium">৳{invoice.total_amount?.toLocaleString()}</td>
                    <td className="py-3 text-green-600">৳{invoice.paid_amount?.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(!invoices?.invoices || invoices.invoices.length === 0) && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No invoices created yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Expense</h3>
              <button onClick={() => setShowExpenseModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createExpenseMutation.mutate(expenseForm); }} className="space-y-4">
              <div>
                <label className="label">Category</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  className="input"
                  required
                >
                  <option value="">Select category</option>
                  <option value="materials">Materials</option>
                  <option value="utilities">Utilities</option>
                  <option value="rent">Rent</option>
                  <option value="salary">Salary</option>
                  <option value="transport">Transport</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Amount (৳)</label>
                <input
                  type="number"
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })}
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="label">Payment Method</label>
                <select
                  value={expenseForm.payment_method}
                  onChange={(e) => setExpenseForm({ ...expenseForm, payment_method: e.target.value })}
                  className="input"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_banking">Mobile Banking</option>
                </select>
              </div>
              <div>
                <label className="label">Vendor Name</label>
                <input
                  type="text"
                  value={expenseForm.vendor_name}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendor_name: e.target.value })}
                  className="input"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowExpenseModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
