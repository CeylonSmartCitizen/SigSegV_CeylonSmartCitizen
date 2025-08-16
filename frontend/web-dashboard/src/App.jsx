import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { BookingProvider } from './contexts/BookingContext'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import Layout from './components/Layout/Layout'
import LoginPage from './components/Auth/LoginPage'
import RegisterPage from './components/Auth/RegisterPage'
import ForgotPasswordPage from './components/Auth/ForgotPasswordPage'
import Dashboard from './components/Dashboard/Dashboard'
import ServiceDirectory from './components/ServiceDirectory/ServiceDirectory'
import ServiceDetails from './components/ServiceDirectory/ServiceDetails'
import AppointmentBooking from './components/Booking/AppointmentBooking'
import MyAppointments from './components/Booking/MyAppointments'
import QueueManagement from './components/Queue/QueueManagement'
import QueueStatus from './components/Queue/QueueStatus'
import DocumentUpload from './components/Documents/DocumentUpload'
import DocumentList from './components/Documents/DocumentList'
import Profile from './components/Profile/Profile'
import NotificationCenter from './components/Notifications/NotificationCenter'
import ErrorBoundary from './components/common/ErrorBoundary'
import './App.css'

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <LanguageProvider>
          <AuthProvider>
            <NotificationProvider>
              <BookingProvider>
                <div className="App min-h-screen bg-gray-50">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout>
                          <Dashboard />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/services" element={
                      <ProtectedRoute>
                        <Layout>
                          <ServiceDirectory />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/services/:serviceId" element={
                      <ProtectedRoute>
                        <Layout>
                          <ServiceDetails />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/book/:serviceId?" element={
                      <ProtectedRoute>
                        <Layout>
                          <AppointmentBooking />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/appointments" element={
                      <ProtectedRoute>
                        <Layout>
                          <MyAppointments />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/queue" element={
                      <ProtectedRoute>
                        <Layout>
                          <QueueManagement />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/queue/:queueId" element={
                      <ProtectedRoute>
                        <Layout>
                          <QueueStatus />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/documents" element={
                      <ProtectedRoute>
                        <Layout>
                          <DocumentList />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/documents/upload" element={
                      <ProtectedRoute>
                        <Layout>
                          <DocumentUpload />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <Layout>
                          <Profile />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    <Route path="/notifications" element={
                      <ProtectedRoute>
                        <Layout>
                          <NotificationCenter />
                        </Layout>
                      </ProtectedRoute>
                    } />
                    
                    {/* Redirect to dashboard by default */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </BookingProvider>
            </NotificationProvider>
          </AuthProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </Router>
  )
}

export default App
