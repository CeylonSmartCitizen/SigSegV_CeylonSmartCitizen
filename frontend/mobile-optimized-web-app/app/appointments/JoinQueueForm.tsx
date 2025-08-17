// JoinQueueForm.tsx
// Minimal, modern, iPhone-optimized join queue form for citizens

import React, { useState } from "react";
import type { JoinQueueRequest } from "../../lib/queue.types";

interface JoinQueueFormProps {
  onJoin: (body: JoinQueueRequest) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const JoinQueueForm: React.FC<JoinQueueFormProps> = ({ onJoin, loading, error }) => {
  const [serviceId, setServiceId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [citizenId, setCitizenId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId || !departmentId || !citizenId) return;
    await onJoin({ serviceId, departmentId, citizenId });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-[430px] mx-auto bg-white rounded-xl shadow p-5 mt-4 flex flex-col items-center border border-blue-100">
      <h2 className="text-lg font-semibold text-black mb-2">Join Queue</h2>
      <input
        className="w-full mb-2 px-3 py-2 border border-blue-200 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Service ID"
        value={serviceId}
        onChange={e => setServiceId(e.target.value)}
        required
      />
      <input
        className="w-full mb-2 px-3 py-2 border border-blue-200 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Department ID"
        value={departmentId}
        onChange={e => setDepartmentId(e.target.value)}
        required
      />
      <input
        className="w-full mb-2 px-3 py-2 border border-blue-200 rounded text-black focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Citizen ID"
        value={citizenId}
        onChange={e => setCitizenId(e.target.value)}
        required
      />
      {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
      <button
        type="submit"
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition w-full"
        disabled={loading}
      >
        {loading ? "Joining..." : "Join Queue"}
      </button>
    </form>
  );
};
