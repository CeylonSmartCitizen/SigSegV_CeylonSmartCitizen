const officerRepository = require('../repositories/officerRepository');
const departmentRepository = require('../repositories/departmentRepository');

/**
 * Officer Service - Business logic for officer operations
 */

class OfficerService {
    /**
     * Get all officers with filtering and search
     */
    async getAllOfficers(filters) {
        try {
            // Validate department_id if provided
            if (filters.department_id && !this.isValidUUID(filters.department_id)) {
                throw new Error('Invalid department ID format');
            }

            // Validate specializations format
            if (filters.specializations && !Array.isArray(filters.specializations)) {
                throw new Error('Specializations must be an array');
            }

            // Validate pagination parameters
            if (filters.page && filters.page < 1) {
                throw new Error('Page number must be greater than 0');
            }

            if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
                throw new Error('Limit must be between 1 and 100');
            }

            const result = await officerRepository.getAllOfficers(filters);
            
            return {
                success: true,
                data: result,
                message: `Found ${result.officers.length} officers`
            };

        } catch (error) {
            console.error('Error in OfficerService.getAllOfficers:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officers',
                code: 'OFFICERS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get officer by ID with detailed information
     */
    async getOfficerById(officerId) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(officerId)) {
                throw new Error('Invalid officer ID format');
            }

            const officer = await officerRepository.getOfficerById(officerId);
            
            if (!officer) {
                throw new Error('Officer not found');
            }

            return {
                success: true,
                data: officer,
                message: 'Officer details retrieved successfully'
            };

        } catch (error) {
            console.error('Error in OfficerService.getOfficerById:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officer details',
                code: error.message === 'Officer not found' ? 'OFFICER_NOT_FOUND' : 'OFFICER_FETCH_ERROR'
            };
        }
    }

    /**
     * Get officers by specialization with filtering
     */
    async getOfficersBySpecialization(specializations, options = {}) {
        try {
            // Validate specializations
            if (!Array.isArray(specializations) || specializations.length === 0) {
                throw new Error('Specializations must be a non-empty array');
            }

            // Validate department_id if provided
            if (options.department_id && !this.isValidUUID(options.department_id)) {
                throw new Error('Invalid department ID format');
            }

            const result = await officerRepository.getOfficersBySpecialization(specializations, options);
            
            return {
                success: true,
                data: {
                    officers: result.officers,
                    pagination: result.pagination,
                    filters: {
                        specializations,
                        department_id: options.department_id,
                        active_only: options.active_only !== false
                    },
                    summary: {
                        total_found: result.officers.length,
                        specializations_matched: specializations,
                        departments_covered: [...new Set(result.officers.map(o => o.department.id))]
                    }
                },
                message: `Found ${result.officers.length} officers with specified specializations`
            };

        } catch (error) {
            console.error('Error in OfficerService.getOfficersBySpecialization:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officers by specialization',
                code: 'OFFICERS_SPECIALIZATION_ERROR'
            };
        }
    }

    /**
     * Get officer availability for a specific date
     */
    async getOfficerAvailability(officerId, date) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(officerId)) {
                throw new Error('Invalid officer ID format');
            }

            // Validate date format
            if (!this.isValidDate(date)) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }

            // Check if date is not in the past
            const targetDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (targetDate < today) {
                throw new Error('Cannot check availability for past dates');
            }

            // Check if date is not too far in the future (e.g., 90 days)
            const maxFutureDate = new Date();
            maxFutureDate.setDate(maxFutureDate.getDate() + 90);
            
            if (targetDate > maxFutureDate) {
                throw new Error('Cannot check availability more than 90 days in advance');
            }

            const availability = await officerRepository.getOfficerAvailability(officerId, date);
            
            return {
                success: true,
                data: {
                    ...availability,
                    insights: this.generateAvailabilityInsights(availability)
                },
                message: availability.is_available 
                    ? `Officer is available on ${date} with ${availability.available_slots.length} time slots`
                    : `Officer is not available on ${date}: ${availability.reason}`
            };

        } catch (error) {
            console.error('Error in OfficerService.getOfficerAvailability:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officer availability',
                code: error.message === 'Officer not found' ? 'OFFICER_NOT_FOUND' : 'AVAILABILITY_FETCH_ERROR'
            };
        }
    }

    /**
     * Find best available officer for a service appointment
     */
    async findBestOfficerForService(serviceId, appointmentDate, appointmentTime, requiredSpecializations = []) {
        try {
            // Validate service ID
            if (!this.isValidUUID(serviceId)) {
                throw new Error('Invalid service ID format');
            }

            // Validate date
            if (!this.isValidDate(appointmentDate)) {
                throw new Error('Invalid appointment date format. Use YYYY-MM-DD');
            }

            // Validate time format
            if (!this.isValidTime(appointmentTime)) {
                throw new Error('Invalid appointment time format. Use HH:MM');
            }

            // Check if appointment is not in the past
            const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
            if (appointmentDateTime < new Date()) {
                throw new Error('Cannot schedule appointments in the past');
            }

            // Validate specializations format
            if (requiredSpecializations && !Array.isArray(requiredSpecializations)) {
                throw new Error('Required specializations must be an array');
            }

            const result = await officerRepository.findBestAvailableOfficer(
                serviceId, 
                appointmentDate, 
                appointmentTime, 
                requiredSpecializations
            );
            
            return {
                success: result.found,
                data: result,
                message: result.found 
                    ? `Found suitable officer: ${result.recommended_officer.name}`
                    : `No suitable officer found: ${result.reason}`
            };

        } catch (error) {
            console.error('Error in OfficerService.findBestOfficerForService:', error);
            throw {
                success: false,
                error: error.message || 'Failed to find suitable officer',
                code: 'OFFICER_ASSIGNMENT_ERROR'
            };
        }
    }

    /**
     * Get officer workload and performance statistics
     */
    async getOfficerStatistics(officerId, dateFrom, dateTo) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(officerId)) {
                throw new Error('Invalid officer ID format');
            }

            // Validate date parameters
            if (!this.isValidDate(dateFrom) || !this.isValidDate(dateTo)) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }

            const fromDate = new Date(dateFrom);
            const toDate = new Date(dateTo);

            if (fromDate > toDate) {
                throw new Error('Start date cannot be after end date');
            }

            // Limit date range to prevent excessive data
            const daysDiff = Math.ceil((toDate - fromDate) / (1000 * 60 * 60 * 24));
            if (daysDiff > 365) {
                throw new Error('Date range cannot exceed 365 days');
            }

            // First check if officer exists
            const officer = await officerRepository.getOfficerById(officerId);
            if (!officer) {
                throw new Error('Officer not found');
            }

            const statistics = await officerRepository.getOfficerStatistics(officerId, dateFrom, dateTo);
            
            return {
                success: true,
                data: {
                    officer: {
                        id: officer.id,
                        name: officer.name.full,
                        designation: officer.designation,
                        department: officer.department.name
                    },
                    statistics,
                    insights: this.generatePerformanceInsights(statistics),
                    recommendations: this.generateRecommendations(statistics)
                },
                message: 'Officer statistics retrieved successfully'
            };

        } catch (error) {
            console.error('Error in OfficerService.getOfficerStatistics:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officer statistics',
                code: error.message === 'Officer not found' ? 'OFFICER_NOT_FOUND' : 'STATISTICS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get officers scheduled for a specific date across departments
     */
    async getOfficersScheduledForDate(date, departmentId = null) {
        try {
            // Validate date format
            if (!this.isValidDate(date)) {
                throw new Error('Invalid date format. Use YYYY-MM-DD');
            }

            // Validate department_id if provided
            if (departmentId && !this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            const filters = {
                active_only: true,
                available_only: false,
                department_id: departmentId,
                page: 1,
                limit: 100
            };

            const officers = await officerRepository.getAllOfficers(filters);
            
            // Check each officer's availability for the date
            const officerAvailabilities = await Promise.all(
                officers.officers.map(async (officer) => {
                    try {
                        const availability = await officerRepository.getOfficerAvailability(officer.id, date);
                        return {
                            officer: {
                                id: officer.id,
                                name: officer.name.full,
                                designation: officer.designation,
                                department: officer.department.name,
                                specializations: officer.specializations
                            },
                            availability: {
                                is_scheduled: availability.working_hours !== null,
                                is_available: availability.is_available,
                                working_hours: availability.working_hours,
                                available_slots: availability.available_slots.length,
                                booked_slots: availability.booked_slots.length
                            }
                        };
                    } catch (error) {
                        return {
                            officer: {
                                id: officer.id,
                                name: officer.name.full,
                                designation: officer.designation,
                                department: officer.department.name,
                                specializations: officer.specializations
                            },
                            availability: {
                                is_scheduled: false,
                                is_available: false,
                                error: error.message
                            }
                        };
                    }
                })
            );

            const scheduledOfficers = officerAvailabilities.filter(
                oa => oa.availability.is_scheduled
            );

            const availableOfficers = scheduledOfficers.filter(
                oa => oa.availability.is_available
            );

            return {
                success: true,
                data: {
                    date,
                    department_id: departmentId,
                    officers: officerAvailabilities,
                    summary: {
                        total_officers: officers.officers.length,
                        scheduled_officers: scheduledOfficers.length,
                        available_officers: availableOfficers.length,
                        total_available_slots: availableOfficers.reduce(
                            (sum, oa) => sum + (oa.availability.available_slots || 0), 0
                        ),
                        departments_covered: [...new Set(
                            scheduledOfficers.map(oa => oa.officer.department)
                        )]
                    }
                },
                message: `Found ${scheduledOfficers.length} officers scheduled for ${date}`
            };

        } catch (error) {
            console.error('Error in OfficerService.getOfficersScheduledForDate:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch officers schedule',
                code: 'OFFICERS_SCHEDULE_ERROR'
            };
        }
    }

    // Utility methods

    /**
     * Validate UUID format
     */
    isValidUUID(uuid) {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    }

    /**
     * Validate date format (YYYY-MM-DD)
     */
    isValidDate(dateString) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dateString)) {
            return false;
        }
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Validate time format (HH:MM)
     */
    isValidTime(timeString) {
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        return timeRegex.test(timeString);
    }

    /**
     * Generate availability insights
     */
    generateAvailabilityInsights(availability) {
        const insights = [];

        if (availability.is_available) {
            if (availability.available_slots.length > 8) {
                insights.push({
                    type: 'positive',
                    message: 'High availability - many time slots available'
                });
            } else if (availability.available_slots.length <= 2) {
                insights.push({
                    type: 'warning',
                    message: 'Limited availability - only few time slots remaining'
                });
            }

            if (availability.booked_slots.length > 6) {
                insights.push({
                    type: 'info',
                    message: 'Busy schedule - officer has many appointments scheduled'
                });
            }
        } else {
            if (availability.reason && availability.reason.includes('not scheduled')) {
                insights.push({
                    type: 'info',
                    message: 'Officer is not scheduled to work on this day'
                });
            }
        }

        return insights;
    }

    /**
     * Generate performance insights from statistics
     */
    generatePerformanceInsights(statistics) {
        const insights = [];
        const stats = statistics.statistics;

        // Completion rate insights
        if (stats.completion_rate >= 95) {
            insights.push({
                type: 'positive',
                message: 'Excellent completion rate - officer consistently delivers quality service'
            });
        } else if (stats.completion_rate < 80) {
            insights.push({
                type: 'warning',
                message: 'Low completion rate - may need support or training'
            });
        }

        // Rating insights - removed since no rating system implemented

        // Workload insights
        if (stats.total_appointments > 100) {
            insights.push({
                type: 'info',
                message: 'High activity level - experienced with many appointments'
            });
        }

        // No-show insights
        const noShowRate = stats.total_appointments > 0 
            ? (stats.no_show_appointments / stats.total_appointments) * 100 
            : 0;
        
        if (noShowRate > 15) {
            insights.push({
                type: 'warning',
                message: 'High no-show rate - may need better appointment confirmation process'
            });
        }

        return insights;
    }

    /**
     * Generate recommendations based on statistics
     */
    generateRecommendations(statistics) {
        const recommendations = [];
        const stats = statistics.statistics;

        if (stats.completion_rate < 85) {
            recommendations.push({
                category: 'performance',
                priority: 'high',
                message: 'Consider additional training or support to improve completion rate'
            });
        }

        if (stats.avg_appointment_duration > 45) {
            recommendations.push({
                category: 'efficiency',
                priority: 'medium',
                message: 'Appointment duration is above average - consider process optimization'
            });
        }

        if (stats.total_appointments < 10) {
            recommendations.push({
                category: 'utilization',
                priority: 'low',
                message: 'Low appointment volume - consider increasing availability or promotion'
            });
        }

        return recommendations;
    }
}

module.exports = new OfficerService();
