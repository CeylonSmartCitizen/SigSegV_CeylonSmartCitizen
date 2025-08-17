"use client";

import { useState, useEffect } from "react";
// Helper to decode JWT and extract payload
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function BookAppointmentPage() {
  const [servicesDebug, setServicesDebug] = useState<any>(null);
  const [departmentsDebug, setDepartmentsDebug] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [serviceId, setServiceId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [departmentsError, setDepartmentsError] = useState("");
  const [citizenId, setCitizenId] = useState<string>("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();


  // Fetch services, departments, and user profile on mount
  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem("accessToken") || "";
    // Decode citizenId from JWT
    if (token) {
      const payload = parseJwt(token);
      if (payload && (payload.id || payload.userId || payload.sub)) {
        setCitizenId(payload.id || payload.userId || payload.sub);
      }
    }
    setLoadingServices(true);
    setLoadingDepartments(true);
    setServicesError("");
    setDepartmentsError("");
    // Fetch services
    fetch("/api/appointments/services", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(async res => {
        let text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (err) {
          setServicesDebug({ error: 'Invalid JSON', status: res.status, statusText: res.statusText, raw: text });
          throw err;
        }
        if (!res.ok) {
          setServicesDebug({ error: 'HTTP error', status: res.status, statusText: res.statusText, body: json, raw: text });
          throw new Error("Failed to fetch services");
        }
        setServicesDebug({ ...json, raw: text });
        let arr = [];
        if (json?.data?.services && Array.isArray(json.data.services)) arr = json.data.services;
        else if (json?.data && Array.isArray(json.data)) arr = json.data;
        else if (Array.isArray(json)) arr = json;
        if (arr.length === 0) {
          setServicesError("No services returned from API. Check backend data.");
        }
        setServices(arr);
      })
      .catch((e) => {
        setServicesError("Could not load services. Please try again.");
        setServicesDebug(prev => ({ ...(prev || {}), error: e?.message || String(e) }));
        console.error('Services API error:', e);
      })
      .finally(() => setLoadingServices(false));
    // Fetch departments
    fetch("/api/appointments/departments", {
      headers: { "Authorization": `Bearer ${token}` }
    })
      .then(async res => {
        let text = await res.text();
        let json = null;
        try {
          json = JSON.parse(text);
        } catch (err) {
          setDepartmentsDebug({ error: 'Invalid JSON', status: res.status, statusText: res.statusText, raw: text });
          throw err;
        }
        if (!res.ok) {
          setDepartmentsDebug({ error: 'HTTP error', status: res.status, statusText: res.statusText, body: json, raw: text });
          throw new Error("Failed to fetch departments");
        }
        setDepartmentsDebug({ ...json, raw: text });
        let arr = [];
        if (json?.data?.departments && Array.isArray(json.data.departments)) arr = json.data.departments;
        else if (json?.data && Array.isArray(json.data)) arr = json.data;
        else if (Array.isArray(json)) arr = json;
        if (arr.length === 0) {
          setDepartmentsError("No departments returned from API. Check backend data.");
        }
        setDepartments(arr);
      })
      .catch((e) => {
        setDepartmentsError("Could not load departments. Please try again.");
        setDepartmentsDebug(prev => ({ ...(prev || {}), error: e?.message || String(e) }));
        console.error('Departments API error:', e);
      })
      .finally(() => setLoadingDepartments(false));
  }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          service_id: serviceId,
          department_id: departmentId,
          citizen_id: citizenId,
          preferred_date: date,
          preferred_time: time,
          notes: description,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to book appointment");
      router.push("/appointments");
    } catch (err) {
      const error = err as Error;
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ maxWidth: 430, margin: "0 auto", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">Book Appointment</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 w-full pt-8">
  {/* ...existing code... */}
        <div className="w-full max-w-md mx-auto bg-white/80 rounded-3xl shadow-xl p-7 mt-6">
          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="serviceId">Service</label>
              <select
                id="serviceId"
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200"
                style={{ color: '#111', background: '#fff', height: 56, fontSize: '1.13rem' }}
                value={serviceId}
                onChange={e => setServiceId(e.target.value)}
                required
              >
                <option value="" disabled hidden style={{ color: '#888' }}>
                  Select a service
                </option>
                {loadingServices ? (
                  <option disabled>Loading services...</option>
                ) : servicesError ? (
                  <option disabled>{servicesError}</option>
                ) : services.length === 0 ? (
                  <option disabled>No services available</option>
                ) : (
                  services.map(s => (
                    <option key={s.id} value={s.id} style={{ color: '#111', background: '#fff' }}>
                      {s.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="departmentId">Department</label>
              <select
                id="departmentId"
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200"
                style={{ color: '#111', background: '#fff', height: 56, fontSize: '1.13rem' }}
                value={departmentId}
                onChange={e => setDepartmentId(e.target.value)}
                required
              >
                <option value="" disabled hidden style={{ color: '#888' }}>
                  Select a department
                </option>
                {loadingDepartments ? (
                  <option disabled>Loading departments...</option>
                ) : departmentsError ? (
                  <option disabled>{departmentsError}</option>
                ) : departments.length === 0 ? (
                  <option disabled>No departments available</option>
                ) : (
                  departments.map(d => (
                    <option key={d.id} value={d.id} style={{ color: '#111', background: '#fff' }}>
                      {d.name}
                    </option>
                  ))
                )}
              </select>
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200"
                  style={{ color: '#111', background: '#fff', height: 56, fontSize: '1.13rem' }}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  placeholder="Date"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="time">Time</label>
                <input
                  id="time"
                  type="time"
                  className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200"
                  style={{ color: '#111', background: '#fff', height: 56, fontSize: '1.13rem' }}
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  required
                  placeholder="Time"
                />
              </div>
            </div>
            <div className="w-full">
              <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="description">Description</label>
              <textarea
                id="description"
                className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200 resize-none"
                style={{ color: '#111', background: '#fff', height: 112, fontSize: '1.13rem' }}
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Reason for appointment (optional)"
              />
            </div>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2" disabled={loading}>{loading ? "Booking..." : "Book Appointment"}</button>
          </form>
        </div>
      </main>
    </div>
  );
}
