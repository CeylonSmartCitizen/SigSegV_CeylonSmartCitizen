import React from 'react';
import './ServiceDetailsInfo.css';

function ServiceDetailsInfo({ service }) {
  // Example data structure for demonstration
  const requirements = service.requirements?.documents || [];
  const feeStructure = service.fees || {};
  const paymentMethods = service.paymentMethods || ['Credit Card', 'Mobile Payment', 'Bank Transfer'];
  const processSteps = service.processSteps || [
    'Submit application online',
    'Upload required documents',
    'Pay service fee',
    'Attend appointment',
    'Receive confirmation'
  ];
  const contactInfo = service.contactInfo || {
    phone: '011-1234567',
    email: 'info@service.lk',
    address: '123 Main St, Colombo'
  };

  return (
    <div className="service-details-info">
      <h2>{service.name}</h2>
      <p>{service.description}</p>

      <section>
        <h3>Step-by-Step Process</h3>
        <ol>
          {processSteps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h3>Document Requirements</h3>
        <ul>
          {requirements.map((doc, idx) => (
            <li key={idx}>
              {doc.name}
              {doc.sampleImage && (
                <img src={doc.sampleImage} alt={doc.name + ' sample'} style={{ maxWidth: '80px', marginLeft: '1rem' }} />
              )}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Fee Structure</h3>
        <ul>
          {Object.entries(feeStructure).map(([key, value]) => (
            <li key={key}>{key}: Rs. {value}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Payment Methods</h3>
        <ul>
          {paymentMethods.map((method, idx) => (
            <li key={idx}>{method}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3>Processing Time & Follow-up</h3>
        <p>{service.processingTime || 'Typically 3-5 working days.'}</p>
        <p>{service.followUp || 'You will be notified via email/SMS.'}</p>
      </section>

      <section>
        <h3>Contact Information</h3>
        <ul>
          <li>Phone: {contactInfo.phone}</li>
          <li>Email: {contactInfo.email}</li>
          <li>Address: {contactInfo.address}</li>
        </ul>
      </section>
    </div>
  );
}

export default ServiceDetailsInfo;
