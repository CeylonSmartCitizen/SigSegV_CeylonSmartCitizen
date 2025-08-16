import React from 'react'
import ServiceDirectory from './components/ServiceDirectory/ServiceDirectory'
import ErrorBoundary from './components/common/ErrorBoundary'
import { NotificationProvider } from './components/common/NotificationSystem'
import { BookingProvider } from './api/booking.jsx'
import './App.css'
import './components/common/ErrorBoundary.css'
import './components/common/NotificationSystem.css'
import './components/common/LoadingStates.css'

function App() {
  return (

    <div className="App">
      <ErrorBoundary
        componentName="App"
        fallbackMessage="The application encountered an unexpected error. Please refresh the page to continue."
      >
        <NotificationProvider>
          <BookingProvider>
            <ServiceDirectory />
          </BookingProvider>
        </NotificationProvider>
      </ErrorBoundary>

    </div>
  )
}

export default App
