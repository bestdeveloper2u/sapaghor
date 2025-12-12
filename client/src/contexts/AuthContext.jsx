import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    try {
      const userData = await authAPI.me()
      setUser(userData)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(credentials) {
    const response = await authAPI.login(credentials)
    setUser(response.user)
    return response
  }

  async function logout() {
    await authAPI.logout()
    setUser(null)
  }

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
