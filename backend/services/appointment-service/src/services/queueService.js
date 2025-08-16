const queueRepository = require('../repositories/queueRepository');
const appointmentRepository = require('../repositories/appointmentRepository');
const serviceRepository = require('../repositories/serviceRepository');

/**
 * Queue Service - Business logic layer for queue management
 * Handles complex queue operations, integrations, and business rules
 */

class QueueService {
    /**
     * Join queue with full business logic validation
     * @param {Object} data - Join queue request data
     * @param {string} data.appointment_id - UUID of the appointment
     * @param {string} data.user_id - UUID of the user
     * @param {string} data.arrival_time - ISO date string (optional)
     * @returns {Object} Queue entry with position and wait time
     */
    async joinQueue(data) {
        const { appointment_id, user_id, arrival_time } = data;
        
        try {
            // 1. Validate appointment exists and belongs to user
            const appointment = await appointmentRepository.getAppointmentById(appointment_id);
            if (!appointment) {
                throw new Error('APPOINTMENT_NOT_FOUND');
            }
            
            if (appointment.user_id !== user_id) {
                throw new Error('UNAUTHORIZED_APPOINTMENT_ACCESS');
            }
            
            // 2. Check appointment status and date
            if (appointment.status === 'cancelled') {
                throw new Error('APPOINTMENT_CANCELLED');
            }
            
            if (appointment.status === 'completed') {
                throw new Error('APPOINTMENT_ALREADY_COMPLETED');
            }
            
            // 3. Validate appointment is for today
            const today = new Date().toISOString().split('T')[0];
            const appointmentDate = new Date(appointment.appointment_date).toISOString().split('T')[0];
            
            if (appointmentDate !== today) {
                throw new Error('APPOINTMENT_NOT_FOR_TODAY');
            }
            
            // 4. Check if user is already in queue
            const existingQueueEntry = await queueRepository.getUserQueuePosition(user_id, appointment_id);
            if (existingQueueEntry && ['waiting', 'called', 'serving'].includes(existingQueueEntry.status)) {
                throw new Error('ALREADY_IN_QUEUE');
            }
            
            // 5. Get service and department information
            const service = await serviceRepository.getServiceById(appointment.service_id);
            if (!service) {
                throw new Error('SERVICE_NOT_FOUND');
            }
            
            // 6. Get or create queue session
            const queueSession = await queueRepository.getOrCreateQueueSession(
                service.department_id,
                service.id,
                today
            );
            
            // 7. Check queue capacity and business hours
            await this.validateQueueCapacity(queueSession);
            await this.validateBusinessHours(service.department_id);
            
            // 8. Join the queue
            const queueEntry = await queueRepository.joinQueue(queueSession.id, appointment_id);
            
            // 9. Update appointment status
            await appointmentRepository.updateAppointmentStatus(appointment_id, 'confirmed');
            
            // 10. Calculate enhanced wait time
            const enhancedWaitTime = await this.calculateEnhancedWaitTime(
                queueSession.id, 
                queueEntry.position, 
                service.estimated_duration_minutes
            );
            
            // 11. Schedule notifications (if notification service is available)
            await this.scheduleQueueNotifications(user_id, queueEntry, enhancedWaitTime);
            
            return {
                queue_entry_id: queueEntry.id,
                queue_session_id: queueSession.id,
                position: queueEntry.position,
                queue_number: `Q-${String(queueEntry.position).padStart(3, '0')}`,
                estimated_wait_time: enhancedWaitTime,
                status: queueEntry.status,
                joined_at: queueEntry.created_at,
                appointment: {
                    token_number: appointment.token_number,
                    service_name: service.name,
                    department_name: service.department_name
                }
            };
            
        } catch (error) {
            console.error('Error in QueueService.joinQueue:', error);
            throw error;
        }
    }
    
