const queueRepository = require('../repositories/queueRepository');
const queueService = require('../services/queueService');
const { v4: uuidv4, validate: isValidUUID } = require('uuid');

/**
 * Queue Controller - Handles HTTP requests for queue management
 * Endpoints: /api/queue/*
 */

class QueueController {
    /**
     * GET /api/queue/status
     * Get user's current queue position and wait time
     */
    async getQueueStatus(req, res) {
        try {
            const { user_id, appointment_id } = req.query;
            
            // Validation
            if (!user_id || !isValidUUID(user_id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_USER_ID',
                        message: 'Valid user_id is required',
                        field: 'user_id'
                    }
                });
            }

            if (appointment_id && !isValidUUID(appointment_id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_APPOINTMENT_ID',
                        message: 'Invalid appointment_id format',
                        field: 'appointment_id'
                    }
                });
            }

            // Use queue service for enhanced business logic
            const queueStatus = await queueService.getQueueStatus(user_id, appointment_id);
            
            res.status(200).json({
                success: true,
                data: queueStatus
            });
            
        } catch (error) {
            console.error('Error in getQueueStatus:', error);
            
            // Handle specific business logic errors
            if (error.message === 'QUEUE_ENTRY_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'QUEUE_ENTRY_NOT_FOUND',
                        message: 'User is not currently in any queue',
                        details: 'No active queue entry found for this user today'
                    }
                });
            }
            
            res.status(500).json({
                success: false,
                error: {
                    code: 'QUEUE_STATUS_ERROR',
                    message: 'Failed to retrieve queue status',
                    details: 'An internal error occurred while fetching queue information'
                }
            });
        }
    }

    /**
     * POST /api/queue/join
     * Join the queue when user arrives at the department
     */
    async joinQueue(req, res) {
        try {
            const { appointment_id, arrival_time, department_id, service_id } = req.body;
            
            // Validation
            if (!appointment_id || !isValidUUID(appointment_id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_APPOINTMENT_ID',
                        message: 'Valid appointment_id is required',
                        field: 'appointment_id'
                    }
                });
            }

            // Get user_id from the appointment (in production, this would come from JWT token)
            const user_id = req.user?.id || req.body.user_id;
            if (!user_id) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'USER_ID_REQUIRED',
                        message: 'User authentication required',
                        field: 'user_id'
                    }
                });
            }

            // Use queue service for enhanced business logic
            const queueResult = await queueService.joinQueue({
                appointment_id,
                user_id,
                arrival_time
            });

            res.status(201).json({
                success: true,
                data: queueResult,
                message: `Successfully joined queue at position ${queueResult.position}`
            });
            
        } catch (error) {
            console.error('Error in joinQueue:', error);
            
            // Handle specific business logic errors
            const errorMappings = {
                'APPOINTMENT_NOT_FOUND': {
                    status: 404,
                    code: 'APPOINTMENT_NOT_FOUND',
                    message: 'Appointment not found'
                },
                'UNAUTHORIZED_APPOINTMENT_ACCESS': {
                    status: 403,
                    code: 'UNAUTHORIZED_ACCESS',
                    message: 'You do not have access to this appointment'
                },
                'APPOINTMENT_CANCELLED': {
                    status: 400,
                    code: 'APPOINTMENT_CANCELLED',
                    message: 'Cannot join queue for cancelled appointment'
                },
                'APPOINTMENT_ALREADY_COMPLETED': {
                    status: 400,
                    code: 'APPOINTMENT_COMPLETED',
                    message: 'Appointment has already been completed'
                },
                'APPOINTMENT_NOT_FOR_TODAY': {
                    status: 400,
                    code: 'INVALID_APPOINTMENT_DATE',
                    message: 'Can only join queue for today\'s appointments'
                },
                'ALREADY_IN_QUEUE': {
                    status: 409,
                    code: 'ALREADY_IN_QUEUE',
                    message: 'User is already in queue for this appointment'
                },
                'QUEUE_FULL': {
                    status: 409,
                    code: 'QUEUE_FULL',
                    message: 'Queue has reached maximum capacity'
                }
            };

            const errorMapping = errorMappings[error.message];
            if (errorMapping) {
                return res.status(errorMapping.status).json({
                    success: false,
                    error: {
                        code: errorMapping.code,
                        message: errorMapping.message
                    }
                });
            }

            // Handle database constraint errors
            if (error.code === '23505') { 
                return res.status(409).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_QUEUE_ENTRY',
                        message: 'User is already in queue for this appointment'
                    }
                });
            }

            res.status(500).json({
                success: false,
                error: {
                    code: 'QUEUE_JOIN_ERROR',
                    message: 'Failed to join queue',
                    details: 'An internal error occurred while joining the queue'
                }
            });
        }
    }

    /**
     * GET /api/queue/sessions
     * Get active queue sessions (for officers/admin)
     */
    async getActiveSessions(req, res) {
        try {
            const { department_id } = req.query;
            
            // Validate department_id if provided
            if (department_id && !isValidUUID(department_id)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DEPARTMENT_ID',
                        message: 'Invalid department_id format',
                        field: 'department_id'
                    }
                });
            }

            const activeSessions = await queueRepository.getActiveQueueSessions(department_id);

            const response = {
                success: true,
                data: {
                    sessions: activeSessions.map(session => ({
                        id: session.id,
                        department: {
                            id: session.department_id,
                            name: session.department_name
                        },
                        service: session.service_id ? {
                            id: session.service_id,
                            name: session.service_name
                        } : null,
                        session_date: session.session_date,
                        current_position: session.current_position,
                        total_entries: parseInt(session.total_entries) || 0,
                        waiting_count: parseInt(session.waiting_count) || 0,
                        max_capacity: session.max_capacity,
                        status: session.status,
                        session_hours: {
                            start: session.session_start_time,
                            end: session.session_end_time
                        }
                    })),
                    total_sessions: activeSessions.length,
                    last_updated: new Date().toISOString()
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getActiveSessions:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SESSION_FETCH_ERROR',
                    message: 'Failed to retrieve active sessions',
                    details: 'An internal error occurred while fetching queue sessions'
                }
            });
        }
    }

    /**
     * GET /api/queue/session/:sessionId
     * Get detailed queue session information
     */
    async getSessionDetails(req, res) {
        try {
            const { sessionId } = req.params;
            const { page = 1, limit = 20 } = req.query;
            
            // Validation
            if (!sessionId || !isValidUUID(sessionId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_SESSION_ID',
                        message: 'Valid session ID is required',
                        field: 'sessionId'
                    }
                });
            }

            // Validate pagination parameters
            const pageNum = parseInt(page);
            const limitNum = parseInt(limit);
            
            if (isNaN(pageNum) || pageNum < 1) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_PAGE',
                        message: 'Page must be a positive integer',
                        field: 'page'
                    }
                });
            }

            if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_LIMIT',
                        message: 'Limit must be between 1 and 100',
                        field: 'limit'
                    }
                });
            }

            // Get session details
            const session = await queueRepository.getQueueSessionById(sessionId);
            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Queue session not found',
                        details: 'The requested queue session does not exist'
                    }
                });
            }

            // Get queue entries with pagination
            const queueData = await queueRepository.getQueueEntries(sessionId, pageNum, limitNum);
            
            const response = {
                success: true,
                data: {
                    session_id: session.id,
                    department: {
                        id: session.department_id,
                        name: session.department_name,
                        name_si: session.department_name_si,
                        name_ta: session.department_name_ta
                    },
                    service: session.service_id ? {
                        id: session.service_id,
                        name: session.service_name,
                        name_si: session.service_name_si,
                        name_ta: session.service_name_ta,
                        estimated_duration: session.estimated_duration_minutes
                    } : null,
                    session_date: session.session_date,
                    current_position: session.current_position,
                    max_capacity: session.max_capacity,
                    total_served: session.total_served,
                    average_service_time: session.average_service_time,
                    status: session.status,
                    session_hours: {
                        start: session.session_start_time,
                        end: session.session_end_time
                    },
                    statistics: {
                        total_entries: parseInt(session.total_entries) || 0,
                        waiting_count: parseInt(session.waiting_count) || 0,
                        completed_count: parseInt(session.completed_count) || 0
                    },
                    queue_entries: queueData.entries.map(entry => ({
                        id: entry.id,
                        position: entry.position,
                        status: entry.status,
                        token_number: entry.token_number,
                        appointment_time: entry.appointment_time,
                        customer: {
                            name: `${entry.first_name} ${entry.last_name}`,
                            first_name: entry.first_name,
                            last_name: entry.last_name
                        },
                        service_name: entry.service_name,
                        estimated_wait_minutes: entry.estimated_wait_minutes,
                        called_at: entry.called_at,
                        served_at: entry.served_at,
                        completed_at: entry.completed_at,
                        created_at: entry.created_at
                    })),
                    pagination: queueData.pagination
                }
            };

            res.status(200).json(response);
        } catch (error) {
            console.error('Error in getSessionDetails:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'SESSION_DETAILS_ERROR',
                    message: 'Failed to retrieve session details',
                    details: 'An internal error occurred while fetching session information'
                }
            });
        }
    }

    /**
     * PUT /api/queue/session/:sessionId/advance
     * Advance queue to next position (for officers)
     */
    async advanceQueue(req, res) {
        try {
            const { sessionId } = req.params;
            const officerId = req.user?.id || req.body.officer_id; // From JWT or request body
            
            // Validation
            if (!sessionId || !isValidUUID(sessionId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_SESSION_ID',
                        message: 'Valid session ID is required',
                        field: 'sessionId'
                    }
                });
            }

            // Use queue service for enhanced business logic
            const result = await queueService.advanceQueue(sessionId, officerId);
            
            res.status(200).json({
                success: true,
                data: result,
                message: result.next_person 
                    ? `Queue advanced. Now calling: ${result.next_person.token_number}`
                    : 'Queue advanced. No more people waiting.'
            });
            
        } catch (error) {
            console.error('Error in advanceQueue:', error);
            
            // Handle specific business logic errors
            if (error.message === 'SESSION_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_FOUND',
                        message: 'Queue session not found'
                    }
                });
            }

            if (error.message === 'SESSION_NOT_ACTIVE') {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'SESSION_NOT_ACTIVE',
                        message: 'Cannot advance queue for inactive session'
                    }
                });
            }

            res.status(500).json({
                success: false,
                error: {
                    code: 'QUEUE_ADVANCE_ERROR',
                    message: 'Failed to advance queue',
                    details: 'An internal error occurred while advancing the queue'
                }
            });
        }
    }

    /**
     * PUT /api/queue/entry/:entryId/status
     * Update queue entry status (for officers)
     */
    async updateEntryStatus(req, res) {
        try {
            const { entryId } = req.params;
            const { status } = req.body;
            
            // Validation
            if (!entryId || !isValidUUID(entryId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_ENTRY_ID',
                        message: 'Valid entry ID is required',
                        field: 'entryId'
                    }
                });
            }

            const validStatuses = ['waiting', 'called', 'serving', 'completed', 'skipped'];
            if (!status || !validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS',
                        message: 'Valid status is required',
                        details: `Valid statuses: ${validStatuses.join(', ')}`,
                        field: 'status'
                    }
                });
            }

            // Use queue service for enhanced business logic
            const result = await queueService.updateQueueEntryStatus(entryId, status, req.body);

            res.status(200).json({
                success: true,
                data: result,
                message: `Queue entry status updated to: ${status}`
            });
            
        } catch (error) {
            console.error('Error in updateEntryStatus:', error);
            
            // Handle specific business logic errors
            if (error.message === 'QUEUE_ENTRY_NOT_FOUND') {
                return res.status(404).json({
                    success: false,
                    error: {
                        code: 'ENTRY_NOT_FOUND',
                        message: 'Queue entry not found'
                    }
                });
            }

            if (error.message.includes('Invalid status transition')) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_STATUS_TRANSITION',
                        message: error.message
                    }
                });
            }

            res.status(500).json({
                success: false,
                error: {
                    code: 'STATUS_UPDATE_ERROR',
                    message: 'Failed to update entry status',
                    details: 'An internal error occurred while updating the queue entry'
                }
            });
        }
    }

    /**
     * GET /api/queue/analytics/:departmentId
     * Get comprehensive queue analytics for a department
     */
    async getDepartmentAnalytics(req, res) {
        try {
            const { departmentId } = req.params;
            const { date } = req.query;
            
            // Validation
            if (!departmentId || !isValidUUID(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: {
                        code: 'INVALID_DEPARTMENT_ID',
                        message: 'Valid department ID is required',
                        field: 'departmentId'
                    }
                });
            }

            // Use queue service for comprehensive analytics
            const analytics = await queueService.getDepartmentQueueAnalytics(departmentId, date);

            res.status(200).json({
                success: true,
                data: analytics
            });
            
        } catch (error) {
            console.error('Error in getDepartmentAnalytics:', error);
            res.status(500).json({
                success: false,
                error: {
                    code: 'ANALYTICS_ERROR',
                    message: 'Failed to retrieve department analytics',
                    details: 'An internal error occurred while fetching analytics data'
                }
            });
        }
    }
}

module.exports = new QueueController();
