// src/models/appointment.js
// Appointment model using direct PostgreSQL queries with existing schema
const { query } = require('../config/database');

class Appointment {
  // Create a new appointment
  static async create(appointmentData) {
    const {
      user_id,
      service_id,
      officer_id,
      appointment_date,
      appointment_time,
      status = 'scheduled',
      token_number,
      estimated_wait_time,
      citizen_notes,
      priority_score = 0
    } = appointmentData;

    const sql = `
      INSERT INTO appointments (
        user_id, service_id, officer_id, appointment_date, appointment_time,
        status, token_number, estimated_wait_time, citizen_notes, priority_score
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const params = [
      user_id, service_id, officer_id, appointment_date, appointment_time,
      status, token_number, estimated_wait_time, citizen_notes, priority_score
    ];

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Find appointments with filters and pagination
  static async findMany(filters = {}, pagination = {}) {
    const { user_id, status, service_id, date_from, date_to } = filters;
    const { page = 1, limit = 10, sort = 'appointment_date DESC' } = pagination;

    let sql = `
      SELECT 
        a.*,
        s.name as service_name,
        s.name_si as service_name_si,
        s.name_ta as service_name_ta,
        d.name as department_name,
        d.name_si as department_name_si,
        d.name_ta as department_name_ta,
        o.first_name || ' ' || o.last_name as officer_name,
        o.designation as officer_designation
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN officers o ON a.officer_id = o.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      sql += ` AND a.user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (status) {
      paramCount++;
      sql += ` AND a.status = $${paramCount}`;
      params.push(status);
    }

    if (service_id) {
      paramCount++;
      sql += ` AND a.service_id = $${paramCount}`;
      params.push(service_id);
    }

    if (date_from) {
      paramCount++;
      sql += ` AND a.appointment_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      sql += ` AND a.appointment_date <= $${paramCount}`;
      params.push(date_to);
    }

    sql += ` ORDER BY ${sort}`;

    // Add pagination
    const offset = (page - 1) * limit;
    paramCount++;
    sql += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    sql += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await query(sql, params);
    return result.rows;
  }

  // Find appointment by ID
  static async findById(id) {
    const sql = `
      SELECT 
        a.*,
        s.name as service_name,
        s.name_si as service_name_si,
        s.name_ta as service_name_ta,
        d.name as department_name,
        o.first_name || ' ' || o.last_name as officer_name,
        o.designation as officer_designation
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN departments d ON s.department_id = d.id
      LEFT JOIN officers o ON a.officer_id = o.id
      WHERE a.id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Update appointment
  static async update(id, updateData) {
    const {
      appointment_date,
      appointment_time,
      status,
      citizen_notes,
      officer_id,
      actual_start_time,
      actual_end_time
    } = updateData;

    let sql = 'UPDATE appointments SET updated_at = CURRENT_TIMESTAMP';
    const params = [];
    let paramCount = 0;

    if (appointment_date) {
      paramCount++;
      sql += `, appointment_date = $${paramCount}`;
      params.push(appointment_date);
    }

    if (appointment_time) {
      paramCount++;
      sql += `, appointment_time = $${paramCount}`;
      params.push(appointment_time);
    }

    if (status) {
      paramCount++;
      sql += `, status = $${paramCount}`;
      params.push(status);
    }

    if (citizen_notes) {
      paramCount++;
      sql += `, citizen_notes = $${paramCount}`;
      params.push(citizen_notes);
    }

    if (officer_id) {
      paramCount++;
      sql += `, officer_id = $${paramCount}`;
      params.push(officer_id);
    }

    if (actual_start_time) {
      paramCount++;
      sql += `, actual_start_time = $${paramCount}`;
      params.push(actual_start_time);
    }

    if (actual_end_time) {
      paramCount++;
      sql += `, actual_end_time = $${paramCount}`;
      params.push(actual_end_time);
    }

    paramCount++;
    sql += ` WHERE id = $${paramCount} RETURNING *`;
    params.push(id);

    const result = await query(sql, params);
    return result.rows[0];
  }

  // Delete appointment (set status to cancelled)
  static async delete(id) {
    const sql = `
      UPDATE appointments 
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING *
    `;

    const result = await query(sql, [id]);
    return result.rows[0];
  }

  // Count appointments for pagination
  static async count(filters = {}) {
    const { user_id, status, service_id, date_from, date_to } = filters;

    let sql = 'SELECT COUNT(*) FROM appointments WHERE 1=1';
    const params = [];
    let paramCount = 0;

    if (user_id) {
      paramCount++;
      sql += ` AND user_id = $${paramCount}`;
      params.push(user_id);
    }

    if (status) {
      paramCount++;
      sql += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (service_id) {
      paramCount++;
      sql += ` AND service_id = $${paramCount}`;
      params.push(service_id);
    }

    if (date_from) {
      paramCount++;
      sql += ` AND appointment_date >= $${paramCount}`;
      params.push(date_from);
    }

    if (date_to) {
      paramCount++;
      sql += ` AND appointment_date <= $${paramCount}`;
      params.push(date_to);
    }

    const result = await query(sql, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Appointment;
