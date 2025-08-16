import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { authAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  UserIcon,
  PencilIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const { t, currentLanguage, changeLanguage } = useLanguage()
  const { showToast } = useNotifications()
  
  const [loading, setLoading] = useState(false)
  const [editing, setEditing] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    nic: '',
    language: 'en'
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        nic: user.nic || '',
        language: user.language || currentLanguage
      })
    }
  }, [user, currentLanguage])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+94|0)[0-9]{9}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number'
    }

    if (!formData.nic.trim()) {
      newErrors.nic = 'NIC is required'
    } else {
      const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/
      if (!nicRegex.test(formData.nic)) {
        newErrors.nic = 'Please enter a valid NIC number'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validatePassword = () => {
    const newErrors = {}

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setLoading(true)
      
      const response = await authAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        nic: formData.nic,
        language: formData.language
      })

      if (response.data.success) {
        updateUser(response.data.data.user)
        
        // Update language if changed
        if (formData.language !== currentLanguage) {
          changeLanguage(formData.language)
        }
        
        setEditing(false)
        showToast({
          type: 'success',
          message: 'Profile updated successfully'
        })
      } else {
        showToast({
          type: 'error',
          message: response.data.message || 'Failed to update profile'
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update profile'
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePassword()) return

    try {
      setLoading(true)
      
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.success) {
        setChangingPassword(false)
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        showToast({
          type: 'success',
          message: 'Password changed successfully'
        })
      } else {
        showToast({
          type: 'error',
          message: response.data.message || 'Failed to change password'
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to change password'
      })
    } finally {
      setLoading(false)
    }
  }

  const cancelEdit = () => {
    setEditing(false)
    setErrors({})
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        nic: user.nic || '',
        language: user.language || currentLanguage
      })
    }
  }

  const cancelPasswordChange = () => {
    setChangingPassword(false)
    setErrors({})
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatNIC = (nic) => {
    if (!nic) return ''
    if (nic.length === 10) {
      return `${nic.slice(0, 9)}${nic.slice(9).toUpperCase()}`
    }
    return nic
  }

  const formatPhone = (phone) => {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('94')) {
      return `+94 ${cleaned.slice(2, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
    } else if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    }
    return phone
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('profile.title')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and personal information
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PencilIcon className="w-4 h-4 mr-1" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Profile Picture */}
          <div className="flex items-center mb-6">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-semibold">
              {user ? getInitials(user.firstName, user.lastName) : 'U'}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <button className="mt-1 text-sm text-blue-600 hover:text-blue-500">
                <CameraIcon className="w-4 h-4 inline mr-1" />
                Change photo
              </button>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+94 77 123 4567"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="nic" className="block text-sm font-medium text-gray-700">
                    NIC Number *
                  </label>
                  <input
                    type="text"
                    id="nic"
                    name="nic"
                    value={formData.nic}
                    onChange={handleInputChange}
                    placeholder="123456789V or 199912345678"
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.nic ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.nic && (
                    <p className="mt-1 text-sm text-red-600">{errors.nic}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Preferred Language
                  </label>
                  <select
                    id="language"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="si">සිංහල</option>
                    <option value="ta">தமிழ்</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner size="small" className="mr-2" />
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-1" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <div className="mt-1 flex items-center">
                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{user?.firstName || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <div className="mt-1 flex items-center">
                  <UserIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{user?.lastName || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 flex items-center">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{user?.email || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="mt-1 flex items-center">
                  <DevicePhoneMobileIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{formatPhone(user?.phone) || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                <div className="mt-1 flex items-center">
                  <ShieldCheckIcon className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-900">{formatNIC(user?.nic) || 'Not set'}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Preferred Language</label>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-900">
                    {formData.language === 'en' ? 'English' : 
                     formData.language === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Security Settings</h2>
            {!changingPassword && (
              <button
                onClick={() => setChangingPassword(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ShieldCheckIcon className="w-4 h-4 mr-1" />
                Change Password
              </button>
            )}
          </div>
        </div>

        <div className="p-6">
          {changingPassword ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password *
                </label>
                <div className="mt-1 relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                      errors.currentPassword ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-4 w-4 text-gray-400" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password *
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.newPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={cancelPasswordChange}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="w-4 h-4 inline mr-1" />
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? (
                    <LoadingSpinner size="small" className="mr-2" />
                  ) : (
                    <CheckIcon className="w-4 h-4 mr-1" />
                  )}
                  Change Password
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <div className="mt-1 flex items-center">
                  <span className="text-sm text-gray-900">••••••••••••</span>
                  <span className="ml-2 text-xs text-gray-500">Last changed: Recently</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Keep your account secure by using a strong password and changing it regularly.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
