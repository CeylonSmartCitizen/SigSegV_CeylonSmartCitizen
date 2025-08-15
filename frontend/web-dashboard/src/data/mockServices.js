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
    popular: true
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
    popular: true
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
