const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');
const { validateCreateAppointment, validateUpdateAppointment } = require('../middleware/validation');

// ================================================================================================
// TEMPORARY: AUTHENTICATION DISABLED FOR TESTING
// TODO: RE-ENABLE AUTHENTICATION BEFORE PRODUCTION
// 
// TO RE-INTEGRATE AUTHENTICATION:
// 1. Uncomment the line below: router.use(auth);
// 2. Ensure all appointment endpoints require valid JWT tokens
// 3. Test with auth service integration
// 4. Remove this comment block
// ================================================================================================

// Protect all routes with JWT auth middleware
// router.use(auth); // COMMENTED OUT FOR TESTING - UNCOMMENT TO RE-ENABLE AUTH

// Create Appointment
router.post('/', validateCreateAppointment, appointmentController.createAppointment);

// View Appointments (with optional filters/pagination)
router.get('/', appointmentController.getAppointments);

// Update/Cancel Appointment
router.put('/:id', validateUpdateAppointment, appointmentController.updateAppointment);

module.exports = router;
