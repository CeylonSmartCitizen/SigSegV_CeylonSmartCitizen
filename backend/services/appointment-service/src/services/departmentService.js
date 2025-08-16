const departmentRepository = require('../repositories/departmentRepository');
const officerRepository = require('../repositories/officerRepository');

/**
 * Department Service - Business logic for department operations
 */

class DepartmentService {
    /**
     * Get all departments with filtering and search
     */
    async getAllDepartments(filters) {
        try {
            // Validate language parameter
            if (filters.language && !['en', 'si', 'ta'].includes(filters.language)) {
                throw new Error('Invalid language parameter. Supported: en, si, ta');
            }

            // Validate pagination parameters
            if (filters.page && filters.page < 1) {
                throw new Error('Page number must be greater than 0');
            }

            if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
                throw new Error('Limit must be between 1 and 100');
            }

            const result = await departmentRepository.getAllDepartments(filters);
            
            return {
                success: true,
                data: result,
                message: `Found ${result.departments.length} departments`
            };

        } catch (error) {
            console.error('Error in DepartmentService.getAllDepartments:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch departments',
                code: 'DEPARTMENTS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get department by ID with comprehensive details
     */
    async getDepartmentById(departmentId, language = 'en') {
        try {
            // Validate UUID format
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            // Validate language parameter
            if (!['en', 'si', 'ta'].includes(language)) {
                throw new Error('Invalid language parameter. Supported: en, si, ta');
            }

            const department = await departmentRepository.getDepartmentById(departmentId, language);
            
            if (!department) {
                throw new Error('Department not found');
            }

            return {
                success: true,
                data: department,
                message: 'Department details retrieved successfully'
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentById:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department details',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'DEPARTMENT_FETCH_ERROR'
            };
        }
    }

    /**
     * Get services offered by a department
     */
    async getDepartmentServices(departmentId, options = {}) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            // Validate language parameter
            if (options.language && !['en', 'si', 'ta'].includes(options.language)) {
                throw new Error('Invalid language parameter. Supported: en, si, ta');
            }

            // First check if department exists
            const department = await departmentRepository.getDepartmentById(departmentId);
            if (!department) {
                throw new Error('Department not found');
            }

            const services = await departmentRepository.getDepartmentServices(departmentId, options);
            
            return {
                success: true,
                data: {
                    department: {
                        id: department.id,
                        name: department.name,
                        is_active: department.is_active
                    },
                    services,
                    total_services: services.length,
                    active_services: services.filter(s => s.is_active).length
                },
                message: `Found ${services.length} services for department`
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentServices:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department services',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'SERVICES_FETCH_ERROR'
            };
        }
    }

    /**
     * Get current operational status of a department
     */
    async getDepartmentStatus(departmentId) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            const status = await departmentRepository.getDepartmentStatus(departmentId);
            
