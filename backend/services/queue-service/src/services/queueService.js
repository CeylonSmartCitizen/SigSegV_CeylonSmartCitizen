const db = require('../config/database');

// Create a new queue session
async function createQueueSession(data) {
  const {
    department_id,
    service_id,
    session_date,
    max_capacity = 50,
    session_start_time = '09:00:00',
    session_end_time = '17:00:00'
  } = data;
  try {
    const result = await db.query(
      `INSERT INTO queue_sessions (
        department_id, service_id, session_date, max_capacity, session_start_time, session_end_time
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [department_id, service_id, session_date, max_capacity, session_start_time, session_end_time]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to create queue session: ' + error.message);
  }
}

// Add an entry to the queue
async function addQueueEntry(data) {
  const {
    queue_session_id,
    appointment_id,
    position,
    status = 'waiting',
    estimated_wait_minutes = null
  } = data;
  try {
    const result = await db.query(
      `INSERT INTO queue_entries (
        queue_session_id, appointment_id, position, status, estimated_wait_minutes
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [queue_session_id, appointment_id, position, status, estimated_wait_minutes]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to add queue entry: ' + error.message);
  }
}

// Update queue entry position/status
async function updateQueueEntry(id, data) {
  const { position, status, estimated_wait_minutes } = data;
  try {
    const result = await db.query(
      `UPDATE queue_entries SET
        position = COALESCE($1, position),
        status = COALESCE($2, status),
        estimated_wait_minutes = COALESCE($3, estimated_wait_minutes)
      WHERE id = $4
      RETURNING *`,
      [position, status, estimated_wait_minutes, id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to update queue entry: ' + error.message);
  }
}

// Get queue session details
async function getQueueSession(id) {
  try {
    const result = await db.query(
      `SELECT * FROM queue_sessions WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to get queue session: ' + error.message);
  }
}

// Get all entries for a queue session
async function getQueueEntries(sessionId) {
  try {
    const result = await db.query(
      `SELECT * FROM queue_entries WHERE queue_session_id = $1 ORDER BY position ASC`,
      [sessionId]
    );
    return result.rows;
  } catch (error) {
    throw new Error('Failed to get queue entries: ' + error.message);
  }
}

// Update officer status in a queue session
async function updateOfficerStatus(sessionId, data) {
  const { status } = data;
  try {
    const result = await db.query(
      `UPDATE queue_sessions SET status = COALESCE($1, status) WHERE id = $2 RETURNING *`,
      [status, sessionId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to update officer status: ' + error.message);
  }
}

// Pause or resume a queue session
async function setQueueSessionStatus(sessionId, status) {
  try {
    const result = await db.query(
      `UPDATE queue_sessions SET status = $1 WHERE id = $2 RETURNING *`,
      [status, sessionId]
    );
    return result.rows[0];
  } catch (error) {
    throw new Error('Failed to update queue session status: ' + error.message);
  }
}

module.exports = {
  createQueueSession,
  addQueueEntry,
  updateQueueEntry,
  getQueueSession,
  getQueueEntries,
  updateOfficerStatus,
  setQueueSessionStatus
};
