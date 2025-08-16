// src/controllers/serviceController.js
// Service Directory Controller - HTTP request handlers for appointment service
const serviceRepository = require('../repositories/serviceRepository');

/**
 * List all services with search, filter, and pagination
 * GET /api/services
 */
const listServices = async (req, res) => {
  try {
    const {
      search = '',
      department_id,
      category,
      min_fee,
      max_fee,
      language = 'en',
      sort = 'name_asc',
      page = 1,
      limit = 20,
      active_only = 'true'
    } = req.query;

    // Validate and sanitize input
    const filters = {
      search: search.trim(),
      department_id: department_id || null,
      category: category || null,
      min_fee: min_fee ? parseFloat(min_fee) : null,
      max_fee: max_fee ? parseFloat(max_fee) : null,
      language: ['en', 'si', 'ta'].includes(language) ? language : 'en',
      sort: ['name_asc', 'name_desc', 'fee_asc', 'fee_desc', 'duration_asc', 'duration_desc', 'priority_desc'].includes(sort) ? sort : 'name_asc',
      page: Math.max(1, parseInt(page) || 1),
      limit: Math.min(50, Math.max(1, parseInt(limit) || 20)), // Max 50 items per page
      active_only: active_only === 'true'
    };

    // Validate fee range
    if (filters.min_fee !== null && filters.max_fee !== null && filters.min_fee > filters.max_fee) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FEE_RANGE',
          message: 'Minimum fee cannot be greater than maximum fee',
          field: 'fee_range'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Validate UUID format for department_id if provided
    if (filters.department_id) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(filters.department_id)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_DEPARTMENT_ID',
            message: 'Invalid department ID format',
            field: 'department_id'
          },
          timestamp: new Date().toISOString()
        });
      }
    }

    // Get services from repository
    const result = await serviceRepository.getAllServices(filters);

    // Get filter options for frontend
    const filterOptions = await serviceRepository.getFilterOptions();

    // Format response
    res.status(200).json({
      success: true,
      data: {
        services: result.services,
        pagination: result.pagination,
        filters: {
          applied: {
            search: filters.search || null,
            department_id: filters.department_id,
            category: filters.category,
            min_fee: filters.min_fee,
            max_fee: filters.max_fee,
            language: filters.language,
            sort: filters.sort
          },
          available: filterOptions
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in listServices controller:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching services',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get service details by ID
 * GET /api/services/:id
 */
const getServiceDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'en' } = req.query;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_SERVICE_ID',
          message: 'Invalid service ID format',
          field: 'id'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Validate language
    const validLanguage = ['en', 'si', 'ta'].includes(language) ? language : 'en';

    // Get service from repository
    const service = await serviceRepository.getServiceById(id, validLanguage);

    if (!service) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SERVICE_NOT_FOUND',
          message: 'Service not found or is not active',
          field: 'id'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Get related services from the same department
    const relatedServices = await serviceRepository.getServicesByDepartment(
      service.department.id, 
      validLanguage
    );

    // Filter out the current service from related services
    const filteredRelatedServices = relatedServices
      .filter(relatedService => relatedService.id !== service.id)
      .slice(0, 5); // Limit to 5 related services

    res.status(200).json({
      success: true,
      data: {
        service,
        related_services: filteredRelatedServices
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getServiceDetails controller:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching service details',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get available service categories
 * GET /api/services/categories
 */
const getServiceCategories = async (req, res) => {
  try {
    const categories = await serviceRepository.getServiceCategories();

    res.status(200).json({
      success: true,
      data: {
        categories,
        count: categories.length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in getServiceCategories controller:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An error occurred while fetching service categories',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  listServices,
  getServiceDetails,
  getServiceCategories
};
