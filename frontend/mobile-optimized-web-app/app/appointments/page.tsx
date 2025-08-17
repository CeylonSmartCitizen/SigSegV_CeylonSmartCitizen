"use client";


import Link from "next/link";
import { useEffect, useState } from "react";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  async function fetchAppointments() {
    setLoading(true);
    setError("");
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch("/api/appointments", {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();
      if (res.ok && data.success && data.data && Array.isArray(data.data.appointments)) {
        setAppointments(data.data.appointments);
      } else if (res.ok && Array.isArray(data)) {
        setAppointments(data);
      } else if (res.ok && data.data && Array.isArray(data.data)) {
        setAppointments(data.data);
      } else {
        setError(data.message || "Failed to load appointments");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function handleCancelAppointment(id: string) {
    if (!id) return;
    setCancellingId(id);
    setCancelError("");
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`/api/appointments/appointments/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to cancel appointment');
      }
      // Update UI
      setAppointments(prev => prev.map(a => a.id === id || a._id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel appointment');
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{
        maxWidth: 430,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxSizing: "border-box",
      }}
    >
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">My Appointments</h1>
        <p className="text-gray-500 text-sm mt-1">View and manage your appointments</p>
      </header>
      <main className="flex-1 flex flex-col items-center px-4 w-full">
        <div className="w-full max-w-xs mx-auto mt-6 space-y-4">
          {loading ? (
            <div className="text-center text-gray-400 text-base py-12">Loading appointments...</div>
          ) : error ? (
            <div className="text-center text-red-500 text-base py-12">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-400 text-base py-12">No appointments found.</div>
          ) : (
            appointments.map((appt) => (
              <div key={appt.id || appt._id} className="bg-gray-50 rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold text-black">{appt.service?.name || appt.service || appt.title}</span>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${appt.status === 'scheduled' ? 'bg-green-100 text-green-600' : appt.status === 'cancelled' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'}`}>{appt.status || 'Pending'}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">{appt.service?.department_name || appt.department || appt.departmentName}</div>
                <div className="flex justify-between text-sm text-black mt-2">
                  <span>{appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString() : appt.date || appt.appointmentDate}</span>
                  <span>{appt.appointment_time || appt.time || appt.appointmentTime}</span>
                </div>
                {appt.token_number && (
                  <div className="text-xs text-gray-500 mt-1">Token: {appt.token_number}</div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button 
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setShowModal(true);
                    }}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
                  >
                    View
                  </button>
                  <button
                    onClick={() => {
                      if (appt.status === 'cancelled') return;
                      setPendingCancelId(appt.id || appt._id);
                      setShowCancelModal(true);
                    }}
                    className={`flex-1 bg-white border border-gray-200 text-black py-2 rounded-lg font-medium text-sm hover:bg-gray-50 transition-colors ${appt.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={appt.status === 'cancelled' || cancellingId === (appt.id || appt._id)}
                  >
                    {cancellingId === (appt.id || appt._id) ? 'Cancelling...' : appt.status === 'cancelled' ? 'Cancelled' : 'Cancel'}
                  </button>
      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs mx-auto shadow-2xl p-6">
            <h2 className="text-lg font-bold text-black mb-2 text-center">Cancel Appointment?</h2>
            <p className="text-gray-700 text-center mb-6">Are you sure you want to cancel this appointment? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium text-base hover:bg-gray-200 transition-colors"
                onClick={() => {
                  setShowCancelModal(false);
                  setPendingCancelId(null);
                }}
              >
                No, Go Back
              </button>
              <button
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium text-base hover:bg-red-700 transition-colors"
                onClick={async () => {
                  if (pendingCancelId) {
                    await handleCancelAppointment(pendingCancelId);
                  }
                  setShowCancelModal(false);
                  setPendingCancelId(null);
                }}
                disabled={cancellingId === pendingCancelId}
              >
                {cancellingId === pendingCancelId ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
                </div>
                {cancelError && cancellingId === (appt.id || appt._id) && (
                  <div className="text-xs text-red-500 mt-1 text-center">{cancelError}</div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* Appointment Details Modal */}
      {showModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md mx-auto shadow-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-black">Appointment Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Service</h3>
                  <p className="text-base text-black">{selectedAppointment.service?.name || 'N/A'}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Department</h3>
                  <p className="text-base text-black">{selectedAppointment.service?.department_name || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                    <p className="text-base text-black">
                      {selectedAppointment.appointment_date ? 
                        new Date(selectedAppointment.appointment_date).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                    <p className="text-base text-black">{selectedAppointment.appointment_time || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      selectedAppointment.status === 'scheduled' ? 'bg-green-100 text-green-600' : 
                      selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-600' : 
                      'bg-gray-200 text-gray-500'}`}>
                      {selectedAppointment.status || 'Pending'}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Token</h3>
                    <p className="text-base text-black">{selectedAppointment.token_number || 'N/A'}</p>
                  </div>
                </div>
                
                {selectedAppointment.officer && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Officer</h3>
                    <p className="text-base text-black">{selectedAppointment.officer.name}</p>
                    {selectedAppointment.officer.designation && (
                      <p className="text-sm text-gray-500">{selectedAppointment.officer.designation}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setShowModal(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full text-center py-4 text-xs text-gray-400 bg-white border-t border-gray-100" style={{position:'sticky',bottom:0,left:0,right:0,zIndex:10,maxWidth:430,margin:'0 auto'}}>
        <div className="mb-2">
          <Link href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-base shadow-sm hover:bg-blue-700 transition-colors">Dashboard</Link>
        </div>
        <div>© {new Date().getFullYear()} Ceylon Smart Citizen</div>
      </footer>
    </div>
  );
}
