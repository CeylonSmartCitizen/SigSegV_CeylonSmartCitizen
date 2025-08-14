// ================================================================================================
// IMPORTANT: AUTHENTICATION TEMPORARILY DISABLED FOR TESTING
// 
// TO RE-ENABLE AUTHENTICATION:
// 1. In routes/appointments.js: Uncomment router.use(auth);
// 2. In this file: Remove all fallback user_id assignments (search for '550e8400-e29b-41d4-a716-446655440000')
// 3. Ensure req.user.user_id is properly extracted from JWT tokens
// 4. Test with valid JWT tokens from auth service
// 5. Remove all comments marked with "TEMPORARY: AUTH DISABLED"
// ================================================================================================

const appointmentService = require('../services/appointmentService');
const { getPreferredLanguage, pickLang } = require('../utils/languageHelper');

// Appointment Controller
// Handles: createAppointment, getAppointments, updateAppointment

exports.createAppointment = async (req, res, next) => {
  try {
    // ================================================================================================
    // TEMPORARY: AUTH DISABLED - USING TEST USER ID
    // TODO: REMOVE WHEN RE-ENABLING AUTHENTICATION
    // When auth is re-enabled, remove the fallback and use only: req.user.user_id
    // ================================================================================================
    const user_id = req.user && req.user.user_id || '4534a6f8-4312-4afa-b500-3f92048d2ae5'; // John Doe's actual ID for testing
    
    const { service_id, preferred_date, preferred_time, notes } = req.body;
    // TODO: Add input validation here
    const appointment = await appointmentService.createAppointment({
      user_id,
      service_id,
      preferred_date,
      preferred_time,
      notes
    });
    // Language preference
    const lang = getPreferredLanguage(req);
    if (appointment.service) {
      appointment.service = {
        ...pickLang(appointment.service, lang, [
          { base: 'name', si: 'name_si', ta: 'name_ta' },
          { base: 'description', si: 'description_si', ta: 'description_ta' },
          { base: 'department_name', si: 'department_name_si', ta: 'department_name_ta' }
        ]),
        // include all fields for frontend flexibility
        name_si: appointment.service.name_si,
        name_ta: appointment.service.name_ta,
        description_si: appointment.service.description_si,
        description_ta: appointment.service.description_ta,
        department_name_si: appointment.service.department_name_si,
        department_name_ta: appointment.service.department_name_ta
      };
    }
    return res.status(201).json({ success: true, data: appointment });
  } catch (err) {
    err.status = err.status || 400;
    err.code = err.code || err.message;
    return next(err);
  }
};

exports.getAppointments = async (req, res, next) => {
  try {
    // ================================================================================================
    // TEMPORARY: AUTH DISABLED - USING TEST USER ID  
    // TODO: REMOVE WHEN RE-ENABLING AUTHENTICATION
    // When auth is re-enabled, remove the fallback and use only: req.user.user_id
    // ================================================================================================
    const user_id = req.user && req.user.user_id || '4534a6f8-4312-4afa-b500-3f92048d2ae5'; // John Doe's actual ID for testing
    
    const { status, page = 1, limit = 10, sort = 'date_desc' } = req.query;
    
    // Convert sort parameter to SQL ORDER BY syntax
    const sortMap = {
      'date_asc': 'appointment_date ASC',
      'date_desc': 'appointment_date DESC',
      'created_asc': 'created_at ASC',
      'created_desc': 'created_at DESC',
      'status_asc': 'status ASC',
      'status_desc': 'status DESC'
    };
    const sqlSort = sortMap[sort] || 'appointment_date DESC';
    
    // TODO: Add input validation here
    const result = await appointmentService.getAppointments({
      user_id,
      status,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: sqlSort
    });
    // Language preference
    const lang = getPreferredLanguage(req);
    result.appointments = result.appointments.map(a => {
      if (a.service) {
        a.service = {
          ...pickLang(a.service, lang, [
            { base: 'name', si: 'name_si', ta: 'name_ta' },
            { base: 'description', si: 'description_si', ta: 'description_ta' },
            { base: 'department_name', si: 'department_name_si', ta: 'department_name_ta' }
          ]),
          name_si: a.service.name_si,
          name_ta: a.service.name_ta,
          description_si: a.service.description_si,
          description_ta: a.service.description_ta,
          department_name_si: a.service.department_name_si,
          department_name_ta: a.service.department_name_ta
        };
      }
      return a;
    });
    return res.status(200).json({ success: true, data: result });
  } catch (err) {
    err.status = err.status || 400;
    err.code = err.code || err.message;
    return next(err);
  }
};

exports.updateAppointment = async (req, res, next) => {
  try {
    // ================================================================================================
    // TEMPORARY: AUTH DISABLED - USING TEST USER ID
    // TODO: REMOVE WHEN RE-ENABLING AUTHENTICATION  
    // When auth is re-enabled, remove the fallback and use only: req.user.user_id
    // ================================================================================================
    const user_id = req.user && req.user.user_id || '4534a6f8-4312-4afa-b500-3f92048d2ae5'; // John Doe's actual ID for testing
    
    const appointment_id = req.params.id;
    const { status, notes } = req.body; // status: 'cancelled', 'rescheduled', etc.
    // TODO: Add input validation here
    const updated = await appointmentService.updateAppointment({
      user_id,
      appointment_id,
      status,
      notes
    });
    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    err.status = err.status || 400;
    err.code = err.code || err.message;
    return next(err);
  }
};
