import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, AlertCircle } from 'lucide-react';
import '../../styles/PersonalDetails.css';

const PersonalDetails = ({ bookingData, onUpdate }) => {
  const [formData, setFormData] = useState(bookingData.personalDetails);
  const [errors, setErrors] = useState({});
  const [specialRequirements, setSpecialRequirements] = useState(bookingData.specialRequirements || '');

  const handleChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    
    onUpdate({ personalDetails: newFormData });
  };

  const handleSpecialRequirementsChange = (value) => {
    setSpecialRequirements(value);
    onUpdate({ specialRequirements: value });
  };

  const validateNIC = (nic) => {
    // Sri Lankan NIC validation
    const oldNICPattern = /^[0-9]{9}[vVxX]$/;
    const newNICPattern = /^[0-9]{12}$/;
    return oldNICPattern.test(nic) || newNICPattern.test(nic);
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validatePhone = (phone) => {
    // Sri Lankan phone number validation
    const phonePattern = /^(\+94|0)[0-9]{9}$/;
    return phonePattern.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName?.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.nic?.trim()) {
      newErrors.nic = 'NIC number is required';
    } else if (!validateNIC(formData.nic)) {
      newErrors.nic = 'Please enter a valid NIC number';
    }
    
    if (!formData.email?.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid Sri Lankan phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Auto-validate on blur
  const handleBlur = (field) => {
    const fieldErrors = { ...errors };
    
    if (field === 'nic' && formData.nic && !validateNIC(formData.nic)) {
      fieldErrors.nic = 'Please enter a valid NIC number';
    } else if (field === 'email' && formData.email && !validateEmail(formData.email)) {
      fieldErrors.email = 'Please enter a valid email address';
    } else if (field === 'phone' && formData.phone && !validatePhone(formData.phone)) {
      fieldErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(fieldErrors);
  };

  return (
    <div className="personal-details">
      <div className="details-header">
        <h3>Personal Information</h3>
        <p>Please provide your personal details for the appointment</p>
      </div>

      <div className="form-sections">
        {/* Personal Information */}
        <div className="form-section">
          <h4>
            <User size={20} />
            Personal Information
          </h4>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="fullName">
                Full Name <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                onBlur={() => handleBlur('fullName')}
                placeholder="Enter your full name as per NIC"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.fullName}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="nic">
                NIC Number <span className="required">*</span>
              </label>
              <input
                id="nic"
                type="text"
                value={formData.nic || ''}
                onChange={(e) => handleChange('nic', e.target.value.toUpperCase())}
                onBlur={() => handleBlur('nic')}
                placeholder="e.g., 123456789V or 123456789012"
                className={errors.nic ? 'error' : ''}
                maxLength="12"
              />
              {errors.nic && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.nic}
                </span>
              )}
              <span className="field-help">
                Enter your 10-digit old format (123456789V) or 12-digit new format NIC
              </span>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="form-section">
          <h4>
            <Phone size={20} />
            Contact Information
          </h4>
          
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="your.email@example.com"
                  className={errors.email ? 'error' : ''}
                />
              </div>
              {errors.email && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="phone">
                Phone Number <span className="required">*</span>
              </label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+94 77 123 4567 or 0771234567"
                  className={errors.phone ? 'error' : ''}
                />
              </div>
              {errors.phone && (
                <span className="error-message">
                  <AlertCircle size={14} />
                  {errors.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="form-section">
          <h4>
            <MapPin size={20} />
            Address Information
          </h4>
          
          <div className="form-group">
            <label htmlFor="address">
              Complete Address
            </label>
            <textarea
              id="address"
              value={formData.address || ''}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter your complete address including city and postal code"
              rows={3}
            />
            <span className="field-help">
              This address will be used for any postal correspondence
            </span>
          </div>
        </div>

        {/* Special Requirements */}
        <div className="form-section">
          <h4>Special Requirements or Notes</h4>
          <div className="form-group">
            <label htmlFor="specialRequirements">
              Additional Information
            </label>
            <textarea
              id="specialRequirements"
              value={specialRequirements}
              onChange={(e) => handleSpecialRequirementsChange(e.target.value)}
              placeholder="Please mention any special requirements, accessibility needs, or additional information that might be helpful for your appointment"
              rows={4}
            />
            <span className="field-help">
              Optional: Any specific requirements or information you'd like us to know
            </span>
          </div>
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="privacy-notice">
        <div className="notice-header">
          <AlertCircle size={20} />
          <h5>Data Privacy & Security</h5>
        </div>
        <p>
          Your personal information is collected and processed in accordance with the Data Protection Act. 
          We use this information solely for processing your appointment and providing government services. 
          Your data is encrypted and stored securely, and will not be shared with third parties without your consent.
        </p>
      </div>
    </div>
  );
};

export default PersonalDetails;
