import React from 'react';
import { 
  DollarSign, 
  CreditCard, 
  Banknote, 
  Receipt,
  Info
} from 'lucide-react';
import '../../styles/FeeBreakdown.css';

const FeeBreakdown = ({ feeBreakdown, totalFee }) => {
  if (!feeBreakdown) {
    return (
      <div className="fee-breakdown-simple">
        <div className="simple-fee-card">
          <DollarSign className="fee-icon" size={32} />
          <div className="fee-info">
            <h3>Service Fee</h3>
            <div className="total-amount">Rs. {totalFee?.toLocaleString() || '0'}</div>
          </div>
        </div>
        <p className="fee-note">No detailed fee breakdown available for this service.</p>
      </div>
    );
  }

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, available: true, fee: 0 },
    { id: 'bank', name: 'Online Banking', icon: Banknote, available: true, fee: 0 },
    { id: 'cash', name: 'Cash Payment', icon: Receipt, available: false, fee: 0 }
  ];

  return (
    <div className="fee-breakdown">
      <div className="fee-breakdown-header">
        <h2>Fee Breakdown</h2>
        <p>Detailed cost breakdown for this service</p>
      </div>

      {/* Fee Breakdown Card */}
      <div className="breakdown-card">
        <div className="breakdown-header">
          <Receipt className="breakdown-icon" size={24} />
          <h3>Cost Breakdown</h3>
        </div>

        <div className="breakdown-items">
          {Object.entries(feeBreakdown).map(([key, value]) => {
            if (key === 'total') return null;
            
            const formatLabel = (key) => {
              return key.split(/(?=[A-Z])/)
                       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                       .join(' ');
            };

            return (
              <div key={key} className="breakdown-item">
                <span className="breakdown-label">{formatLabel(key)}</span>
                <span className="breakdown-amount">Rs. {value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>

        <div className="breakdown-total">
          <div className="total-row">
            <span className="total-label">Total Amount</span>
            <span className="total-amount">Rs. {feeBreakdown.total.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="payment-methods">
        <h3>Payment Methods</h3>
        <div className="payment-methods-grid">
          {paymentMethods.map(method => {
            const MethodIcon = method.icon;
            return (
              <div 
                key={method.id} 
                className={`payment-method ${method.available ? 'available' : 'unavailable'}`}
              >
                <MethodIcon className="payment-icon" size={20} />
                <div className="payment-info">
                  <span className="payment-name">{method.name}</span>
                  <span className={`payment-status ${method.available ? 'available' : 'unavailable'}`}>
                    {method.available ? 'Available' : 'Not Available'}
                  </span>
                </div>
                {method.fee > 0 && (
                  <span className="payment-fee">+Rs. {method.fee}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fee Information */}
      <div className="fee-info-card">
        <div className="info-header">
          <Info className="info-icon" size={20} />
          <h4>Fee Information</h4>
        </div>
        
        <div className="info-content">
          <ul>
            <li>All fees are in Sri Lankan Rupees (LKR)</li>
            <li>Payment must be completed before document processing</li>
            <li>Refunds are available only if service cannot be provided</li>
            <li>Additional charges may apply for expedited processing</li>
            <li>Government taxes are included in the total amount</li>
          </ul>
        </div>
      </div>

      {/* Refund Policy */}
      <div className="refund-policy">
        <h4>Refund Policy</h4>
        <div className="policy-grid">
          <div className="policy-item">
            <div className="policy-timeframe">Within 24 hours</div>
            <div className="policy-percentage">100% Refund</div>
          </div>
          <div className="policy-item">
            <div className="policy-timeframe">1-3 days</div>
            <div className="policy-percentage">75% Refund</div>
          </div>
          <div className="policy-item">
            <div className="policy-timeframe">After processing</div>
            <div className="policy-percentage">No Refund</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeeBreakdown;
