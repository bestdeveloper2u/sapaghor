import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customersAPI } from '../utils/api'
import { Plus, Search, Edit, X } from 'lucide-react'

export default function Customers() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState(null)
  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    alternate_phone: '',
    address: '',
    city: '',
    district: '',
    category: '',
    credit_limit: 0,
    notes: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn: () => customersAPI.list({ search, page, per_page: 20 })
  })

  const createMutation = useMutation({
    mutationFn: customersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['customers'])
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['customers'])
      resetForm()
    }
  })

  const resetForm = () => {
    setShowModal(false)
    setEditingCustomer(null)
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      alternate_phone: '',
      address: '',
      city: '',
      district: '',
      category: '',
      credit_limit: 0,
      notes: ''
    })
  }

  const handleEdit = (customer) => {
    setEditingCustomer(customer)
    setFormData({
      company_name: customer.company_name || '',
      contact_person: customer.contact_person || '',
      email: customer.email || '',
      phone: customer.phone || '',
      alternate_phone: customer.alternate_phone || '',
      address: customer.address || '',
      city: customer.city || '',
      district: customer.district || '',
      category: customer.category || '',
      credit_limit: customer.credit_limit || 0,
      notes: customer.notes || ''
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingCustomer) {
      updateMutation.mutate({ id: editingCustomer.id, data: formData })
    } else {
      createMutation.mutate(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-600">Manage your customer database</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Customers Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Outstanding</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.customers?.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{customer.company_name}</td>
                    <td className="px-6 py-4">{customer.contact_person || '-'}</td>
                    <td className="px-6 py-4">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{customer.address || '-'}</td>
                    <td className="px-6 py-4">{customer.total_orders || 0}</td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      ৳{customer.outstanding_balance?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {(!data?.customers || data.customers.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company/Customer Name *</label>
                  <input
                    type="text"
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone *</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Alternate Phone</label>
                  <input
                    type="text"
                    value={formData.alternate_phone}
                    onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="">Select category</option>
                    <option value="regular">Regular</option>
                    <option value="vip">VIP</option>
                    <option value="corporate">Corporate</option>
                    <option value="retail">Retail</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label">Address (ঠিকানা)</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">District</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Credit Limit</label>
                  <input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) })}
                    className="input"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="input"
                    rows={2}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingCustomer ? 'Update' : 'Create'} Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
