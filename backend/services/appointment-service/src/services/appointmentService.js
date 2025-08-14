// src/services/appointmentService.js
// Business logic for appointment creation using PostgreSQL

const tokenGenerator = require('../utils/tokenGenerator');
const { query } = require('../config/database');
const Appointment = require('../models/appointment');

async function createAppointment({ user_id, service_id, preferred_date, preferred_time, notes }) {
  // 1. Validate user and service
  const userResult = await query('SELECT * FROM users WHERE id = $1 AND is_active = true', [user_id]);
  if (!userResult.rows.length) throw new Error('USER_NOT_FOUND');
  
  const serviceResult = await query(`
    SELECT s.*, d.name as department_name, d.name_si as department_name_si, d.name_ta as department_name_ta 
    FROM services s 
    JOIN departments d ON s.department_id = d.id 
    WHERE s.id = $1 AND s.is_active = true
  `, [service_id]);
  if (!serviceResult.rows.length) throw new Error('SERVICE_NOT_AVAILABLE');
  
  const service = serviceResult.rows[0];

  // 2. Officer assignment (simplified: pick first available officer)
  const officersResult = await query(`
    SELECT * FROM officers 
    WHERE department_id = $1 AND is_active = true 
    LIMIT 1
  `, [service.department_id]);
  if (!officersResult.rows.length) throw new Error('OFFICER_NOT_AVAILABLE');
  const officer = officersResult.rows[0];

  // 3. Check for appointment conflicts
  const conflictResult = await query(`
    SELECT id FROM appointments 
    WHERE officer_id = $1 AND appointment_date = $2 AND appointment_time = $3 
    AND status IN ('scheduled', 'rescheduled')
  `, [officer.id, preferred_date, preferred_time]);
  if (conflictResult.rows.length) throw new Error('APPOINTMENT_CONFLICT');

  // 4. Generate token number
  const serviceCode = service.id.slice(-3); // Example: last 3 chars as code
  const dateObj = new Date(preferred_date);
  const sequenceResult = await query(`
    SELECT COUNT(*) FROM appointments 
    WHERE service_id = $1 AND appointment_date = $2
  `, [service_id, preferred_date]);
  const sequence = parseInt(sequenceResult.rows[0].count) + 1;
  const token_number = tokenGenerator.generateToken(serviceCode, dateObj, sequence);

  // 5. Calculate estimated wait time (simplified)
  const estimated_wait_time = service.estimated_duration_minutes || 20;

  // 6. Create appointment
  const appointment = await Appointment.create({
    user_id,
    service_id,
    officer_id: officer.id,
    appointment_date: preferred_date,
    appointment_time: preferred_time,
    status: 'scheduled',
    token_number,
    estimated_wait_time,
    citizen_notes: notes
  });

  // 7. Return appointment details
  return {
    id: appointment.id,
    user_id: appointment.user_id,
    service_id: appointment.service_id,
    officer_id: appointment.officer_id,
    appointment_date: appointment.appointment_date,
    appointment_time: appointment.appointment_time,
    status: appointment.status,
    token_number: appointment.token_number,
    estimated_wait_time: appointment.estimated_wait_time,
    service: {
      name: service.name,
      name_si: service.name_si,
      name_ta: service.name_ta,
      description: service.description,
      description_si: service.description_si,
      description_ta: service.description_ta,
      department_name: service.department_name,
      department_name_si: service.department_name_si,
      department_name_ta: service.department_name_ta
    },
    officer: {
      name: officer.first_name + ' ' + officer.last_name,
      designation: officer.designation
    }
  };
}

async function getAppointments({ user_id, status, page = 1, limit = 10, sort = 'appointment_date DESC' }) {
  // Build filters
  const filters = { user_id };
  if (status) filters.status = status;

  // Query appointments with pagination
  const [appointments, total_count] = await Promise.all([
    Appointment.findMany(filters, { page, limit, sort }),
    Appointment.count(filters)
  ]);

  // Format response
  return {
    appointments: appointments.map(a => ({
      id: a.id,
      service: {
        name: a.service_name,
        name_si: a.service_name_si,
        name_ta: a.service_name_ta,
        department_name: a.department_name,
        department_name_si: a.department_name_si,
        department_name_ta: a.department_name_ta
      },
      officer: a.officer_name ? {
        name: a.officer_name,
        designation: a.officer_designation
      } : undefined,
      appointment_date: a.appointment_date,
      appointment_time: a.appointment_time,
      status: a.status,
      token_number: a.token_number
    })),
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total_count / limit),
      total_count,
      per_page: limit
    }
  };
}

async function updateAppointment({ user_id, appointment_id, status, citizen_notes }) {
  // 1. Fetch appointment and validate ownership
  const appointment = await Appointment.findById(appointment_id);
  if (!appointment || appointment.user_id !== user_id) {
    throw new Error('APPOINTMENT_NOT_FOUND');
  }

  // 2. Check if update is allowed
  if (["cancelled", "completed"].includes(appointment.status)) {
    throw new Error('CANNOT_UPDATE_APPOINTMENT');
  }

  // 3. Update appointment
  const updateData = {};
  if (status) updateData.status = status;
  if (citizen_notes) updateData.citizen_notes = citizen_notes;

  const updated = await Appointment.update(appointment_id, updateData);

  // 4. Return updated appointment
  return {
    id: updated.id,
    status: updated.status,
    citizen_notes: updated.citizen_notes,
    updated_at: updated.updated_at
  };
}

module.exports = {
  createAppointment,
  getAppointments,
  updateAppointment
};
