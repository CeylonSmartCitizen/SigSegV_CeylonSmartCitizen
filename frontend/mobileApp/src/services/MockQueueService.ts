// src/services/mockQueueService.ts
import { QueueData } from '../types/queue.types';

class MockQueueService {
  private currentPosition = 5;
  private lastUpdate = new Date();

  async getCurrentQueueStatus(): Promise<QueueData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate position advancement
    if (Date.now() - this.lastUpdate.getTime() > 30000) {
      this.currentPosition = Math.max(1, this.currentPosition - 1);
      this.lastUpdate = new Date();
    }

    return {
      id: 'queue-123',
      currentPosition: this.currentPosition,
      peopleAhead: Math.max(0, this.currentPosition - 1),
      estimatedWaitTime: this.currentPosition * 7, // 7 minutes per person
      tokenNumber: `A-${100 + this.currentPosition}`,
      status: this.currentPosition === 1 ? 'called' : 'waiting',
      lastUpdated: new Date(),
      queueStats: {
        totalServed: 15 - this.currentPosition,
        averageServiceTime: 8,
        totalInQueue: 12,
        currentlyServing: this.currentPosition === 1 ? 1 : 0,
      },
    };
  }

  async joinQueue(serviceId: string): Promise<QueueData> {
    // Simulate joining queue
    this.currentPosition = Math.floor(Math.random() * 10) + 1;
    return this.getCurrentQueueStatus();
  }
}

export const mockQueueService = new MockQueueService();
