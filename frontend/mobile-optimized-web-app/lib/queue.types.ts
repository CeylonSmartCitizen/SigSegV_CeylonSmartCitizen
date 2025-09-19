// TypeScript types for queue management API (client/citizen only)

// Represents the status of the queue for the user
export interface QueueStatus {
  inQueue: boolean;
  position?: number; // User's position in the queue (if in queue)
  estimatedWaitMinutes?: number; // Estimated wait time in minutes
  queueId?: string;
  joinedAt?: string; // ISO date string
  // Add more fields as needed based on backend response
}

// Request body for joining the queue
export interface JoinQueueRequest {
  serviceId: string;
  // departmentId and citizenId are now handled automatically by the backend
}

// Response after joining the queue
export interface JoinQueueResponse {
  success: boolean;
  message: string;
  queueId: string;
  position: number;
  estimatedWaitMinutes: number;
}

// Standard API error response
export interface ApiError {
  success: false;
  message: string;
  code?: string;
  field?: string;
}
