const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { body, query, param, validationResult } = require('express-validator');
const { v4: uuidv4, validate: isValidUUID } = require('uuid');

/**
 * Validation middleware to handle express-validator errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const firstError = errors.array()[0];
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: firstError.msg,
                field: firstError.param,
                details: errors.array()
            }
        });
    }
    next();
};

/**
 * Custom UUID validation middleware
 */
const validateUUID = (field, required = true) => {
    return (req, res, next) => {
        const value = req.params[field] || req.query[field] || req.body[field];
        
        if (!value && required) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'MISSING_REQUIRED_FIELD',
                    message: `${field} is required`,
                    field: field
                }
            });
        }
        
        if (value && !isValidUUID(value)) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_UUID_FORMAT',
                    message: `Invalid ${field} format. Must be a valid UUID.`,
                    field: field
                }
            });
        }
        
        next();
    };
};

/**
 * Rate limiting middleware (basic implementation)
 */
const queueRateLimit = (req, res, next) => {
    // In production, implement proper rate limiting with Redis
    // For now, just pass through
    next();
};

/**
 * GET /api/queue/status
 * Get user's current queue position and wait time
 */
router.get('/status', [
    query('user_id')
        .notEmpty()
        .withMessage('user_id is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('user_id must be a valid UUID');
            }
            return true;
        }),
    query('appointment_id')
        .optional()
        .custom((value) => {
            if (value && !isValidUUID(value)) {
                throw new Error('appointment_id must be a valid UUID');
            }
            return true;
        }),
    handleValidationErrors,
    queueRateLimit
], queueController.getQueueStatus);

/**
 * POST /api/queue/join
 * Join the queue when user arrives at the department
 */
router.post('/join', [
    body('appointment_id')
        .notEmpty()
        .withMessage('appointment_id is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('appointment_id must be a valid UUID');
            }
            return true;
        }),
    body('department_id')
        .notEmpty()
        .withMessage('department_id is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('department_id must be a valid UUID');
            }
            return true;
        }),
    body('service_id')
        .optional()
        .custom((value) => {
            if (value && !isValidUUID(value)) {
                throw new Error('service_id must be a valid UUID');
            }
            return true;
        }),
    body('arrival_time')
        .optional()
        .isISO8601()
        .withMessage('arrival_time must be a valid ISO 8601 date string')
        .custom((value) => {
            if (value) {
                const arrivalDate = new Date(value);
                const now = new Date();
                const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
                const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
                
                if (arrivalDate < oneHourAgo || arrivalDate > oneHourFromNow) {
                    throw new Error('arrival_time must be within 1 hour of current time');
                }
            }
            return true;
        }),
    handleValidationErrors,
    queueRateLimit
], queueController.joinQueue);

/**
 * GET /api/queue/sessions
 * Get active queue sessions (for officers/admin)
 */
router.get('/sessions', [
    query('department_id')
        .optional()
        .custom((value) => {
            if (value && !isValidUUID(value)) {
                throw new Error('department_id must be a valid UUID');
            }
            return true;
        }),
    handleValidationErrors
], queueController.getActiveSessions);

/**
 * GET /api/queue/session/:sessionId
 * Get detailed queue session information
 */
router.get('/session/:sessionId', [
    param('sessionId')
        .notEmpty()
        .withMessage('sessionId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('sessionId must be a valid UUID');
            }
            return true;
        }),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('page must be a positive integer')
        .toInt(),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('limit must be between 1 and 100')
        .toInt(),
    handleValidationErrors
], queueController.getSessionDetails);

/**
 * PUT /api/queue/session/:sessionId/advance
 * Advance queue to next position (for officers)
 */
router.put('/session/:sessionId/advance', [
    param('sessionId')
        .notEmpty()
        .withMessage('sessionId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('sessionId must be a valid UUID');
            }
            return true;
        }),
    handleValidationErrors
], queueController.advanceQueue);

/**
 * PUT /api/queue/entry/:entryId/status
 * Update queue entry status (for officers)
 */
router.put('/entry/:entryId/status', [
    param('entryId')
        .notEmpty()
        .withMessage('entryId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('entryId must be a valid UUID');
            }
            return true;
        }),
    body('status')
        .notEmpty()
        .withMessage('status is required')
        .isIn(['waiting', 'called', 'serving', 'completed', 'skipped'])
        .withMessage('status must be one of: waiting, called, serving, completed, skipped'),
    handleValidationErrors
], queueController.updateEntryStatus);

/**
 * GET /api/queue/health
 * Health check endpoint for queue service
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        service: 'queue-management',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

/**
 * POST /api/queue/session/:sessionId/pause
 * Pause queue session (for officers/admin)
 */
