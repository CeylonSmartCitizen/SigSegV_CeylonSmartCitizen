import React, { useState } from 'react';
import { CreditCard, Smartphone, Building, Shield, Clock } from 'lucide-react';
import '../../styles/PaymentConfirmation.css';

const PaymentConfirmation = ({ service, bookingData, onUpdate }) => {
  const [selectedPayment, setSelectedPayment] = useState(bookingData.paymentMethod || '');
  const [paymentDetails, setPaymentDetails] = useState({});

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, MasterCard, American Express',
      processingTime: 'Instant',
      fees: 0
    },
    {
      id: 'mobile',
      name: 'Mobile Payment',
      icon: Smartphone,
      description: 'eZCash, mCash, Dialog Pay',
      processingTime: 'Instant',
      fees: 0
    },
    {
      id: 'bank',
      name: 'Online Banking',
      icon: Building,
      description: 'All major banks supported',
      processingTime: '1-2 minutes',
      fees: 0
    },
    {
      id: 'counter',
      name: 'Pay at Counter',
      icon: Clock,
      description: 'Pay when you arrive for appointment',
      processingTime: 'On arrival',
      fees: 0,
      note: 'Please bring exact amount in cash'
    }
  ];

  const handlePaymentSelect = (methodId) => {
    setSelectedPayment(methodId);
    onUpdate({ paymentMethod: methodId });
  };

  const calculateTotal = () => {
    const serviceFee = service.fees?.serviceFee || 0;
    const processingFee = service.fees?.processingFee || 0;
    const additionalFees = service.fees?.additionalFees || 0;
    return serviceFee + processingFee + additionalFees;
  };

  const total = calculateTotal();

  return (
    <div className="payment-confirmation">
      <div className="payment-header">
        <h3>Payment & Confirmation</h3>
        <p>Review the fee breakdown and select your payment method</p>
      </div>

      {/* Fee Breakdown */}
      <div className="fee-breakdown">
        <h4>Fee Breakdown</h4>
        <div className="fee-details">
          {service.fees?.serviceFee && (
            <div className="fee-item">
              <span>Service Fee</span>
              <span>Rs. {service.fees.serviceFee.toLocaleString()}</span>
            </div>
          )}
          {service.fees?.processingFee && (
            <div className="fee-item">
              <span>Processing Fee</span>
              <span>Rs. {service.fees.processingFee.toLocaleString()}</span>
            </div>
          )}
          {service.fees?.additionalFees && (
            <div className="fee-item">
              <span>Additional Fees</span>
              <span>Rs. {service.fees.additionalFees.toLocaleString()}</span>
            </div>
          )}
          <div className="fee-item total">
            <span>Total Amount</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <h4>Select Payment Method</h4>
        <div className="methods-grid">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            return (
              <div
                key={method.id}
                className={`payment-method ${selectedPayment === method.id ? 'selected' : ''}`}
                onClick={() => handlePaymentSelect(method.id)}
              >
                <div className="method-header">
                  <div className="method-icon">
                    <Icon size={24} />
                  </div>
                  <div className="method-info">
                    <h5>{method.name}</h5>
                    <p>{method.description}</p>
                  </div>
                  <div className="method-select">
                    <div className="radio-button">
                      {selectedPayment === method.id && <div className="radio-inner" />}
                    </div>
                  </div>
                </div>
                
                <div className="method-details">
                  <div className="detail-item">
                    <span>Processing Time:</span>
                    <span>{method.processingTime}</span>
                  </div>
                  <div className="detail-item">
                    <span>Additional Fees:</span>
                    <span>{method.fees > 0 ? `Rs. ${method.fees}` : 'Free'}</span>
                  </div>
                  {method.note && (
                    <div className="method-note">
                      <span>{method.note}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Security */}
      <div className="payment-security">
        <div className="security-header">
          <Shield size={20} />
          <h4>Secure Payment</h4>
        </div>
        <div className="security-features">
          <div className="security-item">
            <div className="security-icon">
              <Shield size={16} />
            </div>
            <div className="security-text">
              <h6>256-bit SSL Encryption</h6>
              <p>Your payment information is protected with bank-level security</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-icon">
              <CreditCard size={16} />
            </div>
            <div className="security-text">
              <h6>PCI Compliant</h6>
              <p>We follow industry standards for handling payment data</p>
            </div>
          </div>
          <div className="security-item">
            <div className="security-icon">
              <Building size={16} />
            </div>
            <div className="security-text">
              <h6>Government Certified</h6>
              <p>Official government payment gateway integration</p>
            </div>
          </div>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="refund-policy">
        <h4>Refund Policy</h4>
        <div className="policy-grid">
          <div className="policy-item">
            <div className="policy-time">24 Hours</div>
            <div className="policy-details">
              <h6>Full Refund</h6>
              <p>100% refund if cancelled 24+ hours before appointment</p>
            </div>
          </div>
          <div className="policy-item">
            <div className="policy-time">2-24 Hours</div>
            <div className="policy-details">
              <h6>Partial Refund</h6>
              <p>75% refund for cancellations within 24 hours</p>
            </div>
          </div>
          <div className="policy-item">
            <div className="policy-time">&lt; 2 Hours</div>
            <div className="policy-details">
              <h6>No Refund</h6>
              <p>No refund for last-minute cancellations</p>
            </div>
          </div>
        </div>
        <div className="policy-note">
          <p>Processing fees may apply for refunds. Refunds typically take 3-5 business days to process.</p>
        </div>
      </div>

      {/* Summary */}
      {selectedPayment && (
        <div className="payment-summary">
          <h4>Payment Summary</h4>
          <div className="summary-content">
            <div className="summary-row">
              <span>Service:</span>
              <span>{service.name}</span>
            </div>
            <div className="summary-row">
              <span>Total Amount:</span>
              <span className="amount">Rs. {total.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Payment Method:</span>
              <span>{paymentMethods.find(m => m.id === selectedPayment)?.name}</span>
            </div>
            <div className="summary-row">
              <span>Processing:</span>
              <span>{paymentMethods.find(m => m.id === selectedPayment)?.processingTime}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentConfirmation;
