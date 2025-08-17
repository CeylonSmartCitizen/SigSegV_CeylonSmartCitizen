// JoinQueueForm.tsx
// Minimal, modern, iPhone-optimized join queue form for citizens

import React, { useState, useEffect } from "react";
import type { JoinQueueRequest } from "../../lib/queue.types";

interface JoinQueueFormProps {
  onJoin: (body: JoinQueueRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

interface Service {
  id: string;
  name: string;
  department_name: string;
  estimated_duration_minutes: number;
  fee_amount: number;
}

export const JoinQueueForm: React.FC<JoinQueueFormProps> = ({ onJoin, loading, error }) => {
  const [serviceId, setServiceId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Fetch available services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        const response = await fetch('/api/appointments/services', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        const data = await response.json();
        
        if (response.ok && data.success && data.data && data.data.services) {
          setServices(data.data.services);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    await onJoin({ serviceId });
  };

  const selectedService = services.find(s => s.id === serviceId);

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto bg-white rounded-xl shadow p-5 mt-4 flex flex-col items-center border border-blue-100">
      <h2 className="text-lg font-semibold text-black mb-3">Join Queue</h2>
      
      {loadingServices ? (
        <div className="text-gray-500 text-sm mb-4">Loading services...</div>
      ) : (
        <select
          className="w-full mb-3 px-3 py-3 border border-blue-200 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          value={serviceId}
          onChange={e => setServiceId(e.target.value)}
          required
        >
          <option value="">Select a service</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - {service.department_name}
            </option>
          ))}
        </select>
      )}

      {selectedService && (
        <div className="w-full mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm text-gray-700">
            <div><strong>Department:</strong> {selectedService.department_name}</div>
            <div><strong>Duration:</strong> ~{selectedService.estimated_duration_minutes} minutes</div>
            <div><strong>Fee:</strong> LKR {selectedService.fee_amount}</div>
          </div>
        </div>
      )}

      {error && <div className="text-red-500 text-sm mb-3 text-center">{error}</div>}
      
      <button
        type="submit"
        className="mt-2 px-4 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full disabled:opacity-50"
        disabled={loading || loadingServices || !serviceId}
      >
        {loading ? "Joining..." : "Join Queue"}
      </button>
    </form>
  );
};
