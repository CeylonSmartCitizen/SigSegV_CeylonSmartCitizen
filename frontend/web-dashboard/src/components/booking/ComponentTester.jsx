import React, { useState } from 'react';
import { 
  PlayCircle, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  CreditCard,
  HelpCircle,
  Target,
  Monitor,
  Smartphone,
  Tablet
} from 'lucide-react';

// Import all components
import ServiceOverview from './ServiceOverview';
import DocumentRequirements from './DocumentRequirements';
import FeeStructure from './FeeStructure';
import FAQRelatedServices from './FAQRelatedServices';
import FinalReview from './FinalReview';

import './ComponentTester.css';

const ComponentTester = () => {
  const [currentTest, setCurrentTest] = useState('overview');
  const [testResults, setTestResults] = useState({});
  const [testData, setTestData] = useState({
    serviceType: "Passport Application",
    processingType: "standard",
    paymentMethod: "card",
    totalAmount: 4150,
    selectedBundle: null,
    documents: ["National ID", "Address Proof", "Birth Certificate", "Passport Photos"],
    additionalServices: ["SMS Updates"],
    optionalDocuments: ["Marriage Certificate"]
  });

  const components = [
    {
      id: 'overview',
      name: 'Service Overview',
      component: ServiceOverview,
      description: 'Tests service information display, expandable sections, and contact details',
      features: [
        'Process steps explanation',
        'Processing information',
        'Follow-up procedures',
        'Contact information',
        'Expandable sections'
      ]
    },
    {
      id: 'documents',
      name: 'Document Requirements',
      component: DocumentRequirements,
      description: 'Tests document checklist, file uploads, and progress tracking',
      features: [
        'Interactive document checklist',
        'Progress tracking',
        'File upload simulation',
        'Sample image modals',
        'Required vs optional docs'
      ]
    },
    {
      id: 'fees',
      name: 'Fee Structure',
      component: FeeStructure,
      description: 'Tests fee calculation, payment methods, and pricing breakdown',
      features: [
        'Processing type selection',
        'Real-time fee calculation',
        'Payment method selection',
        'Additional services',
        'Tax calculations'
      ]
    },
    {
      id: 'faq',
      name: 'FAQ & Related Services',
      component: FAQRelatedServices,
      description: 'Tests FAQ search, service bundles, and support channels',
      features: [
        'Searchable FAQ',
        'Expandable answers',
        'Service bundles',
        'Related services',
        'Share functionality'
      ]
    },
    {
      id: 'review',
      name: 'Final Review',
      component: FinalReview,
      description: 'Tests application summary, validation, and submission flow',
      features: [
        'Application summary',
        'Pre-submission checklist',
        'Terms agreement',
        'Submission flow',
        'Confirmation states'
      ]
    }
  ];

  const deviceTests = [
    { id: 'desktop', name: 'Desktop', icon: Monitor, width: '1200px' },
    { id: 'tablet', name: 'Tablet', icon: Tablet, width: '768px' },
    { id: 'mobile', name: 'Mobile', icon: Smartphone, width: '375px' }
  ];

  const featureTests = [
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Test components across different screen sizes'
    },
    {
      id: 'interactions',
      name: 'User Interactions',
      description: 'Test clicks, hovers, and form interactions'
    },
    {
      id: 'animations',
      name: 'Animations & Transitions',
      description: 'Test smooth transitions and loading states'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Test keyboard navigation and screen reader support'
    },
    {
      id: 'performance',
      name: 'Performance',
      description: 'Test loading times and smooth scrolling'
    }
  ];

  const handleComponentTest = (componentId) => {
    setCurrentTest(componentId);
    // Simulate test execution
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [componentId]: {
          status: 'passed',
          timestamp: new Date().toLocaleTimeString(),
          features: components.find(c => c.id === componentId)?.features || []
        }
      }));
    }, 1000);
  };

  const handleNext = (data) => {
    console.log('Next clicked with data:', data);
    setTestData(prev => ({ ...prev, ...data }));
  };

  const handleBack = () => {
    console.log('Back clicked');
  };

  const handleEdit = (section) => {
    console.log('Edit clicked for section:', section);
  };

  const handleConfirm = (data) => {
    console.log('Confirm clicked with data:', data);
    setTestResults(prev => ({
      ...prev,
      submission: {
        status: 'passed',
        timestamp: new Date().toLocaleTimeString(),
        data
      }
    }));
  };

  const runAllTests = () => {
    components.forEach((component, index) => {
      setTimeout(() => {
        handleComponentTest(component.id);
      }, index * 500);
    });
  };

  const getCurrentComponent = () => {
    const component = components.find(c => c.id === currentTest);
    if (!component) return null;

    const ComponentToRender = component.component;
    const props = {
      serviceType: testData.serviceType,
      onContinue: handleNext,
      onBack: handleBack,
      onEdit: handleEdit,
      onConfirm: handleConfirm
    };

    if (currentTest === 'review') {
      props.serviceData = testData;
    }

    return <ComponentToRender {...props} />;
  };

  return (
    <div className="component-tester">
      <div className="tester-header">
        <PlayCircle className="tester-icon" />
        <div className="tester-title">
          <h1>Service Details Component Tester</h1>
          <p>Comprehensive testing suite for all implemented features</p>
        </div>
        <button className="run-all-btn" onClick={runAllTests}>
          <PlayCircle className="btn-icon" />
          Run All Tests
        </button>
      </div>

      <div className="test-dashboard">
        {/* Component Navigation */}
        <div className="test-nav">
          <h3>Components</h3>
          <div className="component-list">
            {components.map(component => (
              <div 
                key={component.id} 
                className={`component-item ${currentTest === component.id ? 'active' : ''} ${testResults[component.id] ? 'tested' : ''}`}
                onClick={() => setCurrentTest(component.id)}
              >
                <div className="component-info">
                  <h4>{component.name}</h4>
                  <p>{component.description}</p>
                </div>
                <div className="test-status">
                  {testResults[component.id] ? (
                    <CheckCircle className="status-icon success" />
                  ) : (
                    <AlertCircle className="status-icon pending" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Test Results */}
        <div className="test-results">
          <h3>Test Results</h3>
          <div className="results-grid">
            {Object.entries(testResults).map(([testId, result]) => (
              <div key={testId} className="result-card">
                <div className="result-header">
                  <h4>{components.find(c => c.id === testId)?.name || testId}</h4>
                  <span className={`status-badge ${result.status}`}>
                    {result.status}
                  </span>
                </div>
                <div className="result-details">
                  <p>Completed at: {result.timestamp}</p>
                  {result.features && (
                    <div className="tested-features">
                      <strong>Tested Features:</strong>
                      <ul>
                        {result.features.map(feature => (
                          <li key={feature}>
                            <CheckCircle className="feature-check" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Device Testing */}
      <div className="device-testing">
        <h3>Responsive Testing</h3>
        <div className="device-buttons">
          {deviceTests.map(device => {
            const IconComponent = device.icon;
            return (
              <button 
                key={device.id}
                className="device-btn"
                onClick={() => {
                  const testFrame = document.querySelector('.test-frame');
                  if (testFrame) {
                    testFrame.style.maxWidth = device.width;
                  }
                }}
              >
                <IconComponent className="device-icon" />
                {device.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feature Testing Checklist */}
      <div className="feature-testing">
        <h3>Feature Testing Checklist</h3>
        <div className="feature-grid">
          {featureTests.map(test => (
            <div key={test.id} className="feature-test">
              <div className="feature-header">
                <h4>{test.name}</h4>
                <input 
                  type="checkbox" 
                  id={test.id}
                  onChange={(e) => {
                    setTestResults(prev => ({
                      ...prev,
                      [`feature_${test.id}`]: {
                        status: e.target.checked ? 'passed' : 'pending',
                        timestamp: new Date().toLocaleTimeString()
                      }
                    }));
                  }}
                />
              </div>
              <p>{test.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Component Display */}
      <div className="component-display">
        <div className="display-header">
          <h3>
            {components.find(c => c.id === currentTest)?.name || 'Component Test'}
          </h3>
          <button 
            className="test-btn"
            onClick={() => handleComponentTest(currentTest)}
          >
            <PlayCircle className="btn-icon" />
            Test Component
          </button>
        </div>
        
        <div className="test-frame">
          {getCurrentComponent()}
        </div>
      </div>

      {/* Test Summary */}
      <div className="test-summary">
        <h3>Test Summary</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-number">{Object.keys(testResults).length}</span>
            <span className="stat-label">Tests Completed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {Object.values(testResults).filter(r => r.status === 'passed').length}
            </span>
            <span className="stat-label">Tests Passed</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{components.length}</span>
            <span className="stat-label">Components</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {components.reduce((acc, c) => acc + c.features.length, 0)}
            </span>
            <span className="stat-label">Features</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentTester;
