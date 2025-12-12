import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ordersAPI, customersAPI } from '../utils/api'
import { MATERIAL_LABELS, FEE_LABELS } from '../components/WorkflowProgress'
import { Plus, Trash2, ArrowLeft } from 'lucide-react'

export default function NewOrder() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    customer_id: '',
    order_type: 'regular_order',
    work_name: '',
    description: '',
    expected_delivery_date: '',
    special_instructions: '',
    discount: 0,
    design_fee: 0,
    urgency_fee: 0,
    cashing_fee: 0,
    misc_fee: 0,
    items: [{
      product_name: '',
      quantity: 1,
      size: '',
      color: '',
      unit_price: 0,
      plate: 0,
      paper: 0,
      duplicate: 0,
      ink: 0,
      printing: 0,
      binding: 0,
      laminating: 0,
      others: 0
    }]
  })
  const [error, setError] = useState('')
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    contact_person: '',
    phone: '',
    address: ''
  })

  const { data: customersData } = useQuery({
    queryKey: ['customers-list'],
    queryFn: () => customersAPI.list({ per_page: 100 })
  })

  const createOrderMutation = useMutation({
    mutationFn: ordersAPI.create,
    onSuccess: (data) => {
      navigate(`/orders/${data.id}`)
    },
    onError: (err) => {
      setError(err.message)
    }
  })

  const createCustomerMutation = useMutation({
    mutationFn: customersAPI.create,
    onSuccess: (data) => {
      setFormData({ ...formData, customer_id: data.id })
      setShowNewCustomer(false)
      setNewCustomer({ company_name: '', contact_person: '', phone: '', address: '' })
    }
  })

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        product_name: '',
        quantity: 1,
        size: '',
        color: '',
        unit_price: 0,
        plate: 0,
        paper: 0,
        duplicate: 0,
        ink: 0,
        printing: 0,
        binding: 0,
        laminating: 0,
        others: 0
      }]
    })
  }

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const calculateItemMaterialTotal = (item) => {
    return (item.plate || 0) + (item.paper || 0) + (item.duplicate || 0) + (item.ink || 0) +
           (item.printing || 0) + (item.binding || 0) + (item.laminating || 0) + (item.others || 0)
  }

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price)
    }, 0)
  }

  const calculateExtraFees = () => {
    return (formData.design_fee || 0) + (formData.urgency_fee || 0) +
           (formData.cashing_fee || 0) + (formData.misc_fee || 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const extraFees = calculateExtraFees()
    return subtotal + extraFees - (formData.discount || 0)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.customer_id) {
      setError('গ্রাহক নির্বাচন করুন (Please select a customer)')
      return
    }
    if (!formData.work_name) {
      setError('কাজের নাম লিখুন (Please enter work name)')
      return
    }
    createOrderMutation.mutate(formData)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Order (নতুন অর্ডার)</h1>
          <p className="text-gray-600">নতুন অর্ডার তৈরি করুন</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg">{error}</div>
        )}

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Customer Information (গ্রাহকের তথ্য)</h2>
          
          {!showNewCustomer ? (
            <div className="space-y-4">
              <div>
                <label className="label">Select Customer (গ্রাহক নির্বাচন করুন) *</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="input"
                >
                  <option value="">গ্রাহক নির্বাচন করুন...</option>
                  {customersData?.customers?.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company_name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCustomer(true)}
                className="text-primary-600 hover:underline text-sm"
              >
                + নতুন গ্রাহক যোগ করুন (Add New Customer)
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Company/Customer Name (প্রতিষ্ঠান/গ্রাহকের নাম) *</label>
                  <input
                    type="text"
                    value={newCustomer.company_name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
                    className="input"
                    placeholder="প্রতিষ্ঠানের নাম"
                  />
                </div>
                <div>
                  <label className="label">Contact Person (যোগাযোগকারী)</label>
                  <input
                    type="text"
                    value={newCustomer.contact_person}
                    onChange={(e) => setNewCustomer({ ...newCustomer, contact_person: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Phone (ফোন) *</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Address (ঠিকানা)</label>
                  <input
                    type="text"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="input"
                    placeholder="ঠিকানা"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => createCustomerMutation.mutate(newCustomer)}
                  disabled={!newCustomer.company_name || !newCustomer.phone}
                  className="btn-primary disabled:opacity-50"
                >
                  গ্রাহক সংরক্ষণ করুন
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCustomer(false)}
                  className="btn-secondary"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Order Details (অর্ডার বিবরণ)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Order Type (অর্ডার প্রকার)</label>
              <select
                value={formData.order_type}
                onChange={(e) => setFormData({ ...formData, order_type: e.target.value })}
                className="input"
              >
                <option value="regular_order">Regular Order (অর্ডার)</option>
                <option value="pre_order">Pre Order (প্রি-অর্ডার)</option>
              </select>
            </div>
            <div>
              <label className="label">Work Name (কাজের নাম) *</label>
              <input
                type="text"
                value={formData.work_name}
                onChange={(e) => setFormData({ ...formData, work_name: e.target.value })}
                className="input"
                placeholder="যেমন: বিজনেস কার্ড, ব্যানার"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label">Description (বিবরণ)</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input"
                rows={2}
              />
            </div>
            <div>
              <label className="label">Expected Delivery Date (প্রত্যাশিত ডেলিভারি তারিখ)</label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => setFormData({ ...formData, expected_delivery_date: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Special Instructions (বিশেষ নির্দেশনা)</label>
              <input
                type="text"
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Order Items (অর্ডার আইটেম)</h2>
            <button type="button" onClick={handleAddItem} className="btn-secondary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              আইটেম যোগ করুন
            </button>
          </div>
          
          <div className="space-y-6">
            {formData.items.map((item, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Item {index + 1} (আইটেম {index + 1})</span>
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label className="label">Product Name (পণ্যের নাম)</label>
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => handleItemChange(index, 'product_name', e.target.value)}
                      className="input"
                      placeholder="যেমন: বিজনেস কার্ড"
                    />
                  </div>
                  <div>
                    <label className="label">Quantity (পরিমাণ)</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="input"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="label">Size (সাইজ)</label>
                    <input
                      type="text"
                      value={item.size}
                      onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                      className="input"
                      placeholder="যেমন: A4, 3x5"
                    />
                  </div>
                  <div>
                    <label className="label">Color (কালার)</label>
                    <input
                      type="text"
                      value={item.color}
                      onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label">Unit Price (একক মূল্য) ৳</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="input"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="label">Total (মোট)</label>
                    <div className="input bg-gray-100">
                      ৳{(item.quantity * item.unit_price).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Material Costs (উপকরণ খরচ)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(MATERIAL_LABELS).map(([key, label]) => (
                      <div key={key}>
                        <label className="label text-xs">{label.bn} ({label.en})</label>
                        <input
                          type="number"
                          value={item[key] || 0}
                          onChange={(e) => handleItemChange(index, key, parseFloat(e.target.value) || 0)}
                          className="input text-sm"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-right text-sm text-gray-600">
                    Material Total (উপকরণ মোট): ৳{calculateItemMaterialTotal(item).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Extra Fees (অতিরিক্ত ফি)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(FEE_LABELS).map(([key, label]) => (
              <div key={key}>
                <label className="label">{label.bn} ({label.en})</label>
                <input
                  type="number"
                  value={formData[key] || 0}
                  onChange={(e) => setFormData({ ...formData, [key]: parseFloat(e.target.value) || 0 })}
                  className="input"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="flex flex-col items-end space-y-2">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal (উপমোট):</span>
                <span>৳{calculateSubtotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Extra Fees (অতিরিক্ত ফি):</span>
                <span>৳{calculateExtraFees().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discount (ছাড়):</span>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                  className="input w-32 text-right"
                  min="0"
                />
              </div>
              <div className="flex justify-between text-xl font-bold border-t pt-2">
                <span>Total (মোট):</span>
                <span>৳{calculateTotal().toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            বাতিল (Cancel)
          </button>
          <button
            type="submit"
            disabled={createOrderMutation.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {createOrderMutation.isPending ? 'তৈরি হচ্ছে...' : 'অর্ডার তৈরি করুন (Create Order)'}
          </button>
        </div>
      </form>
    </div>
  )
}
