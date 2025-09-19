"use client";

import { useQueue } from "../appointments/useQueue";
import { QueueStatusCard } from "../appointments/QueueStatusCard";
import { JoinQueueForm } from "../appointments/JoinQueueForm";
import Link from "next/link";
import { useEffect, useRef } from "react";

export default function QueuePage() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') || '' : '';
  const {
    queueStatus,
    loading: queueLoading,
    error: queueError,
    joinResult,
    fetchQueueStatus,
    join,
  } = useQueue(token);

  // Auto-refresh queue status every 30 seconds
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      fetchQueueStatus();
    }, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchQueueStatus]);

  useEffect(() => {
    fetchQueueStatus();
  }, []);

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
        <h1 className="text-2xl font-bold text-black tracking-tight">Queue Management</h1>
        <p className="text-gray-500 text-sm mt-1">View your queue status and join the queue</p>
      </header>
      <main className="flex-1 flex flex-col items-center px-4 w-full">
        <div className="w-full max-w-xs mx-auto mt-6 mb-6 space-y-4 relative">
          {/* Loading overlay for queue actions */}
          {queueLoading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-20 rounded-xl">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <QueueStatusCard
            status={queueStatus}
            loading={queueLoading}
            error={queueError}
            onRefresh={fetchQueueStatus}
          />
          <JoinQueueForm
            onJoin={join}
            loading={queueLoading}
            error={queueError}
          />
          {/* Success message after joining queue */}
          {joinResult && joinResult.success && (
            <div className="text-green-600 text-sm text-center mt-2">{joinResult.message || 'You have joined the queue!'}</div>
          )}
        </div>
      </main>
      <footer className="w-full text-center py-4 text-xs text-gray-400 bg-white border-t border-gray-100" style={{position:'sticky',bottom:0,left:0,right:0,zIndex:10,maxWidth:430,margin:'0 auto'}}>
        <div className="mb-2">
          <Link href="/appointments" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full font-semibold text-base shadow-sm hover:bg-blue-700 transition-colors">Appointments</Link>
        </div>
        <div>© {new Date().getFullYear()} Ceylon Smart Citizen</div>
      </footer>
    </div>
  );
}
