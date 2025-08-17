"use client";

import { useEffect, useState } from "react";

export default function TrackApplicationPage() {
  const [applicationId, setApplicationId] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleTrack(e) {
    e.preventDefault();
    setStatus(null);
    setError("");
    setLoading(true);
    try {
      // Replace with your real API endpoint for tracking
      const token = localStorage.getItem("accessToken") || "test";
      const res = await fetch(`/api/appointments/track/${applicationId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || data?.message || "Failed to fetch status");
      setStatus(data?.data || data);
    } catch (err) {
      setError(err.message || "Failed to fetch status");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ maxWidth: 430, margin: "0 auto", fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)", boxSizing: "border-box" }}>
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-black tracking-tight">Track Application</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 w-full pt-8">
        <form onSubmit={handleTrack} className="w-full max-w-md mx-auto flex flex-col gap-4 mb-8">
          <label className="block text-base font-semibold text-gray-800 mb-2 tracking-tight" htmlFor="applicationId">Application ID</label>
          <input
            id="applicationId"
            type="text"
            className="w-full bg-white border border-gray-100 rounded-2xl px-5 text-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 placeholder-gray-400 transition-all shadow-sm hover:shadow-md hover:border-blue-200"
            style={{ color: '#111', background: '#fff', height: 56, fontSize: '1.13rem' }}
            value={applicationId}
            onChange={e => setApplicationId(e.target.value)}
            required
            placeholder="Enter your application ID"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-md hover:bg-blue-700 transition-colors disabled:opacity-60 mt-2" disabled={loading || !applicationId.trim()}>{loading ? "Tracking..." : "Track"}</button>
        </form>
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}
        {status && (
          <div className="w-full max-w-md mx-auto bg-blue-50 border border-blue-200 rounded-2xl p-5 text-gray-900">
            <div className="font-semibold text-lg mb-2">Status: {status.status || status.applicationStatus || "Unknown"}</div>
            {status.lastUpdated && <div className="text-xs text-gray-500 mb-1">Last updated: {status.lastUpdated}</div>}
            {status.remarks && <div className="text-sm text-gray-700 mt-2">Remarks: {status.remarks}</div>}
            {/* Add more fields as needed */}
          </div>
        )}
      </main>
    </div>
  );
}
