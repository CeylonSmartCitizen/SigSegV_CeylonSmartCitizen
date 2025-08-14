const db = require('../config/database');

/**
 * Queue Repository - Handles all database operations for queue management
 * Tables: queue_sessions, queue_entries, appointments
 */

class QueueRepository {
    /**
     * Get or create today's queue session for a specific department/service
     * @param {string} departmentId - UUID of the department
     * @param {string} serviceId - UUID of the service (optional)
     * @param {string} sessionDate - Date in YYYY-MM-DD format (default: today)
     * @returns {Object} Queue session details
     */
    async getOrCreateQueueSession(departmentId, serviceId = null, sessionDate = null) {
        try {
            const today = sessionDate || new Date().toISOString().split('T')[0];
            
            // First try to get existing session
            let session = await this.getQueueSession(departmentId, serviceId, today);
            
            if (!session) {
                // Create new session if it doesn't exist
                const query = `
                    INSERT INTO queue_sessions (
                        department_id, 
                        service_id, 
                        session_date, 
                        max_capacity, 
                        current_position, 
                        total_served, 
                        status,
                        session_start_time,
                        session_end_time
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    RETURNING *
                `;
                
                const values = [
                    departmentId,
                    serviceId,
                    today,
                    50, // default max_capacity
                    0,  // current_position
                    0,  // total_served
                    'active',
                    '09:00:00', // session_start_time
                    '17:00:00'  // session_end_time
                ];
                
                const result = await db.query(query, values);
                session = result.rows[0];
            }
            
            return session;
        } catch (error) {
            console.error('Error in getOrCreateQueueSession:', error);
            throw error;
        }
    }

    /**
     * Get existing queue session
     * @param {string} departmentId - UUID of the department
     * @param {string} serviceId - UUID of the service (optional)
     * @param {string} sessionDate - Date in YYYY-MM-DD format
     * @returns {Object|null} Queue session or null if not found
     */
    async getQueueSession(departmentId, serviceId = null, sessionDate) {
        try {
            let query, values;
            
            if (serviceId) {
                query = `
                    SELECT qs.*, d.name as department_name, s.name as service_name
                    FROM queue_sessions qs
                    JOIN departments d ON d.id = qs.department_id
                    LEFT JOIN services s ON s.id = qs.service_id
                    WHERE qs.department_id = $1 
                    AND qs.service_id = $2 
                    AND qs.session_date = $3
                `;
                values = [departmentId, serviceId, sessionDate];
            } else {
                query = `
                    SELECT qs.*, d.name as department_name
                    FROM queue_sessions qs
                    JOIN departments d ON d.id = qs.department_id
                    WHERE qs.department_id = $1 
                    AND qs.service_id IS NULL 
                    AND qs.session_date = $2
                `;
                values = [departmentId, sessionDate];
            }
            
            const result = await db.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in getQueueSession:', error);
            throw error;
        }
    }

