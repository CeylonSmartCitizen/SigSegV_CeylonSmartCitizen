"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ServiceDetailsPage({ params }) {
  const { id } = params;
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function fetchService() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken") || "test";
        const res = await fetch(`/api/appointments/services/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || "Failed to fetch service");
        setService(data?.data || data);
      } catch (err) {
        setError(err.message || "Failed to fetch service");
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchService();
  }, [id]);

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ maxWidth: 430, margin: "0 auto", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-blue-600 font-semibold text-base mb-2">← Back</button>
        <h1 className="text-2xl font-bold text-black tracking-tight mt-2">Service Details</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 w-full pt-8">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading service details...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : !service ? (
          <div className="text-gray-500 text-center py-10">Service not found.</div>
        ) : (
          <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-7 border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-2">{service.name}</div>
            {service.description && <div className="text-gray-700 text-base mb-4">{service.description}</div>}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Department</div>
              <div className="text-base text-black font-medium">{service.department_name || service.department || 'N/A'}</div>
            </div>
            {service.requirements && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Requirements</div>
                <ul className="list-disc pl-5 text-base text-black">
                  {Array.isArray(service.requirements) ? service.requirements.map((req, i) => <li key={i}>{req}</li>) : <li>{service.requirements}</li>}
                </ul>
              </div>
            )}
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-4">
              {service.category && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{service.category}</span>}
              {service.fee && <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Fee: Rs. {service.fee}</span>}
              {service.duration && <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Duration: {service.duration} min</span>}
            </div>
            <button onClick={() => router.push(`/book-appointment?serviceId=${service.id}`)} className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors mt-4">Book Appointment</button>
          </div>
        )}
      </main>
    </div>
  );
}
