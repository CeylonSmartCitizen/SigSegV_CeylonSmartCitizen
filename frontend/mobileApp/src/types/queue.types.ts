// src/types/queue.types.ts
export interface QueueData {
  id: string;
  currentPosition: number;
  peopleAhead: number;
  estimatedWaitTime: number;
  tokenNumber: string;
  status: 'waiting' | 'called' | 'serving' | 'completed' | 'cancelled';
  lastUpdated: Date;
  queueStats: QueueStats;
}

export interface QueueStats {
  totalServed: number;
  averageServiceTime: number;
  totalInQueue: number;
  currentlyServing: number;
}

export interface DocumentData {
  id: string;
  type: string;
  originalImage: any;
  extractedText?: string;
  confidence?: number;
  status: 'pending' | 'processing' | 'processed' | 'failed';
  processedAt?: Date;
  createdAt: Date;
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'queue_update' | 'document_status' | 'appointment' | 'system';
  read: boolean;
  createdAt: Date;
  actionRequired?: boolean;
  metadata?: any;
}
