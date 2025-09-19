"use client";


import Link from "next/link";
import { useEffect, useState } from "react";
import { FiBell } from "react-icons/fi";
import dynamic from "next/dynamic";
const SLGovLogo = dynamic(() => import("../../components/SLGovLogo"), { ssr: false });

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [notifCount, setNotifCount] = useState<number>(0);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    // Fetch notification count
    async function fetchNotifCount() {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) return;
        const profileRes = await fetch("/api/auth/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        const uid = profileData?.data?.user?.id || profileData?.user?.id;
        if (!uid) return;
        const res = await fetch(`/api/support/notifications/user/${uid}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        const notifications = Array.isArray(data) ? data : data.notifications || data.data || [];
        setNotifCount(notifications.filter((n: any) => !n.isRead).length);
      } catch {}
    }
    fetchNotifCount();
    return () => clearTimeout(t);
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white" style={{ maxWidth: 430, margin: '0 auto', fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}>
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="animate-spin rounded-full border-8 border-blue-200 border-t-blue-600" style={{ width: 88, height: 88, borderTopColor: '#2563eb', borderRightColor: '#bfdbfe', borderBottomColor: '#bfdbfe', borderLeftColor: '#bfdbfe' }}></div>
          <div className="text-2xl font-extrabold text-blue-700 tracking-tight">Ceylon Smart Citizen</div>
          <div className="text-blue-500 text-base tracking-wide">Loading dashboard...</div>
        </div>
      </div>
    );
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
      <header className="w-full px-4 pt-6 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black tracking-tight">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome to Ceylon Smart Citizen</p>
        </div>
        <Link href="/notifications" className="relative ml-4" aria-label="Notifications">
          <FiBell className="w-7 h-7 text-blue-600" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold min-w-[20px] text-center border-2 border-white shadow">
              {notifCount}
            </span>
          )}
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start px-4 w-full pt-8">
        {/* Quick Actions Section */}
        <section className="w-full max-w-xs mx-auto mb-8">
          <h2 className="text-lg font-semibold text-black mb-4 text-left">Quick Actions</h2>
          <div className="flex flex-col gap-4">
            <Link href="/book-appointment" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-blue-700 transition-colors text-center" style={{fontSize:18,minHeight:56}}>Book Appointment</Link>
            <Link href="/appointments" className="block w-full bg-white border border-blue-600 text-blue-600 py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-blue-50 transition-colors text-center" style={{fontSize:18,minHeight:56}}>My Bookings</Link>
            <Link href="/track-application" className="block w-full bg-white border border-blue-600 text-blue-600 py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-blue-50 transition-colors text-center" style={{fontSize:18,minHeight:56}}>Track Application</Link>
          </div>
        </section>
        {/* Upcoming Deadlines Section */}
        <section className="w-full max-w-xs mx-auto mb-8">
          <h2 className="text-lg font-semibold text-black mb-4 text-left">Upcoming Deadlines</h2>
          <ul className="space-y-3">
            {/* Placeholder deadlines with red dot */}
            <li className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-3 inline-block"></span>
              <div className="flex flex-col">
                <span className="font-medium text-black">National ID Renewal</span>
                <span className="text-xs text-gray-500 mt-1">Due: 2025-09-10</span>
              </div>
            </li>
            <li className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-3 inline-block"></span>
              <div className="flex flex-col">
                <span className="font-medium text-black">Tax Filing</span>
                <span className="text-xs text-gray-500 mt-1">Due: 2025-09-30</span>
              </div>
            </li>
            <li className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center shadow-sm">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-3 inline-block"></span>
              <div className="flex flex-col">
                <span className="font-medium text-black">Passport Renewal</span>
                <span className="text-xs text-gray-500 mt-1">Due: 2025-10-15</span>
              </div>
            </li>
          </ul>
        </section>
        {/* Government Services Highlight Section */}
        <section className="w-full max-w-xs mx-auto mb-8">
          <h2 className="text-lg font-semibold text-black mb-4 text-left">Government Services Highlight</h2>
          <div className="grid grid-cols-1 gap-4">
            {/* Placeholder service cards */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col shadow-sm">
              <span className="font-semibold text-blue-700 text-base mb-1">e-Civil Registration</span>
              <span className="text-xs text-gray-600 mb-2">Register births, marriages, and deaths online.</span>
              <button className="mt-auto bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Learn More</button>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col shadow-sm">
              <span className="font-semibold text-blue-700 text-base mb-1">Online Bill Payments</span>
              <span className="text-xs text-gray-600 mb-2">Pay your utility and government bills securely.</span>
              <button className="mt-auto bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Learn More</button>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex flex-col shadow-sm">
              <span className="font-semibold text-blue-700 text-base mb-1">Grama Niladhari Services</span>
              <span className="text-xs text-gray-600 mb-2">Request certificates and documents from your local office.</span>
              <button className="mt-auto bg-blue-600 text-white rounded-lg px-3 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">Learn More</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
