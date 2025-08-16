import React, { createContext, useContext, useState, useEffect } from 'react'
import { appointmentAPI } from '../services/api'

const BookingContext = createContext()

export function BookingProvider({ children }) {
  const [appointments, setAppointments] = useState([])
  const [services, setServices] = useState([])
  const [departments, setDepartments] = useState([])
  const [officers, setOfficers] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState({
    serviceId: null,
    date: null,
    time: null,
    notes: '',
    department: null,
    officer: null
  })

  // Fetch initial data
  useEffect(() => {
    fetchServices()
    fetchDepartments()
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const response = await appointmentAPI.getAppointments()
      if (response.data.success) {
        setAppointments(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async () => {
    try {
      const response = await appointmentAPI.getServices()
      if (response.data.success) {
        setServices(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchDepartments = async () => {
    try {
      const response = await appointmentAPI.getDepartments()
      if (response.data.success) {
        setDepartments(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching departments:', error)
    }
  }

  const fetchOfficers = async (departmentId) => {
    try {
      const response = await appointmentAPI.getOfficers(departmentId)
      if (response.data.success) {
        setOfficers(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching officers:', error)
    }
  }

  const getAvailableSlots = async (serviceId, date) => {
    try {
      const response = await appointmentAPI.getAvailableSlots(serviceId, date)
      if (response.data.success) {
        return response.data.data
      }
      return []
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return []
    }
  }

  const createAppointment = async (appointmentData) => {
    try {
      setLoading(true)
      const response = await appointmentAPI.createAppointment(appointmentData)
      
      if (response.data.success) {
        const newAppointment = response.data.data
        setAppointments(prev => [newAppointment, ...prev])
        
        // Clear booking data
        setBookingData({
          serviceId: null,
          date: null,
          time: null,
          notes: '',
          department: null,
          officer: null
        })
        
        return { success: true, appointment: newAppointment }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create appointment' 
      }
    } finally {
      setLoading(false)
    }
  }

  const updateAppointment = async (appointmentId, updateData) => {
    try {
      setLoading(true)
      const response = await appointmentAPI.updateAppointment(appointmentId, updateData)
      
      if (response.data.success) {
        const updatedAppointment = response.data.data
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId ? updatedAppointment : apt
          )
        )
        
        return { success: true, appointment: updatedAppointment }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update appointment' 
      }
    } finally {
      setLoading(false)
    }
  }

  const cancelAppointment = async (appointmentId) => {
    try {
      setLoading(true)
      const response = await appointmentAPI.updateAppointment(appointmentId, { 
        status: 'cancelled' 
      })
      
      if (response.data.success) {
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'cancelled' } 
              : apt
          )
        )
        
        return { success: true }
      } else {
        return { success: false, error: response.data.message }
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to cancel appointment' 
      }
    } finally {
      setLoading(false)
    }
  }

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }))
  }

  const clearBookingData = () => {
    setBookingData({
      serviceId: null,
      date: null,
      time: null,
      notes: '',
      department: null,
      officer: null
    })
  }

  const getServiceById = (serviceId) => {
    return services.find(service => service.id === serviceId)
  }

  const getDepartmentById = (departmentId) => {
    return departments.find(dept => dept.id === departmentId)
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments.filter(apt => 
      apt.status === 'scheduled' && new Date(apt.date) >= now
    ).sort((a, b) => new Date(a.date) - new Date(b.date))
  }

  const getAppointmentHistory = () => {
    return appointments.filter(apt => 
      apt.status === 'completed' || apt.status === 'cancelled'
    ).sort((a, b) => new Date(b.date) - new Date(a.date))
  }

  const value = {
    appointments,
    services,
    departments,
    officers,
    loading,
    bookingData,
    fetchAppointments,
    fetchServices,
    fetchDepartments,
    fetchOfficers,
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    updateBookingData,
    clearBookingData,
    getServiceById,
    getDepartmentById,
    getUpcomingAppointments,
    getAppointmentHistory
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
