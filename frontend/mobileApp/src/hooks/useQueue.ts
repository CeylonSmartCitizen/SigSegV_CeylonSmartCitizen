// src/hooks/useQueue.ts
import { useState, useEffect, useCallback } from 'react';
import { QueueData } from '../types/queue.types';
import { mockQueueService } from '../services/MockQueueService';

export const useQueue = () => {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQueueData = useCallback(async () => {
    try {
      setError(null);
      const data = await mockQueueService.getCurrentQueueStatus();
      setQueueData(data);
    } catch (err) {
      setError('Failed to fetch queue data');
      console.error('Queue fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const joinQueue = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      const data = await mockQueueService.joinQueue(serviceId);
      setQueueData(data);
      return data;
    } catch (err) {
      setError('Failed to join queue');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueueData();
    
    // Set up real-time updates
    const interval = setInterval(fetchQueueData, 15000);
    return () => clearInterval(interval);
  }, [fetchQueueData]);

  return {
    queueData,
    loading,
    error,
    refetch: fetchQueueData,
    joinQueue,
  };
};
