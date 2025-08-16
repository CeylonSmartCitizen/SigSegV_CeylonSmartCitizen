import React, { useState } from 'react';
import { 
  CreditCard, 
  DollarSign, 
  Clock, 
  RefreshCw, 
  Calculator,
  AlertCircle,
  CheckCircle,
  Info,
  Wallet,
  Building,
  Smartphone,
  Calendar,
  FileText,
  Download
} from 'lucide-react';
import './FeeStructure.css';

const FeeStructure = ({ serviceType = "Passport Application", onContinue, onBack }) => {
  const [selectedProcessing, setSelectedProcessing] = useState('standard');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [additionalServices, setAdditionalServices] = useState([]);

  // Fee structure data
  const baseServiceFees = {
    'standard': {
      processingFee: 2500,
      serviceFee: 500,
      processingTime: '10-15 working days',
      description: 'Standard processing'
    },
    'urgent': {
      processingFee: 4500,
      serviceFee: 1000,
      processingTime: '3-5 working days',
      description: 'Urgent processing'
    },
    'express': {
      processingFee: 7500,
      serviceFee: 1500,
      processingTime: '1-2 working days',
      description: 'Express processing'
    }
  };

  const additionalServiceOptions = [
    { id: 'courier', name: 'Document Courier Service', fee: 1000 },
    { id: 'photos', name: 'Passport Photo Service', fee: 500 },
    { id: 'verification', name: 'Document Verification', fee: 750 },
    { id: 'sms', name: 'SMS Status Updates', fee: 200 }
  ];

  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit/Debit Card',
      icon: CreditCard,
      description: 'Visa, MasterCard, American Express',
      processingFee: 0,
      availability: 'Available 24/7'
    },
    {
      id: 'bank',
      name: 'Bank Transfer',
      icon: Building,
      description: 'Direct bank transfer',
      processingFee: 0,
      availability: 'Business hours only'
    },
    {
      id: 'mobile',
      name: 'Mobile Payment',
      icon: Smartphone,
      description: 'eZCash, mCash, PayHere',
      processingFee: 25,
      availability: 'Available 24/7'
    },
    {
      id: 'cash',
      name: 'Cash Payment',
      icon: Wallet,
      description: 'Pay at government office',
      processingFee: 0,
      availability: 'Office hours only'
    }
  ];

  const taxes = {
    serviceTax: 0.18, // 18%
    processingTax: 0.02 // 2%
  };

  // Calculate total fees
  const calculateTotal = () => {
    const base = baseServiceFees[selectedProcessing];
    const baseTotal = base.processingFee + base.serviceFee;
    
    const additionalTotal = additionalServices.reduce((sum, serviceId) => {
      const service = additionalServiceOptions.find(s => s.id === serviceId);
      return sum + (service ? service.fee : 0);
    }, 0);

    const subtotal = baseTotal + additionalTotal;
    const serviceTaxAmount = subtotal * taxes.serviceTax;
    const processingTaxAmount = base.processingFee * taxes.processingTax;
    
    const selectedMethod = paymentMethods.find(m => m.id === selectedPayment);
    const paymentFee = selectedMethod ? selectedMethod.processingFee : 0;

    return {
      subtotal,
      serviceTaxAmount,
      processingTaxAmount,
      paymentFee,
      total: subtotal + serviceTaxAmount + processingTaxAmount + paymentFee
    };
  };

  const toggleAdditionalService = (serviceId) => {
    setAdditionalServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleContinue = () => {
    if (!selectedPayment) {
      alert('Please select a payment method to continue');
      return;
    }
    onContinue?.({
      processingType: selectedProcessing,
      paymentMethod: selectedPayment,
      additionalServices,
      totalAmount: calculateTotal().total
    });
  };

  const totals = calculateTotal();

  return (
    <div className="fee-structure">
      <div className="fee-header">
        <DollarSign className="fee-icon" />
        <div className="fee-title">
          <h2>Fee Structure & Payment</h2>
          <p>Choose your processing type and payment method</p>
        </div>
      </div>

      {/* Processing Type Selection */}
      <div className="section processing-selection">
        <h3>
          <Clock className="section-icon" />
          Processing Type
        </h3>
        
        <div className="processing-options">
          {Object.entries(baseServiceFees).map(([type, details]) => (
            <div 
              key={type}
              className={`processing-option ${selectedProcessing === type ? 'selected' : ''}`}
              onClick={() => setSelectedProcessing(type)}
            >
              <div className="processing-header">
                <input
                  type="radio"
                  name="processing"
                  value={type}
                  checked={selectedProcessing === type}
                  onChange={() => setSelectedProcessing(type)}
                />
                <div className="processing-info">
                  <h4>{details.description}</h4>
                  <p className="processing-time">
                    <Calendar className="time-icon" />
                    {details.processingTime}
                  </p>
                </div>
                <div className="processing-price">
                  <span className="price">LKR {(details.processingFee + details.serviceFee).toLocaleString()}</span>
                </div>
              </div>
              
              <div className="fee-breakdown">
                <div className="breakdown-item">
                  <span>Processing Fee</span>
                  <span>LKR {details.processingFee.toLocaleString()}</span>
                </div>
                <div className="breakdown-item">
                  <span>Service Fee</span>
                  <span>LKR {details.serviceFee.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Services */}
      <div className="section additional-services">
        <h3>
          <CheckCircle className="section-icon" />
          Additional Services (Optional)
        </h3>
        
        <div className="services-grid">
          {additionalServiceOptions.map(service => (
            <div 
              key={service.id}
              className={`service-option ${additionalServices.includes(service.id) ? 'selected' : ''}`}
              onClick={() => toggleAdditionalService(service.id)}
            >
              <input
                type="checkbox"
                checked={additionalServices.includes(service.id)}
                onChange={() => toggleAdditionalService(service.id)}
              />
              <div className="service-details">
                <h4>{service.name}</h4>
                <span className="service-fee">+LKR {service.fee.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="section payment-methods">
        <h3>
          <CreditCard className="section-icon" />
          Payment Methods
        </h3>
        
        <div className="payment-grid">
          {paymentMethods.map(method => {
            const IconComponent = method.icon;
            return (
              <div 
                key={method.id}
                className={`payment-option ${selectedPayment === method.id ? 'selected' : ''}`}
                onClick={() => setSelectedPayment(method.id)}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={selectedPayment === method.id}
                  onChange={() => setSelectedPayment(method.id)}
                />
                <div className="payment-content">
                  <IconComponent className="payment-icon" />
                  <div className="payment-info">
                    <h4>{method.name}</h4>
                    <p>{method.description}</p>
                    <small className="availability">{method.availability}</small>
                    {method.processingFee > 0 && (
                      <span className="processing-fee">
                        +LKR {method.processingFee} processing fee
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fee Calculator */}
      <div className="section fee-calculator">
        <div className="calculator-header">
          <h3>
            <Calculator className="section-icon" />
            Fee Calculation
          </h3>
          <button 
            className="toggle-calculator"
            onClick={() => setShowCalculator(!showCalculator)}
          >
            {showCalculator ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {showCalculator && (
          <div className="calculation-breakdown">
            <div className="breakdown-section">
              <h4>Base Service</h4>
              <div className="breakdown-item">
                <span>Processing Fee</span>
                <span>LKR {baseServiceFees[selectedProcessing].processingFee.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Service Fee</span>
                <span>LKR {baseServiceFees[selectedProcessing].serviceFee.toLocaleString()}</span>
              </div>
            </div>

            {additionalServices.length > 0 && (
              <div className="breakdown-section">
                <h4>Additional Services</h4>
                {additionalServices.map(serviceId => {
                  const service = additionalServiceOptions.find(s => s.id === serviceId);
                  return (
                    <div key={serviceId} className="breakdown-item">
                      <span>{service.name}</span>
                      <span>LKR {service.fee.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="breakdown-section">
              <h4>Taxes & Fees</h4>
              <div className="breakdown-item">
                <span>Service Tax (18%)</span>
                <span>LKR {totals.serviceTaxAmount.toLocaleString()}</span>
              </div>
              <div className="breakdown-item">
                <span>Processing Tax (2%)</span>
                <span>LKR {totals.processingTaxAmount.toLocaleString()}</span>
              </div>
              {totals.paymentFee > 0 && (
                <div className="breakdown-item">
                  <span>Payment Processing Fee</span>
                  <span>LKR {totals.paymentFee.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="total-summary">
          <div className="subtotal">
            <span>Subtotal:</span>
            <span>LKR {totals.subtotal.toLocaleString()}</span>
          </div>
          <div className="total">
            <span>Total Amount:</span>
            <span>LKR {totals.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className="section important-info">
        <h3>
          <Info className="section-icon" />
          Important Information
        </h3>
        
        <div className="info-grid">
          <div className="info-card">
            <AlertCircle className="info-icon warning" />
            <div className="info-content">
              <h4>Payment Timeline</h4>
              <ul>
                <li>Payment must be completed within 24 hours of booking</li>
                <li>Processing begins only after payment confirmation</li>
                <li>Express processing requires immediate payment</li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <RefreshCw className="info-icon primary" />
            <div className="info-content">
              <h4>Refund Policy</h4>
              <ul>
                <li>Full refund if service is cancelled before processing</li>
                <li>50% refund if cancelled during initial review</li>
                <li>No refund after document processing begins</li>
                <li>Refunds processed within 7-10 working days</li>
              </ul>
            </div>
          </div>

          <div className="info-card">
            <FileText className="info-icon success" />
            <div className="info-content">
              <h4>Receipt & Documentation</h4>
              <ul>
                <li>Payment receipt will be emailed immediately</li>
                <li>Keep receipt for office visits</li>
                <li>Reference number required for all inquiries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fee-actions">
        <button className="btn-secondary" onClick={onBack}>
          <RefreshCw className="btn-icon" />
          Back to Documents
        </button>
        
        <button className="btn-download" onClick={() => window.print()}>
          <Download className="btn-icon" />
          Download Summary
        </button>
        
        <button 
          className="btn-primary"
          onClick={handleContinue}
          disabled={!selectedPayment}
        >
          <CheckCircle className="btn-icon" />
          Continue to Payment
        </button>
      </div>

      {/* Payment Security Notice */}
      <div className="security-notice">
        <CheckCircle className="security-icon" />
        <p>
          <strong>Secure Payment:</strong> All transactions are encrypted and processed through 
          certified payment gateways. Your financial information is never stored on our servers.
        </p>
      </div>
    </div>
  );
};

export default FeeStructure;
