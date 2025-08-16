const db = require('../config/database');

/**
 * Department Repository - Handles all database operations for departments
 * Supports multi-language (English, Sinhala, Tamil) and operational status
 */

class DepartmentRepository {
    /**
     * Get all departments with optional filtering
     * @param {Object} filters - Filter options
     * @param {boolean} filters.active_only - Only return active departments
     * @param {string} filters.language - Language for names (en, si, ta)
     * @param {number} filters.page - Page number for pagination
     * @param {number} filters.limit - Items per page
     * @returns {Object} Departments list with pagination
     */
    async getAllDepartments(filters = {}) {
        try {
            const {
                active_only = false,
                language = 'en',
                page = 1,
                limit = 20,
                search = ''
            } = filters;

            let query = `
                SELECT 
                    d.id,
                    d.name,
                    d.name_si,
                    d.name_ta,
                    d.description,
                    d.contact_number,
                    d.email,
                    d.address,
                    d.working_hours,
                    d.location_coordinates,
                    d.is_active,
                    d.created_at,
                    COUNT(s.id) as services_count,
                    COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_services_count
                FROM departments d
                LEFT JOIN services s ON s.department_id = d.id
                WHERE 1=1
            `;

            const values = [];
            let paramIndex = 1;

            // Filter by active status
            if (active_only) {
                query += ` AND d.is_active = $${paramIndex}`;
                values.push(true);
                paramIndex++;
            }

            // Search filter
            if (search) {
                query += ` AND (
                    d.name ILIKE $${paramIndex} OR 
                    d.name_si ILIKE $${paramIndex} OR 
                    d.name_ta ILIKE $${paramIndex} OR
                    d.description ILIKE $${paramIndex}
                )`;
                values.push(`%${search}%`);
                paramIndex++;
            }

            query += ` GROUP BY d.id ORDER BY d.name ASC`;

            // Add pagination
            const offset = (page - 1) * limit;
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            values.push(limit, offset);

            // Get total count for pagination
            const countQuery = `
                SELECT COUNT(DISTINCT d.id) as total
                FROM departments d
                WHERE 1=1
                ${active_only ? 'AND d.is_active = true' : ''}
                ${search ? `AND (
                    d.name ILIKE '%${search}%' OR 
                    d.name_si ILIKE '%${search}%' OR 
                    d.name_ta ILIKE '%${search}%' OR
                    d.description ILIKE '%${search}%'
                )` : ''}
            `;

            const [departmentsResult, countResult] = await Promise.all([
                db.query(query, values),
                db.query(countQuery)
            ]);

            const departments = departmentsResult.rows.map(dept => 
                this.formatDepartmentResponse(dept, language)
            );

            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);

            return {
                departments,
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
            console.error('Error in getAllDepartments:', error);
            throw error;
        }
    }