            return {
                success: true,
                data: status,
                message: 'Department status retrieved successfully'
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentStatus:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department status',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'STATUS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get department officers with availability information
     */
    async getDepartmentOfficers(departmentId, options = {}) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            // First check if department exists
            const department = await departmentRepository.getDepartmentById(departmentId);
            if (!department) {
                throw new Error('Department not found');
            }

            const result = await officerRepository.getOfficersByDepartment(departmentId, options);
            
            return {
                success: true,
                data: {
                    department: {
                        id: department.id,
                        name: department.name,
                        is_active: department.is_active
                    },
                    officers: result.officers,
                    pagination: result.pagination,
                    summary: {
                        total_officers: result.officers.length,
                        active_officers: result.officers.filter(o => o.is_active).length,
                        available_now: result.officers.filter(o => 
                            o.current_availability && o.current_availability.is_available
                        ).length
                    }
                },
                message: `Found ${result.officers.length} officers in department`
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentOfficers:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department officers',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'OFFICERS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get department analytics and performance metrics
     */
    async getDepartmentAnalytics(departmentId, dateFrom, dateTo) {
        try {
            // Validate UUID format
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
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

            // First check if department exists
            const department = await departmentRepository.getDepartmentById(departmentId);
            if (!department) {
                throw new Error('Department not found');
            }

            const analytics = await departmentRepository.getDepartmentAnalytics(departmentId, dateFrom, dateTo);
            
            return {
                success: true,
                data: {
                    department: {
                        id: department.id,
                        name: department.name
                    },
                    analytics,
                    insights: this.generateInsights(analytics)
                },
                message: 'Department analytics retrieved successfully'
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentAnalytics:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department analytics',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'ANALYTICS_FETCH_ERROR'
            };
        }
    }

    /**
     * Get comprehensive department overview with all related information
     */
    async getDepartmentOverview(departmentId, language = 'en') {
        try {
            // Validate parameters
            if (!this.isValidUUID(departmentId)) {
                throw new Error('Invalid department ID format');
            }

            if (!['en', 'si', 'ta'].includes(language)) {
                throw new Error('Invalid language parameter. Supported: en, si, ta');
            }

            // Fetch all department information in parallel
            const [
                department,
                services,
                officers,
                status
            ] = await Promise.all([
                departmentRepository.getDepartmentById(departmentId, language),
                departmentRepository.getDepartmentServices(departmentId, { language, active_only: false }),
                officerRepository.getOfficersByDepartment(departmentId, { active_only: false, include_availability: true }),
                departmentRepository.getDepartmentStatus(departmentId)
            ]);

            if (!department) {
                throw new Error('Department not found');
            }

            return {
                success: true,
                data: {
                    department,
                    services: {
                        list: services,
                        total: services.length,
                        active: services.filter(s => s.is_active).length,
                        categories: [...new Set(services.map(s => s.category))].filter(Boolean)
                    },
                    officers: {
                        list: officers.officers,
                        total: officers.officers.length,
                        active: officers.officers.filter(o => o.is_active).length,
                        available_now: officers.officers.filter(o => 
                            o.current_availability && o.current_availability.is_available
                        ).length,
                        specializations: [...new Set(
                            officers.officers.flatMap(o => o.specializations || [])
                        )].filter(Boolean)
                    },
                    current_status: status,
                    summary: {
                        is_operational: department.is_active && status.is_open,
                        total_capacity: officers.officers.filter(o => o.is_active).length,
                        current_workload: status.today_statistics.people_in_queue,
                        service_categories: [...new Set(services.map(s => s.category))].filter(Boolean).length
                    }
                },
                message: 'Department overview retrieved successfully'
            };

        } catch (error) {
            console.error('Error in DepartmentService.getDepartmentOverview:', error);
            throw {
                success: false,
                error: error.message || 'Failed to fetch department overview',
                code: error.message === 'Department not found' ? 'DEPARTMENT_NOT_FOUND' : 'OVERVIEW_FETCH_ERROR'
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
     * Generate insights from analytics data
     */
    generateInsights(analytics) {
        const insights = [];
        const stats = analytics.statistics;

        // Completion rate insights
        if (stats.completion_rate >= 90) {
            insights.push({
                type: 'positive',
                message: 'Excellent completion rate - department is performing very well'
            });
        } else if (stats.completion_rate < 70) {
            insights.push({
                type: 'warning',
                message: 'Low completion rate - may need attention to improve service delivery'
            });
        }

        // Workload insights
        if (stats.total_appointments > 0) {
            const appointmentsPerOfficer = stats.total_appointments / (stats.total_officers || 1);
            if (appointmentsPerOfficer > 50) {
                insights.push({
                    type: 'info',
                    message: 'High workload per officer - consider adding more staff during peak periods'
                });
            }
        }

        // Service duration insights
        if (stats.avg_service_duration > 0) {
            if (stats.avg_service_duration > 60) {
                insights.push({
                    type: 'info',
                    message: 'Average service duration is over 1 hour - consider process optimization'
                });
            }
        }

        return insights;
    }
}

module.exports = new DepartmentService();
