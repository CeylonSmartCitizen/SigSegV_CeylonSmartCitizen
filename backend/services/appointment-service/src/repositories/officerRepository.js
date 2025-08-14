const db = require('../config/database');

/**
 * Officer Repository - Handles all database operations for officers
 * Supports specializations, schedules, availability, and assignment logic
 */

class OfficerRepository {
    /**
     * Get all officers with optional filtering
     * @param {Object} filters - Filter options
     * @param {string} filters.department_id - Filter by department
     * @param {Array} filters.specializations - Filter by specializations
     * @param {boolean} filters.active_only - Only return active officers
     * @param {boolean} filters.available_only - Only return currently available officers
     * @param {number} filters.page - Page number for pagination
     * @param {number} filters.limit - Items per page
     * @returns {Object} Officers list with pagination
     */
    async getAllOfficers(filters = {}) {
        try {
            const {
                department_id,
                specializations,
                active_only = false,
                available_only = false,
                page = 1,
                limit = 20,
                search = ''
            } = filters;

            let query = `
                SELECT 
                    o.*,
                    d.name as department_name,
                    d.name_si as department_name_si,
                    d.name_ta as department_name_ta,
                    COUNT(a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments
                FROM officers o
                LEFT JOIN departments d ON d.id = o.department_id
                LEFT JOIN appointments a ON a.officer_id = o.id
                WHERE 1=1
            `;

            const values = [];
            let paramIndex = 1;

            // Filter by department
            if (department_id) {
                query += ` AND o.department_id = $${paramIndex}`;
                values.push(department_id);
                paramIndex++;
            }

            // Filter by active status
            if (active_only) {
                query += ` AND o.is_active = $${paramIndex}`;
                values.push(true);
                paramIndex++;
            }

            // Filter by specializations
            if (specializations && specializations.length > 0) {
                query += ` AND o.specializations && $${paramIndex}`;
                values.push(specializations);
                paramIndex++;
            }

            // Search filter
            if (search) {
                query += ` AND (
                    o.first_name ILIKE $${paramIndex} OR 
                    o.last_name ILIKE $${paramIndex} OR
                    o.designation ILIKE $${paramIndex} OR
                    o.email ILIKE $${paramIndex}
                )`;
                values.push(`%${search}%`);
                paramIndex++;
            }

            query += ` GROUP BY o.id, d.name, d.name_si, d.name_ta ORDER BY o.first_name, o.last_name ASC`;

            // Add pagination
            const offset = (page - 1) * limit;
            query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            values.push(limit, offset);

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(DISTINCT o.id) as total
                FROM officers o
                WHERE 1=1
            `;
            
            if (department_id) countQuery += ` AND o.department_id = '${department_id}'`;
            if (active_only) countQuery += ` AND o.is_active = true`;
            if (specializations && specializations.length > 0) {
                countQuery += ` AND o.specializations && ARRAY[${specializations.map(s => `'${s}'`).join(',')}]`;
            }
            if (search) {
                countQuery += ` AND (
                    o.first_name ILIKE '%${search}%' OR 
                    o.last_name ILIKE '%${search}%' OR
                    o.designation ILIKE '%${search}%' OR
                    o.email ILIKE '%${search}%'
                )`;
            }

            const [officersResult, countResult] = await Promise.all([
                db.query(query, values),
                db.query(countQuery)
            ]);

            let officers = officersResult.rows.map(officer => 
                this.formatOfficerResponse(officer)
            );

            // Filter by availability if requested
            if (available_only) {
                const currentTime = new Date();
                officers = officers.filter(officer => 
                    this.isOfficerAvailable(officer, currentTime)
                );
            }

            const total = parseInt(countResult.rows[0].total);
            const totalPages = Math.ceil(total / limit);

            return {
                officers,
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
            console.error('Error in getAllOfficers:', error);
            throw error;
        }
    }

    /**
     * Get officer by ID with detailed information
     * @param {string} officerId - UUID of the officer
     * @returns {Object|null} Officer details or null if not found
     */
    async getOfficerById(officerId) {
        try {
            const query = `
                SELECT 
                    o.*,
                    d.name as department_name,
                    d.name_si as department_name_si,
                    d.name_ta as department_name_ta,
                    COUNT(a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments
                FROM officers o
                LEFT JOIN departments d ON d.id = o.department_id
                LEFT JOIN appointments a ON a.officer_id = o.id
                WHERE o.id = $1
                GROUP BY o.id, d.name, d.name_si, d.name_ta
            `;

            const result = await db.query(query, [officerId]);
            
            if (result.rows.length === 0) {
                return null;
            }

            const officer = this.formatOfficerResponse(result.rows[0]);
            
            // Add current availability status
            officer.current_availability = this.calculateCurrentAvailability(result.rows[0]);
            
            return officer;

        } catch (error) {
            console.error('Error in getOfficerById:', error);
            throw error;
        }
    }

    /**
     * Get officers by department with availability information
     * @param {string} departmentId - UUID of the department
     * @param {Object} options - Query options
     * @returns {Array} List of officers in the department
     */
    async getOfficersByDepartment(departmentId, options = {}) {
        try {
            const { active_only = true, include_availability = true } = options;

            const filters = { 
                department_id: departmentId, 
                active_only,
                available_only: false 
            };
            
            const result = await this.getAllOfficers(filters);
            
            if (include_availability) {
                const currentTime = new Date();
                result.officers = result.officers.map(officer => ({
                    ...officer,
                    current_availability: this.calculateCurrentAvailability(officer)
                }));
            }

            return result;

        } catch (error) {
            console.error('Error in getOfficersByDepartment:', error);
            throw error;
        }
    }

    /**
     * Get officers by specialization
     * @param {Array} specializations - Array of specializations to filter by
     * @param {Object} options - Query options
     * @returns {Array} List of officers with matching specializations
     */
    async getOfficersBySpecialization(specializations, options = {}) {
        try {
            const { department_id, active_only = true } = options;

            const filters = { 
                specializations, 
                department_id,
                active_only,
                available_only: false 
            };
            
            return await this.getAllOfficers(filters);

        } catch (error) {
            console.error('Error in getOfficersBySpecialization:', error);
            throw error;
        }
    }

    /**
     * Get officer availability for a specific date
     * @param {string} officerId - UUID of the officer
     * @param {string} date - Date to check availability (YYYY-MM-DD)
     * @returns {Object} Officer availability for the date
     */
    async getOfficerAvailability(officerId, date) {
        try {
            const officer = await this.getOfficerById(officerId);
            if (!officer) {
                throw new Error('Officer not found');
            }

            const targetDate = new Date(date);
            const dayOfWeek = this.getDayOfWeek(targetDate);

            // Get officer's schedule for the day
            const daySchedule = officer.working_schedule[dayOfWeek];
            if (!daySchedule) {
                return {
                    officer_id: officerId,
                    date,
                    is_available: false,
                    reason: 'Officer not scheduled to work on this day',
                    working_hours: null,
                    booked_slots: [],
                    available_slots: []
                };
            }

            // Get existing appointments for the date
            const appointmentsQuery = `
                SELECT 
                    scheduled_time,
                    estimated_duration_minutes,
                    status
                FROM appointments a
                JOIN services s ON s.id = a.service_id
                WHERE a.officer_id = $1 
                AND a.appointment_date = $2
                AND a.status NOT IN ('cancelled', 'no_show')
                ORDER BY a.scheduled_time ASC
            `;

            const appointmentsResult = await db.query(appointmentsQuery, [officerId, date]);
            const bookedSlots = appointmentsResult.rows.map(apt => ({
                start_time: apt.scheduled_time,
                duration_minutes: apt.estimated_duration_minutes || 30,
                status: apt.status
            }));

            // Calculate available time slots
            const availableSlots = this.calculateAvailableSlots(daySchedule, bookedSlots);

            return {
                officer_id: officerId,
                date,
                is_available: availableSlots.length > 0,
                working_hours: daySchedule,
                booked_slots: bookedSlots,
                available_slots: availableSlots,
                total_available_slots: availableSlots.length
            };

        } catch (error) {
            console.error('Error in getOfficerAvailability:', error);
            throw error;
        }
    }

    /**
     * Find best available officer for a service
     * @param {string} serviceId - UUID of the service
     * @param {string} date - Preferred date (YYYY-MM-DD)
     * @param {string} time - Preferred time (HH:MM)
     * @param {Array} requiredSpecializations - Required specializations
     * @returns {Object} Best officer assignment recommendation
     */
    async findBestAvailableOfficer(serviceId, date, time, requiredSpecializations = []) {
        try {
            // Get service details first
            const serviceQuery = `
                SELECT s.*, d.id as department_id
                FROM services s
                JOIN departments d ON d.id = s.department_id
                WHERE s.id = $1
            `;
            const serviceResult = await db.query(serviceQuery, [serviceId]);
            
            if (serviceResult.rows.length === 0) {
                throw new Error('Service not found');
            }

            const service = serviceResult.rows[0];
            const departmentId = service.department_id;

            // Get available officers for the department
            const officers = await this.getOfficersByDepartment(departmentId, { 
                active_only: true, 
                include_availability: false 
            });

            // Filter officers by specializations if required
            let candidateOfficers = officers.officers;
            if (requiredSpecializations.length > 0) {
                candidateOfficers = candidateOfficers.filter(officer => 
                    requiredSpecializations.every(spec => 
                        officer.specializations.includes(spec)
                    )
                );
            }

            if (candidateOfficers.length === 0) {
                return {
                    found: false,
                    reason: 'No officers available with required specializations',
                    alternatives: []
                };
            }

            // Check availability for each officer
            const availabilityChecks = await Promise.all(
                candidateOfficers.map(async officer => {
                    const availability = await this.getOfficerAvailability(officer.id, date);
                    return {
                        officer,
                        availability,
                        score: this.calculateOfficerScore(officer, availability, time)
                    };
                })
            );

            // Filter to only available officers and sort by score
            const availableOfficers = availabilityChecks
                .filter(check => check.availability.is_available)
                .sort((a, b) => b.score - a.score);

            if (availableOfficers.length === 0) {
                return {
                    found: false,
                    reason: 'No officers available on the requested date',
                    alternatives: this.suggestAlternatives(candidateOfficers, date)
                };
            }

            const bestOfficer = availableOfficers[0];

            return {
                found: true,
                recommended_officer: {
                    id: bestOfficer.officer.id,
                    name: `${bestOfficer.officer.first_name} ${bestOfficer.officer.last_name}`,
                    designation: bestOfficer.officer.designation,
                    specializations: bestOfficer.officer.specializations,
                    availability: bestOfficer.availability
                },
                alternatives: availableOfficers.slice(1, 4).map(alt => ({
                    id: alt.officer.id,
                    name: `${alt.officer.first_name} ${alt.officer.last_name}`,
                    designation: alt.officer.designation,
                    score: alt.score
                }))
            };

        } catch (error) {
            console.error('Error in findBestAvailableOfficer:', error);
            throw error;
        }
    }

    /**
     * Get officer workload and performance statistics
     * @param {string} officerId - UUID of the officer
     * @param {string} dateFrom - Start date (YYYY-MM-DD)
     * @param {string} dateTo - End date (YYYY-MM-DD)
     * @returns {Object} Officer statistics
     */
    async getOfficerStatistics(officerId, dateFrom, dateTo) {
        try {
            const statsQuery = `
                SELECT 
                    COUNT(a.id) as total_appointments,
                    COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
                    COUNT(CASE WHEN a.status = 'cancelled' THEN 1 END) as cancelled_appointments,
                    COUNT(CASE WHEN a.status = 'no_show' THEN 1 END) as no_show_appointments,
                    AVG(CASE 
                        WHEN a.actual_start_time IS NOT NULL AND a.actual_end_time IS NOT NULL
                        THEN EXTRACT(EPOCH FROM (a.actual_end_time - a.actual_start_time))/60 
                    END) as avg_appointment_duration
                FROM appointments a
                WHERE a.officer_id = $1 
                AND a.appointment_date BETWEEN $2 AND $3
            `;

            const result = await db.query(statsQuery, [officerId, dateFrom, dateTo]);
            const stats = result.rows[0] || {};

            return {
                officer_id: officerId,
                period: { from: dateFrom, to: dateTo },
                statistics: {
                    total_appointments: parseInt(stats.total_appointments || 0),
                    completed_appointments: parseInt(stats.completed_appointments || 0),
                    cancelled_appointments: parseInt(stats.cancelled_appointments || 0),
                    no_show_appointments: parseInt(stats.no_show_appointments || 0),
                    completion_rate: stats.total_appointments > 0 
                        ? Math.round((stats.completed_appointments / stats.total_appointments) * 100)
                        : 0,
                    avg_appointment_duration: Math.round(stats.avg_appointment_duration || 0)
                }
            };

        } catch (error) {
            console.error('Error in getOfficerStatistics:', error);
            throw error;
        }
    }

    // Helper methods

    /**
     * Format officer response
     */
    formatOfficerResponse(officer) {
        return {
            id: officer.id,
            officer_id: officer.officer_id,
            name: {
                first: officer.first_name,
                last: officer.last_name,
                full: `${officer.first_name} ${officer.last_name}`
            },
            designation: officer.designation,
            department: {
                id: officer.department_id,
                name: officer.department_name,
                name_si: officer.department_name_si,
                name_ta: officer.department_name_ta
            },
            contact_information: {
                email: officer.email,
                phone: officer.contact_number
            },
            specializations: officer.specializations || [],
            working_schedule: officer.working_schedule || {},
            is_active: officer.is_active,
            statistics: {
                total_appointments: parseInt(officer.total_appointments || 0),
                completed_appointments: parseInt(officer.completed_appointments || 0)
            },
            created_at: officer.created_at,
            updated_at: officer.updated_at
        };
    }

    /**
     * Calculate current availability status
     */
    calculateCurrentAvailability(officer) {
        if (!officer.is_active) {
            return {
                status: 'inactive',
                is_available: false,
                reason: 'Officer is not active'
            };
        }

        const currentTime = new Date();
        const isAvailable = this.isOfficerAvailable(officer, currentTime);
        
        return {
            status: isAvailable ? 'available' : 'unavailable',
            is_available: isAvailable,
            current_time: currentTime.toISOString(),
            reason: isAvailable ? 'Officer is currently available' : 'Officer is not scheduled to work at this time'
        };
    }

    /**
     * Check if officer is currently available
     */
    isOfficerAvailable(officer, currentTime) {
        if (!officer.is_active || !officer.working_schedule) {
            return false;
        }

        const dayOfWeek = this.getDayOfWeek(currentTime);
        const daySchedule = officer.working_schedule[dayOfWeek];
        
        if (!daySchedule) {
            return false;
        }

        const currentHour = currentTime.getHours();
        const currentMinute = currentTime.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;

        // Parse working hours
        const startTime = this.parseTime(daySchedule.start || daySchedule);
        const endTime = this.parseTime(daySchedule.end || daySchedule);

        if (!startTime || !endTime) {
            return false;
        }

        return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
    }

    /**
     * Get day of week string
     */
    getDayOfWeek(date) {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        return days[date.getDay()];
    }

    /**
     * Parse time string to minutes
     */
    parseTime(timeString) {
        if (!timeString) return null;
        
        if (typeof timeString === 'string' && timeString.includes(':')) {
            const [hours, minutes] = timeString.split(':').map(Number);
            return hours * 60 + (minutes || 0);
        }
        
        return null;
    }

    /**
     * Calculate available time slots
     */
    calculateAvailableSlots(daySchedule, bookedSlots, slotDuration = 30) {
        const startTime = this.parseTime(daySchedule.start || daySchedule);
        const endTime = this.parseTime(daySchedule.end || daySchedule);
        
        if (!startTime || !endTime) {
            return [];
        }

        const slots = [];
        
        for (let time = startTime; time < endTime; time += slotDuration) {
            const slotEnd = time + slotDuration;
            
            // Check if this slot conflicts with any booked appointment
            const hasConflict = bookedSlots.some(booked => {
                const bookedStart = this.parseTime(booked.start_time);
                const bookedEnd = bookedStart + (booked.duration_minutes || 30);
                
                return (time < bookedEnd && slotEnd > bookedStart);
            });
            
            if (!hasConflict) {
                slots.push({
                    start_time: this.formatTimeFromMinutes(time),
                    end_time: this.formatTimeFromMinutes(slotEnd),
                    duration_minutes: slotDuration
                });
            }
        }
        
        return slots;
    }

    /**
     * Format minutes back to time string
     */
    formatTimeFromMinutes(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    /**
     * Calculate officer score for assignment
     */
    calculateOfficerScore(officer, availability, preferredTime) {
        let score = 0;
        
        // Experience score (based on completed appointments)
        score += Math.min(officer.statistics.completed_appointments / 10, 20);
        
        // Availability score
        if (availability.is_available) {
            score += 30;
            
            // Bonus for having slots near preferred time
            if (preferredTime && availability.available_slots.length > 0) {
                const preferredMinutes = this.parseTime(preferredTime);
                const closestSlot = availability.available_slots.reduce((closest, slot) => {
                    const slotMinutes = this.parseTime(slot.start_time);
                    const currentDistance = Math.abs(slotMinutes - preferredMinutes);
                    const closestDistance = Math.abs(this.parseTime(closest.start_time) - preferredMinutes);
                    return currentDistance < closestDistance ? slot : closest;
                });
                
                const distance = Math.abs(this.parseTime(closestSlot.start_time) - preferredMinutes);
                score += Math.max(20 - distance / 30, 0); // Bonus decreases with distance
            }
        }
        
        return score;
    }

    /**
     * Suggest alternative dates/officers
     */
    suggestAlternatives(officers, requestedDate) {
        // This is a simplified version - in reality, you'd check multiple dates
        return officers.slice(0, 3).map(officer => ({
            officer_id: officer.id,
            name: `${officer.first_name} ${officer.last_name}`,
            designation: officer.designation,
            suggestion: 'Check availability for next working day'
        }));
    }
}

module.exports = new OfficerRepository();
