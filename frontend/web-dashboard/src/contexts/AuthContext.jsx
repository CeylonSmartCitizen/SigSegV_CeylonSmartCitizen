import React, { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setIsAuthenticated(true)
        
        // Verify token is still valid
        verifyToken()
      } catch (error) {
        console.error('Error parsing user data:', error)
        logout()
      }
    }
    
    setLoading(false)
  }, [])

  const verifyToken = async () => {
    try {
      const response = await api.get('/auth/profile')
      if (response.data.success) {
        setUser(response.data.data)
        setIsAuthenticated(true)
      } else {
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
        const { token, user: userData } = response.data.data
        
        // Store auth data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Update state
        setUser(userData)
        setIsAuthenticated(true)
        
        return { success: true, user: userData }
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
        
        // Store auth data
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        // Update state
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

  const logout = async () => {
    try {
      // Call logout endpoint to invalidate token on server
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData)
      
      if (response.data.success) {
        const updatedUser = response.data.data
        setUser(updatedUser)
        localStorage.setItem('user', JSON.stringify(updatedUser))
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
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
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

// Export the useAuth hook
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthProvider
