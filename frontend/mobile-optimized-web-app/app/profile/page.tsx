"use client";

import Link from "next/link";

export default function ProfilePage() {
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
        <h1 className="text-2xl font-bold text-black tracking-tight">Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Your account details</p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 w-full">
        <div className="w-full max-w-xs mx-auto text-center">
          <div className="mb-8">
            <span className="inline-flex w-20 h-20 rounded-full bg-blue-100 items-center justify-center mb-2">
              <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </span>
            <h2 className="text-xl font-semibold text-black">Lehan Navarathne</h2>
            <p className="text-gray-500 text-sm mt-1">lehanxp@gmail.com</p>
          </div>
          <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
            <div className="flex justify-between text-sm text-black"><span>NIC</span><span>200203406745</span></div>
            <div className="flex justify-between text-sm text-black"><span>Phone</span><span>0764891241</span></div>
            <div className="flex justify-between text-sm text-black"><span>Address</span><span>Maligawatta, Maradana</span></div>
            <div className="flex justify-between text-sm text-black"><span>Date of Birth</span><span>1998-03-16</span></div>
            <div className="flex justify-between text-sm text-black"><span>Gender</span><span>Male</span></div>
            <div className="flex justify-between text-sm text-black"><span>Preferred Language</span><span>English</span></div>
          </div>
          <div className="mt-8 space-y-3">
            <Link href="#" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-blue-700 transition-colors" style={{fontSize:18,minHeight:56}}>Edit Profile</Link>
            <Link href="#" className="block w-full bg-white border border-gray-200 text-black py-4 rounded-2xl font-semibold text-lg shadow-sm hover:bg-gray-50 transition-colors" style={{fontSize:18,minHeight:56}}>Logout</Link>
          </div>
        </div>
      </main>
  {/* Footer removed: now handled by global layout */}
    </div>
  );
}
