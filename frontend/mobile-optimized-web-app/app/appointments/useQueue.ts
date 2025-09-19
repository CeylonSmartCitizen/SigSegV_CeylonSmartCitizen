// React hook for queue management state (client/citizen only)
// Clean, minimal, and ready for iPhone-sized UI integration

import { useState, useCallback } from 'react';
import type { QueueStatus, JoinQueueRequest, JoinQueueResponse } from '../../lib/queue.types';
import { getQueueStatus, joinQueue } from '../../lib/queue.api';

export function useQueue(token: string) {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinResult, setJoinResult] = useState<JoinQueueResponse | null>(null);

  // Fetch current queue status
  const fetchQueueStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const status = await getQueueStatus(token);
      setQueueStatus(status);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Join the queue
  const join = useCallback(async (body: JoinQueueRequest) => {
    setLoading(true);
    setError(null);
    try {
      const result = await joinQueue(token, body);
      setJoinResult(result);
      // Optionally refresh status after joining
      await fetchQueueStatus();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, fetchQueueStatus]);

  return {
    queueStatus,
    loading,
    error,
    joinResult,
    fetchQueueStatus,
    join,
  };
}
