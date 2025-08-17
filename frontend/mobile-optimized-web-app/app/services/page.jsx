"use client";

import { useEffect, useState } from "react";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchServices() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken") || "test";
        const res = await fetch("/api/appointments/services", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.message || "Failed to fetch services");
        setServices(data?.data?.services || []);
      } catch (err) {
        setError(err.message || "Failed to fetch services");
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ maxWidth: 430, margin: "0 auto", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">Services</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 w-full pt-8">
        {loading ? (
          <div className="text-gray-500 text-center py-10">Loading services...</div>
        ) : error ? (
          <div className="text-red-500 text-center py-10">{error}</div>
        ) : services.length === 0 ? (
          <div className="text-gray-500 text-center py-10">No services available.</div>
        ) : (
          <div className="w-full max-w-md mx-auto grid grid-cols-1 gap-5">
            {services.map(service => (
              <div key={service.id} className="bg-white rounded-2xl shadow-md p-5 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
                <div className="text-lg font-semibold text-gray-900 mb-1">{service.name}</div>
                {service.description && <div className="text-gray-600 text-sm mb-2">{service.description}</div>}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  {service.category && <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded">{service.category}</span>}
                  {service.fee && <span className="bg-green-50 text-green-700 px-2 py-1 rounded">Fee: Rs. {service.fee}</span>}
                  {service.duration && <span className="bg-yellow-50 text-yellow-700 px-2 py-1 rounded">Duration: {service.duration} min</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