    /**
     * Get queue session by ID with detailed information
     * @param {string} sessionId - UUID of the queue session
     * @returns {Object|null} Detailed queue session information
     */
    async getQueueSessionById(sessionId) {
        try {
            const query = `
                SELECT 
                    qs.*,
                    d.name as department_name,
                    d.name_si as department_name_si,
                    d.name_ta as department_name_ta,
                    s.name as service_name,
                    s.name_si as service_name_si,
                    s.name_ta as service_name_ta,
                    s.estimated_duration_minutes,
                    COUNT(qe.id) as total_entries,
                    COUNT(CASE WHEN qe.status = 'waiting' THEN 1 END) as waiting_count,
                    COUNT(CASE WHEN qe.status = 'completed' THEN 1 END) as completed_count
                FROM queue_sessions qs
                JOIN departments d ON d.id = qs.department_id
                LEFT JOIN services s ON s.id = qs.service_id
                LEFT JOIN queue_entries qe ON qe.queue_session_id = qs.id
                WHERE qs.id = $1
                GROUP BY qs.id, d.id, s.id
            `;
            
            const result = await db.query(query, [sessionId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in getQueueSessionById:', error);
            throw error;
        }
    }

    /**
     * Join queue - Add user's appointment to the queue
     * @param {string} queueSessionId - UUID of the queue session
     * @param {string} appointmentId - UUID of the appointment
     * @returns {Object} Queue entry details
     */
    async joinQueue(queueSessionId, appointmentId) {
        try {
            // Start transaction
            await db.query('BEGIN');
            
            // Get next position in queue
            const positionQuery = `
                SELECT COALESCE(MAX(position), 0) + 1 as next_position
                FROM queue_entries 
                WHERE queue_session_id = $1
            `;
            const positionResult = await db.query(positionQuery, [queueSessionId]);
            const nextPosition = positionResult.rows[0].next_position;
            
            // Insert queue entry
            const insertQuery = `
                INSERT INTO queue_entries (
                    queue_session_id,
                    appointment_id,
                    position,
                    status,
                    estimated_wait_minutes
                )
                VALUES ($1, $2, $3, $4, $5)
                RETURNING *
            `;
            
            // Calculate estimated wait time (position * average service time)
            const sessionQuery = `
                SELECT average_service_time, estimated_duration_minutes
                FROM queue_sessions qs
                LEFT JOIN services s ON s.id = qs.service_id
                WHERE qs.id = $1
            `;
            const sessionResult = await db.query(sessionQuery, [queueSessionId]);
            const avgServiceTime = sessionResult.rows[0]?.average_service_time || 
                                 sessionResult.rows[0]?.estimated_duration_minutes || 30;
            
            const estimatedWait = (nextPosition - 1) * avgServiceTime;
            
            const values = [queueSessionId, appointmentId, nextPosition, 'waiting', estimatedWait];
            const result = await db.query(insertQuery, values);
            
            // Update queue session current position if this is the first entry
            if (nextPosition === 1) {
                await db.query(
                    'UPDATE queue_sessions SET current_position = 1 WHERE id = $1',
                    [queueSessionId]
                );
            }
            
            await db.query('COMMIT');
            return result.rows[0];
            
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error in joinQueue:', error);
            throw error;
        }
    }

    /**
     * Get user's position in queue
     * @param {string} userId - UUID of the user
     * @param {string} appointmentId - UUID of the appointment (optional)
     * @returns {Object|null} Queue position details
     */
    async getUserQueuePosition(userId, appointmentId = null) {
        try {
            let query, values;
            
            if (appointmentId) {
                query = `
                    SELECT 
                        qe.*,
                        qs.current_position,
                        qs.department_id,
                        qs.service_id,
                        a.token_number,
                        s.name as service_name,
                        d.name as department_name,
                        (qe.position - qs.current_position) as people_ahead
                    FROM queue_entries qe
                    JOIN queue_sessions qs ON qs.id = qe.queue_session_id
                    JOIN appointments a ON a.id = qe.appointment_id
                    JOIN services s ON s.id = a.service_id
                    JOIN departments d ON d.id = s.department_id
                    WHERE a.id = $1 AND a.user_id = $2
                    AND qe.status IN ('waiting', 'called')
                    ORDER BY qe.created_at DESC
                    LIMIT 1
                `;
                values = [appointmentId, userId];
            } else {
                // Get latest queue entry for user
                query = `
                    SELECT 
                        qe.*,
                        qs.current_position,
                        qs.department_id,
                        qs.service_id,
                        a.token_number,
                        s.name as service_name,
                        d.name as department_name,
                        (qe.position - qs.current_position) as people_ahead
                    FROM queue_entries qe
                    JOIN queue_sessions qs ON qs.id = qe.queue_session_id
                    JOIN appointments a ON a.id = qe.appointment_id
                    JOIN services s ON s.id = a.service_id
                    JOIN departments d ON d.id = s.department_id
                    WHERE a.user_id = $1
                    AND qe.status IN ('waiting', 'called')
                    AND qs.session_date = CURRENT_DATE
                    ORDER BY qe.created_at DESC
                    LIMIT 1
                `;
                values = [userId];
            }
            
            const result = await db.query(query, values);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in getUserQueuePosition:', error);
            throw error;
        }
    }

    /**
     * Get queue entries for a session with pagination
     * @param {string} sessionId - UUID of the queue session
     * @param {number} page - Page number (default: 1)
     * @param {number} limit - Items per page (default: 50)
     * @returns {Object} Queue entries with pagination
     */
    async getQueueEntries(sessionId, page = 1, limit = 50) {
        try {
            const offset = (page - 1) * limit;
            
            const query = `
                SELECT 
                    qe.*,
                    a.token_number,
                    a.appointment_time,
                    u.first_name,
                    u.last_name,
                    s.name as service_name
                FROM queue_entries qe
                JOIN appointments a ON a.id = qe.appointment_id
                JOIN users u ON u.id = a.user_id
                JOIN services s ON s.id = a.service_id
                WHERE qe.queue_session_id = $1
                ORDER BY qe.position ASC
                LIMIT $2 OFFSET $3
            `;
            
            const countQuery = `
                SELECT COUNT(*) as total
                FROM queue_entries
                WHERE queue_session_id = $1
            `;
            
            const [entriesResult, countResult] = await Promise.all([
                db.query(query, [sessionId, limit, offset]),
                db.query(countQuery, [sessionId])
            ]);
            
            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);
            
            return {
                entries: entriesResult.rows,
                pagination: {
                    current_page: page,
                    total_pages: totalPages,
                    total_count: total,
                    per_page: limit,
                    has_next: page < totalPages,
                    has_prev: page > 1
                }
            };
        } catch (error) {
            console.error('Error in getQueueEntries:', error);
            throw error;
        }
    }

    /**
     * Update queue entry status
     * @param {string} entryId - UUID of the queue entry
     * @param {string} status - New status ('waiting', 'called', 'serving', 'completed', 'skipped')
     * @returns {Object} Updated queue entry
     */
    async updateQueueEntryStatus(entryId, status) {
        try {
            let updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
            let values = [entryId, status];
            
            // Add timestamp fields based on status
            switch (status) {
                case 'called':
                    updateFields.push('called_at = CURRENT_TIMESTAMP');
                    break;
                case 'serving':
                    updateFields.push('served_at = CURRENT_TIMESTAMP');
                    break;
                case 'completed':
                    updateFields.push('completed_at = CURRENT_TIMESTAMP');
                    break;
            }
            
            const query = `
                UPDATE queue_entries 
                SET ${updateFields.join(', ')}
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateQueueEntryStatus:', error);
            throw error;
        }
    }

    /**
     * Get queue statistics for a session
     * @param {string} sessionId - UUID of the queue session
     * @returns {Object} Queue statistics
     */
    async getQueueStatistics(sessionId) {
        try {
            const query = `
                SELECT 
                    qs.total_served,
                    qs.current_position,
                    qs.max_capacity,
                    qs.average_service_time,
                    COUNT(qe.id) as total_in_queue,
                    COUNT(CASE WHEN qe.status = 'waiting' THEN 1 END) as waiting_count,
                    COUNT(CASE WHEN qe.status = 'serving' THEN 1 END) as serving_count,
                    COUNT(CASE WHEN qe.status = 'completed' THEN 1 END) as completed_count,
                    COUNT(CASE WHEN qe.status = 'skipped' THEN 1 END) as skipped_count,
                    AVG(CASE 
                        WHEN qe.status = 'completed' AND qe.served_at IS NOT NULL AND qe.completed_at IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (qe.completed_at - qe.served_at))/60 
                    END) as actual_avg_service_time
                FROM queue_sessions qs
                LEFT JOIN queue_entries qe ON qe.queue_session_id = qs.id
                WHERE qs.id = $1
                GROUP BY qs.id
            `;
            
            const result = await db.query(query, [sessionId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in getQueueStatistics:', error);
            throw error;
        }
    }

    /**
     * Update queue session status
     * @param {string} sessionId - UUID of the queue session
     * @param {string} status - New status ('active', 'paused', 'closed')
     * @returns {Object} Updated session
     */
    async updateQueueSessionStatus(sessionId, status) {
        try {
            const query = `
                UPDATE queue_sessions 
                SET status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await db.query(query, [sessionId, status]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateQueueSessionStatus:', error);
            throw error;
        }
    }

    /**
     * Advance queue to next position
     * @param {string} sessionId - UUID of the queue session
     * @returns {Object} Updated session with next person details
     */
    async advanceQueue(sessionId) {
        try {
            await db.query('BEGIN');
            
            // Get current session details
            const session = await this.getQueueSessionById(sessionId);
            if (!session) {
                throw new Error('Queue session not found');
            }
            
            const nextPosition = session.current_position + 1;
            
            // Update session current position
            await db.query(
                'UPDATE queue_sessions SET current_position = $2, total_served = total_served + 1 WHERE id = $1',
                [sessionId, nextPosition]
            );
            
            // Get next person in queue
            const nextPersonQuery = `
                SELECT qe.*, a.token_number, u.first_name, u.last_name
                FROM queue_entries qe
                JOIN appointments a ON a.id = qe.appointment_id
                JOIN users u ON u.id = a.user_id
                WHERE qe.queue_session_id = $1 AND qe.position = $2
            `;
            
            const nextPersonResult = await db.query(nextPersonQuery, [sessionId, nextPosition]);
            
            await db.query('COMMIT');
            
            return {
                session_id: sessionId,
                current_position: nextPosition,
                next_person: nextPersonResult.rows[0] || null
            };
        } catch (error) {
            await db.query('ROLLBACK');
            console.error('Error in advanceQueue:', error);
            throw error;
        }
    }

    /**
     * Get active queue sessions for today
     * @param {string} departmentId - UUID of department (optional)
     * @returns {Array} List of active queue sessions
     */
    async getActiveQueueSessions(departmentId = null) {
        try {
            let query = `
                SELECT 
                    qs.*,
                    d.name as department_name,
                    s.name as service_name,
                    COUNT(qe.id) as total_entries,
                    COUNT(CASE WHEN qe.status = 'waiting' THEN 1 END) as waiting_count
                FROM queue_sessions qs
                JOIN departments d ON d.id = qs.department_id
                LEFT JOIN services s ON s.id = qs.service_id
                LEFT JOIN queue_entries qe ON qe.queue_session_id = qs.id
                WHERE qs.session_date = CURRENT_DATE 
                AND qs.status = 'active'
            `;
            
            let values = [];
            
            if (departmentId) {
                query += ' AND qs.department_id = $1';
                values.push(departmentId);
            }
            
            query += ' GROUP BY qs.id, d.id, s.id ORDER BY qs.created_at ASC';
            
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error in getActiveQueueSessions:', error);
            throw error;
        }
    }
}

module.exports = new QueueRepository();
