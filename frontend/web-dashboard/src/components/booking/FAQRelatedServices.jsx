import React, { useState } from 'react';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  Share2,
  Copy,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Users,
  FileText,
  CheckCircle,
  Star,
  ArrowRight,
  Package,
  Zap,
  Shield,
  Globe,
  Calendar,
  CreditCard,
  Download,
  Search
} from 'lucide-react';
import './FAQRelatedServices.css';

const FAQRelatedServices = ({ serviceType = "Passport Application", onContinue, onBack }) => {
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [selectedBundle, setSelectedBundle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // FAQ Data
  const faqData = [
    {
      id: 1,
      category: 'General',
      question: 'How long does the passport application process take?',
      answer: 'Processing times vary by service level: Standard (10-15 working days), Urgent (3-5 working days), Express (1-2 working days). Processing begins after payment confirmation and document verification.',
      helpful: 245,
      tags: ['processing', 'timeline', 'urgent']
    },
    {
      id: 2,
      category: 'Documents',
      question: 'What documents are required for passport application?',
      answer: 'Required documents include: National ID card, proof of address, birth certificate, and passport-size photos. Additional documents may be needed for specific cases (marriage certificate, name change documents).',
      helpful: 189,
      tags: ['documents', 'requirements', 'ID']
    },
    {
      id: 3,
      category: 'Payment',
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, mobile payments (eZCash, mCash), and cash payments at government offices. All online payments are secure and encrypted.',
      helpful: 156,
      tags: ['payment', 'security', 'methods']
    },
    {
      id: 4,
      category: 'Application',
      question: 'Can I track my application status?',
      answer: 'Yes! You\'ll receive a reference number after booking. Use this to track your application online, receive SMS updates, and get email notifications at each processing stage.',
      helpful: 203,
      tags: ['tracking', 'status', 'notifications']
    },
    {
      id: 5,
      category: 'Appointment',
      question: 'Do I need to visit the office in person?',
      answer: 'Yes, you\'ll need to visit for biometric data collection (fingerprints, photo) and document verification. We\'ll schedule a convenient appointment slot for you.',
      helpful: 178,
      tags: ['appointment', 'biometric', 'visit']
    },
    {
      id: 6,
      category: 'Delivery',
      question: 'How will I receive my passport?',
      answer: 'Passports can be collected from the issuing office or delivered via courier service (additional fee applies). You\'ll be notified when ready for collection.',
      helpful: 134,
      tags: ['delivery', 'collection', 'courier']
    },
    {
      id: 7,
      category: 'Emergency',
      question: 'What if I need urgent processing?',
      answer: 'Emergency processing is available for travel emergencies. Contact our emergency hotline with proof of urgent travel. Additional fees and documentation may apply.',
      helpful: 167,
      tags: ['emergency', 'urgent', 'travel']
    },
    {
      id: 8,
      category: 'Renewal',
      question: 'How do I renew an expired passport?',
      answer: 'Renewal process is similar to new applications but may require fewer documents. Bring your expired passport, updated photos, and address proof. Processing is typically faster.',
      helpful: 198,
      tags: ['renewal', 'expired', 'process']
    }
  ];

  // Related Services Data
  const relatedServices = [
    {
      id: 1,
      name: 'National ID Card Application',
      description: 'Apply for or renew your National Identity Card',
      processingTime: '5-7 working days',
      fee: 'LKR 500',
      rating: 4.7,
      icon: Shield,
      category: 'Identity Documents',
      benefits: ['Digital verification', 'Multiple use cases', 'Lifetime validity']
    },
    {
      id: 2,
      name: 'Birth Certificate',
      description: 'Official birth certificate issuance and corrections',
      processingTime: '3-5 working days',
      fee: 'LKR 300',
      rating: 4.8,
      icon: FileText,
      category: 'Civil Documents',
      benefits: ['Official document', 'International acceptance', 'Quick processing']
    },
    {
      id: 3,
      name: 'Police Clearance Certificate',
      description: 'Character certificate for overseas employment/studies',
      processingTime: '7-10 working days',
      fee: 'LKR 1,000',
      rating: 4.5,
      icon: CheckCircle,
      category: 'Legal Documents',
      benefits: ['International validity', 'Employment requirement', 'Background verification']
    },
    {
      id: 4,
      name: 'Marriage Certificate',
      description: 'Official marriage registration and certificate',
      processingTime: '2-3 working days',
      fee: 'LKR 750',
      rating: 4.9,
      icon: Users,
      category: 'Civil Documents',
      benefits: ['Legal recognition', 'International validity', 'Quick issuance']
    }
  ];

  // Bundle Options
  const bundleOptions = [
    {
      id: 1,
      name: 'Travel Ready Package',
      description: 'Complete travel documentation bundle',
      services: ['Passport Application', 'Police Clearance Certificate', 'Birth Certificate'],
      originalPrice: 4300,
      bundlePrice: 3500,
      savings: 800,
      processingTime: 'Up to 15 working days',
      benefits: [
        'Priority processing for all documents',
        'Single appointment for all services',
        'Coordinated delivery',
        'Dedicated support representative'
      ],
      popular: true
    },
    {
      id: 2,
      name: 'Identity Essentials',
      description: 'Basic identity documents package',
      services: ['Passport Application', 'National ID Card'],
      originalPrice: 3000,
      bundlePrice: 2400,
      savings: 600,
      processingTime: 'Up to 12 working days',
      benefits: [
        'Streamlined application process',
        'Document cross-verification',
        'Combined appointment scheduling',
        'Email status updates'
      ],
      popular: false
    },
    {
      id: 3,
      name: 'Family Package',
      description: 'Multiple family member applications',
      services: ['Multiple Passport Applications', 'Group Processing', 'Family Verification'],
      originalPrice: 'Variable',
      bundlePrice: '20% Off',
      savings: 'Up to LKR 2000',
      processingTime: 'Synchronized processing',
      benefits: [
        'Family group discounts',
        'Simultaneous processing',
        'Group appointment slots',
        'Coordinated documentation'
      ],
      popular: false
    }
  ];

  // Support Channels
  const supportChannels = [
    {
      name: 'Live Chat',
      description: 'Instant support for urgent queries',
      availability: '24/7',
      icon: MessageCircle,
      action: 'Start Chat',
      color: '#10b981'
    },
    {
      name: 'Phone Support',
      description: 'Speak directly with our experts',
      availability: '8 AM - 8 PM',
      icon: Phone,
      action: 'Call Now',
      color: '#3b82f6'
    },
    {
      name: 'Email Support',
      description: 'Detailed assistance via email',
      availability: '24 hours response',
      icon: Mail,
      action: 'Send Email',
      color: '#8b5cf6'
    }
  ];

  // Filter FAQs based on search
  const filteredFAQs = faqData.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const markHelpful = (faqId) => {
    // In a real app, this would update the backend
    console.log(`Marked FAQ ${faqId} as helpful`);
  };

  const selectBundle = (bundleId) => {
    setSelectedBundle(bundleId);
  };

  const handleContinue = () => {
    onContinue?.({
      selectedBundle,
      viewedFAQs: filteredFAQs.filter(faq => expandedFAQ === faq.id).length
    });
  };

  return (
    <div className="faq-related-services">
      <div className="faq-header">
        <HelpCircle className="faq-icon" />
        <div className="faq-title">
          <h2>FAQ & Related Services</h2>
          <p>Find answers to common questions and explore related services</p>
        </div>
        <button className="share-button" onClick={handleShare}>
          <Share2 className="share-icon" />
          Share
        </button>
      </div>

      {/* FAQ Search */}
      <div className="section faq-search-section">
        <div className="search-container">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* FAQ Section */}
      <div className="section faq-section">
        <h3>
          <HelpCircle className="section-icon" />
          Frequently Asked Questions
        </h3>
        
        <div className="faq-list">
          {filteredFAQs.map(faq => (
            <div key={faq.id} className={`faq-item ${expandedFAQ === faq.id ? 'expanded' : ''}`}>
              <div className="faq-question" onClick={() => toggleFAQ(faq.id)}>
                <div className="question-content">
                  <span className="category-tag">{faq.category}</span>
                  <h4>{faq.question}</h4>
                </div>
                {expandedFAQ === faq.id ? 
                  <ChevronUp className="faq-toggle" /> : 
                  <ChevronDown className="faq-toggle" />
                }
              </div>
              
              {expandedFAQ === faq.id && (
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                  <div className="faq-footer">
                    <div className="faq-tags">
                      {faq.tags.map(tag => (
                        <span key={tag} className="tag">{tag}</span>
                      ))}
                    </div>
                    <div className="faq-actions">
                      <button 
                        className="helpful-button"
                        onClick={() => markHelpful(faq.id)}
                      >
                        <CheckCircle className="helpful-icon" />
                        Helpful ({faq.helpful})
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="no-results">
            <HelpCircle className="no-results-icon" />
            <p>No FAQs found matching your search. Try different keywords or browse our support channels.</p>
          </div>
        )}
      </div>

      {/* Bundle Options */}
      <div className="section bundles-section">
        <h3>
          <Package className="section-icon" />
          Service Bundles & Packages
        </h3>
        <p className="section-description">
          Save time and money with our curated service packages
        </p>
        
        <div className="bundles-grid">
          {bundleOptions.map(bundle => (
            <div 
              key={bundle.id} 
              className={`bundle-card ${selectedBundle === bundle.id ? 'selected' : ''} ${bundle.popular ? 'popular' : ''}`}
              onClick={() => selectBundle(bundle.id)}
            >
              {bundle.popular && (
                <div className="popular-badge">
                  <Star className="star-icon" />
                  Most Popular
                </div>
              )}
              
              <div className="bundle-header">
                <h4>{bundle.name}</h4>
                <p>{bundle.description}</p>
              </div>
              
              <div className="bundle-services">
                <h5>Included Services:</h5>
                <ul>
                  {bundle.services.map(service => (
                    <li key={service}>
                      <CheckCircle className="service-check" />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bundle-pricing">
                <div className="price-comparison">
                  {typeof bundle.originalPrice === 'number' ? (
                    <>
                      <span className="original-price">LKR {bundle.originalPrice.toLocaleString()}</span>
                      <span className="bundle-price">LKR {bundle.bundlePrice.toLocaleString()}</span>
                      <span className="savings">Save LKR {bundle.savings.toLocaleString()}</span>
                    </>
                  ) : (
                    <>
                      <span className="bundle-price">{bundle.bundlePrice}</span>
                      <span className="savings">{bundle.savings}</span>
                    </>
                  )}
                </div>
                <div className="processing-time">
                  <Clock className="time-icon" />
                  {bundle.processingTime}
                </div>
              </div>
              
              <div className="bundle-benefits">
                <h5>Package Benefits:</h5>
                <ul>
                  {bundle.benefits.map(benefit => (
                    <li key={benefit}>
                      <Zap className="benefit-icon" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Services */}
      <div className="section related-services">
        <h3>
          <Globe className="section-icon" />
          Related Services
        </h3>
        <p className="section-description">
          Other government services you might need
        </p>
        
        <div className="services-grid">
          {relatedServices.map(service => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <IconComponent className="service-icon" />
                  <div className="service-rating">
                    <Star className="star-icon filled" />
                    <span>{service.rating}</span>
                  </div>
                </div>
                
                <div className="service-content">
                  <h4>{service.name}</h4>
                  <p>{service.description}</p>
                  <span className="service-category">{service.category}</span>
                </div>
                
                <div className="service-details">
                  <div className="detail-item">
                    <Clock className="detail-icon" />
                    <span>{service.processingTime}</span>
                  </div>
                  <div className="detail-item">
                    <CreditCard className="detail-icon" />
                    <span>{service.fee}</span>
                  </div>
                </div>
                
                <div className="service-benefits">
                  <h5>Key Benefits:</h5>
                  <ul>
                    {service.benefits.map(benefit => (
                      <li key={benefit}>
                        <CheckCircle className="benefit-check" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <button className="service-action">
                  <span>Learn More</span>
                  <ArrowRight className="action-icon" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Channels */}
      <div className="section support-section">
        <h3>
          <MessageCircle className="section-icon" />
          Need More Help?
        </h3>
        <p className="section-description">
          Our support team is here to assist you
        </p>
        
        <div className="support-channels">
          {supportChannels.map(channel => {
            const IconComponent = channel.icon;
            return (
              <div key={channel.name} className="support-channel">
                <IconComponent 
                  className="support-icon" 
                  style={{ color: channel.color }}
                />
                <div className="support-content">
                  <h4>{channel.name}</h4>
                  <p>{channel.description}</p>
                  <span className="availability">Available: {channel.availability}</span>
                </div>
                <button 
                  className="support-action"
                  style={{ backgroundColor: channel.color }}
                >
                  {channel.action}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="faq-actions">
        <button className="btn-secondary" onClick={onBack}>
          <ArrowRight className="btn-icon rotate-180" />
          Back to Fees
        </button>
        
        <button className="btn-download" onClick={() => window.print()}>
          <Download className="btn-icon" />
          Download FAQ
        </button>
        
        <button className="btn-primary" onClick={handleContinue}>
          <span>Continue to Review</span>
          <ArrowRight className="btn-icon" />
        </button>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={e => e.stopPropagation()}>
            <h3>Share Service Information</h3>
            <div className="share-options">
              <button className="share-option" onClick={copyLink}>
                <Copy className="share-option-icon" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
              <button className="share-option">
                <Mail className="share-option-icon" />
                <span>Email</span>
              </button>
              <button className="share-option">
                <MessageCircle className="share-option-icon" />
                <span>Message</span>
              </button>
            </div>
            <button 
              className="close-modal"
              onClick={() => setShowShareModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FAQRelatedServices;
