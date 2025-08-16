import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state from localStorage
  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        setIsAuthenticated(true)
        
        // Verify token is still valid
        await verifyToken()
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      }
    }
    setLoading(false)
  }

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/verify')
      if (!response.data.success) {
        logout()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      logout()
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/login', credentials)
      
      if (response.data.success) {
        const { token, user: loggedInUser } = response.data.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(loggedInUser))
        
        setUser(loggedInUser)
        setIsAuthenticated(true)
        
        return { success: true, user: loggedInUser }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        const { token, user: newUser } = response.data.data
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        setUser(newUser)
        setIsAuthenticated(true)
        
        return { success: true, user: newUser }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
    setLoading(false)
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      if (response.data.success) {
        const updatedUser = response.data.data
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        return { success: true, user: updatedUser }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Profile update error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Profile update failed. Please try again.' 
      }
    }
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const changePassword = async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData)
      
      if (response.data.success) {
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Password change error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password change failed. Please try again.' 
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send reset email. Please try again.' 
      }
    }
  }

  const resetPassword = async (resetData) => {
    try {
      const response = await api.post('/auth/reset-password', resetData)
      
      if (response.data.success) {
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Reset password error:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Password reset failed. Please try again.' 
      }
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyToken
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

export default AuthProvider
