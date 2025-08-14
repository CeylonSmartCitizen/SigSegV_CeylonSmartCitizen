const db = require('../config/database');

/**
 * Appointment Repository - Handles all database operations for appointments
 * This is a simplified version for queue management integration
 */

class AppointmentRepository {
    /**
     * Get appointment by ID with service and user information
     * @param {string} appointmentId - UUID of the appointment
     * @returns {Object|null} Appointment details or null if not found
     */
    async getAppointmentById(appointmentId) {
        try {
            const query = `
                SELECT 
                    a.*,
                    s.name as service_name,
                    s.department_id,
                    s.estimated_duration_minutes,
                    u.first_name,
                    u.last_name,
                    d.name as department_name
                FROM appointments a
                JOIN services s ON s.id = a.service_id
                JOIN users u ON u.id = a.user_id
                JOIN departments d ON d.id = s.department_id
                WHERE a.id = $1
            `;
            
            const result = await db.query(query, [appointmentId]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Error in getAppointmentById:', error);
            throw error;
        }
    }

    /**
     * Update appointment status
     * @param {string} appointmentId - UUID of the appointment
     * @param {string} status - New status
     * @returns {Object} Updated appointment
     */
    async updateAppointmentStatus(appointmentId, status) {
        try {
            const query = `
                UPDATE appointments 
                SET status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING *
            `;
            
            const result = await db.query(query, [appointmentId, status]);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateAppointmentStatus:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a user
     * @param {string} userId - UUID of the user
     * @param {Object} filters - Filter options
     * @returns {Array} List of appointments
     */
    async getAppointmentsByUser(userId, filters = {}) {
        try {
            let query = `
                SELECT 
                    a.*,
                    s.name as service_name,
                    s.name_si as service_name_si,
                    s.name_ta as service_name_ta,
                    d.name as department_name,
                    d.name_si as department_name_si,
                    d.name_ta as department_name_ta,
                    o.first_name as officer_first_name,
                    o.last_name as officer_last_name,
                    o.designation as officer_designation
                FROM appointments a
                JOIN services s ON s.id = a.service_id
                JOIN departments d ON d.id = s.department_id
                LEFT JOIN officers o ON o.id = a.officer_id
                WHERE a.user_id = $1
            `;
            
            const values = [userId];
            let paramIndex = 2;
            
            // Add filters
            if (filters.status) {
                query += ` AND a.status = $${paramIndex}`;
                values.push(filters.status);
                paramIndex++;
            }
            
            if (filters.date_from) {
                query += ` AND a.appointment_date >= $${paramIndex}`;
                values.push(filters.date_from);
                paramIndex++;
            }
            
            if (filters.date_to) {
                query += ` AND a.appointment_date <= $${paramIndex}`;
                values.push(filters.date_to);
                paramIndex++;
            }
            
            // Add sorting
            const sortOptions = {
                'date_desc': 'a.appointment_date DESC, a.appointment_time DESC',
                'date_asc': 'a.appointment_date ASC, a.appointment_time ASC',
                'created_desc': 'a.created_at DESC'
            };
            
            const sortBy = sortOptions[filters.sort] || sortOptions['date_desc'];
            query += ` ORDER BY ${sortBy}`;
            
            // Add pagination
            if (filters.limit) {
                query += ` LIMIT $${paramIndex}`;
                values.push(filters.limit);
                paramIndex++;
                
                if (filters.offset) {
                    query += ` OFFSET $${paramIndex}`;
                    values.push(filters.offset);
                }
            }
            
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            console.error('Error in getAppointmentsByUser:', error);
            throw error;
        }
    }

    /**
     * Create new appointment
     * @param {Object} appointmentData - Appointment details
     * @returns {Object} Created appointment
     */
    async createAppointment(appointmentData) {
        try {
            const {
                user_id,
                service_id,
                officer_id,
                appointment_date,
                appointment_time,
                notes,
                token_number
            } = appointmentData;
            
            const query = `
                INSERT INTO appointments (
                    user_id,
                    service_id,
                    officer_id,
                    appointment_date,
                    appointment_time,
                    status,
                    token_number,
                    citizen_notes,
                    priority_score
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;
            
            const values = [
                user_id,
                service_id,
                officer_id,
                appointment_date,
                appointment_time,
                'scheduled',
                token_number,
                notes || null,
                0
            ];
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in createAppointment:', error);
            throw error;
        }
    }

    /**
     * Update appointment details
     * @param {string} appointmentId - UUID of the appointment
     * @param {Object} updateData - Fields to update
     * @returns {Object} Updated appointment
     */
    async updateAppointment(appointmentId, updateData) {
        try {
            const allowedFields = [
                'appointment_date',
                'appointment_time',
                'status',
                'officer_id',
                'citizen_notes',
                'officer_notes',
                'actual_start_time',
                'actual_end_time'
            ];
            
            const updates = [];
            const values = [];
            let paramIndex = 1;
            
            Object.entries(updateData).forEach(([key, value]) => {
                if (allowedFields.includes(key) && value !== undefined) {
                    updates.push(`${key} = $${paramIndex}`);
                    values.push(value);
                    paramIndex++;
                }
            });
            
            if (updates.length === 0) {
                throw new Error('No valid fields to update');
            }
            
            updates.push(`updated_at = CURRENT_TIMESTAMP`);
            
            const query = `
                UPDATE appointments 
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;
            
            values.push(appointmentId);
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in updateAppointment:', error);
            throw error;
        }
    }

    /**
     * Delete appointment (soft delete by setting status to cancelled)
     * @param {string} appointmentId - UUID of the appointment
     * @returns {Object} Updated appointment
     */
    async deleteAppointment(appointmentId) {
        try {
            return await this.updateAppointmentStatus(appointmentId, 'cancelled');
        } catch (error) {
            console.error('Error in deleteAppointment:', error);
            throw error;
        }
    }

    /**
     * Get appointments for a specific date and service
     * @param {string} serviceId - UUID of the service
     * @param {string} date - Date in YYYY-MM-DD format
     * @returns {Array} List of appointments
     */
    async getAppointmentsByServiceAndDate(serviceId, date) {
        try {
            const query = `
                SELECT 
                    a.*,
                    u.first_name,
                    u.last_name,
                    u.phone_number
                FROM appointments a
                JOIN users u ON u.id = a.user_id
                WHERE a.service_id = $1 
                AND a.appointment_date = $2
                AND a.status NOT IN ('cancelled')
                ORDER BY a.appointment_time ASC
            `;
            
            const result = await db.query(query, [serviceId, date]);
            return result.rows;
        } catch (error) {
            console.error('Error in getAppointmentsByServiceAndDate:', error);
            throw error;
        }
    }

    /**
     * Check appointment availability for a time slot
     * @param {string} officerId - UUID of the officer
     * @param {string} date - Date in YYYY-MM-DD format
     * @param {string} time - Time in HH:MM format
     * @returns {boolean} True if slot is available
     */
    async checkTimeSlotAvailability(officerId, date, time) {
        try {
            const query = `
                SELECT COUNT(*) as count
                FROM appointments
                WHERE officer_id = $1
                AND appointment_date = $2
                AND appointment_time = $3
                AND status NOT IN ('cancelled', 'completed')
            `;
            
            const result = await db.query(query, [officerId, date, time]);
            return parseInt(result.rows[0].count) === 0;
        } catch (error) {
            console.error('Error in checkTimeSlotAvailability:', error);
            throw error;
        }
    }

    /**
     * Get appointment statistics for analytics
     * @param {Object} filters - Filter options
     * @returns {Object} Statistics summary
     */
    async getAppointmentStatistics(filters = {}) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_appointments,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_appointments,
                    AVG(CASE 
                        WHEN actual_start_time IS NOT NULL AND actual_end_time IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (actual_end_time - actual_start_time))/60 
                    END) as avg_service_duration
                FROM appointments
                WHERE 1=1
            `;
            
            const values = [];
            let paramIndex = 1;
            
            if (filters.date_from) {
                query += ` AND appointment_date >= $${paramIndex}`;
                values.push(filters.date_from);
                paramIndex++;
            }
            
            if (filters.date_to) {
                query += ` AND appointment_date <= $${paramIndex}`;
                values.push(filters.date_to);
                paramIndex++;
            }
            
            if (filters.service_id) {
                query += ` AND service_id = $${paramIndex}`;
                values.push(filters.service_id);
                paramIndex++;
            }
            
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error in getAppointmentStatistics:', error);
            throw error;
        }
    }
}

module.exports = new AppointmentRepository();
