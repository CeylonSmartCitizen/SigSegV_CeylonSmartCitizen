
"use client";
import React, { useEffect, useState } from "react";

type Notification = {
  id: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
  type?: string;
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const [markingId, setMarkingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [selected, setSelected] = useState<Notification | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");

  useEffect(() => {
    async function fetchNotifications() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          setError("Not authenticated. Please log in.");
          setLoading(false);
          return;
        }
        // Get userId from profile endpoint
        const profileRes = await fetch("/api/auth/profile", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const profileData = await profileRes.json();
        const uid = profileData?.data?.user?.id || profileData?.user?.id;
        if (!uid) {
          setError("Could not determine user ID.");
          setLoading(false);
          return;
        }
        setUserId(uid);
        // Fetch notifications for user
        const res = await fetch(`/api/support/notifications/user/${uid}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || "Failed to fetch notifications");
        }
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : data.notifications || data.data || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    }
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    if (!id) return;
    setMarkingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`/api/support/notifications/${id}/read`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
    setMarkingId("");
  };

  const markAllAsRead = async () => {
    if (!userId) return;
    setMarkingAll(true);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`/api/support/notifications/user/${userId}/read-all`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {}
    setMarkingAll(false);
  };

  const deleteNotification = async (id: string) => {
    if (!id) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem("accessToken");
      await fetch(`/api/support/notifications/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
    setDeletingId("");
  };

  const openDetail = async (id: string) => {
    setDetailError("");
    setDetailLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`/api/support/notifications/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to fetch notification");
      }
      const data = await res.json();
      setSelected(data);
    } catch (err: any) {
      setDetailError(err.message || "Failed to fetch notification");
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetailError("");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-white px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Notifications</h1>
      {loading ? (
        <div className="text-gray-400 py-10">Loading notifications...</div>
      ) : error ? (
        <div className="text-red-500 py-10">{error}</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500 py-10">No notifications found.</div>
      ) : (
        <>
          <button
            className="mb-4 px-5 py-2 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition disabled:opacity-60"
            onClick={markAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? "Marking all as read..." : "Mark all as read"}
          </button>
          <div className="w-full max-w-md mx-auto flex flex-col gap-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl border p-4 shadow-sm flex flex-col gap-1 ${n.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => openDetail(n.id)}
              >
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  {n.title || 'Notification'}
                  {!n.isRead && <span className="ml-2 inline-block w-2 h-2 rounded-full bg-blue-500" title="Unread" />}
                </div>
                <div className="text-gray-700 text-sm">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}</div>
                <div className="flex gap-2 mt-2">
                  {!n.isRead && (
                    <button
                      className="px-4 py-1 rounded bg-blue-500 text-white text-xs font-medium hover:bg-blue-600 transition disabled:opacity-60"
                      onClick={e => { e.stopPropagation(); markAsRead(n.id); }}
                      disabled={markingId === n.id}
                    >
                      {markingId === n.id ? "Marking..." : "Mark as read"}
                    </button>
                  )}
                  <button
                    className="px-4 py-1 rounded bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition disabled:opacity-60"
                    onClick={e => { e.stopPropagation(); deleteNotification(n.id); }}
                    disabled={deletingId === n.id}
                  >
                    {deletingId === n.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Notification Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative flex flex-col">
            <button
              onClick={closeDetail}
              className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl leading-none"
              style={{ lineHeight: 1 }}
            >×</button>
            {detailLoading ? (
              <div className="text-gray-400 py-10">Loading...</div>
            ) : detailError ? (
              <div className="text-red-500 py-10">{detailError}</div>
            ) : (
              <>
                <div className="text-xl font-bold text-gray-900 mb-2">{selected.title || 'Notification'}</div>
                <div className="text-gray-700 mb-4">{selected.message}</div>
                <div className="text-xs text-gray-400 mb-2">{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}</div>
                <div className="text-xs text-gray-500">Type: {selected.type || 'info'}</div>
                {selected.isRead ? null : <div className="text-xs text-blue-600 mt-2">Unread</div>}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
