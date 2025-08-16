import React, { useState } from 'react';
import ServiceOverview from './ServiceOverview';
import DocumentRequirements from './DocumentRequirements';
import FeeStructure from './FeeStructure';
import FAQRelatedServices from './FAQRelatedServices';
import FinalReview from './FinalReview';
import './ServiceDetailsDemo.css';

/**
 * ServiceDetailsDemo - Integration demo showing all 5 components working together
 * This demonstrates the complete Service Details workflow
 */
const ServiceDetailsDemo = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [applicationData, setApplicationData] = useState({
    serviceType: "Passport Application",
    processingType: "standard",
    paymentMethod: "",
    totalAmount: 0,
    selectedBundle: null,
    documents: [],
    additionalServices: [],
    completedSteps: []
  });

  const steps = [
    { id: 1, name: 'Service Overview', component: 'overview', completed: false },
    { id: 2, name: 'Document Requirements', component: 'documents', completed: false },
    { id: 3, name: 'Fee Structure', component: 'fees', completed: false },
    { id: 4, name: 'FAQ & Related Services', component: 'faq', completed: false },
    { id: 5, name: 'Final Review', component: 'review', completed: false }
  ];

  const handleNext = (stepData) => {
    console.log('Step completed with data:', stepData);
    
    // Update application data
    setApplicationData(prev => ({
      ...prev,
      ...stepData,
      completedSteps: [...prev.completedSteps, currentStep]
    }));
    
    // Mark current step as completed
    steps[currentStep - 1].completed = true;
    
    // Move to next step
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleEdit = (section) => {
    console.log('Edit requested for section:', section);
    // Navigate to appropriate step based on section
    const sectionStepMap = {
      'service': 1,
      'documents': 2,
      'payment': 3,
      'faq': 4
    };
    
    if (sectionStepMap[section]) {
      setCurrentStep(sectionStepMap[section]);
    }
  };

  const handleConfirm = (finalData) => {
    console.log('Application submitted:', finalData);
    alert('🎉 Application submitted successfully!');
  };

  const renderCurrentStep = () => {
    const commonProps = {
      serviceType: applicationData.serviceType,
      onContinue: handleNext,
      onBack: handleBack
    };

    switch (currentStep) {
      case 1:
        return <ServiceOverview {...commonProps} />;
      case 2:
        return <DocumentRequirements {...commonProps} />;
      case 3:
        return <FeeStructure {...commonProps} />;
      case 4:
        return <FAQRelatedServices {...commonProps} />;
      case 5:
        return (
          <FinalReview 
            serviceData={applicationData}
            onConfirm={handleConfirm}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        );
      default:
        return <ServiceOverview {...commonProps} />;
    }
  };

  return (
    <div className="service-details-demo">
      {/* Progress Indicator */}
      <div className="demo-header">
        <h1>Service Details Demo</h1>
        <div className="step-progress">
          {steps.map(step => (
            <div 
              key={step.id}
              className={`progress-step ${currentStep === step.id ? 'active' : ''} ${step.completed ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="step-number">{step.id}</div>
              <div className="step-name">{step.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Step Component */}
      <div className="demo-content">
        {renderCurrentStep()}
      </div>

      {/* Demo Controls */}
      <div className="demo-controls">
        <div className="demo-info">
          <h3>Demo Information</h3>
          <p><strong>Current Step:</strong> {currentStep}/5 - {steps[currentStep - 1].name}</p>
          <p><strong>Completed Steps:</strong> {applicationData.completedSteps.length}/5</p>
          <p><strong>Service Type:</strong> {applicationData.serviceType}</p>
        </div>
        
        <div className="demo-data">
          <h3>Application Data</h3>
          <pre>{JSON.stringify(applicationData, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailsDemo;
