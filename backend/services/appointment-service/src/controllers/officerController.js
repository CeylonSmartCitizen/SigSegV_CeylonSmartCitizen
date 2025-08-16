const officerService = require('../services/officerService');

/**
 * Officer Controller - Handles HTTP requests for officer endpoints
 */

class OfficerController {
    /**
     * GET /api/officers
     * Get all officers with optional filtering
     */
    async getAllOfficers(req, res) {
        try {
            const {
                department_id,
                specializations,
                active_only = false,
                available_only = false,
                page = 1,
                limit = 20,
                search = ''
            } = req.query;

            const filters = {
                department_id: department_id || undefined,
                specializations: specializations ? 
                    (Array.isArray(specializations) ? specializations : [specializations]) : 
                    undefined,
                active_only: active_only === 'true' || active_only === true,
                available_only: available_only === 'true' || available_only === true,
                page: parseInt(page),
                limit: parseInt(limit),
                search: String(search).trim()
            };

            const result = await officerService.getAllOfficers(filters);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getAllOfficers controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officers',
                code: error.code || 'OFFICERS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/:id
     * Get officer by ID with detailed information
     */
    async getOfficerById(req, res) {
        try {
            const { id } = req.params;

            const result = await officerService.getOfficerById(id);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getOfficerById controller:', error);
            res.status(error.code === 'OFFICER_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officer',
                code: error.code || 'OFFICER_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/specialization/:specializations
     * Get officers by specialization
     */
    async getOfficersBySpecialization(req, res) {
        try {
            const { specializations } = req.params;
            const {
                department_id,
                active_only = true
            } = req.query;

            // Parse specializations from URL parameter
            const specializationArray = specializations.split(',').map(s => s.trim()).filter(Boolean);

            const options = {
                department_id: department_id || undefined,
                active_only: active_only === 'true' || active_only === true
            };

            const result = await officerService.getOfficersBySpecialization(specializationArray, options);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getOfficersBySpecialization controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officers by specialization',
                code: error.code || 'SPECIALIZATION_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/:id/availability/:date
     * Get officer availability for a specific date
     */
    async getOfficerAvailability(req, res) {
        try {
            const { id, date } = req.params;

            const result = await officerService.getOfficerAvailability(id, date);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getOfficerAvailability controller:', error);
            res.status(error.code === 'OFFICER_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officer availability',
                code: error.code || 'AVAILABILITY_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * POST /api/officers/find-best-for-service
     * Find best available officer for a service appointment
     */
    async findBestOfficerForService(req, res) {
        try {
            const {
                service_id,
                appointment_date,
                appointment_time,
                required_specializations = []
            } = req.body;

            // Validate required fields
            if (!service_id) {
                return res.status(400).json({
                    success: false,
                    error: 'Service ID is required',
                    code: 'MISSING_SERVICE_ID',
                    timestamp: new Date().toISOString()
                });
            }

            if (!appointment_date) {
                return res.status(400).json({
                    success: false,
                    error: 'Appointment date is required',
                    code: 'MISSING_APPOINTMENT_DATE',
                    timestamp: new Date().toISOString()
                });
            }

            if (!appointment_time) {
                return res.status(400).json({
                    success: false,
                    error: 'Appointment time is required',
                    code: 'MISSING_APPOINTMENT_TIME',
                    timestamp: new Date().toISOString()
                });
            }

            const result = await officerService.findBestOfficerForService(
                service_id,
                appointment_date,
                appointment_time,
                required_specializations
            );

            res.status(result.success ? 200 : 404).json({
                success: result.success,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in findBestOfficerForService controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to find suitable officer',
                code: error.code || 'OFFICER_ASSIGNMENT_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/:id/statistics
     * Get officer workload and performance statistics
     */
    async getOfficerStatistics(req, res) {
        try {
            const { id } = req.params;
            const {
                date_from,
                date_to
            } = req.query;

            // Default to last 30 days if dates not provided
            const dateTo = date_to || new Date().toISOString().split('T')[0];
            const dateFrom = date_from || (() => {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                return date.toISOString().split('T')[0];
            })();

            const result = await officerService.getOfficerStatistics(id, dateFrom, dateTo);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getOfficerStatistics controller:', error);
            res.status(error.code === 'OFFICER_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officer statistics',
                code: error.code || 'STATISTICS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/schedule/:date
     * Get officers scheduled for a specific date
     */
    async getOfficersScheduledForDate(req, res) {
        try {
            const { date } = req.params;
            const { department_id } = req.query;

            const result = await officerService.getOfficersScheduledForDate(date, department_id);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getOfficersScheduledForDate controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch officers schedule',
                code: error.code || 'SCHEDULE_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/search
     * Search officers by various criteria
     */
    async searchOfficers(req, res) {
        try {
            const {
                query = '',
                department_id,
                specializations,
                active_only = true,
                page = 1,
                limit = 20
            } = req.query;

            if (!query.trim()) {
                return res.status(400).json({
                    success: false,
                    error: 'Search query is required',
                    code: 'INVALID_SEARCH_QUERY',
                    timestamp: new Date().toISOString()
                });
            }

            const filters = {
                search: String(query).trim(),
                department_id: department_id || undefined,
                specializations: specializations ? 
                    (Array.isArray(specializations) ? specializations : [specializations]) : 
                    undefined,
                active_only: active_only === 'true' || active_only === true,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await officerService.getAllOfficers(filters);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                search_query: query,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in searchOfficers controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to search officers',
                code: error.code || 'SEARCH_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/availability-summary/:date
     * Get availability summary for all officers on a specific date
     */
    async getAvailabilitySummary(req, res) {
        try {
            const { date } = req.params;
            const {
                department_id,
                specialization
            } = req.query;

            const result = await officerService.getOfficersScheduledForDate(date, department_id);

            // Filter by specialization if provided
            let filteredOfficers = result.data.officers;
            if (specialization) {
                filteredOfficers = filteredOfficers.filter(oa => 
                    oa.officer.specializations.includes(specialization)
                );
            }

            const summary = {
                date,
                filters: {
                    department_id: department_id || null,
                    specialization: specialization || null
                },
                availability_summary: {
                    total_officers: filteredOfficers.length,
                    scheduled_officers: filteredOfficers.filter(oa => oa.availability.is_scheduled).length,
                    available_officers: filteredOfficers.filter(oa => oa.availability.is_available).length,
                    total_available_slots: filteredOfficers.reduce(
                        (sum, oa) => sum + (oa.availability.available_slots || 0), 0
                    ),
                    busy_officers: filteredOfficers.filter(oa => 
                        oa.availability.is_scheduled && !oa.availability.is_available
                    ).length
                },
                officers: filteredOfficers.map(oa => ({
                    id: oa.officer.id,
                    name: oa.officer.name,
                    department: oa.officer.department,
                    specializations: oa.officer.specializations,
                    is_scheduled: oa.availability.is_scheduled,
                    is_available: oa.availability.is_available,
                    available_slots: oa.availability.available_slots || 0,
                    booked_slots: oa.availability.booked_slots || 0
                }))
            };

            res.status(200).json({
                success: true,
                data: summary,
                message: `Availability summary for ${filteredOfficers.length} officers on ${date}`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getAvailabilitySummary controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch availability summary',
                code: error.code || 'AVAILABILITY_SUMMARY_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/officers/specializations
     * Get list of all available specializations
     */
    async getAllSpecializations(req, res) {
        try {
            const { department_id } = req.query;

            const filters = {
                department_id: department_id || undefined,
                active_only: true,
                page: 1,
                limit: 100 // Set a reasonable limit for getting all officers
            };

            const result = await officerService.getAllOfficers(filters);

            // Extract unique specializations
            const allSpecializations = result.data.officers.flatMap(officer => 
                officer.specializations || []
            );

            const uniqueSpecializations = [...new Set(allSpecializations)]
                .filter(Boolean)
                .sort();

            // Count officers for each specialization
            const specializationCounts = uniqueSpecializations.map(spec => ({
                specialization: spec,
                officer_count: result.data.officers.filter(officer => 
                    (officer.specializations || []).includes(spec)
                ).length
            }));

            res.status(200).json({
                success: true,
                data: {
                    specializations: uniqueSpecializations,
                    specialization_counts: specializationCounts,
                    total_specializations: uniqueSpecializations.length,
                    department_id: department_id || null
                },
                message: `Found ${uniqueSpecializations.length} unique specializations`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getAllSpecializations controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch specializations',
                code: error.code || 'SPECIALIZATIONS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = new OfficerController();
