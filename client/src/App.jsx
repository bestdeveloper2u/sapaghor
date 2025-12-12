import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import OrderDetails from './pages/OrderDetails'
import NewOrder from './pages/NewOrder'
import Customers from './pages/Customers'
import Design from './pages/Design'
import Production from './pages/Production'
import Delivery from './pages/Delivery'
import Finance from './pages/Finance'
import Users from './pages/Users'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/new" element={<NewOrder />} />
        <Route path="orders/:id" element={<OrderDetails />} />
        <Route path="customers" element={<Customers />} />
        <Route path="design" element={<Design />} />
        <Route path="production" element={<Production />} />
        <Route path="delivery" element={<Delivery />} />
        <Route path="finance" element={<Finance />} />
        <Route path="users" element={<Users />} />
      </Route>
    </Routes>
  )
}
