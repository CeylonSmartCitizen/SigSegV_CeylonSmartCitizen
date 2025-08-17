// Queue API utility functions for client (citizen) use only
// Clean, type-safe, and ready for integration

import type { QueueStatus, JoinQueueRequest, JoinQueueResponse, ApiError } from './queue.types.ts';

const API_BASE = '/api/appointments/queue';

// Get current queue status for the logged-in user
export async function getQueueStatus(token: string): Promise<QueueStatus> {
  const res = await fetch(API_BASE, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const error: ApiError = await res.json();
    throw new Error(error.message || 'Failed to fetch queue status');
  }
  return res.json();
}

// Join the queue for an appointment/service
export async function joinQueue(token: string, body: JoinQueueRequest): Promise<JoinQueueResponse> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const error: ApiError = await res.json();
    throw new Error(error.message || 'Failed to join queue');
  }
  return res.json();
}
