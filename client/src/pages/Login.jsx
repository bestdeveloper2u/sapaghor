import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Eye, EyeOff, LogIn, Moon, Sun } from 'lucide-react'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
      <div className={isDark ? 'bg-gradient-dark' : 'bg-gradient-light'}>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all ${
                isDark ? 'bg-dark-700/50 text-yellow-300 hover:bg-dark-600/70' : 'bg-white/20 text-gray-900 hover:bg-white/30'
              }`}
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>
          </div>

          <div className="w-full max-w-md">
            <div className={`glass p-8 rounded-3xl shadow-glass-lg ${isDark ? 'dark' : ''}`}>
              <div className="text-center mb-8">
                <div className={`inline-block p-4 rounded-full mb-4 ${isDark ? 'bg-secondary-600/30' : 'bg-primary-100'}`}>
                  <LogIn className={`w-8 h-8 ${isDark ? 'text-secondary-400' : 'text-primary-600'}`} />
                </div>
                <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>সাপাঘর ERP</h1>
                <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Printing & Design Business Management</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={`label ${isDark ? 'dark' : ''}`}>Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className={`input ${isDark ? 'dark' : ''}`}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className={`label ${isDark ? 'dark' : ''}`}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className={`input ${isDark ? 'dark' : ''}`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className={`p-3 rounded-xl text-sm ${isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'}`}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Logging in...' : 'Sign In'}
                </button>
              </form>

              <div className={`mt-6 p-4 rounded-xl text-sm text-center ${isDark ? 'bg-dark-700/50' : 'bg-white/30'}`}>
                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Demo Credentials</p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-700'}>Username: <span className="font-mono">admin</span></p>
                <p className={isDark ? 'text-gray-400' : 'text-gray-700'}>Password: <span className="font-mono">admin123</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
