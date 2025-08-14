const departmentService = require('../services/departmentService');

/**
 * Department Controller - Handles HTTP requests for department endpoints
 */

class DepartmentController {
    /**
     * GET /api/departments
     * Get all departments with optional filtering
     */
    async getAllDepartments(req, res) {
        try {
            const {
                active_only = false,
                language = 'en',
                page = 1,
                limit = 20,
                search = ''
            } = req.query;

            const filters = {
                active_only: active_only === 'true' || active_only === true,
                language: String(language).toLowerCase(),
                page: parseInt(page),
                limit: parseInt(limit),
                search: String(search).trim()
            };

            const result = await departmentService.getAllDepartments(filters);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getAllDepartments controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch departments',
                code: error.code || 'DEPARTMENTS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id
     * Get department by ID with detailed information
     */
    async getDepartmentById(req, res) {
        try {
            const { id } = req.params;
            const { language = 'en' } = req.query;

            const result = await departmentService.getDepartmentById(id, language);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentById controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department',
                code: error.code || 'DEPARTMENT_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id/services
     * Get services offered by a department
     */
    async getDepartmentServices(req, res) {
        try {
            const { id } = req.params;
            const {
                active_only = false,
                language = 'en'
            } = req.query;

            const options = {
                active_only: active_only === 'true' || active_only === true,
                language: String(language).toLowerCase()
            };

            const result = await departmentService.getDepartmentServices(id, options);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentServices controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department services',
                code: error.code || 'SERVICES_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id/status
     * Get current operational status of a department
     */
    async getDepartmentStatus(req, res) {
        try {
            const { id } = req.params;

            const result = await departmentService.getDepartmentStatus(id);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentStatus controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department status',
                code: error.code || 'STATUS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id/officers
     * Get officers in a department with availability information
     */
    async getDepartmentOfficers(req, res) {
        try {
            const { id } = req.params;
            const {
                active_only = true,
                include_availability = true
            } = req.query;

            const options = {
                active_only: active_only === 'true' || active_only === true,
                include_availability: include_availability === 'true' || include_availability === true
            };

            const result = await departmentService.getDepartmentOfficers(id, options);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentOfficers controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department officers',
                code: error.code || 'OFFICERS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id/analytics
     * Get department analytics and performance metrics
     */
    async getDepartmentAnalytics(req, res) {
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

            const result = await departmentService.getDepartmentAnalytics(id, dateFrom, dateTo);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentAnalytics controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department analytics',
                code: error.code || 'ANALYTICS_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/:id/overview
     * Get comprehensive department overview with all related information
     */
    async getDepartmentOverview(req, res) {
        try {
            const { id } = req.params;
            const { language = 'en' } = req.query;

            const result = await departmentService.getDepartmentOverview(id, language);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getDepartmentOverview controller:', error);
            res.status(error.code === 'DEPARTMENT_NOT_FOUND' ? 404 : 400).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch department overview',
                code: error.code || 'OVERVIEW_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/search
     * Search departments by various criteria
     */
    async searchDepartments(req, res) {
        try {
            const {
                query = '',
                language = 'en',
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
                language: String(language).toLowerCase(),
                active_only: active_only === 'true' || active_only === true,
                page: parseInt(page),
                limit: parseInt(limit)
            };

            const result = await departmentService.getAllDepartments(filters);

            res.status(200).json({
                success: true,
                data: result.data,
                message: result.message,
                search_query: query,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in searchDepartments controller:', error);
            res.status(400).json({
                success: false,
                error: error.error || error.message || 'Failed to search departments',
                code: error.code || 'SEARCH_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }

    /**
     * GET /api/departments/operational-status
     * Get operational status summary for all departments
     */
    async getAllDepartmentsStatus(req, res) {
        try {
            const { active_only = true } = req.query;

            // First get all departments
            const filters = {
                active_only: active_only === 'true' || active_only === true,
                page: 1,
                limit: 100
            };

            const departments = await departmentService.getAllDepartments(filters);

            // Get status for each department
            const statusPromises = departments.data.departments.map(async (dept) => {
                try {
                    const statusResult = await departmentService.getDepartmentStatus(dept.id);
                    return {
                        department: {
                            id: dept.id,
                            name: dept.name,
                            is_active: dept.is_active
                        },
                        status: statusResult.data,
                        last_updated: new Date().toISOString()
                    };
                } catch (error) {
                    return {
                        department: {
                            id: dept.id,
                            name: dept.name,
                            is_active: dept.is_active
                        },
                        status: {
                            current_status: 'error',
                            is_open: false,
                            error: error.message
                        },
                        last_updated: new Date().toISOString()
                    };
                }
            });

            const departmentStatuses = await Promise.all(statusPromises);

            const summary = {
                total_departments: departmentStatuses.length,
                open_departments: departmentStatuses.filter(ds => ds.status.is_open).length,
                closed_departments: departmentStatuses.filter(ds => !ds.status.is_open && ds.status.current_status !== 'error').length,
                error_departments: departmentStatuses.filter(ds => ds.status.current_status === 'error').length,
                total_people_in_queue: departmentStatuses.reduce(
                    (sum, ds) => sum + (ds.status.today_statistics?.people_in_queue || 0), 0
                ),
                total_active_sessions: departmentStatuses.reduce(
                    (sum, ds) => sum + (ds.status.today_statistics?.active_queue_sessions || 0), 0
                )
            };

            res.status(200).json({
                success: true,
                data: {
                    departments: departmentStatuses,
                    summary,
                    last_updated: new Date().toISOString()
                },
                message: `Retrieved status for ${departmentStatuses.length} departments`,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Error in getAllDepartmentsStatus controller:', error);
            res.status(500).json({
                success: false,
                error: error.error || error.message || 'Failed to fetch departments status',
                code: error.code || 'STATUS_SUMMARY_ERROR',
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = new DepartmentController();
