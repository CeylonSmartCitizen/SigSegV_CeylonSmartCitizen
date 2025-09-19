// QueueStatusCard.tsx
// Minimal, modern, iPhone-optimized queue status display for citizens

import React from "react";
import type { QueueStatus } from "../../lib/queue.types";

interface QueueStatusCardProps {
  status: QueueStatus | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export const QueueStatusCard: React.FC<QueueStatusCardProps> = ({ status, loading, error, onRefresh }) => {
  return (
    <div className="w-full max-w-[430px] mx-auto bg-white rounded-xl shadow p-5 flex flex-col items-center border border-blue-100">
      <h2 className="text-lg font-semibold text-black mb-2">Queue Status</h2>
      {loading ? (
        <div className="text-blue-600">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-sm mb-2">{error}</div>
      ) : status ? (
        status.inQueue ? (
          <>
            <div className="text-blue-700 text-2xl font-bold mb-1">#{status.position}</div>
            <div className="text-black text-sm mb-2">You are in the queue</div>
            <div className="text-blue-500 text-xs mb-2">Estimated wait: {status.estimatedWaitMinutes ?? '--'} min</div>
            <div className="text-gray-400 text-xs mb-2">Joined: {status.joinedAt ? new Date(status.joinedAt).toLocaleTimeString() : '--'}</div>
          </>
        ) : (
          <div className="text-black text-sm">You are not in the queue.</div>
        )
      ) : (
        <div className="text-black text-sm">No queue data.</div>
      )}
      <button
        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
        onClick={onRefresh}
        disabled={loading}
      >
        Refresh
      </button>
    </div>
  );
};
