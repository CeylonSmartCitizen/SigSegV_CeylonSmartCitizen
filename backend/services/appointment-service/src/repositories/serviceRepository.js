// src/repositories/serviceRepository.js
// Service Directory Repository - Database layer for service management
const { query } = require('../config/database');

/**
 * Get all services with filtering, search, and pagination
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Text search term
 * @param {string} filters.department_id - Department UUID filter
 * @param {string} filters.category - Service category filter
 * @param {number} filters.min_fee - Minimum fee filter
 * @param {number} filters.max_fee - Maximum fee filter
 * @param {string} filters.language - Language preference (en, si, ta)
 * @param {string} filters.sort - Sort option (name_asc, name_desc, fee_asc, fee_desc, duration_asc, duration_desc)
 * @param {number} filters.page - Page number (default: 1)
 * @param {number} filters.limit - Items per page (default: 20)
 * @param {boolean} filters.active_only - Filter active services only (default: true)
 * @returns {Object} Services list with pagination metadata
 */
const getAllServices = async (filters = {}) => {
  try {
    const {
      search = '',
      department_id = null,
      category = null,
      min_fee = null,
      max_fee = null,
      language = 'en',
      sort = 'name_asc',
      page = 1,
      limit = 20,
      active_only = true
    } = filters;

    const offset = (page - 1) * limit;
    const queryParams = [];
    let paramCount = 0;

    // Base query with JOIN to departments table
    let baseQuery = `
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
        s.created_at,
        d.id as department_id,
        d.name as department_name,
        d.name_si as department_name_si,
        d.name_ta as department_name_ta,
        d.contact_number as department_contact,
        d.email as department_email,
        d.working_hours as department_working_hours
      FROM services s
      INNER JOIN departments d ON s.department_id = d.id
    `;

    // WHERE conditions
    const whereConditions = [];

    // Active services filter
    if (active_only) {
      whereConditions.push(`s.is_active = true AND d.is_active = true`);
    }

    // Search across multi-language fields
    if (search && search.trim()) {
      paramCount++;
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      queryParams.push(searchPattern);
      whereConditions.push(`(
        LOWER(s.name) LIKE $${paramCount} OR
        LOWER(s.name_si) LIKE $${paramCount} OR
        LOWER(s.name_ta) LIKE $${paramCount} OR
        LOWER(s.description) LIKE $${paramCount} OR
        LOWER(s.description_si) LIKE $${paramCount} OR
        LOWER(s.description_ta) LIKE $${paramCount} OR
        LOWER(d.name) LIKE $${paramCount} OR
        LOWER(d.name_si) LIKE $${paramCount} OR
        LOWER(d.name_ta) LIKE $${paramCount}
      )`);
    }

    // Department filter
    if (department_id) {
      paramCount++;
      queryParams.push(department_id);
      whereConditions.push(`s.department_id = $${paramCount}`);
    }

    // Category filter
    if (category) {
      paramCount++;
      queryParams.push(category);
      whereConditions.push(`s.category = $${paramCount}`);
    }

    // Fee range filter
    if (min_fee !== null) {
      paramCount++;
      queryParams.push(min_fee);
      whereConditions.push(`s.fee_amount >= $${paramCount}`);
    }

    if (max_fee !== null) {
      paramCount++;
      queryParams.push(max_fee);
      whereConditions.push(`s.fee_amount <= $${paramCount}`);
    }

    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
    }

    // Sorting
    let orderBy = '';
    switch (sort) {
      case 'name_asc':
        orderBy = `ORDER BY s.name ASC`;
        break;
      case 'name_desc':
        orderBy = `ORDER BY s.name DESC`;
        break;
      case 'fee_asc':
        orderBy = `ORDER BY s.fee_amount ASC`;
        break;
      case 'fee_desc':
        orderBy = `ORDER BY s.fee_amount DESC`;
        break;
      case 'duration_asc':
        orderBy = `ORDER BY s.estimated_duration_minutes ASC`;
        break;
      case 'duration_desc':
        orderBy = `ORDER BY s.estimated_duration_minutes DESC`;
        break;
      case 'priority_desc':
        orderBy = `ORDER BY s.priority_level DESC, s.name ASC`;
        break;
      default:
        orderBy = `ORDER BY s.name ASC`;
    }

    // Count query for pagination
    const countQuery = baseQuery.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await query(countQuery, queryParams);
    const totalCount = parseInt(countResult.rows[0].total);

    // Add pagination and sorting to main query
    const finalQuery = `${baseQuery} ${orderBy} LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    // Execute main query
    const result = await query(finalQuery, queryParams);

    // Format results based on language preference
    const services = result.rows.map(row => formatServiceResponse(row, language));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);

    return {
      services,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_count: totalCount,
        per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };

  } catch (error) {
    console.error('Error in getAllServices:', error);
    throw error;
  }
};

/**
 * Get service by ID with department details
 * @param {string} serviceId - Service UUID
 * @param {string} language - Language preference (en, si, ta)
 * @returns {Object|null} Service details or null if not found
 */
const getServiceById = async (serviceId, language = 'en') => {
  try {
    const queryText = `
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
        s.created_at,
        d.id as department_id,
        d.name as department_name,
        d.name_si as department_name_si,
        d.name_ta as department_name_ta,
        d.description as department_description,
        d.contact_number as department_contact,
        d.email as department_email,
        d.address as department_address,
        d.working_hours as department_working_hours
      FROM services s
      INNER JOIN departments d ON s.department_id = d.id
      WHERE s.id = $1 AND s.is_active = true AND d.is_active = true
    `;

    const result = await query(queryText, [serviceId]);

    if (result.rows.length === 0) {
      return null;
    }

    return formatServiceResponse(result.rows[0], language);

  } catch (error) {
    console.error('Error in getServiceById:', error);
    throw error;
  }
};

/**
 * Get available service categories for filtering
 * @returns {Array} List of unique categories
 */
const getServiceCategories = async () => {
  try {
    const queryText = `
      SELECT DISTINCT category 
      FROM services 
      WHERE category IS NOT NULL AND is_active = true
      ORDER BY category ASC
    `;

    const result = await query(queryText);
    return result.rows.map(row => row.category);

  } catch (error) {
    console.error('Error in getServiceCategories:', error);
    throw error;
  }
};

/**
 * Get services by department
 * @param {string} departmentId - Department UUID
 * @param {string} language - Language preference
 * @returns {Array} List of services for the department
 */
const getServicesByDepartment = async (departmentId, language = 'en') => {
  try {
    const queryText = `
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
        s.category
      FROM services s
      WHERE s.department_id = $1 AND s.is_active = true
      ORDER BY s.name ASC
    `;

    const result = await query(queryText, [departmentId]);
    return result.rows.map(row => formatServiceResponse(row, language));

  } catch (error) {
    console.error('Error in getServicesByDepartment:', error);
    throw error;
  }
};

/**
 * Get filter options for frontend (categories, departments, fee ranges)
 * @returns {Object} Available filter options
 */
const getFilterOptions = async () => {
  try {
    // Get categories
    const categoriesQuery = `
      SELECT DISTINCT category, COUNT(*) as count
      FROM services 
      WHERE category IS NOT NULL AND is_active = true
      GROUP BY category
      ORDER BY category ASC
    `;

    // Get departments
    const departmentsQuery = `
      SELECT DISTINCT d.id, d.name, d.name_si, d.name_ta, COUNT(s.id) as services_count
      FROM departments d
      INNER JOIN services s ON d.id = s.department_id
      WHERE d.is_active = true AND s.is_active = true
      GROUP BY d.id, d.name, d.name_si, d.name_ta
      ORDER BY d.name ASC
    `;

    // Get fee ranges
    const feeRangesQuery = `
      SELECT 
        MIN(fee_amount) as min_fee,
        MAX(fee_amount) as max_fee,
        PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY fee_amount) as q1_fee,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY fee_amount) as median_fee,
        PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY fee_amount) as q3_fee
      FROM services 
      WHERE is_active = true AND fee_amount > 0
    `;

    const [categoriesResult, departmentsResult, feeRangesResult] = await Promise.all([
      query(categoriesQuery),
      query(departmentsQuery),
      query(feeRangesQuery)
    ]);

    return {
      categories: categoriesResult.rows,
      departments: departmentsResult.rows,
      fee_ranges: feeRangesResult.rows[0] || {
        min_fee: 0,
        max_fee: 0,
        q1_fee: 0,
        median_fee: 0,
        q3_fee: 0
      }
    };

  } catch (error) {
    console.error('Error in getFilterOptions:', error);
    throw error;
  }
};

/**
 * Format service response based on language preference
 * @param {Object} row - Database row
 * @param {string} language - Language preference (en, si, ta)
 * @returns {Object} Formatted service object
 */
const formatServiceResponse = (row, language = 'en') => {
  // Select appropriate language fields
  const getLocalizedText = (field) => {
    switch (language) {
      case 'si':
        return row[`${field}_si`] || row[field] || '';
      case 'ta':
        return row[`${field}_ta`] || row[field] || '';
      default:
        return row[field] || '';
    }
  };

  const service = {
    id: row.id,
    name: getLocalizedText('name'),
    description: getLocalizedText('description'),
    category: row.category,
    fee_amount: parseFloat(row.fee_amount || 0),
    estimated_duration_minutes: row.estimated_duration_minutes,
    required_documents: row.required_documents || [],
    online_available: row.online_available,
    priority_level: row.priority_level,
    max_daily_appointments: row.max_daily_appointments,
    is_active: row.is_active,
    created_at: row.created_at,
    department: {
      id: row.department_id,
      name: getLocalizedText('department_name'),
      contact_number: row.department_contact,
      email: row.department_email,
      working_hours: row.department_working_hours
    }
  };

  // Add additional department details if available
  if (row.department_description) {
    service.department.description = getLocalizedText('department');
  }
  if (row.department_address) {
    service.department.address = row.department_address;
  }

  // Include all language versions for multi-language support
  if (language === 'all') {
    service.name_variants = {
      en: row.name,
      si: row.name_si,
      ta: row.name_ta
    };
    service.description_variants = {
      en: row.description,
      si: row.description_si,
      ta: row.description_ta
    };
  }

  return service;
};

module.exports = {
  getAllServices,
  getServiceById,
  getServiceCategories,
  getServicesByDepartment,
  getFilterOptions
};