router.post('/session/:sessionId/pause', [
    param('sessionId')
        .notEmpty()
        .withMessage('sessionId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('sessionId must be a valid UUID');
            }
            return true;
        }),
    handleValidationErrors
], async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // This would typically be in the controller, but adding inline for completeness
        const queueRepository = require('../repositories/queueRepository');
        const updatedSession = await queueRepository.updateQueueSessionStatus(sessionId, 'paused');
        
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SESSION_NOT_FOUND',
                    message: 'Queue session not found'
                }
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                session_id: updatedSession.id,
                status: updatedSession.status,
                updated_at: updatedSession.updated_at || new Date().toISOString()
            },
            message: 'Queue session paused successfully'
        });
    } catch (error) {
        console.error('Error pausing queue session:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_PAUSE_ERROR',
                message: 'Failed to pause queue session'
            }
        });
    }
});

/**
 * POST /api/queue/session/:sessionId/resume
 * Resume paused queue session (for officers/admin)
 */
router.post('/session/:sessionId/resume', [
    param('sessionId')
        .notEmpty()
        .withMessage('sessionId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('sessionId must be a valid UUID');
            }
            return true;
        }),
    handleValidationErrors
], async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const queueRepository = require('../repositories/queueRepository');
        const updatedSession = await queueRepository.updateQueueSessionStatus(sessionId, 'active');
        
        if (!updatedSession) {
            return res.status(404).json({
                success: false,
                error: {
                    code: 'SESSION_NOT_FOUND',
                    message: 'Queue session not found'
                }
            });
        }
        
        res.status(200).json({
            success: true,
            data: {
                session_id: updatedSession.id,
                status: updatedSession.status,
                updated_at: updatedSession.updated_at || new Date().toISOString()
            },
            message: 'Queue session resumed successfully'
        });
    } catch (error) {
        console.error('Error resuming queue session:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SESSION_RESUME_ERROR',
                message: 'Failed to resume queue session'
            }
        });
    }
});

/**
 * GET /api/queue/analytics/:departmentId
 * Get comprehensive department queue analytics
 */
router.get('/analytics/:departmentId', [
    param('departmentId')
        .notEmpty()
        .withMessage('departmentId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('departmentId must be a valid UUID');
            }
            return true;
        }),
    query('date')
        .optional()
        .isDate()
        .withMessage('date must be a valid date (YYYY-MM-DD format)'),
    handleValidationErrors
], queueController.getDepartmentAnalytics);

/**
 * GET /api/queue/statistics/:departmentId
 * Get queue statistics for a department (for analytics)
 */
router.get('/statistics/:departmentId', [
    param('departmentId')
        .notEmpty()
        .withMessage('departmentId is required')
        .custom((value) => {
            if (!isValidUUID(value)) {
                throw new Error('departmentId must be a valid UUID');
            }
            return true;
        }),
    query('date')
        .optional()
        .isDate()
        .withMessage('date must be a valid date (YYYY-MM-DD format)'),
    handleValidationErrors
], async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { date = new Date().toISOString().split('T')[0] } = req.query;
        
        const queueRepository = require('../repositories/queueRepository');
        
        // Get all sessions for the department on the specified date
        const sessions = await queueRepository.getActiveQueueSessions(departmentId);
        
        // Calculate aggregated statistics
        let totalServed = 0;
        let totalWaiting = 0;
        let avgServiceTime = 0;
        let sessionCount = 0;
        
        for (const session of sessions) {
            const stats = await queueRepository.getQueueStatistics(session.id);
            if (stats) {
                totalServed += stats.total_served || 0;
                totalWaiting += stats.waiting_count || 0;
                if (stats.actual_avg_service_time) {
                    avgServiceTime += stats.actual_avg_service_time;
                    sessionCount++;
                }
            }
        }
        
        const finalAvgServiceTime = sessionCount > 0 ? avgServiceTime / sessionCount : 0;
        
        res.status(200).json({
            success: true,
            data: {
                department_id: departmentId,
                date: date,
                statistics: {
                    total_sessions: sessions.length,
                    total_served: totalServed,
                    total_waiting: totalWaiting,
                    average_service_time: Math.round(finalAvgServiceTime),
                    active_sessions: sessions.filter(s => s.status === 'active').length
                },
                sessions: sessions.map(session => ({
                    id: session.id,
                    service_name: session.service_name,
                    current_position: session.current_position,
                    total_entries: parseInt(session.total_entries) || 0,
                    waiting_count: parseInt(session.waiting_count) || 0,
                    status: session.status
                }))
            }
        });
    } catch (error) {
        console.error('Error getting queue statistics:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'STATISTICS_ERROR',
                message: 'Failed to retrieve queue statistics'
            }
        });
    }
});

// Error handling middleware for routes
router.use((error, req, res, next) => {
    console.error('Queue routes error:', error);
    
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'INVALID_JSON',
                message: 'Invalid JSON format in request body'
            }
        });
    }
    
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'An unexpected error occurred'
        }
    });
});

module.exports = router;