    /**
     * Get department by ID with detailed information
     * @param {string} departmentId - UUID of the department
     * @param {string} language - Language preference (en, si, ta)
     * @returns {Object|null} Department details or null if not found
     */
    async getDepartmentById(departmentId, language = 'en') {
        try {
            const query = `
                SELECT 
                    d.*,
                    COUNT(s.id) as services_count,
                    COUNT(CASE WHEN s.is_active = true THEN 1 END) as active_services_count,
                    COUNT(o.id) as officers_count,
                    COUNT(CASE WHEN o.is_active = true THEN 1 END) as active_officers_count
                FROM departments d
                LEFT JOIN services s ON s.department_id = d.id
                LEFT JOIN officers o ON o.department_id = d.id
                WHERE d.id = $1
                GROUP BY d.id
            `;

            const result = await db.query(query, [departmentId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const department = this.formatDepartmentResponse(result.rows[0], language);
            
            // Add current operational status
            department.current_status = this.calculateOperationalStatus(result.rows[0]);
            
            return department;

        } catch (error) {
            console.error('Error in getDepartmentById:', error);
            throw error;
        }
    }

    /**
     * Get services offered by a department
     * @param {string} departmentId - UUID of the department
     * @param {Object} options - Query options
     * @returns {Array} List of services
     */
    async getDepartmentServices(departmentId, options = {}) {
        try {
            const { active_only = false, language = 'en' } = options;

            let query = `
                SELECT 
                    s.id,
                    s.name,
                    s.name_si,
                    s.name_ta,
                    s.description,
                    s.description_si,
                    s.description_ta,
                    s.required_documents,
                    s.estimated_duration_minutes,
                    s.fee_amount,
                    s.online_available,
                    s.category,
                    s.priority_level,
                    s.max_daily_appointments,
                    s.is_active,
                    COUNT(a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments
                FROM services s
                LEFT JOIN appointments a ON a.service_id = s.id
                WHERE s.department_id = $1
            `;

            const values = [departmentId];

            if (active_only) {
                query += ` AND s.is_active = true`;
            }

            query += ` GROUP BY s.id ORDER BY s.priority_level DESC, s.name ASC`;

            const result = await db.query(query, values);

            return result.rows.map(service => ({
                id: service.id,
                name: this.getLocalizedField(service, 'name', language),
                description: this.getLocalizedField(service, 'description', language),
                required_documents: service.required_documents,
                estimated_duration_minutes: service.estimated_duration_minutes,
                fee_amount: parseFloat(service.fee_amount || 0),
                online_available: service.online_available,
                category: service.category,
                priority_level: service.priority_level,
                max_daily_appointments: service.max_daily_appointments,
                is_active: service.is_active,
                statistics: {
                    total_appointments: parseInt(service.total_appointments || 0),
                    completed_appointments: parseInt(service.completed_appointments || 0)
                }
            }));

        } catch (error) {
            console.error('Error in getDepartmentServices:', error);
            throw error;
        }
    }

    /**
     * Get department operational status for today
     * @param {string} departmentId - UUID of the department
     * @returns {Object} Current operational status
     */
    async getDepartmentStatus(departmentId) {
        try {
            const department = await this.getDepartmentById(departmentId);
            if (!department) {
                throw new Error('Department not found');
            }

            const today = new Date().toISOString().split('T')[0];
            const currentTime = new Date();
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const currentDay = days[currentTime.getDay()];

            // Get today's queue sessions and appointments
            const statusQuery = `
                SELECT 
                    COUNT(DISTINCT qs.id) as active_queue_sessions,
                    COUNT(DISTINCT qe.id) as people_in_queue,
                    COUNT(DISTINCT a.id) as todays_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(DISTINCT o.id) as available_officers
                FROM departments d
                LEFT JOIN queue_sessions qs ON qs.department_id = d.id AND qs.session_date = $2 AND qs.status = 'active'
                LEFT JOIN queue_entries qe ON qe.queue_session_id = qs.id AND qe.status IN ('waiting', 'called')
                LEFT JOIN appointments a ON a.service_id IN (
                    SELECT id FROM services WHERE department_id = d.id
                ) AND a.appointment_date = $2
                LEFT JOIN officers o ON o.department_id = d.id AND o.is_active = true
                WHERE d.id = $1
                GROUP BY d.id
            `;

            const statusResult = await db.query(statusQuery, [departmentId, today]);
            const stats = statusResult.rows[0] || {};

            return {
                department_id: departmentId,
                current_status: this.calculateOperationalStatus(department),
                is_open: this.isDepartmentOpen(department.working_hours, currentTime),
                today_statistics: {
                    active_queue_sessions: parseInt(stats.active_queue_sessions || 0),
                    people_in_queue: parseInt(stats.people_in_queue || 0),
                    todays_appointments: parseInt(stats.todays_appointments || 0),
                    completed_appointments: parseInt(stats.completed_appointments || 0),
                    available_officers: parseInt(stats.available_officers || 0)
                },
                working_hours: department.working_hours,
                last_updated: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error in getDepartmentStatus:', error);
            throw error;
        }
    }

    /**
     * Get department statistics and analytics
     * @param {string} departmentId - UUID of the department
     * @param {string} dateFrom - Start date (YYYY-MM-DD)
     * @param {string} dateTo - End date (YYYY-MM-DD)
     * @returns {Object} Department analytics
     */
    async getDepartmentAnalytics(departmentId, dateFrom, dateTo) {
        try {
            const analyticsQuery = `
                SELECT 
                    COUNT(DISTINCT a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    AVG(CASE 
                        WHEN a.actual_start_time IS NOT NULL AND a.actual_end_time IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (a.actual_end_time - a.actual_start_time))/60 
                    END) as avg_service_duration,
                    COUNT(DISTINCT s.id) as services_offered,
                    COUNT(DISTINCT o.id) as total_officers
                FROM departments d
                LEFT JOIN services s ON s.department_id = d.id
                LEFT JOIN appointments a ON a.service_id = s.id 
                    AND a.appointment_date BETWEEN $2 AND $3
                LEFT JOIN officers o ON o.department_id = d.id AND o.is_active = true
                WHERE d.id = $1
                GROUP BY d.id
            `;

            const result = await db.query(analyticsQuery, [departmentId, dateFrom, dateTo]);
            const analytics = result.rows[0] || {};

            return {
                department_id: departmentId,
                period: { from: dateFrom, to: dateTo },
                statistics: {
                    total_appointments: parseInt(analytics.total_appointments || 0),
                    completed_appointments: parseInt(analytics.completed_appointments || 0),
                    cancelled_appointments: parseInt(analytics.cancelled_appointments || 0),
                    completion_rate: analytics.total_appointments > 0 
                        ? Math.round((analytics.completed_appointments / analytics.total_appointments) * 100)
                        : 0,
                    avg_service_duration: Math.round(analytics.avg_service_duration || 0),
                    services_offered: parseInt(analytics.services_offered || 0),
                    total_officers: parseInt(analytics.total_officers || 0)
                }
            };

        } catch (error) {
            console.error('Error in getDepartmentAnalytics:', error);
            throw error;
        }
    }

    // Helper methods

    /**
     * Format department response based on language preference
     */
    formatDepartmentResponse(department, language = 'en') {
        return {
            id: department.id,
            name: this.getLocalizedField(department, 'name', language),
            name_translations: {
                en: department.name,
                si: department.name_si,
                ta: department.name_ta
            },
            description: department.description,
            contact_information: {
                phone: department.contact_number,
                email: department.email,
                address: department.address
            },
            location_coordinates: department.location_coordinates,
            working_hours: department.working_hours,
            is_active: department.is_active,
            services_count: parseInt(department.services_count || 0),
            active_services_count: parseInt(department.active_services_count || 0),
            officers_count: parseInt(department.officers_count || 0),
            active_officers_count: parseInt(department.active_officers_count || 0),
            created_at: department.created_at
        };
    }

    /**
     * Get localized field value based on language preference
     */
    getLocalizedField(object, fieldName, language) {
        const fieldMap = {
            'en': fieldName,
            'si': `${fieldName}_si`,
            'ta': `${fieldName}_ta`
        };

        const localizedField = fieldMap[language] || fieldName;
        return object[localizedField] || object[fieldName];
    }

    /**
     * Calculate current operational status
     */
    calculateOperationalStatus(department) {
        if (!department.is_active) {
            return 'closed';
        }

        const currentTime = new Date();
        const isOpen = this.isDepartmentOpen(department.working_hours, currentTime);
        
        if (isOpen) {
            return 'open';
        } else {
            return 'closed';
        }
    }

    /**
     * Check if department is currently open based on working hours
     */
    isDepartmentOpen(workingHours, currentTime) {
        if (!workingHours) {
            return false;
        }

        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const currentDay = days[currentTime.getDay()];
        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        const daySchedule = workingHours[currentDay];
        if (!daySchedule) {
            return false;
        }

        // Parse working hours (assuming format like "08:30-16:30")
        const timeRange = daySchedule.start && daySchedule.end 
            ? `${daySchedule.start}-${daySchedule.end}`
            : daySchedule;
            
        if (typeof timeRange === 'string' && timeRange.includes('-')) {
            const [startTime, endTime] = timeRange.split('-');
            const [startHour, startMinute] = startTime.split(':').map(Number);
            const [endHour, endMinute] = endTime.split(':').map(Number);
            
            const startTimeInMinutes = startHour * 60 + (startMinute || 0);
            const endTimeInMinutes = endHour * 60 + (endMinute || 0);
            
            return currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes;
        }

        return false;
    }
}

module.exports = new DepartmentRepository();
