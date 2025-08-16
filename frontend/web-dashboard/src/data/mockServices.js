// Mock service data for Ceylon Smart Citizen
export const mockServices = [
  {
    id: 1,
    name: "Birth Certificate Application",
    department: "Registrar General",
    category: "Certificates",
    fee: 500,
    duration: "7 days",
    rating: 4.5,
    icon: "FileText",
    description: "Apply for a certified copy of birth certificate",
    availability: "available",
    location: "Colombo",
    popular: true,
    detailedDescription: "Obtain an official certified copy of your birth certificate for legal, educational, or personal purposes. This document is essential for passport applications, visa processing, educational admissions, and various government services.",
    requiredDocuments: [
      { name: "National Identity Card", example: "NIC copy (both sides)", required: true },
      { name: "Birth Registration Extract", example: "Original birth registration document", required: true },
      { name: "Sworn Affidavit", example: "JP certified affidavit if name differs", required: false },
      { name: "Payment Receipt", example: "Treasury receipt for service fee", required: true }
    ],
    feeBreakdown: {
      serviceFee: 300,
      processingFee: 150,
      courierFee: 50,
      total: 500
    },
    officers: [
      { id: 1, name: "Ms. Priya Wijeratne", designation: "Senior Registrar", rating: 4.7, experience: "8 years", avatar: "PW" },
      { id: 2, name: "Mr. Kamal Perera", designation: "Assistant Registrar", rating: 4.3, experience: "5 years", avatar: "KP" }
    ],
    reviews: [
      { id: 1, user: "Nimal Silva", rating: 5, comment: "Very efficient service. Got my certificate in 5 days!", date: "2025-08-10" },
      { id: 2, user: "Sanduni Fernando", rating: 4, comment: "Good service but could improve communication.", date: "2025-08-08" },
      { id: 3, user: "Ravi Gunasekara", rating: 5, comment: "Excellent support from officers. Highly recommended.", date: "2025-08-05" }
    ]
  },
  {
    id: 2,
    name: "Business Registration",
    department: "Business Registration",
    category: "Business",
    fee: 2500,
    duration: "14 days",
    rating: 4.2,
    icon: "Building2",
    description: "Register your new business entity",
    availability: "available",
    location: "All Districts",
    popular: true,
    detailedDescription: "Complete registration process for new business entities including sole proprietorships, partnerships, and private limited companies. This service provides legal recognition and enables you to operate your business officially.",
    requiredDocuments: [
      { name: "Business Name Reservation", example: "Approved name reservation certificate", required: true },
      { name: "National Identity Card", example: "NIC of all directors/partners", required: true },
      { name: "Address Proof", example: "Utility bill or lease agreement", required: true },
      { name: "Memorandum & Articles", example: "Company constitution documents", required: true },
      { name: "Bank Statement", example: "Business bank account statement", required: false }
    ],
    feeBreakdown: {
      registrationFee: 2000,
      documentFee: 300,
      certificateFee: 200,
      total: 2500
    },
    officers: [
      { id: 3, name: "Mr. Lasantha Rajapaksa", designation: "Business Registrar", rating: 4.5, experience: "12 years", avatar: "LR" },
      { id: 4, name: "Ms. Chamila Jayasinghe", designation: "Senior Officer", rating: 4.0, experience: "6 years", avatar: "CJ" }
    ],
    reviews: [
      { id: 4, user: "Startup Lanka", rating: 4, comment: "Process was smooth, but took the full 14 days.", date: "2025-08-12" },
      { id: 5, user: "Tech Solutions PVT", rating: 5, comment: "Professional service. All documents processed correctly.", date: "2025-08-09" }
    ]
  },
  {
    id: 3,
    name: "Driving License Renewal",
    department: "Motor Traffic",
    category: "Transport",
    fee: 1200,
    duration: "3 days",
    rating: 4.0,
    icon: "Car",
    description: "Renew your driving license online",
    availability: "limited",
    location: "Colombo",
    popular: false
  },
  {
    id: 4,
    name: "Police Clearance Certificate",
    department: "Police",
    category: "Certificates",
    fee: 1000,
    duration: "10 days",
    rating: 4.3,
    icon: "Shield",
    description: "Obtain police clearance certificate",
    availability: "available",
    location: "All Districts",
    popular: true
  },
  {
    id: 5,
    name: "Land Title Search",
    department: "Land Registry",
    category: "Property",
    fee: 750,
    duration: "5 days",
    rating: 4.1,
    icon: "Map",
    description: "Search for land ownership details",
    availability: "available",
    location: "District Specific",
    popular: false
  },
  {
    id: 6,
    name: "Marriage Certificate",
    department: "Registrar General",
    category: "Certificates",
    fee: 600,
    duration: "7 days",
    rating: 4.4,
    icon: "Heart",
    description: "Apply for marriage certificate",
    availability: "available",
    location: "All Districts",
    popular: false
  },
  {
    id: 7,
    name: "Passport Application",
    department: "Immigration",
    category: "Travel",
    fee: 3500,
    duration: "21 days",
    rating: 4.6,
    icon: "Plane",
    description: "Apply for new passport",
    availability: "available",
    location: "Colombo",
    popular: true
  },
  {
    id: 8,
    name: "Tax Clearance Certificate",
    department: "Inland Revenue",
    category: "Tax",
    fee: 0,
    duration: "5 days",
    rating: 3.9,
    icon: "Receipt",
    description: "Obtain tax clearance certificate",
    availability: "limited",
    location: "All Districts",
    popular: false
  }
];

export const serviceCategories = [
  { id: "all", name: "All Services", icon: "Grid3x3" },
  { id: "certificates", name: "Certificates", icon: "FileText" },
  { id: "business", name: "Business", icon: "Building2" },
  { id: "transport", name: "Transport", icon: "Car" },
  { id: "property", name: "Property", icon: "Map" },
  { id: "travel", name: "Travel", icon: "Plane" },
  { id: "tax", name: "Tax", icon: "Receipt" }
];

export const serviceDepartments = [
  "All Departments",
  "Registrar General",
  "Business Registration", 
  "Motor Traffic",
  "Police",
  "Land Registry",
  "Immigration",
  "Inland Revenue"
];

export const serviceLocations = [
  "All Locations",
  "Colombo",
  "All Districts",
  "District Specific"
];

// Recently viewed services (subset of main services for demo)
export const recentlyViewedServices = [
  mockServices[0], // Birth Certificate Application
  mockServices[3], // Police Clearance Certificate
  mockServices[6]  // Passport Application
];

// Search suggestions for autocomplete
export const searchSuggestions = [
  // Service names
  "Birth Certificate Application",
  "Business Registration", 
  "Driving License Renewal",
  "Police Clearance Certificate",
  "Land Title Search",
  "Marriage Certificate",
  "Passport Application",
  "Tax Clearance Certificate",
  
  // Keywords
  "certificate",
  "license",
  "clearance",
  "registration",
  "renewal",
  "application",
  "search",
  "title",
  
  // Departments
  "Registrar General",
  "Business Registration",
  "Motor Traffic", 
  "Police",
  "Land Registry",
  "Immigration",
  "Inland Revenue",
  
  // Common terms
  "birth",
  "marriage", 
  "business",
  "driving",
  "passport",
  "tax",
  "land",
  "property"
];
