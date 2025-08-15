// Simple email templates for notifications

function appointmentConfirmationTemplate({ userName, appointmentDate, serviceName }) {
  return {
    subject: 'Appointment Confirmation',
    html: `<h2>Dear ${userName},</h2>
      <p>Your appointment for <strong>${serviceName}</strong> on <strong>${appointmentDate}</strong> is confirmed.</p>
      <p>Thank you for using Ceylon Smart Citizen!</p>`,
    text: `Dear ${userName},\nYour appointment for ${serviceName} on ${appointmentDate} is confirmed.\nThank you for using Ceylon Smart Citizen!`
  };
}

function genericNotificationTemplate({ title, message }) {
  return {
    subject: title,
    html: `<h2>${title}</h2><p>${message}</p>`,
    text: `${title}\n${message}`
  };
}

module.exports = {
  appointmentConfirmationTemplate,
  genericNotificationTemplate
};
