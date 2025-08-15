// services/appointmentService.js
// Handles appointment confirmation and reminder logic, triggers notifications

const { createNotification } = require('../utils/notificationFactory');
const { sendEmail } = require('../utils/sendEmail');
const { sendSMS } = require('../utils/sendSMS');

/**
 * Confirm an appointment and trigger notification
 * @param {Object} appointment - { id, userId, userName, userEmail, userPhone, details }
 */
async function confirmAppointment(appointment) {
  // ...existing logic to confirm appointment...

  // Create notification object
  const notification = await createNotification({
    type: 'appointment',
    userId: appointment.userId,
    message: `Your appointment is confirmed. Details: ${appointment.details}`,
    channel: ['email', 'sms'],
    meta: appointment
  });

  // Send email
  await sendEmail({
    to: appointment.userEmail,
    subject: 'Appointment Confirmation',
    template: 'appointment',
    context: { recipientName: appointment.userName, details: appointment.details }
  });

  // Send SMS
  sendSMS({
    type: 'appointment',
    recipientName: appointment.userName,
    recipientNumber: appointment.userPhone,
    details: appointment.details
  });

  return notification;
}

/**
 * Send appointment reminder and trigger notification
 * @param {Object} appointment - { id, userId, userName, userEmail, userPhone, details }
 */
async function sendAppointmentReminder(appointment) {
  // ...existing logic to send reminder...

  // Create notification object
  const notification = await createNotification({
    type: 'appointment',
    userId: appointment.userId,
    message: `Reminder: Your appointment is coming up. Details: ${appointment.details}`,
    channel: ['email', 'sms'],
    meta: appointment
  });

  // Send email
  await sendEmail({
    to: appointment.userEmail,
    subject: 'Appointment Reminder',
    template: 'appointment',
    context: { recipientName: appointment.userName, details: appointment.details }
  });

  // Send SMS
  sendSMS({
    type: 'appointment',
    recipientName: appointment.userName,
    recipientNumber: appointment.userPhone,
    details: appointment.details
  });

  return notification;
}

module.exports = {
  confirmAppointment,
  sendAppointmentReminder
};
