import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersAPI } from '../utils/api'
import { Plus, Edit, X } from 'lucide-react'

export default function Users() {
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    phone: '',
    password: '',
    role_id: '',
    department: ''
  })

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersAPI.list()
  })

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: usersAPI.getRoles
  })

  const createMutation = useMutation({
    mutationFn: usersAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
      resetForm()
    }
  })

  const resetForm = () => {
    setShowModal(false)
    setEditingUser(null)
    setFormData({
      username: '',
      email: '',
      full_name: '',
      phone: '',
      password: '',
      role_id: '',
      department: ''
    })
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      full_name: user.full_name || '',
      phone: user.phone || '',
      password: '',
      role_id: user.role?.id || '',
      department: user.department || ''
    })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const submitData = { ...formData }
    if (!submitData.password) delete submitData.password
    
    if (editingUser) {
      updateMutation.mutate({ id: editingUser.id, data: submitData })
    } else {
      createMutation.mutate(submitData)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users & Roles</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary inline-flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Users Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data?.users?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-medium">
                            {user.full_name?.[0] || user.username?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || user.username}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {user.role?.name || 'No role'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{user.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-primary-600 hover:text-primary-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={resetForm}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="input"
                  required
                  disabled={!!editingUser}
                />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
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
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="label">{editingUser ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="input"
                  required={!editingUser}
                />
              </div>
              <div>
                <label className="label">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="input"
                >
                  <option value="">Select role</option>
                  {roles?.map((role) => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="input"
                >
                  <option value="">Select department</option>
                  <option value="Design">Design</option>
                  <option value="Production">Production</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Management">Management</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingUser ? 'Update' : 'Create'} User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
