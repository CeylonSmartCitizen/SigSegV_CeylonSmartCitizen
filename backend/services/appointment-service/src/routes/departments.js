const express = require('express');
const departmentController = require('../controllers/departmentController');

const router = express.Router();

/**
 * Department Routes
 * Base path: /api/departments
 */

// GET /api/departments - Get all departments with filtering
router.get('/', departmentController.getAllDepartments);

// GET /api/departments/search - Search departments
router.get('/search', departmentController.searchDepartments);

// GET /api/departments/operational-status - Get operational status for all departments
router.get('/operational-status', departmentController.getAllDepartmentsStatus);

// GET /api/departments/:id - Get department by ID
router.get('/:id', departmentController.getDepartmentById);

// GET /api/departments/:id/services - Get services offered by department
router.get('/:id/services', departmentController.getDepartmentServices);

// GET /api/departments/:id/status - Get current operational status
router.get('/:id/status', departmentController.getDepartmentStatus);

// GET /api/departments/:id/officers - Get officers in department
router.get('/:id/officers', departmentController.getDepartmentOfficers);

// GET /api/departments/:id/analytics - Get department analytics
router.get('/:id/analytics', departmentController.getDepartmentAnalytics);

// GET /api/departments/:id/overview - Get comprehensive department overview
router.get('/:id/overview', departmentController.getDepartmentOverview);

module.exports = router;
