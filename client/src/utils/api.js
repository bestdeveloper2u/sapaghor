const API_BASE = '/api'

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include'
  })
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new Error(error.error || 'Request failed')
  }
  
  return response.json()
}

export const api = {
  get: (endpoint) => fetchAPI(endpoint),
  post: (endpoint, data) => fetchAPI(endpoint, { method: 'POST', body: JSON.stringify(data) }),
  put: (endpoint, data) => fetchAPI(endpoint, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (endpoint) => fetchAPI(endpoint, { method: 'DELETE' })
}

export const STATUS_LABELS = {
  order: { en: 'Order', bn: 'অর্ডার' },
  design_sent: { en: 'Design Sent', bn: 'ডিজাইনে প্রেরণ' },
  proof_given: { en: 'Proof Given', bn: 'প্রুফ প্রদান' },
  proof_complete: { en: 'Proof Complete', bn: 'প্রুফ সম্পন্ন' },
  plate_setting: { en: 'Plate Setting', bn: 'প্লেট সেটিং এ প্রেরণ' },
  printing_complete: { en: 'Printing Complete', bn: 'ছাপা সম্পন্ন' },
  binding_sent: { en: 'Binding Sent', bn: 'বাইন্ডিং এ প্রেরণ' },
  order_ready: { en: 'Order Ready', bn: 'অর্ডার সম্পন্ন ও প্রস্তুত' },
  delivered: { en: 'Delivered', bn: 'ডেলিভারী প্রদান' },
  cancelled: { en: 'Cancelled', bn: 'বাতিল' }
}

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  register: (data) => api.post('/auth/register', data)
}

export const customersAPI = {
  list: (params = {}) => api.get(`/customers?${new URLSearchParams(params)}`),
  get: (id) => api.get(`/customers/${id}`),
  create: (data) => api.post('/customers', data),
  update: (id, data) => api.put(`/customers/${id}`, data),
  delete: (id) => api.delete(`/customers/${id}`)
}

export const ordersAPI = {
  list: (params = {}) => api.get(`/orders?${new URLSearchParams(params)}`),
  get: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getHistory: (id) => api.get(`/orders/${id}/history`),
  getStatuses: () => api.get('/order-statuses'),
  getStatusLabels: () => Promise.resolve(STATUS_LABELS)
}

export const designAPI = {
  listTasks: (params = {}) => api.get(`/design-tasks?${new URLSearchParams(params)}`),
  getTask: (id) => api.get(`/design-tasks/${id}`),
  createTask: (data) => api.post('/design-tasks', data),
  updateTask: (id, data) => api.put(`/design-tasks/${id}`, data),
  createProof: (id, data) => api.post(`/design-tasks/${id}/proofs`, data),
  reviewProof: (id, data) => api.put(`/design-proofs/${id}/review`, data),
  getDesigners: () => api.get('/designers')
}

export const productionAPI = {
  listTasks: (params = {}) => api.get(`/production-tasks?${new URLSearchParams(params)}`),
  getTask: (id) => api.get(`/production-tasks/${id}`),
  createTask: (data) => api.post('/production-tasks', data),
  updateTask: (id, data) => api.put(`/production-tasks/${id}`, data),
  getEquipment: () => api.get('/equipment'),
  getTypes: () => api.get('/production-types')
}

export const deliveryAPI = {
  list: (params = {}) => api.get(`/deliveries?${new URLSearchParams(params)}`),
  get: (id) => api.get(`/deliveries/${id}`),
  create: (data) => api.post('/deliveries', data),
  update: (id, data) => api.put(`/deliveries/${id}`, data),
  getPersonnel: () => api.get('/delivery-personnel')
}

export const financeAPI = {
  listInvoices: (params = {}) => api.get(`/invoices?${new URLSearchParams(params)}`),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  sendInvoice: (id) => api.post(`/invoices/${id}/send`),
  listPayments: (params = {}) => api.get(`/payments?${new URLSearchParams(params)}`),
  createPayment: (data) => api.post('/payments', data),
  listExpenses: (params = {}) => api.get(`/expenses?${new URLSearchParams(params)}`),
  createExpense: (data) => api.post('/expenses', data),
  getExpenseCategories: () => api.get('/expense-categories'),
  getPaymentMethods: () => api.get('/payment-methods')
}

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getOrdersByStatus: () => api.get('/dashboard/orders-by-status'),
  getRecentOrders: () => api.get('/dashboard/recent-orders'),
  getPendingDeliveries: () => api.get('/dashboard/pending-deliveries'),
  getRevenueTrend: () => api.get('/dashboard/revenue-trend')
}

export const usersAPI = {
  list: (params = {}) => api.get(`/users?${new URLSearchParams(params)}`),
  get: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  getRoles: () => api.get('/roles')
}