    /**
     * Get comprehensive queue status for user
     * @param {string} user_id - UUID of the user
     * @param {string} appointment_id - UUID of appointment (optional)
     * @returns {Object} Enhanced queue status with predictions
     */
    async getQueueStatus(user_id, appointment_id = null) {
        try {
            // 1. Get user's queue position
            const queuePosition = await queueRepository.getUserQueuePosition(user_id, appointment_id);
            if (!queuePosition) {
                throw new Error('QUEUE_ENTRY_NOT_FOUND');
            }
            
            // 2. Get queue statistics and session details
            const [queueStats, sessionDetails] = await Promise.all([
                queueRepository.getQueueStatistics(queuePosition.queue_session_id),
                queueRepository.getQueueSessionById(queuePosition.queue_session_id)
            ]);
            
            // 3. Calculate enhanced metrics
            const enhancedMetrics = await this.calculateQueueMetrics(queuePosition, queueStats, sessionDetails);
            
            // 4. Get real-time updates
            const realtimeData = await this.getRealtimeQueueData(queuePosition.queue_session_id);
            
            return {
                queue_position: queuePosition.position,
                people_ahead: Math.max(0, queuePosition.people_ahead || 0),
                estimated_wait_time: enhancedMetrics.estimatedWaitTime,
                estimated_call_time: enhancedMetrics.estimatedCallTime,
                current_serving: queuePosition.current_position,
                status: queuePosition.status,
                appointment: {
                    token_number: queuePosition.token_number,
                    service_name: queuePosition.service_name,
                    department_name: queuePosition.department_name
                },
                queue_stats: {
                    total_in_queue: queueStats?.total_in_queue || 0,
                    served_today: queueStats?.total_served || 0,
                    average_service_time: enhancedMetrics.avgServiceTime,
                    waiting_count: queueStats?.waiting_count || 0,
                    serving_count: queueStats?.serving_count || 0,
                    queue_velocity: enhancedMetrics.queueVelocity
                },
                realtime: realtimeData,
                predictions: {
                    likely_call_time_range: enhancedMetrics.callTimeRange,
                    confidence_level: enhancedMetrics.confidence,
                    busy_period: enhancedMetrics.isBusyPeriod
                },
                last_updated: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error in QueueService.getQueueStatus:', error);
            throw error;
        }
    }
    
    /**
     * Advance queue with business logic and notifications
     * @param {string} sessionId - UUID of queue session
     * @param {string} officerId - UUID of officer advancing queue
     * @returns {Object} Advanced queue result with notifications
     */
    async advanceQueue(sessionId, officerId = null) {
        try {
            // 1. Validate session and officer permissions
            const session = await queueRepository.getQueueSessionById(sessionId);
            if (!session) {
                throw new Error('SESSION_NOT_FOUND');
            }
            
            if (session.status !== 'active') {
                throw new Error('SESSION_NOT_ACTIVE');
            }
            
            // 2. Get current person being served and mark as completed
            const currentPerson = await this.getCurrentServingPerson(sessionId, session.current_position);
            if (currentPerson) {
                await queueRepository.updateQueueEntryStatus(currentPerson.id, 'completed');
            }
            
            // 3. Advance the queue
            const result = await queueRepository.advanceQueue(sessionId);
            
            // 4. Update next person status to 'called'
            if (result.next_person) {
                await queueRepository.updateQueueEntryStatus(result.next_person.id, 'called');
                
                // 5. Send notifications to next person
                await this.notifyNextPerson(result.next_person);
                
                // 6. Update wait times for remaining people
                await this.updateWaitTimesForQueue(sessionId);
            }
            
            // 7. Update session statistics
            await this.updateSessionStatistics(sessionId);
            
            return {
                session_id: result.session_id,
                previous_position: session.current_position,
                current_position: result.current_position,
                next_person: result.next_person ? {
                    entry_id: result.next_person.id,
                    token_number: result.next_person.token_number,
                    name: `${result.next_person.first_name} ${result.next_person.last_name}`,
                    position: result.next_person.position,
                    estimated_service_time: session.estimated_duration_minutes || 30
                } : null,
                previous_person_completed: currentPerson ? {
                    token_number: currentPerson.token_number,
                    service_duration: currentPerson.actual_service_time || null
                } : null,
                queue_stats: await queueRepository.getQueueStatistics(sessionId),
                advanced_at: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error in QueueService.advanceQueue:', error);
            throw error;
        }
    }
    
    /**
     * Handle queue entry status changes with business logic
     * @param {string} entryId - UUID of queue entry
     * @param {string} newStatus - New status
     * @param {Object} metadata - Additional metadata
     * @returns {Object} Updated entry with side effects
     */
    async updateQueueEntryStatus(entryId, newStatus, metadata = {}) {
        try {
            // 1. Get current entry details
            const currentEntry = await this.getQueueEntryDetails(entryId);
            if (!currentEntry) {
                throw new Error('QUEUE_ENTRY_NOT_FOUND');
            }
            
            // 2. Validate status transition
            this.validateStatusTransition(currentEntry.status, newStatus);
            
            // 3. Update entry status
            const updatedEntry = await queueRepository.updateQueueEntryStatus(entryId, newStatus);
            
            // 4. Handle status-specific business logic
            await this.handleStatusChangeEffects(updatedEntry, newStatus, metadata);
            
            // 5. Update related records
            await this.updateRelatedRecords(updatedEntry, newStatus);
            
            return {
                entry: updatedEntry,
                effects: await this.getStatusChangeEffects(updatedEntry, newStatus),
                updated_at: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Error in QueueService.updateQueueEntryStatus:', error);
            throw error;
        }
    }
    
    /**
     * Get comprehensive department queue analytics
     * @param {string} departmentId - UUID of department
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Object} Detailed analytics and insights
     */
    async getDepartmentQueueAnalytics(departmentId, date = null) {
        try {
            const targetDate = date || new Date().toISOString().split('T')[0];
            
            // 1. Get all queue sessions for the department
            const sessions = await queueRepository.getActiveQueueSessions(departmentId);
            
            // 2. Calculate comprehensive statistics
            const analytics = await this.calculateDepartmentAnalytics(sessions, targetDate);
            
            // 3. Generate insights and recommendations
            const insights = await this.generateQueueInsights(analytics);
            
            // 4. Get historical trends
            const trends = await this.getHistoricalTrends(departmentId, targetDate);
            
            return {
                department_id: departmentId,
                date: targetDate,
                summary: {
                    total_sessions: sessions.length,
                    total_served: analytics.totalServed,
                    total_waiting: analytics.totalWaiting,
                    average_wait_time: analytics.avgWaitTime,
                    average_service_time: analytics.avgServiceTime,
                    efficiency_score: analytics.efficiencyScore
                },
                service_breakdown: analytics.serviceBreakdown,
                hourly_distribution: analytics.hourlyDistribution,
                insights: insights,
                trends: trends,
                recommendations: await this.generateRecommendations(analytics)
            };
            
        } catch (error) {
            console.error('Error in QueueService.getDepartmentQueueAnalytics:', error);
            throw error;
        }
    }
    
    // Helper methods for business logic
    
    async validateQueueCapacity(queueSession) {
        if (queueSession.max_capacity) {
            const stats = await queueRepository.getQueueStatistics(queueSession.id);
            if (stats && stats.total_in_queue >= queueSession.max_capacity) {
                throw new Error('QUEUE_FULL');
            }
        }
    }
    
    async validateBusinessHours(departmentId) {
        // Implementation would check department working hours
        // For now, assume all hours are valid
        return true;
    }
    
    async calculateEnhancedWaitTime(sessionId, position, estimatedDuration) {
        try {
            const stats = await queueRepository.getQueueStatistics(sessionId);
            const session = await queueRepository.getQueueSessionById(sessionId);
            
            // Use actual average or fall back to estimated
            const avgServiceTime = stats?.actual_avg_service_time || estimatedDuration || 30;
            
            // Account for current position and people ahead
            const peopleAhead = position - session.current_position;
            const baseWaitTime = Math.max(0, peopleAhead) * avgServiceTime;
            
            // Add buffer for real-world variations (10-20%)
            const bufferMultiplier = 1.15;
            
            return Math.round(baseWaitTime * bufferMultiplier);
        } catch (error) {
            console.error('Error calculating enhanced wait time:', error);
            return (position - 1) * 30; // Fallback calculation
        }
    }
    
    async scheduleQueueNotifications(userId, queueEntry, waitTime) {
        try {
            // This would integrate with notification service
            // For now, just log the notification intent
            console.log(`Notification scheduled for user ${userId}: Position ${queueEntry.position}, Wait time: ${waitTime} minutes`);
            
            // Future implementation:
            // - Schedule SMS/email notifications
            // - Set up real-time WebSocket updates
            // - Create push notifications
            
            return true;
        } catch (error) {
            console.error('Error scheduling notifications:', error);
            return false;
        }
    }
    
    async calculateQueueMetrics(queuePosition, queueStats, sessionDetails) {
        const avgServiceTime = queueStats?.actual_avg_service_time || 
                              sessionDetails?.estimated_duration_minutes || 30;
        
        const peopleAhead = Math.max(0, queuePosition.people_ahead || 0);
        const estimatedWaitTime = peopleAhead * avgServiceTime;
        
        const now = new Date();
        const estimatedCallTime = new Date(now.getTime() + estimatedWaitTime * 60000);
        
        // Calculate queue velocity (people served per hour)
        const queueVelocity = avgServiceTime > 0 ? Math.round(60 / avgServiceTime * 10) / 10 : 0;
        
        // Determine if this is a busy period
        const isBusyPeriod = (queueStats?.waiting_count || 0) > 10;
        
        // Calculate confidence level based on historical data
        const confidence = this.calculateConfidenceLevel(queueStats, sessionDetails);
        
        return {
            estimatedWaitTime: Math.round(estimatedWaitTime),
            estimatedCallTime: estimatedCallTime.toISOString(),
            avgServiceTime: Math.round(avgServiceTime),
            queueVelocity,
            isBusyPeriod,
            confidence,
            callTimeRange: {
                earliest: new Date(estimatedCallTime.getTime() - 15 * 60000).toISOString(),
                latest: new Date(estimatedCallTime.getTime() + 15 * 60000).toISOString()
            }
        };
    }
    
    calculateConfidenceLevel(queueStats, sessionDetails) {
        // Base confidence on data availability and consistency
        let confidence = 0.5;
        
        if (queueStats?.total_served > 5) confidence += 0.2;
        if (queueStats?.actual_avg_service_time) confidence += 0.2;
        if (sessionDetails?.average_service_time) confidence += 0.1;
        
        return Math.min(confidence, 1.0);
    }
    
    async getRealtimeQueueData(sessionId) {
        try {
            const stats = await queueRepository.getQueueStatistics(sessionId);
            
            return {
                active_officers: 1, // This would come from officer management
                current_serving_time: await this.getCurrentServingTime(sessionId),
                recent_service_times: await this.getRecentServiceTimes(sessionId),
                queue_momentum: this.calculateQueueMomentum(stats)
            };
        } catch (error) {
            console.error('Error getting realtime queue data:', error);
            return {};
        }
    }
    
    calculateQueueMomentum(stats) {
        // Simple momentum calculation based on serving vs waiting ratio
        const serving = stats?.serving_count || 0;
        const waiting = stats?.waiting_count || 0;
        
        if (waiting === 0) return 'excellent';
        if (serving > 0 && waiting < 5) return 'good';
        if (waiting < 10) return 'moderate';
        return 'slow';
    }
    
    async getCurrentServingPerson(sessionId, currentPosition) {
        try {
            const entries = await queueRepository.getQueueEntries(sessionId, 1, 1);
            return entries.entries.find(entry => 
                entry.position === currentPosition && entry.status === 'serving'
            );
        } catch (error) {
            console.error('Error getting current serving person:', error);
            return null;
        }
    }
    
    async notifyNextPerson(nextPerson) {
        // Integration point for notification service
        console.log(`Calling next person: ${nextPerson.token_number}`);
        return true;
    }
    
    async updateWaitTimesForQueue(sessionId) {
        // Update estimated wait times for all waiting people
        // This would be implemented based on current queue state
        return true;
    }
    
    async updateSessionStatistics(sessionId) {
        // Update running averages and statistics
        // This would calculate real-time service time averages
        return true;
    }
    
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            'waiting': ['called', 'skipped'],
            'called': ['serving', 'skipped'],
            'serving': ['completed'],
            'completed': [], // Terminal state
            'skipped': [] // Terminal state
        };
        
        if (!validTransitions[currentStatus]?.includes(newStatus)) {
            throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }
    }
    
    async getQueueEntryDetails(entryId) {
        try {
            // This would get full entry details - implementing basic version
            return { id: entryId, status: 'waiting' }; // Placeholder
        } catch (error) {
            console.error('Error getting queue entry details:', error);
            return null;
        }
    }
    
    async handleStatusChangeEffects(entry, newStatus, metadata) {
        // Handle side effects of status changes
        switch (newStatus) {
            case 'called':
                await this.notifyUserCalled(entry);
                break;
            case 'serving':
                await this.startServiceTimer(entry);
                break;
            case 'completed':
                await this.recordServiceCompletion(entry, metadata);
                break;
            case 'skipped':
                await this.handleSkippedUser(entry);
                break;
        }
    }
    
    async updateRelatedRecords(entry, newStatus) {
        // Update appointment status based on queue status
        if (newStatus === 'completed') {
            // Update appointment to completed
        }
    }
    
    async getStatusChangeEffects(entry, newStatus) {
        return {
            notifications_sent: true,
            appointment_updated: newStatus === 'completed',
            wait_times_recalculated: ['called', 'serving'].includes(newStatus)
        };
    }
    
    // Placeholder methods for comprehensive functionality
    async notifyUserCalled(entry) { return true; }
    async startServiceTimer(entry) { return true; }
    async recordServiceCompletion(entry, metadata) { return true; }
    async handleSkippedUser(entry) { return true; }
    async getCurrentServingTime(sessionId) { return 0; }
    async getRecentServiceTimes(sessionId) { return []; }
    async calculateDepartmentAnalytics(sessions, date) { return {}; }
    async generateQueueInsights(analytics) { return {}; }
    async getHistoricalTrends(departmentId, date) { return {}; }
    async generateRecommendations(analytics) { return {}; }
}

module.exports = new QueueService();
